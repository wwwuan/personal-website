"""Check root and GitHub Pages deployments without reading project media.

Run: python tests/pages_check.py
Uses the same optional Playwright installation as browser_check.py.
"""
import copy
from functools import partial
from http.server import ThreadingHTTPServer
import json
import os
from pathlib import Path
import sys
from threading import Thread
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
if (ROOT / ".tools" / "python").is_dir():
    sys.path.insert(0, str(ROOT / ".tools" / "python"))

from main import PortfolioHandler
from playwright.sync_api import expect, sync_playwright

DATA = json.loads((ROOT / "assets" / "portfolio.json").read_text(encoding="utf-8"))


def check_mount(browser, mount):
    class MountedHandler(PortfolioHandler):
        def send_head(self):
            if not self.path.startswith(mount):
                self.send_error(404)
                return None
            original_path = self.path
            self.path = "/" + self.path[len(mount):]
            try:
                return super().send_head()
            finally:
                self.path = original_path

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(MountedHandler, directory=str(ROOT)))
    worker = Thread(target=server.serve_forever, daemon=True)
    worker.start()
    origin = "http://127.0.0.1:" + str(server.server_port)
    base = origin + mount
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.set_default_timeout(5000)
    # No project media or PDF is opened. Wrong URLs still appear in the request log.
    context.route("**/images/**", lambda route: route.fulfill(status=404, body=""))
    context.route("**/videos/**", lambda route: route.abort())
    context.route("**/files/**", lambda route: route.fulfill(status=200, content_type="application/pdf", body=""))
    page = context.new_page()
    errors = []
    requests = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))

    def loaded_home():
        expect(page.locator(".project-card")).to_have_count(len(DATA["projects"]))
        expect(page.locator(".hero-greeting strong")).to_have_text(DATA["profile"]["name"])
        assert page.evaluate("getComputedStyle(document.body).backgroundColor") == "rgb(12, 20, 29)"
        assert page.locator("video").count() == 0

    try:
        for entry in [base, base + "index.html"]:
            page.goto(entry, wait_until="networkidle")
            loaded_home()

        # Click every card and return through the actual rendered link.
        for project in DATA["projects"]:
            page.locator('.project-actions a[href="./project.html?id=' + project["id"] + '"]').click()
            expect(page.locator(".detail-heading h1")).to_have_text(project["title"])
            assert page.url == base + "project.html?id=" + project["id"]
            page.reload(wait_until="networkidle")
            expect(page.locator(".detail-heading h1")).to_have_text(project["title"])
            page.locator(".detail-back").click()
            loaded_home()
            assert page.url == base + "index.html#projects"

        first = DATA["projects"][0]
        detail = base + "project.html?id=" + first["id"]
        # Logo, header navigation, footer, contact, and next-project navigation.
        for selector, anchor in [
            (".brand", "home"),
            ('#primary-nav a[href="./index.html#projects"]', "projects"),
            (".detail-pagination > .text-link", "projects"),
            (".detail-facts > a", "contact"),
            (".footer-brand", "home"),
            (".back-top", "home"),
        ]:
            page.goto(detail, wait_until="networkidle")
            page.locator(selector).click()
            loaded_home()
            assert page.url == base + "index.html#" + anchor

        page.goto(detail, wait_until="networkidle")
        page.locator(".next-project").click()
        expect(page.locator(".detail-heading h1")).to_have_text(DATA["projects"][1]["title"])
        assert page.url == base + "project.html?id=" + DATA["projects"][1]["id"]

        page.goto(base + "project.html?id=unknown", wait_until="networkidle")
        page.locator(".detail-not-found a").click()
        loaded_home()
        assert page.url == base + "index.html#projects"

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(detail, wait_until="networkidle")
        page.locator(".menu-toggle").click()
        page.locator('#primary-nav a[href="./index.html#projects"]').click()
        loaded_home()
        assert page.url == base + "index.html#projects"
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")

        # Configured /images, /videos and /files paths must stay under the mount.
        fixture = copy.deepcopy(DATA)
        fixture["profile"]["resumeAvailable"] = True
        fixture["projects"][0]["cover"]["available"] = True
        fixture["projects"][0]["video"]["available"] = True
        context.route("**/assets/portfolio.json", lambda route: route.fulfill(
            status=200, content_type="application/json", body=json.dumps(fixture)))
        context.add_init_script("HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };")
        page.goto(base, wait_until="networkidle")
        loaded_home()
        expect(page.locator(".hero-actions .resume-link")).to_have_attribute("href", "./files/resume.pdf")
        assert page.locator(".hero-actions .resume-link").evaluate("a => a.href") == base + "files/resume.pdf"
        page.locator("[data-play]").first.click()
        expect(page.locator("video")).to_have_count(1)
        assert page.locator("video").evaluate("v => v.src") == base + first["video"]["src"].lstrip("/")

        escaped = [url for url in requests if url.startswith(origin) and not urlsplit(url).path.startswith(mount)]
        assert not escaped, escaped
        assert not errors, errors
        for asset in ["styles/main.css", "scripts/app.js", "favicon.svg", "assets/portfolio.json"]:
            assert base + asset in requests, asset
        print("PASS:", mount, "homepage, detail, return links, reload, mobile navigation and asset paths")
    finally:
        context.close()
        server.shutdown()
        server.server_close()
        worker.join()


def main():
    candidates = [
        os.environ.get("PORTFOLIO_BROWSER", ""),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    executable = next((path for path in candidates if path and Path(path).is_file()), None)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, **({"executable_path": executable} if executable else {}))
        try:
            for mount in ["/", "/personal-website/", "/preview/portfolio/"]:
                check_mount(browser, mount)
        finally:
            browser.close()
    print("All deployment path checks passed. No project media was read.")


if __name__ == "__main__":
    main()
