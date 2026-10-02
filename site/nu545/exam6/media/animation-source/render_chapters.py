"""Editable source-derived scientific animations for NU545 Exam 6.
Pillow + NumPy + FFmpeg; no network or paid runtime. Original art remains intact.
Motion, tissue deformation, highlighted lesions, scale, and time are schematic.
Run: python3 render_chapters.py 40 [--frames-only] [--qa-dir /private/frames].
"""
from pathlib import Path
from functools import lru_cache
import json,math,subprocess,sys,textwrap
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter
HERE=Path(__file__).resolve().parent;MEDIA=HERE.parent
W,H,FPS=1280,720,24
BG='#0f141d';WHITE='#f2f5f9';BLUE='#54b1d9';MUTED='#a4b5c6';RED='#d86c68'
FIG={40:'2404_PeristalsisN.jpg',41:'2404_PeristalsisN.jpg',42:'2418_Histology_Small_IntestinesN.jpg',43:'1006_Sliding_Filament_Model_of_Muscle_Contraction.jpg',44:'606_Spongy_Bone.jpg',45:'916_Hip_Joint.jpg'}
@lru_cache(None)
def font(n):return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',n)
@lru_cache(None)
def art(ch):return Image.open(MEDIA/'figures'/FIG[ch]).convert('RGB')
def ease(a,b,t):
 p=max(0,min(1,(t-a)/max(.01,b-a)));return p*p*(3-2*p)
def text(im,xy,value,size=23,color=WHITE,width=31):
 ImageDraw.Draw(im).multiline_text(xy,'\n'.join(textwrap.wrap(value,width)),font=font(size),fill=color,spacing=8)
def panel(im,box):ImageDraw.Draw(im).rounded_rectangle(box,12,fill='white')
def pastefit(im,source,box):
 a=source.copy();a.thumbnail((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS);im.paste(a,(box[0]+(box[2]-box[0]-a.width)//2,box[1]+(box[3]-box[1]-a.height)//2))
def sample(a,xx,yy):
 # Bilinear resampling, preserving the source texture instead of inventing anatomy.
 h,w=a.shape[:2];xx=np.clip(xx,0,w-1);yy=np.clip(yy,0,h-1);x=xx.astype(int);y=yy.astype(int);u=(xx-x)[...,None];v=(yy-y)[...,None]
 return ((a[y,x]*(1-u)+a[y,np.minimum(x+1,w-1)]*u)*(1-v)+(a[np.minimum(y+1,h-1),x]*(1-u)+a[np.minimum(y+1,h-1),np.minimum(x+1,w-1)]*u)*v).astype('uint8')
@lru_cache(None)
def tube():return np.array(art(40).crop((99,208,187,399)).resize((176,420),Image.Resampling.LANCZOS)).astype(float)
@lru_cache(None)
def bolus():
 a=art(40).crop((114,111,171,191)).resize((65,91),Image.Resampling.LANCZOS).convert('RGBA');mask=Image.new('L',a.size);ImageDraw.Draw(mask).ellipse((0,0,64,90),fill=255);a.putalpha(mask);return a
@lru_cache(None)
def villi():return art(42).crop((415,568,797,788)).rotate(90,expand=True).resize((286,400),Image.Resampling.LANCZOS)
@lru_cache(None)
def fibers():
 a=np.array(art(43).crop((0,24,818,263)).convert('RGBA'));rgb=a[:,:,:3].astype(float);r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
 green=(g>r*.94)&(g>b*1.07)&(g<240);purple=(r>g*1.12)&(b>g*1.08)&(g<190)
 out=[]
 for mask in [green,purple]:
  v=a.copy();v[:,:,3]=np.where(mask,255,0);out.append(Image.fromarray(v))
 return out
@lru_cache(None)
def trabecula():
 a=art(44).crop((163,306,336,481));rgb=np.array(a).astype(float);r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2];mask=((r-g)<34)&(g>80)&((g-b)<45)
 return a,Image.fromarray((mask*255).astype('uint8'))
class Film:
 def __init__(self,ch):
  self.ch=ch;self.timing=json.loads((HERE/f'ch{ch}-timing.json').read_text());self.duration=self.timing['duration'];self.starts=[s['start'] for s in self.timing['stages']]+[self.duration]
 def stage(self,t):return max(i for i,x in enumerate(self.starts[:-1]) if x<=t)
 def phrase(self,value):
  ws=value.lower().split();a=self.timing['words']
  for i in range(len(a)-len(ws)+1):
   if all(w in a[i+j]['text'].lower() for j,w in enumerate(ws)):return a[i]['start']
  raise ValueError((self.ch,value))
 def frame(self,t):
  im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im);s=self.stage(t)
  d.text((38,20),f'NU545  /  EXAM 6  /  CHAPTER {self.ch}',font=font(17),fill=MUTED)
  d.text((38,52),self.timing['title'],font=font(30),fill=WHITE);d.line((38,98,1242,98),fill='#354153')
  text(im,(38,115),self.timing['stages'][s]['title'],25,BLUE,60)
  getattr(self,f'ch{self.ch}')(im,t,s)
  d.line((38,664,1242,664),fill='#263040',width=3);d.line((38,664,38+int(1204*t/self.duration),664),fill=BLUE,width=3)
  credit='OpenStax A&P (2016), CC BY 4.0' if self.ch==43 else 'OpenStax College A&P (2013), CC BY 3.0'
  d.text((38,682),credit+' | adapted figure motion | schematic scale and time',font=font(15),fill=MUTED)
  d.text((1150,682),f'{int(t):02}/{math.ceil(self.duration):02}s',font=font(15),fill=MUTED)
  return im
 def notes(self,im,head,body,foot=''):
  text(im,(880,165),head,27,BLUE,23);text(im,(880,235),body,24,WHITE,25)
  if foot:text(im,(880,476),foot,20,MUTED,30)
 def drawtube(self,im,x,t,mode,amount=0):
  a=tube();yy,xx=np.mgrid[0:420,0:176];y=np.arange(420);center=88
  if mode=='mix':sc=1-.62*(.5+.5*np.sin(2*np.pi*(y/140-t/3)))**5
  elif mode=='propel':sc=1-.7*np.exp(-((y-((t*32)%440-20))/29)**2)
  elif mode=='block':sc=1+amount*.40*np.exp(-((y-170)/100)**2);sc-=.80*np.exp(-((y-310)/18)**2)
  else:sc=np.ones(420)
  warped=sample(a,center+(xx-center)/sc[:,None],yy);im.paste(Image.fromarray(warped),(x,188))
  if mode=='propel':by=188+int((t*32)%440-20)+40;by=min(540,by);im.paste(bolus(),(x+55,by),bolus())
  elif mode=='mix':
   d=ImageDraw.Draw(im)
   for i in range(10):
    py=225+i*34;px=x+88+int(14*math.sin(t*2+i));d.ellipse((px-5,py-5,px+5,py+5),fill='#c8884a')
  elif mode=='block':
   d=ImageDraw.Draw(im)
   for i in range(int(5+25*amount)):
    py=475-(i//4)*17;px=x+55+(i%4)*19;d.ellipse((px-6,py-6,px+6,py+6),fill='#c8884a')
   d.rectangle((x+53,494,x+123,504),fill='#9d4338')
  else:im.paste(bolus(),(x+55,352),bolus())
 def ch40(self,im,t,s):
  panel(im,(38,157,844,636));mode='mix' if s==0 else 'propel';self.drawtube(im,110,t,mode)
  if s==2:self.drawtube(im,380,t,'mix')
  else:pastefit(im,art(40),(395,192,806,576))
  text(im,(75,610),'Live figure adaptation',17,'#273d50',30)
  self.notes(im,['Mix locally','Move onward','Compare both'][s],['Alternating contractions repeatedly mix contents in the same region.','A traveling narrowing advances the bolus through the lumen.','Left: propulsion. Right: local mixing. Movement serves different tasks.'][s],'Course basis: Chapter 40, slide 46. No motor-control pathway is inferred.')
 def ch41(self,im,t,s):
  panel(im,(38,157,844,636));mode=['propel','block','still'][s];p=ease(self.starts[1],self.starts[1]+8,t);self.drawtube(im,158,t,mode,p)
  pastefit(im,art(41),(432,210,800,538));text(im,(425,568),'Original peristalsis reference',17,'#273d50',33)
  self.notes(im,['Open lumen','Lesion blocks flow','Open but not propelling'][s],['Coordinated contraction moves material forward.','Contents collect proximal to the lesion. A longer upstream segment can distend.','Paralytic ileus is a failure of motility without a blocking lesion.'][s],'Source: Chapter 41, slides 33, 36–37. Lesion and accumulation layers are schematic.')
 def ch42(self,im,t,s):
  panel(im,(38,157,844,636));base=villi();p=ease(self.phrase('Watch the projections'),self.phrase('The loss of surface')+2,t)
  if s==2:p=1-.6*ease(self.starts[2]+3,self.starts[2]+12,t)
  h=int(400*(1-.62*p));v=base.resize((286,h),Image.Resampling.LANCZOS);im.paste(v,(480,628-h));im.paste(base,(80,228))
  text(im,(72,181),'Reference villi',21,'#273d50',24);text(im,(474,181),'Schematic tissue change',21,'#273d50',26)
  self.notes(im,['Projecting surface','Injury removes surface','Different restrictions'][s],['Actual source micrograph, rotated for comparison.','The supplied celiac pathway includes inflammation and villous flattening.','Gluten exclusion remains permanent. Lactose may be reintroduced after healing.'][s],'Source: Chapter 42, slides 37, 40–41. Animated deformation is not a diagnostic image or recovery forecast.')
 def ch43(self,im,t,s):
  panel(im,(38,157,844,636));green,purple=fibers();progress=ease(self.starts[1],self.starts[1]+7,t)
  if s==2:progress*=1-ease(self.starts[2],self.starts[2]+9,t)
  shift=int(94*progress);canvas=Image.new('RGB',(818,280),'white');canvas.paste(purple,(0,20),purple)
  left=green.crop((0,0,408,239));right=green.crop((408,0,818,239));canvas.paste(left,(shift,20),left);canvas.paste(right,(408-shift,20),right)
  canvas=canvas.resize((780,267),Image.Resampling.LANCZOS);im.paste(canvas,(50,260))
  d=ImageDraw.Draw(im);d.line((168+int(shift*.95),565,701-int(shift*.95),565),fill='#304050',width=3)
  for x in [168+int(shift*.95),701-int(shift*.95)]:d.line((x,555,x,575),fill='#304050',width=3)
  text(im,(270,585),'Sarcomere span changes',21,'#273d50',40)
  if s==0:
   for i in range(7):
    x=140+i*88;y=200+int(25*math.sin(t*2+i));d.ellipse((x-5,y-5,x+5,y+5),fill='#4f99cf')
   text(im,(64,177),'Ca²⁺ availability → binding',21,'#273d50',45)
  self.notes(im,['Calcium enables coupling','Filaments slide','Calcium returns'][s],['Electrical excitation precedes calcium release and actin–myosin binding.','Thin filaments move inward. Their length stays fixed while overlap increases.','Cross-bridges detach and the sarcomere lengthens.'][s],'Source: Chapter 43, slides 53–56. Filament layers were separated from the original OpenStax figure.')
 def ch44(self,im,t,s):
  panel(im,(38,157,844,636));a,mask=trabecula();p=ease(self.phrase('Watch the supporting'),self.phrase('The supplied glucocorticoid')+7,t)
  steps=int(p*8);lo=mask.filter(ImageFilter.MinFilter(1+2*steps)) if steps else mask
  hi=mask.filter(ImageFilter.MinFilter(3+2*steps));eroded=Image.blend(lo,hi,p*8-steps).filter(ImageFilter.GaussianBlur(1.3))
  lost=np.maximum(0,np.array(mask).astype(float)-np.array(eroded).astype(float))/255
  rgb=np.array(a).astype(float);rgb=rgb*(1-lost[:,:,None])+np.array([205,128,100])*lost[:,:,None]
  pastefit(im,a.resize((324,328)),(58,230,402,572));pastefit(im,Image.fromarray(rgb.astype('uint8')).resize((324,328)),(445,230,825,572))
  text(im,(64,179),'Original network',21,'#273d50',27);text(im,(456,179),'Resorption adaptation',21,'#273d50',26)
  self.notes(im,['Supporting connections','Resorption exceeds balance','Mass versus mineralization'][s],['The source image shows a trabecular architecture.','Connections thin as the schematic bone-removal front expands.','Osteoporosis: reduced mass. Osteomalacia: inadequate osteoid mineralization.'][s],'Course basis: Chapter 44, slides 31–33 and 36. The conflicting wording on slide 30 is excluded.')
 def ch45(self,im,t,s):
  panel(im,(38,157,844,636));a=np.array(art(45).crop((0,0,1105,625))).astype(float);h,w=a.shape[:2];yy,xx=np.mgrid[0:h,0:w]
  p=ease(self.phrase('Watch the highlighted'),self.phrase('This deformation')+5,t)
  if s==2:p=1-.35*ease(self.starts[2],self.starts[2]+13,t)
  # Local superior femoral-head deformation, without moving the socket or shaft.
  influence=np.exp(-(((xx-558)/65)**4+((yy-209)/79)**4));sy=yy-34*p*influence;v=sample(a,xx,sy)
  tissue=(xx>490)&(xx<629)&(yy>170)&(yy<310);red=tissue*influence*.20*p
  v=(v*(1-red[:,:,None])+np.array([180,87,70])*red[:,:,None]).astype('uint8');im.paste(Image.fromarray(v).resize((800,452)),(41,169))
  d=ImageDraw.Draw(im);d.ellipse((403,288,497,390),outline='#ce7761',width=3)
  self.notes(im,['Femoral-head location','Contour changes','Remodeling is gradual'][s],['The packet begins with interrupted blood supply to the head.','Necrosis precedes collapse in the supplied sequence.','The schematic retains altered contour. Containment keeps the ball seated in the socket.'][s],'Source: Chapter 45, slides 39–40. Adult reference anatomy supports location only. No recovery time or final shape is predicted.')

def main(ch,frames=False):
 f=Film(ch)
 if '--qa-dir' in sys.argv:
  qa=Path(sys.argv[sys.argv.index('--qa-dir')+1]).resolve();qa.mkdir(parents=True,exist_ok=True)
  if MEDIA in qa.parents or qa==MEDIA: raise ValueError('Keep QA frames outside the public media directory')
  for label,t in [('start',1),('middle',(f.starts[1]+f.starts[2])/2),('late',f.duration-3)]:
   f.frame(t).save(qa/f'ch{ch}-{label}.jpg',quality=92)
 f.frame(1).save(MEDIA/f'ch{ch}-academic-poster.jpg',quality=92)
 if frames:return
 cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',str(MEDIA/'audio'/f'ch{ch}-clear.mp3'),'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(MEDIA/f'ch{ch}-academic.mp4')]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 for n in range(math.ceil(f.duration*FPS)):p.stdin.write(f.frame(n/FPS).tobytes())
 p.stdin.close();assert p.wait()==0;print(ch,'rendered',f.duration,flush=True)
if __name__=='__main__':main(int(sys.argv[1]),'--frames-only' in sys.argv)
