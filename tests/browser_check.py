"""Browser checks for the portfolio, using mock media without opening media files.

Run against an already running server:
    python tests/browser_check.py
Install optional tooling:
    python -m pip install -r requirements-dev.txt
"""
import argparse
import copy
import json
import os
from pathlib import Path
import sys
from urllib.request import urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
LOCAL_TOOLS = ROOT / ".tools" / "python"
if LOCAL_TOOLS.is_dir():
    sys.path.insert(0, str(LOCAL_TOOLS))
from playwright.sync_api import sync_playwright, expect

DATA = json.loads((ROOT / "assets" / "portfolio.json").read_text(encoding="utf-8"))


def browser_executable():
    candidates = [
        os.environ.get("PORTFOLIO_BROWSER", ""),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
    return next((path for path in candidates if path and Path(path).is_file()), None)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--screenshots", action="store_true")
    args = parser.parse_args()
    base = args.url.rstrip("/")
    failures = []
    checks = []
    with sync_playwright() as p:
        executable = browser_executable()
        browser = p.chromium.launch(headless=True, **({"executable_path": executable} if executable else {}))

        def context_for(payload=None, media_script=None):
            context = browser.new_context(viewport={"width":1440,"height":1000}, reduced_motion="reduce")
            context.set_default_timeout(5000)
            # These routes ensure no real image/video is read, even in failure checks.
            context.route("**/videos/**", lambda route: route.abort())
            context.route("**/images/**", lambda route: route.fulfill(status=404, body=""))
            if payload is not None:
                context.route("**/assets/portfolio.json", lambda route: route.fulfill(
                    status=200, content_type="application/json", body=json.dumps(payload)))
            if media_script:
                context.add_init_script(media_script)
            return context

        context = context_for()
        page = context.new_page()
        page.on("pageerror", lambda error: failures.append(str(error)))
        requests = []
        page.on("request", lambda request: requests.append(request.url))
        page.goto(base, wait_until="networkidle")
        expect(page.locator(".project-card")).to_have_count(len(DATA["projects"]))
        expect(page.locator(".skill-card")).to_have_count(len(DATA["skills"]))
        expect(page.locator(".hero-greeting strong")).to_have_text(DATA["profile"]["name"])
        assert page.locator("video").count() == 0
        assert not [url for url in requests if "/videos/" in url or "/images/" in url]
        checks.append("Live homepage, UTF-8, profile modules and zero default media requests")

        for category in DATA["categories"]:
            page.locator('[data-filter="' + category["id"] + '"]').click()
            selected = [item for item in DATA["projects"] if category["id"] == "all" or item["category"] == category["id"]]
            expect(page.locator(".project-card")).to_have_count(len(selected))
            expect(page.locator('[data-filter="' + category["id"] + '"]')).to_have_attribute("aria-pressed","true")
        page.locator('[data-filter="all"]').click()
        page.locator("[data-play]").first.click()
        expect(page.locator("#toast")).to_have_class("toast is-visible")
        assert page.locator("video").count() == 0
        checks.append("All project filters and missing-demo feedback")

        for width in [320, 390, 768, 1024, 1440, 1920]:
            page.set_viewport_size({"width":width,"height":900})
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), width
        page.set_viewport_size({"width":390,"height":844})
        page.locator(".menu-toggle").click()
        expect(page.locator(".menu-toggle")).to_have_attribute("aria-expanded","true")
        page.keyboard.press("Escape")
        expect(page.locator(".menu-toggle")).to_have_attribute("aria-expanded","false")
        page.locator(".menu-toggle").click()
        page.locator("#primary-nav a[href='#projects']").click()
        expect(page.locator(".menu-toggle")).to_have_attribute("aria-expanded","false")
        checks.append("Six homepage widths, mobile navigation, Escape and anchor selection")

        for project in DATA["projects"]:
            page.goto(base + "/project.html?id=" + project["id"],wait_until="networkidle")
            expect(page.locator(".detail-heading h1")).to_have_text(project["title"])
            expect(page.locator(".ownership-list article")).to_have_count(len(project["ownership"]))
            expect(page.locator(".architecture-flow li")).to_have_count(len(project["flow"]))
            for width in [320, 390, 768, 1440]:
                page.set_viewport_size({"width":width,"height":900})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), (project["id"],width)
        page.goto(base + "/project.html?id=unknown",wait_until="networkidle")
        expect(page.locator(".detail-not-found")).to_have_count(1)
        page.goto(base + "/index.html#projects",wait_until="networkidle")
        page.wait_for_function("document.getElementById('projects').getBoundingClientRect().top >= 80 && document.getElementById('projects').getBoundingClientRect().top <= 110")
        checks.append("All detail routes, contribution boundaries, responsive details and direct anchors")

        if args.screenshots:
            output = ROOT / ".tools"
            output.mkdir(exist_ok=True)
            page.goto(base,wait_until="networkidle")
            page.set_viewport_size({"width":1440,"height":1000})
            page.evaluate("document.activeElement.blur(); window.scrollTo({top:0,behavior:'instant'})")
            page.screenshot(path=str(output / "desktop-preview.png"))
            page.screenshot(path=str(output / "desktop-full.png"),full_page=True)
            page.set_viewport_size({"width":390,"height":844})
            page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            page.screenshot(path=str(output / "mobile-preview.png"))
            page.screenshot(path=str(output / "mobile-full.png"),full_page=True)

        assert not failures, failures
        context.close()

        payload = copy.deepcopy(DATA)
        payload["projects"][0]["video"]["available"] = True
        mock_player = """
            Object.defineProperty(HTMLMediaElement.prototype, "paused", {
                configurable:true, get(){ return !this.__playing; }
            });
            HTMLMediaElement.prototype.play = function(){
                this.__playing = true;
                this.dataset.playInvoked = "true";
                this.dispatchEvent(new Event("play"));
                return Promise.resolve();
            };
            HTMLMediaElement.prototype.pause = function(){
                this.__playing = false;
                this.dispatchEvent(new Event("pause"));
            };
        """
        context = context_for(payload,mock_player)
        page = context.new_page()
        page.goto(base,wait_until="networkidle")
        assert page.locator("video").count() == 0
        page.locator("[data-play]").first.click()
        video = page.locator("video")
        expect(video).to_have_count(1)
        expect(video).to_have_attribute("data-play-invoked","true")
        assert video.evaluate("(v) => v.muted && v.loop && v.controls && v.playsInline && v.preload === 'none' && !v.autoplay")
        page.locator("[data-mute]").click()
        assert video.evaluate("(v) => !v.muted")
        page.locator("[data-loop]").click()
        assert video.evaluate("(v) => !v.loop")
        page.locator("[data-play]").first.click()
        assert video.evaluate("(v) => v.paused")
        page.locator('[data-filter="edge"]').click()
        assert page.locator("video").count() == 0
        checks.append("Mock player: click-only creation, mute, loop, controls, pause and filter cleanup")
        context.close()

        failure_player = "HTMLMediaElement.prototype.play = function(){ return Promise.reject(new DOMException('Mock unavailable media','NotSupportedError')); };"
        payload["projects"][0]["cover"]["available"] = True
        payload["profile"]["resumeAvailable"] = True
        context = context_for(payload,failure_player)
        context.route("**/files/resume.pdf",lambda route: route.fulfill(status=404,body=""))
        page = context.new_page()
        page.goto(base,wait_until="networkidle")
        page.locator("[data-play]").first.click()
        expect(page.locator("video")).to_have_count(0)
        expect(page.locator(".project-cover-image")).to_have_count(0)
        expect(page.locator(".cover-placeholder").first).to_be_visible()
        expect(page.locator(".hero-actions button")).to_be_disabled()
        checks.append("Unavailable image, failed playback and missing-resume fallbacks")
        context.close()

        payload = copy.deepcopy(DATA)
        payload["profile"]["github"] = "https://github.com/example"
        payload["profile"]["email"] = "developer@example.com"
        payload["profile"]["resumeAvailable"] = True
        context = context_for(payload)
        context.route("**/files/resume.pdf",lambda route: route.fulfill(
            status=200,content_type="application/pdf",body=""))
        page = context.new_page()
        page.goto(base,wait_until="networkidle")
        expect(page.locator(".hero-actions a[download]")).to_have_count(1)
        expect(page.locator(".hero-socials a[href='mailto:developer@example.com']")).to_have_count(1)
        expect(page.locator(".contact-grid a")).to_have_count(3)
        checks.append("Configured contact links and PDF download, using in-memory fixtures")
        context.close()

        context = context_for()
        context.route("**/assets/portfolio.json",lambda route: route.fulfill(status=503,body=""))
        page = context.new_page()
        page.goto(base,wait_until="networkidle")
        expect(page.locator(".load-error")).to_have_count(1)
        expect(page.locator(".load-error button")).to_have_count(1)
        checks.append("Unavailable project-data error and retry control")
        context.close()
        browser.close()

    for path in ["/README1.md","/.tools/python/playwright/__init__.py","/assets/%2e%2e/README1.md"]:
        try:
            urlopen(base + path)
            raise AssertionError("Unexpected public file: " + path)
        except HTTPError as error:
            assert error.code == 404
    checks.append("Development server serves only public site files")
    for label in checks:
        print("PASS: " + label)
    print("Completed " + str(len(checks)) + " checks. No real media file was read or generated.")


if __name__ == "__main__":
    main()
