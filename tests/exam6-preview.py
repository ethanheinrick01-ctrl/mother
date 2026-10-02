#!/usr/bin/env python3
"""Local preview with byte-range support for native video seeking."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os, re
class Preview(SimpleHTTPRequestHandler):
 def send_head(self):
  p=Path(self.translate_path(self.path))
  r=self.headers.get('Range','')
  if p.is_file() and re.fullmatch(r'bytes=\d*-\d*',r):
   f=p.open('rb');size=p.stat().st_size;a,b=r[6:].split('-')
   start=int(a) if a else max(0,size-int(b));end=min(int(b) if b and a else size-1,size-1)
   if start>end or start>=size:f.close();self.send_error(416);return None
   self.send_response(206);self.send_header('Content-Type',self.guess_type(str(p)));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Content-Length',str(end-start+1));self.end_headers();f.seek(start);self.remaining=end-start+1;return f
  return super().send_head()
 def end_headers(self):
  self.send_header('Cache-Control','no-store');self.send_header('Accept-Ranges','bytes');super().end_headers()
 def copyfile(self,src,out):
  left=getattr(self,'remaining',None)
  if left is None:return super().copyfile(src,out)
  while left>0:
   data=src.read(min(left,65536))
   if not data:break
   out.write(data);left-=len(data)
  del self.remaining
os.chdir(Path(__file__).resolve().parents[1])
ThreadingHTTPServer(('127.0.0.1',8766),Preview).serve_forever()
