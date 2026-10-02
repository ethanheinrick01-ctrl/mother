"""Editable, source-faithful mechanism films. Pillow + FFmpeg; no runtime API calls.
Artwork originals remain unchanged in ../figures. All scale, time, marker colors,
flow particles, growth and injury fields are schematic adaptations, not clinical measurements.
Run python render_chapters.py [chapter ...]; --frames writes review contact sheet only.
"""
from pathlib import Path
from functools import lru_cache
import json,math,subprocess,sys,textwrap
from PIL import Image,ImageDraw,ImageFont,ImageOps
HERE=Path(__file__).resolve().parent; MEDIA=HERE.parent
W,H,FPS=1280,720,24
BG=(15,20,29);WHITE=(242,245,249);BLUE=(84,177,217);MUTED=(164,181,198);WARM=(243,185,114);RED=(204,79,82)
@lru_cache(None)
def font(n):return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',n)
@lru_cache(None)
def art(name):
 a=Image.open(MEDIA/'figures'/name).convert('RGBA');b=Image.new('RGBA',a.size,'white');b.alpha_composite(a);return b.convert('RGB')
@lru_cache(None)
def tile(name,crop,size):return art(name).crop(crop).resize(size,Image.Resampling.LANCZOS)
def ease(a,b,t):
 p=max(0,min(1,(t-a)/max(.01,b-a)));return p*p*(3-2*p)
def txt(im,xy,v,n=25,color=WHITE,width=32):ImageDraw.Draw(im).multiline_text(xy,'\n'.join(textwrap.wrap(v,width)),font=font(n),fill=color,spacing=8)
def panel(im,box=(40,174,795,612)):ImageDraw.Draw(im).rounded_rectangle(box,10,fill='white')
def pathpoint(path,f):
 f=max(0,min(.99999,f));j=int(f*(len(path)-1));p=f*(len(path)-1)-j;return tuple(path[j][k]*(1-p)+path[j+1][k]*p for k in [0,1])
def particles(im,path,t,count=16,speed=.15,color=RED,r=4):
 d=ImageDraw.Draw(im)
 for i in range(count):
  x,y=pathpoint(path,(t*speed+i/max(1,count))%1);d.ellipse((x-r,y-r,x+r,y+r),fill=color)
def disk(name,box,n):
 a=tile(name,box,(n,n)).convert('RGBA');m=Image.new('L',(n,n));ImageDraw.Draw(m).ellipse((1,1,n-2,n-2),fill=255);a.putalpha(m);return a
class Film:
 def __init__(self,ch):
  self.ch=ch;self.timing=json.loads((HERE/f'ch{ch}-timing.json').read_text());self.duration=self.timing['duration'];self.starts=[s['start'] for s in self.timing['stages']]+[self.duration]
 def frame(self,t):
  s=max(i for i,v in enumerate(self.starts[:-1]) if v<=t);im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
  txt(im,(38,20),f'NU545  /  EXAM 7  /  CHAPTER {self.ch}',17,MUTED,80);txt(im,(38,52),self.timing['title'],30,WHITE,80)
  d.line((38,98,1242,98),fill=(53,65,83));txt(im,(40,122),self.timing['stages'][s]['title'],25,BLUE,65)
  getattr(self,f'ch{self.ch}')(im,t,s)
  d=ImageDraw.Draw(im);d.line((38,668,1242,668),fill=(38,48,64),width=3);d.line((38,668,38+int(1204*t/self.duration),668),fill=BLUE,width=3)
  credits={4:'NHGRI / Sulai · public domain',5:'OpenStax College (2013) · CC BY 3.0',6:'NIH (2005) · public domain',12:'NCI / Don Bliss (2005) · public domain',13:'OpenStax College (2013) · CC BY 3.0',14:'OpenStax A&P (2016) · CC BY 4.0',46:'OpenStax College (2013) · CC BY 3.0',47:'OpenStax College (2013) · CC BY 3.0',48:'OpenStax College (2013) · CC BY 3.0',49:'OpenStax College (2013) · CC BY 3.0'}
  txt(im,(38,685),credits[self.ch]+' · adapted motion; schematic scale and time',14,MUTED,145)
  return im
 def notes(self,im,s,labels):
  h,b=labels[s];txt(im,(842,186),h,26,BLUE,26);y=198+len(textwrap.wrap(h,26))*34;txt(im,(842,y),b,25,WHITE,27)
 def ch4(self,im,t,s):
  panel(im);base=tile('transcription.png',(0,450,1280,770),(740,300));im.paste(base,(48,210))
  # Reveal the illustrated RNA transcript progressively; polymerase moves along the template.
  d=ImageDraw.Draw(im);p=ease(0,self.starts[2]-1,t);end=int(400*p)
  d.rectangle((152+end,342,435,376),fill='white') if end<283 else None
  if s==2:
   a=tile('transcription.png',(188,586,590,638),(300,40));im.paste(a,(int(155+170*ease(self.starts[2],self.duration-2,t)),int(400+130*ease(self.starts[2],self.duration-2,t))))
  particles(im,[(150,327),(250,327),(360,327),(430,327)],t,8,color=(56,163,120),r=3)
  txt(im,(66,563),'DNA template → messenger RNA → later protein assembly',23,(45,59,75),60)
  self.notes(im,s,[('Make a message','RNA polymerase uses the DNA template.'),('Transcription','The RNA copy lengthens; the DNA is retained.'),('Keep steps separate','Translation uses the message at a ribosome. The departing RNA is schematic.')])
 def ch5(self,im,t,s):
  panel(im);im.paste(tile('glucose-homeostasis.jpg',(895,145,1025,237),(310,222)),(110,310));im.paste(tile('glucose-homeostasis.jpg',(21,89,324,304),(288,205)),(473,315))
  d=ImageDraw.Draw(im);txt(im,(105,200),'Tissue response',22,(45,59,75),25);txt(im,(469,200),'Pancreatic supply',22,(45,59,75),25)
  response=1-.78*ease(2,12,t);supply=1-.8*ease(18,23,t)
  for x,p in [(105,response),(468,supply)]:
   d.rectangle((x,245,x+282,265),fill=(235,225,213));d.rectangle((x,245,x+282*p,265),fill=(75,153,188))
  particles(im,[(110,289),(420,289)],t,16,color=BLUE)
  particles(im,[(260,290),(265,360),(274,426)],t,max(1,int(14*response)),color=(219,158,44),r=5)
  # Fade actual pancreatic islet texture as the narrated supply comparison develops.
  a=Image.new('RGBA',im.size);ad=ImageDraw.Draw(a)
  for x,y in [(526,427),(640,421),(711,465)]:ad.ellipse((x-20,y-16,x+20,y+16),fill=(247,235,202,int(210*(1-supply))))
  im.paste(Image.alpha_composite(im.convert('RGBA'),a).convert('RGB'))
  particles(im,[(486,342),(741,342)],t,max(2,int(18*supply)),color=BLUE)
  txt(im,(77,567),'Bars show relative effect, not a clinical measurement.',21,(45,59,75),60)
  self.notes(im,s,[('Type 2 mechanism','Insulin is present, but tissue response is reduced.'),('Type 1 contrast','Autoimmune beta-cell loss reduces supply. These are distinct mechanisms.'),('Risk can be modified','Physical activity addresses modifiable risk; inherited susceptibility remains.')])
 def ch6(self,im,t,s):
  panel(im);a=tile('epigenetics.png',(1370,870,2090,1180),(700,280));b=tile('epigenetics.png',(665,1050,1350,1310),(700,280));p=ease(4,15,t)
  im.paste(Image.blend(a,b,p),(67,265));d=ImageDraw.Draw(im)
  for i in range(int(8*p)):
   x=150+i*67;y=262+13*math.sin(i);d.ellipse((x-7,y-7,x+7,y+7),fill=(229,148,58));d.line((x,y+7,x+10,y+21),fill=(229,148,58),width=2)
  txt(im,(74,205),'Accessible DNA     →     compact, less active region',23,(45,59,75),58)
  particles(im,[(75,570),(760,570)],t,max(1,int(18*(1-p))),color=BLUE)
  self.notes(im,s,[('Packing changes access','Scholarly histone geometry anchors this schematic comparison.'),('Promoter methylation','Added markers represent methylation; transcription falls in this example.'),('Expression, not sequence','Different expression patterns can coexist with the same DNA.')])
 def ch12(self,im,t,s):
  panel(im);im.paste(tile('ductal-in-situ.jpg',(490,180,905,620),(425,425)),(64,180));d=ImageDraw.Draw(im)
  p=ease(self.starts[1]+1,self.starts[2],t)
  # A gap opens in the actual outer duct boundary, followed by cell movement.
  if p>0:d.pieslice((414,330,525,442),270,90,fill='white')
  for i in range(6):
   x=430+230*p*(.45+.1*i);y=370+26*math.sin(i*2);c=disk('ductal-in-situ.jpg',(694,280,738,324),31);im.paste(c,(int(x),int(y)),c)
  if s==2:
   c=disk('ductal-in-situ.jpg',(694,280,738,324),36)
   for i in range(1+int(4*ease(self.starts[2]+3,self.duration-1,t))):im.paste(c,(663+(i%2)*33,464+(i//2)*31),c)
  txt(im,(530,218),'Surrounding tissue',22,(45,59,75),22);txt(im,(70,623),'Illustrative boundary comparison; not inevitable progression.',19,MUTED,75)
  self.notes(im,s,[('Boundary intact','Original NCI ductal illustration provides the tissue geometry.'),('Local invasion','Matrix breakdown opens a route. Cells cross the boundary.'),('Distant growth requires more','Survival and proliferation must follow transport. The destination is schematic.')])
 def ch13(self,im,t,s):
  panel(im);im.paste(tile('adipose-tissue.jpg',(5,4,837,870),(710,430)),(55,180));p=ease(self.starts[1],self.starts[2],t)*(1-.75*ease(self.starts[2]+1,self.duration-1,t))
  d=ImageDraw.Draw(im)
  for i in range(10+int(35*p)):
   x=90+(i*71+t*24)%625;y=210+(i*53+t*14)%350;d.ellipse((x-4,y-4,x+4,y+4),fill=(150,72,146))
  txt(im,(47,625),'Moving markers represent signaling, not measured hormone concentrations.',18,MUTED,90)
  self.notes(im,s,[('Adipose signaling','Adipokines connect tissue storage with endocrine activity.'),('Obesity-related pathway','Insulin resistance and hyperinsulinemia interact with the tissue environment.'),('Activity-related change','Fewer markers show the supplied decrease in inflammatory mediators. This is risk, not certainty.')])
 def ch14(self,im,t,s):
  panel(im);d=ImageDraw.Draw(im);txt(im,(85,200),'Differentiation',24,(45,59,75),25);txt(im,(459,200),'Retained immaturity',24,(45,59,75),25)
  early=disk('stem-cell.jpg',(310,480,443,608),160);late=disk('stem-cell.jpg',(260,980,370,1095),160);p=ease(self.starts[1]+2,self.starts[2],t)
  im.paste(Image.blend(early,late,p),(167,340),early);im.paste(early,(530,340),early)
  # Additional immature cells accumulate along the second path while mature tissue develops on the first.
  for i in range(int(5*p)):
   c=disk('stem-cell.jpg',(310,480,443,608),67);im.paste(c,(480+(i%3)*75,485+(i//3)*50),c)
  txt(im,(63,625),'OpenStax cell textures; a conceptual contrast, not a tumor micrograph.',18,MUTED,90)
  self.notes(im,s,[('Developmental context','The chapter emphasizes immature tissues and childhood growth.'),('Different outcomes','Maturation changes cell structure; the second path retains an immature pattern.'),('Mesodermal origins','Many childhood cancers arise from these tissues. Multiple risk contributors remain relevant.')])
 def skin(self,im,t,compress=0):
  panel(im);a=tile('skin.jpg',(220,205,1015,920),(620,430));h=int(430*(1-.35*compress));im.paste(a.resize((620,h)),(84,180+430-h))
 def ch46(self,im,t,s):
  p=ease(0,self.starts[1],t)*(1-ease(self.starts[2],self.duration-1,t));self.skin(im,t,p)
  route=[(84+(x-220)*620/795,610-(920-y)*430*(1-.35*p)/715) for x,y in [(350,810),(457,735),(525,613),(632,485),(628,428),(541,417),(463,409)]]
  particles(im,route,t,max(1,int(15*(1-p))),speed=.14*(1-.8*p),color=(235,79,74))
  d=ImageDraw.Draw(im)
  if p>.05:
   d.line((330,170,330,205+90*p),fill=RED,width=8);d.polygon([(318,197+90*p),(342,197+90*p),(330,216+90*p)],fill=RED)
  if s==1:
   ov=Image.new('RGBA',im.size);ImageDraw.Draw(ov).ellipse((200,290,530,590),fill=(104,46,62,int(100*p)));im=im # composite in place
   im.paste(Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB'))
  self.notes(im,s,[('Compression increases','The tissue and local vascular region visibly narrow.'),('Perfusion falls','Reduced local flow can lead to ischemia and necrosis.'),('Remove the pressure','Relief addresses the force. Staging still depends on observed depth and the wound base.')])
 def ch47(self,im,t,s):
  self.skin(im,t);d=ImageDraw.Draw(im);p=ease(self.starts[1],self.starts[2],t)
  for i in range(8):
   x=125+i*58;d.line((x,210,x+16,238+25*p),fill=(168,57,64),width=max(1,int(5*p)))
  h=int(40*p);a=tile('skin.jpg',(220,330,780,391),(436,50+h));im.paste(a,(84,277-h))
  if s==2:d.line((100,242,685,260),fill=(86,167,209),width=5)
  self.notes(im,s,[('Barrier dysfunction','Filaggrin and immune mechanisms are part of the supplied explanation.'),('Repeated scratching','Surface injury and epidermal thickening develop. Thickening is lichenification.'),('Support the barrier','Hydration and emollients help barrier care. The overlay is schematic, not a treatment animation.')])
 def capillary(self,im):
  panel(im);im.paste(tile('lymphatic-system.jpg',(700,375,1007,681),(420,420)),(120,180))
  # Route follows red blood-capillary segments in the actual inset, not green lymphatics.
  return [(120+(x-700)*420/307,180+(y-375)*420/306) for x,y in [(825,380),(820,444),(920,447),(952,515),(963,558),(900,607),(865,656),(853,676)]]
 def ch48(self,im,t,s):
  path=self.capillary(im);p=ease(0,self.starts[1],t);replacement=.6*ease(self.starts[1]+3,self.starts[2],t);particles(im,path,t,max(2,int(22*(1-.8*p+replacement))),color=RED)
  d=ImageDraw.Draw(im)
  for i in range(int(29*p)):
   f=(t*.11+i/29)%1;x=388+f*100;y=290+i*7;d.ellipse((x-3,y-3,x+3,y+3),fill=(68,142,225))
  txt(im,(600,253),'Blood',24,RED,16);txt(im,(593,363),'Tissue fluid',24,(52,114,181),18)
  self.notes(im,s,[('Volume leaves circulation','Fluid accumulates outside the vessel while circulating supply falls.'),('Edema and depletion coexist','Replacement restores volume despite swelling. It does not target increased leak.'),('Different endpoints','Urine output assesses replacement; capillary seal marks the supplied end of burn shock.')])
 def ch49(self,im,t,s):
  path=self.capillary(im);p=ease(3,self.starts[2],t);particles(im,path,t,max(2,int(22*(1-.83*p))),speed=.2*(1-.75*p),color=RED)
  d=ImageDraw.Draw(im);pressure=1-.6*ease(self.starts[2]+1,self.duration-2,t);d.rectangle((641,285,675,560),outline=(54,71,84),width=2);d.rectangle((644,558-int(267*pressure),672,558),fill=BLUE);txt(im,(609,205),'Pressure',21,(45,59,75),15)
  self.notes(im,s,[('Compensated shock','Abnormal perfusion can coexist with age-appropriate systolic pressure.'),('Less peripheral flow','The capillary particle stream declines before the pressure indicator falls.'),('Later deterioration','Hypotension is a later category. Hypoxia and bradycardia require attention in the supplied assessment.')])

def render(ch,frames=False):
 f=Film(ch);times=[1]+[min(f.duration-.3,v+2) for v in f.starts[1:-1]]+[f.duration-1]
 sheet=Image.new('RGB',(1280,720*len(times)))
 for i,t in enumerate(times):sheet.paste(f.frame(t),(0,i*720))
 if frames:
  review=Path(sys.argv[sys.argv.index('--review-dir')+1]) if '--review-dir' in sys.argv else Path.cwd()/'exam7-review-frames'
  review.mkdir(parents=True,exist_ok=True);sheet.save(review/f'ch{ch}.jpg',quality=88)
  return
 f.frame(min(f.duration/2,10)).save(MEDIA/f'ch{ch}-academic-poster.jpg',quality=90)
 cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r',str(FPS),'-i','-','-i',str(MEDIA/f'ch{ch}-narration.mp3'),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-shortest',str(MEDIA/f'ch{ch}-academic.mp4')]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 for n in range(math.ceil(f.duration*FPS)):p.stdin.write(f.frame(n/FPS).tobytes())
 p.stdin.close();assert p.wait()==0;print(ch,'rendered',f.duration,flush=True)
if __name__=='__main__':
 chapters=[int(v) for v in sys.argv[1:] if v.isdigit()] or [4,5,6,12,13,14,46,47,48,49]
 for ch in chapters:render(ch,'--frames' in sys.argv)
