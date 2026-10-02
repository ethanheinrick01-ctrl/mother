"""Loopback-only static preview with byte ranges for native video seeking.

Usage: python3 docs/nu545/exam4/authoring/preview_server.py --port 8774
Only the repository's public site directory is served.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse, os, re

ROOT = Path(__file__).resolve().parents[4] / 'site'

class RangeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        self.remaining = None
        path = Path(self.translate_path(self.path))
        if not path.is_file():
            return super().send_head()
        handle = path.open('rb')
        stat = os.fstat(handle.fileno())
        size = stat.st_size
        start, end = 0, size - 1
        raw = self.headers.get('Range')
        if raw:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', raw)
            if not match or not any(match.groups()):
                handle.close(); self.send_error(416); return None
            left, right = match.groups()
            if left:
                start = int(left)
                end = min(int(right), end) if right else end
            else:
                start = max(0, size - int(right))
            if start >= size or end < start:
                handle.close(); self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.end_headers(); return None
        self.send_response(206 if raw else 200)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(stat.st_mtime))
        if raw:
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        handle.seek(start); self.remaining = end - start + 1
        return handle

    def copyfile(self, source, output):
        if self.remaining is None:
            return super().copyfile(source, output)
        try:
            while self.remaining:
                chunk = source.read(min(65536, self.remaining))
                if not chunk: break
                output.write(chunk); self.remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--port', type=int, default=8774)
    args = p.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), RangeHandler)
    print(f'Public-site preview: http://127.0.0.1:{args.port}/nu545/exam4/', flush=True)
    server.serve_forever()
