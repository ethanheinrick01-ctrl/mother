"""Loopback-only preview with byte ranges for native film seeking."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re,argparse
cli=argparse.ArgumentParser();cli.add_argument("--port",type=int,default=8877);args=cli.parse_args()
ROOT=Path(__file__).resolve().parents[4]/"site"
class RangeHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".vtt": "text/vtt", ".mp4": "video/mp4", ".js": "text/javascript"}
    def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT),**k)
    def send_head(self):
        self.range=None
        p=Path(self.translate_path(self.path))
        if p.is_file() and self.headers.get('Range'):
            m=re.fullmatch(r'bytes=(\d+)-(\d*)',self.headers['Range'])
            if m:
                size=p.stat().st_size;start=int(m[1]);end=min(int(m[2]) if m[2] else size-1,size-1)
                if start>=size:self.send_error(416);return None
                f=p.open('rb');f.seek(start);self.range=(start,end)
                self.send_response(206);self.send_header('Content-Type',self.guess_type(str(p)));self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Content-Length',str(end-start+1));self.send_header('Accept-Ranges','bytes');self.end_headers();return f
        return super().send_head()
    def copyfile(self,src,out):
        if self.range:
            left=self.range[1]-self.range[0]+1
            while left:
                b=src.read(min(left,65536))
                if not b:break
                out.write(b);left-=len(b)
        else:super().copyfile(src,out)
ThreadingHTTPServer(('127.0.0.1',args.port),RangeHandler).serve_forever()
