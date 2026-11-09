"""Small, dependency-free development server for the portfolio."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC_FILES = {"index.html", "project.html", "favicon.svg"}
PUBLIC_DIRS = {"assets", "styles", "scripts", "images", "videos", "files"}


class PortfolioHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".pdf": "application/pdf",
    }

    def send_head(self):
        relative = unquote(urlsplit(self.path).path).lstrip("/") or "index.html"
        target = (ROOT / relative).resolve()
        parts = Path(relative).parts
        allowed = (
            target.is_relative_to(ROOT)
            and target.is_file()
            and (relative in PUBLIC_FILES or (parts and parts[0] in PUBLIC_DIRS))
            and not any(part.startswith(".") for part in parts)
        )
        if not allowed:
            self.send_error(404, "File not found")
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Run the personal portfolio locally.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    args = parser.parse_args()
    handler = partial(PortfolioHandler, directory=str(ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Portfolio: http://{args.host}:{args.port}", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
