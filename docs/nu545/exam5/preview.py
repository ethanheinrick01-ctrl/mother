"""Loopback-only preview with byte-range support for bundled chapter films."""
from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3] / "site"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        requested = self.headers.get("Range")
        if requested:
            target = Path(self.translate_path(self.path))
            match = re.fullmatch(r"bytes=(\d+)-(\d*)", requested)
            if target.is_file() and match:
                size = target.stat().st_size
                start = int(match[1])
                end = min(int(match[2]) if match[2] else size - 1, size - 1)
                if start >= size or end < start:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{size}")
                    self.end_headers()
                    return
                self.send_response(206)
                self.send_header("Content-Type", self.guess_type(str(target)))
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Length", end - start + 1)
                self.end_headers()
                with target.open("rb") as stream:
                    stream.seek(start)
                    self.wfile.write(stream.read(end - start + 1))
                return
        super().do_GET()

    def log_message(self, *_args):
        pass


if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8756)
    args = parser.parse_args()
    print(f"Exam 5 preview: http://127.0.0.1:{args.port}/nu545/exam5/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
