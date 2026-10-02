"""Unit 4 scholarly process films. Run: python render_chapters.py CHAPTER [--frames-only].
Pillow/NumPy/FFmpeg; exact Clear audio and aligned timing are local. Original art is
preserved. Cropping, cell motion, clot overlays and volume markers are explicitly
schematic adaptations, never measured time/scale or additional tested facts.
"""
from pathlib import Path
from functools import lru_cache
import argparse,json,math,subprocess,textwrap
from PIL import Image,ImageDraw,ImageFont
import numpy as np
HERE=Path(__file__).resolve().parent;MEDIA=HERE.parent;W,H,FPS=1280,720,24
BG=(15,20,29);WHITE=(242,245,249);BLUE=(84,177,217);MUTED=(164,181,198);GOLD=(243,185,114);RED=(210,73,85)
@lru_cache(None)
def font(n):return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',n)
@lru_cache(None)
def art(name):return Image.open(MEDIA/'figures'/name).convert('RGBA')
@lru_cache(None)
def piece(name,crop,size,transparent=False):
 im=art(name).crop(crop).resize(size,Image.Resampling.LANCZOS)
 if transparent:
  a=np.array(im);a[:,:,3]=np.where(np.min(a[:,:,:3],axis=2)>240,0,a[:,:,3]);im=Image.fromarray(a)
 return im
@lru_cache(None)
def rbc(size=64):return piece('hematopoiesis.jpg',(420,754,520,870),(size,size),True)
@lru_cache(None)
def sickle(size=100):return piece('sickle.png',(40,30,700,340),(size,int(size*.48)),False)
def put(im,cell,x,y):im.paste(cell,(int(x-cell.width/2),int(y-cell.height/2)),cell)
def txt(d,xy,s,n=25,col=WHITE,width=33):d.multiline_text(xy,'\n'.join(textwrap.wrap(s,width)),font=font(n),fill=col,spacing=8)
def notes(d,rows,x=860,y=195):
 for i,(h,s) in enumerate(rows):txt(d,(x,y+i*145),h,23,BLUE,28);txt(d,(x,y+38+i*145),s,23,WHITE,28)
def bar(d,x,y,w,level,label,col=BLUE):
 d.rectangle((x,y,x+w,y+18),fill=(43,56,70));d.rectangle((x,y,x+w*max(0,min(1,level)),y+18),fill=col);txt(d,(x,y+28),label,20,MUTED,38)
def pathpoint(points,f):
 ds=[math.dist(points[i],points[i+1]) for i in range(len(points)-1)];total=sum(ds);p=f*total
 for i,length in enumerate(ds):
  if p<=length:return tuple(points[i][j]+(points[i+1][j]-points[i][j])*p/max(length,.01) for j in [0,1])
  p-=length
 return points[-1]
def stream(im,points,t,count=6,color=RED,speed=.14,stop=None,hidden=None):
 d=ImageDraw.Draw(im)
 for i in range(count):
  f=(t*speed+i/count)%1
  if stop is not None:f=min(f,stop)
  if hidden and hidden[0]<f<hidden[1]:continue
  x,y=pathpoint(points,f);d.ellipse((x-6,y-6,x+6,y+6),fill=color,outline=(255,255,255),width=1)
def stage(t,timing):
 starts=[s['start'] for s in timing['stages']];k=max(i for i,v in enumerate(starts) if t>=v);end=starts[k+1] if k+1<len(starts) else timing['duration'];return k,t-starts[k],max(.1,end-starts[k])
def vessel(im):
 a=art('hemostasis.jpg');w,h=a.size
 # Scholarly vessel segment from the normal clotting figure, not fabricated anatomy.
 im.paste(piece('hemostasis.jpg',(int(.17*w),int(.735*h),int(.49*w),int(.855*h)),(740,270)),(65,230))

def c28(im,k,t,dur):
 d=ImageDraw.Draw(im)
 if k==0:
  vessel(im)
  for i in range(5):
   f=(t*.16+i/5)%1;x=110+f*650;y=375+15*math.sin(i);cell=rbc(70)
   # reversible squeezing changes the actual scholarly cell aspect ratio.
   scale=1-.44*math.exp(-((f-.5)/.12)**2);cell=cell.resize((70,int(70*scale)))
   put(im,cell,x,y)
  notes(d,[('Reversible deformability','Shape changes permit capillary passage.'),('Adult erythrocyte','Oxygen carriage; 120-day listed life span.')])
 elif k==1:
  im.paste(piece('hematopoiesis.jpg',(250,0,1480,1110),(520,470)),(60,170))
  # Increasing actual-cell output, rather than a static highlighted lineage tree.
  for i in range(1+min(12,int(t*.8))):put(im,rbc(48),610+(i%3)*58,280+(i//3)*60)
  bar(d,90,620,660,min(1,t/max(dur*.65,1)),'Renal hypoxia → EPO → marrow production')
  notes(d,[('Production signal','The kidney releases erythropoietin.'),('Output evidence','Reticulocytes track release of new red cells.')])
 elif k==2:
  put(im,piece('hematopoiesis.jpg',(900,1550,1170,1850),(230,250),True),240,380)
  x=675-min(t*85,440)
  if t<5:put(im,rbc(max(10,int(80*(1-max(0,t-3)/2)))),x,370)
  if t>6:
   for i,col in enumerate([GOLD,BLUE,RED]):
    stream(im,[(300,390),(480,270+120*i),(710,270+120*i)],t-6,3,col,.09)
   for i,s in enumerate(['Iron: recycled','Globin: amino acids','Porphyrin: bilirubin']):txt(d,(440,210+120*i),s,22,WHITE,27)
  notes(d,[('Senescent cell removal','Macrophages dismantle aging erythrocytes.'),('Distinct products','Track recycling separately from pigment formation.')])
 else:
  for i in range(10):
   f=(t*.12+i/10)%1; x=100+f*570; y=310 if f<.75 else 310+(f-.75)*660
   d.ellipse((x-10,y-10,x+10,y+10),fill=GOLD)
  for i in range(min(16,int(t*.8))):d.ellipse((600+(i%4)*26,475+(i//4)*25,616+(i%4)*26,491+(i//4)*25),fill=GOLD)
  put(im,rbc(100),190,490);txt(d,(80,240),'Plasma transport: transferrin',27,BLUE,36);txt(d,(440,590),'Intracellular storage: ferritin',25,BLUE,30)
  notes(d,[('Keep roles separate','EPO signals; transferrin carries; ferritin stores.'),('Source boundary','Complete iron absorption remains a textbook gap.')])

def c29(im,k,t,dur):
 d=ImageDraw.Draw(im);vessel(im)
 txt(d,(75,170),'Normal repair figure → DIC process overlay',24,BLUE,44)
 if k==0:
  stream(im,[(110,375),(720,375)],t,5,RED,.1)
  notes(d,[('Reference','Local clot formation supports vessel repair.'),('Change in DIC','Activation becomes widespread.')])
 else:
  buildup=min(1,t/6) if k==1 else 1
  for q,x in enumerate([310,470,620]):
   for j in range(int(14*buildup)):
    yy=290+j*9;d.line((x-35,yy,x+35,yy+32),fill=GOLD,width=3);d.line((x+35,yy,x-35,yy+32),fill=GOLD,width=3)
  stream(im,[(110,375),(745,375)],t,7,RED,.14,stop=.27 if buildup>.5 else None)
  if k==1:notes(d,[('Tissue factor activation','Thrombin and fibrin increase.'),('Intravascular deposits','Flow falls as microvessels become obstructed.')])
  if k==2:
   level=max(.12,1-t/max(dur*.6,1));bar(d,90,550,660,level,'Available platelets and factors: consumption',GOLD)
   for i in range(5):
    y=510+((t*35+i*30)%90);d.ellipse((75+i*20,y,84+i*20,y+13),fill=RED)
   notes(d,[('Clotting and bleeding','Consumption depletes hemostatic components.'),('Fibrinolysis','Accelerated fibrinolysis accompanies activation.')])
  if k==3:
   bar(d,90,550,660,.3,'Treat the driver; support hemostasis and organs')
   notes(d,[('Underlying pathology','Remove the initiating condition.'),('Explicit gaps','Complete diagnostic laboratory pattern and treatment indications are missing.')])

def c30(im,k,t,dur):
 d=ImageDraw.Draw(im)
 if k!=2:vessel(im)
 if k in [0,1]:
  for i in range(6):
   f=(t*.13+i/6)%1
   if k==1:f=min(f,.57+i*.018)
   cell=rbc(65) if k==0 or t<3 else sickle(105)
   put(im,cell,100+f*690,335+(i%2)*55)
  notes(d,[('Flexible passage' if k==0 else 'Stiff cells obstruct','Normal cell motion' if k==0 else 'HbS polymerization reduces deformability.'),('Scale is schematic','No speed, size or cell count is a measured clinical value.')])
 elif k==2:
  for j,(label,description) in enumerate([('Vasoocclusive','Obstruction'),('Aplastic','Production stops'),('Sequestration','Splenic pooling'),('Hyperhemolytic','Destruction rises')]):
   yy=205+j*110;txt(d,(65,yy),label,24,BLUE,22);txt(d,(280,yy),description,24,WHITE,26)
   active=max(0,t-j*3.2)
   count=7 if j==0 else max(1,7-int(active)) if j==1 else min(10,2+int(active)) if j==2 else max(0,7-int(active*.5))
   for i in range(count):put(im,sickle(48) if j==0 else rbc(35),530+i*25,yy+45)
  notes(d,[('Four mechanisms','A crisis label identifies a different failure in flow, production, pooling or survival.'),('Compare before treating','Names alone do not replace the mechanism.')])
 else:
  for i in range(5):put(im,rbc(80),140+i*130,330+25*math.sin(t+i))
  bar(d,90,530,650,.75,'Oxygen is qualified by current hypoxia')
  notes(d,[('Source-supported care','Fluids, pain/infection care and hydroxyurea are listed.'),('Quarantined wording','Substitution direction and missing diagnostic testing stay explicit.')])

def heart(im,x=75,y=165,h=470):
 w=int(h*803/992);im.paste(piece('heart.jpg',(392,0,1195,992),(w,h)),(x,y));return x,y,w,h
def hp(p,box):x,y,w,h=box;return (x+(p[0]-392)*w/803,y+p[1]*h/992)
def c31(im,k,t,dur):
 d=ImageDraw.Draw(im);box=heart(im);conv=lambda pts:[hp(p,box) for p in pts]
 def closed(points):
  for p in points:
   x,y=hp(p,box);d.line((x-16,y,x+16,y),fill=RED,width=5)
 av=[(620,610),(965,510)];semi=[(760,480),(870,480)]
 if k==0:
  closed(semi)
  stream(im,conv([(970,370),(995,475),(1015,650)]),t,8,RED,.15)
  stream(im,conv([(570,480),(610,610),(715,720)]),t,8,BLUE,.15)
  state='AV valves open; semilunar valves closed'
 elif k==1:
  closed(av+semi)
  bar(d,520,300,255,min(1,t/max(dur*.7,1)),'Pressure rises; volume unchanged',GOLD);state='All valves closed'
 elif k==2:
  closed(av)
  # The posterior aortic segment is hidden behind the pulmonary trunk in
  # this anterior cutaway. Do not draw red flow inside the blue trunk.
  stream(im,conv([(1000,710),(940,600),(870,510),(870,480),(720,390),(720,300),(780,170),(800,100)]),t,8,RED,.16,hidden=(.44,.72))
  stream(im,conv([(720,710),(760,560),(780,480),(875,300),(990,220)]),t,8,BLUE,.16)
  state='Semilunar valves open; blood is ejected'
 else:
  closed(semi if t>6 else av+semi)
  state='Semilunar closure → relaxation → AV opening'
  if t>6:
   stream(im,conv([(970,370),(995,475),(1015,650)]),t,6,RED,.15);stream(im,conv([(570,480),(610,610),(715,720)]),t,6,BLUE,.15)
  bar(d,520,300,255,max(0,1-t/6),'Pressure falls before renewed filling')
 txt(d,(65,645),state,24,BLUE,56)
 notes(d,[('Pressure gates flow','Valve opening follows the chamber–outflow pressure relationship.'),('One-way sequence','Filling, closed-valve contraction, ejection, closed-valve relaxation.')])

def c32(im,k,t,dur):
 d=ImageDraw.Draw(im);a=heart(im,50,170,405);b=heart(im,455,170,405)
 txt(d,(60,140),'Contraction / ejection',24,BLUE,28);txt(d,(465,140),'Relaxation / filling',24,BLUE,28)
 for j,box in enumerate([a,b]):
  cyc=(t%5)/5;fill=int(20*(cyc/.5 if cyc<.5 else 1-(cyc-.5)*2))
  if k==1 and j==0:fill=max(12,fill)
  if k==2 and j==1:fill=min(7,fill)
  for i in range(max(0,fill)):
   x,y=hp((975+(i%4)*20,590+(i//4)*35),box);d.ellipse((x-4,y-4,x+4,y+4),fill=GOLD)
 if k==0:notes(d,[('Compare two routes','The same chamber anatomy anchors both mechanical comparisons.'),('Schematic markers','Markers represent relative filling and residual blood.')])
 if k==1:notes(d,[('Systolic dysfunction','Impaired contraction leaves more blood after ejection.'),('Reduced output','Less blood is moved with each beat.')])
 if k==2:notes(d,[('Diastolic dysfunction','Poor relaxation/compliance limits filling.'),('Preserved fraction','A fraction can remain preserved while the incoming volume is inadequate.')])
 if k==3:
  notes(d,[('Pulmonary congestion','Left failure: orthopnea, edema and frothy sputum.'),('Systemic congestion','Right failure: JVD and peripheral edema.')]);bar(d,80,610,670,min(1,t/7),'Congestion increases upstream of the failing pump',GOLD)

def c33(im,k,t,dur):
 d=ImageDraw.Draw(im);crop=(0,60,1450,940);size=(790,480);im.paste(piece('vsd.jpg',crop,size),(40,160))
 def pt(p):return (40+p[0]*790/1450,160+(p[1]-60)*480/880)
 if k>=1:
  pts=[pt(p) for p in [(1280,660),(1215,665),(1140,700),(1090,735),(1100,560),(1100,430)]]
  stream(im,pts,t,7 if k==1 else 13,RED,.13)
 if k==0:notes(d,[('Paired anatomy','Normal separation appears beside the ventricular communication.'),('Visualization only','CDC artwork adds no new scored factual pool.')])
 if k==1:notes(d,[('Left → right','Higher LV pressure adds flow through the communication.'),('Pulmonary destination','The extra stream returns toward the lungs.')])
 if k==2:notes(d,[('Large-shunt burden','Pulmonary overcirculation and HF may follow.'),('Compare lesion types','A shunt differs from outflow obstruction and parallel circuits.')])
 if k==3:notes(d,[('Growth consequence','Poor feeding can limit weight gain.'),('Source boundary','Complete murmur maps and later cyanosis criteria remain missing.')])
 txt(d,(45,651),'CDC visualization; use does not imply CDC/HHS/U.S. Government endorsement.',19,MUTED,83)

funcs={28:c28,29:c29,30:c30,31:c31,32:c32,33:c33}
credits={28:'OpenStax (2013/2016), CC BY 3.0/4.0; cell crops and schematic motion',29:'OpenStax College (2013); CC BY 3.0; vessel crop with schematic DIC overlays',30:'OpenStax + DBCLS; CC BY 3.0/4.0; cell crops and schematic motion',31:'OpenStax College (2013), CC BY 3.0; heart crop with schematic flow',32:'OpenStax College (2013), CC BY 3.0; heart crop with schematic volume',33:'CDC/NCBDDD; U.S. public domain; crop with schematic flow overlays'}
def frame(ch,t,timing):
 im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im);k,elapsed,duration=stage(t,timing)
 txt(d,(40,20),f'NU545 / EXAM 4 / CHAPTER {ch}',18,MUTED,70);txt(d,(40,55),timing['title'],30,WHITE,70)
 d.line((40,103,1240,103),fill=(52,65,80),width=1);txt(d,(40,118),timing['stages'][k]['title'],25,BLUE,60)
 funcs[ch](im,k,elapsed,duration);d=ImageDraw.Draw(im);d.line((40,680,1240,680),fill=(52,65,80),width=1);txt(d,(40,690),credits[ch],14,MUTED,128)
 return im
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('chapter',type=int);a.add_argument('--frames-only',action='store_true');a.add_argument('--qa-dir',type=Path,default=Path('/private/tmp/nu545-exam4-film-review'));args=a.parse_args();ch=args.chapter
 timing=json.loads((HERE/f'ch{ch}-timing.json').read_text());frame(ch,0,timing).save(MEDIA/f'ch{ch}-academic-poster.jpg',quality=94)
 review=args.qa_dir;review.mkdir(parents=True,exist_ok=True)
 for i,s in enumerate(timing['stages']):frame(ch,min(timing['duration']-.1,s['start']+6),timing).save(review/f'ch{ch}-stage{i+1}.jpg',quality=93)
 if not args.frames_only:
  cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i',str(MEDIA/f'ch{ch}-clear.mp3'),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-shortest',str(MEDIA/f'ch{ch}-academic.mp4')]
  proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
  for i in range(math.ceil(timing['duration']*FPS)):proc.stdin.write(frame(ch,i/FPS,timing).tobytes())
  proc.stdin.close();assert proc.wait()==0
 print('Rendered',ch,timing['duration'])
