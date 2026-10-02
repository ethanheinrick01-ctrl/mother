"""Source-anchored Exam 5 films. Python/Pillow/NumPy + FFmpeg; no runtime cost.
Original figures are retained separately. Crops, geometric deformations and
colored process layers are schematic adaptations, not measurements or diagnoses.
Run: python3 render_chapters.py 34 [--frames-only]
"""
from pathlib import Path
from functools import lru_cache
import argparse, json, math, subprocess, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent; MEDIA=HERE.parent
W,H,FPS=1280,720,24
BG=(15,20,29); WHITE=(242,245,249); BLUE=(84,177,217)
MUTED=(164,181,198); INK=(38,55,68); RED=(203,83,86)
@lru_cache(None)
def font(n): return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',n)
@lru_cache(None)
def tile(name,crop,size): return Image.open(MEDIA/'figures'/name).convert('RGB').crop(crop).resize(size,Image.Resampling.LANCZOS)
def ease(a,b,t):
    p=max(0,min(1,(t-a)/max(.01,b-a)));return p*p*(3-2*p)
def text(d,xy,value,n=24,color=WHITE,width=30):
    d.multiline_text(xy,'\n'.join(textwrap.wrap(value,width)),font=font(n),fill=color,spacing=7)
def pathpoint(points,p):
    lengths=[math.dist(a,b) for a,b in zip(points,points[1:])]; x=(p%1)*sum(lengths)
    for a,b,ln in zip(points,points[1:],lengths):
        if x<=ln:
            f=x/ln;return (a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)
        x-=ln
    return points[-1]
def stream(d,points,t,count=12,speed=.18,color=BLUE,r=4):
    for i in range(count):
        x,y=pathpoint(points,t*speed+i/count);d.ellipse((x-r,y-r,x+r,y+r),fill=color)
def overlay(im,draw):
    layer=Image.new('RGBA',im.size);draw(ImageDraw.Draw(layer));im.paste(Image.alpha_composite(im.convert('RGBA'),layer).convert('RGB'))
@lru_cache(None)
def alveolar_grid():
    a=np.array(tile('alveolus.jpg',(20,935,735,1650),(570,465)))
    yy,xx=np.indices(a.shape[:2]);dx=xx-270;dy=yy-230
    weight=np.exp(-((dx/190)**4+(dy/180)**4))
    return a,xx,yy,dx,dy,weight
def alveolus(im,collapse=0):
    a,x,y,dx,dy,weight=alveolar_grid()
    # Local inward deformation of the published exchange compartment.
    k=1+collapse*.82*weight
    sx=np.clip((270+dx*k).astype(int),0,a.shape[1]-1)
    sy=np.clip((230+dy*k).astype(int),0,a.shape[0]-1)
    im.paste(Image.fromarray(a[sy,sx]),(105,177))
class Film:
    def __init__(self,ch):
        self.ch=ch;self.info=json.loads((HERE/f'ch{ch}-timing.json').read_text())
        self.starts=[x['start'] for x in self.info['stages']]+[self.info['duration']]
        self.duration=self.info['duration']
    def stage(self,t):return max(i for i,s in enumerate(self.starts[:-1]) if s<=t)
    def frame(self,t):
        im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im);s=self.stage(t)
        d.text((38,20),f'NU545 / EXAM 5 / CHAPTER {self.ch}',font=font(17),fill=MUTED)
        d.text((38,52),self.info['title'],font=font(30),fill=WHITE)
        d.line((38,98,1242,98),fill=(53,65,83),width=1)
        d.text((40,120),self.info['stages'][s]['title'],font=font(24),fill=BLUE)
        d.rounded_rectangle((40,167,788,646),radius=10,fill='white')
        getattr(self,f'ch{self.ch}')(im,t,s)
        d=ImageDraw.Draw(im);d.line((38,668,1242,668),fill=(38,48,64),width=3)
        d.line((38,668,38+int(1204*t/self.duration),668),fill=BLUE,width=3)
        license='CC BY 4.0' if self.ch==34 else 'CC BY 4.0 + 3.0' if self.ch in (35,36) else 'CC BY 3.0'
        d.text((38,684),f'OpenStax College · {license} · adapted motion; schematic scale, quantities and time',font=font(14),fill=MUTED)
        d.text((1150,684),f'{int(t):02d}/{math.ceil(self.duration):02d}s',font=font(14),fill=MUTED)
        return im
    def notes(self,im,rows):
        d=ImageDraw.Draw(im)
        for i,(head,body) in enumerate(rows):
            text(d,(828,177+i*155),head,25,BLUE)
            text(d,(828,222+i*155),body,23,WHITE)
    def ch34(self,im,t,s):
        collapse=.78*ease(self.starts[3]+1,self.starts[3]+7,t) if s==3 else .035*(1+math.sin(t*1.8))
        alveolus(im,collapse);d=ImageDraw.Draw(im)
        if s in (1,2):
            # Secretion originates at the visible yellow type-II cell boundary.
            n=int(28*ease(self.starts[1]+2,self.starts[2]+3,t))
            for i in range(n):
                a=2*math.pi*i/28;x=367+163*math.cos(a);y=390+143*math.sin(a)
                d.ellipse((x-3,y-3,x+3,y+3),fill=(37,134,163))
            d.text((70,612),'Surfactant at the inner air surface',font=font(21),fill=INK)
        if s==4:
            stream(d,[(364,385),(500,383),(565,375),(633,331)],t,10,.1,(54,133,179),5)
            stream(d,[(628,258),(647,365),(619,491),(589,561)],t,9,.17,RED,5)
            d.text((70,612),'Oxygen crosses; blood carries it onward',font=font(20),fill=INK)
        labels=[('Open airspace','Gas exchange requires an available surface'),('Cell roles','Type I: structure. Type II: surfactant'),('Lower surface tension','Surface coating helps prevent collapse'),('Inadequate surfactant','Airspace closes; ventilation falls'),('Different steps','Diffusion crosses the barrier; perfusion moves blood')]
        self.notes(im,[labels[s],('Source boundary','Geometry and particle counts are schematic')])
    def ch35(self,im,t,s):
        injury=ease(self.starts[1],self.starts[1]+8,t) if s<=1 else 1
        alveolus(im,.53*injury if s<4 else 0)
        if s in (1,2,3):
            def layers(a):
                # Fluid accumulates within the source airspace, below the capillary.
                top=530-170*injury;a.pieslice((208,247,548,550),0,180,fill=(82,165,205,75))
                a.rectangle((260,top,493,540),fill=(82,165,205,80))
                for i in range(9):
                    x,y=pathpoint([(603,344),(523,384),(435,466)],t*.13+i/9)
                    a.ellipse((x-5,y-5,x+5,y+5),fill=(52,137,190,180))
                if s>=2:
                    growth=ease(self.starts[2],self.starts[2]+6,t)
                    for i in range(int(12*growth)):
                        x=240+(i*67)%277;y=320+(i*39)%193
                        a.ellipse((x-8,y-6,x+8,y+6),fill=(182,119,165,190))
                if s==3:
                    n=int(18*ease(self.starts[3],self.starts[3]+5,t))
                    for i in range(n):
                        x=226+i*16;a.line((x,299,x+75,529),fill=(129,80,116,180),width=4)
            overlay(im,layers)
        if s==4:
            base=tile('airway.jpg',(15,70,980,790),(630,400));im.paste(base,(90,202))
            p=ease(self.starts[4],self.starts[4]+7,t)
            def airway(a):
                a.rectangle((98,216,708,252+int(65*p)),fill=(100,144,82,155))
                a.rectangle((98,327-int(25*p),708,344),fill=(224,130,99,160))
            overlay(im,airway)
        labels=[('Barrier injury','The alveolar and capillary region is affected'),('Exudative phase','Leak, surfactant inactivation and collapse'),('Proliferative phase','Type II cells, fibroblasts and myofibroblasts'),('Fibrotic remodeling','Exchange architecture is disrupted'),('Asthma contrast','Conducting-airway swelling, contraction and mucus')]
        self.notes(im,[labels[s],('Overlapping phases','The sequence is not an inevitable patient clock')])
    def ch36(self,im,t,s):
        if s==4:
            alveolus(im,.75*ease(self.starts[4]+1,self.starts[4]+5,t))
            self.notes(im,[('Different initiating defect','Newborn RDS: inadequate surfactant'),('Different surface','Alveolar collapse, rather than mucus clearance')]);return
        base=tile('airway.jpg',(15,70,980,790),(700,460)).copy()
        # Animate the existing ciliary strip; no fabricated anatomical organ.
        strip=base.crop((0,53,700,75));base.paste(strip,(int(2*math.sin(t*7)),53));im.paste(base,(64,177))
        water=1-.85*ease(3,self.starts[1]+3,t)
        layerthick=20+int(59*(1-water))
        def layers(a):
            a.rectangle((70,185,754,185+layerthick),fill=(104,157,78,190))
            # The free watery layer visibly thins while secretions adhere.
            a.rectangle((70,185+layerthick,754,185+layerthick+max(3,int(21*water))),fill=(52,155,211,110))
            for i in range(8):
                x=90+(i*81+(t*32 if s==0 else 6*math.sin(t)))%635;y=207+(i%3)*9
                a.ellipse((x-7,y-3,x+7,y+3),fill=(170,82,106,230))
            if s>=2:
                p=ease(self.starts[2],self.starts[2]+6,t)
                for i in range(int(18*p)):
                    x=75+i*37
                    pts=[(x+j*5,205+10*math.sin(j+i)) for j in range(12)]
                    a.line(pts,fill=(122,72,149,200),width=3)
            if s==3:
                p=ease(self.starts[3],self.starts[3]+7,t)
                for i in range(int(10*p)):
                    x=120+i*55;a.line((x,306,x+23,466),fill=(145,90,137,130),width=5)
        overlay(im,layers);d=ImageDraw.Draw(im)
        d.text((81,598),'Normal airway panel + CF mechanism overlays',font=font(21),fill=INK)
        labels=[('Surface liquid falls','Defective chloride transport; increased sodium absorption'),('Secretions adhere','Less effective clearance; bacteria remain'),('Inflammation adds viscosity','Neutrophil DNA and filamentous actin'),('Persistent obstruction','Bronchiectasis and fibrosis can follow')]
        self.notes(im,[labels[s],('Original art disclosure','Normal airway panel from an asthma comparison; never labeled CF tissue')])
    def ch37(self,im,t,s):
        # Published loop and collecting duct kept in their original orientation.
        loop=tile('nephron.jpg',(410,725,720,1850),(150,450));duct=tile('nephron.jpg',(750,1000,960,2170),(95,450))
        im.paste(loop,(208,180));im.paste(duct,(564,180))
        d=ImageDraw.Draw(im);d.text((69,182),'Descending',font=font(20),fill=INK);d.text((365,183),'Ascending',font=font(20),fill=INK)
        d.text((520,614),'Collecting duct',font=font(20),fill=INK)
        gradient=ease(self.starts[1],self.starts[1]+9,t) if s<=1 else 1
        def shade(a):
            for y in range(240,604,8):
                depth=(y-240)/364;a.rectangle((369,y,514,y+7),fill=(207,146,88,int(25+120*depth*gradient)))
        overlay(im,shade);d=ImageDraw.Draw(im)
        # Centerlines calibrated to the original tubular lumens in this crop.
        desc=[(244,180),(232,288),(233,448),(252,584),(264,606)]
        asc=[(264,606),(285,560),(292,460),(282,372),(282,215),(300,180)]
        stream(d,desc,t,10,.12,BLUE,4);stream(d,asc,t,10,.12,(204,132,53),4)
        if s>=1:
            stream(d,[(292,427),(363,427),(422,427)],t,6,.3,(197,117,31),4)
        if s>=2:
            stream(d,[(234,482),(182,482),(141,482)],t,6,.24,BLUE,4)
        if s==4:
            stream(d,[(617,213),(617,406),(625,595)],t,7,.14,BLUE,4)
            stream(d,[(624,496),(687,496),(734,496)],t,8,.32,BLUE,4)
            # Final outflow visibly decreases after ADH raises water permeability.
            n=int(9-6*ease(self.starts[4]+4,self.starts[4]+12,t))
            stream(d,[(625,595),(628,637)],t,n,.19,BLUE,4)
        text(d,(380,275),'Medullary interstitium',19,INK,14)
        labels=[('Two neighboring limbs','Opposite directions and different permeability'),('Build the gradient','Ascending sodium and chloride transport'),('Concentrate tubular fluid','Water leaves the descending limb'),('Dilute tubular fluid','Ascending solute loss without water loss'),('ADH adjustment','More collecting-duct water reabsorption; less final urine')]
        self.notes(im,[labels[s],('Teaching layers','Colors show water and solute, not measured concentrations')])
    def ch38(self,im,t,s):
        base=tile('kidney.jpg',(0,0,1975,1129),(735,420));a=np.array(base)
        yy,xx=np.indices(a.shape[:2]);cx,cy=445,180
        amount=.45*ease(self.starts[2],self.starts[2]+8,t) if s<=2 else .45*(1-ease(self.starts[3],self.starts[3]+8,t))
        radius=np.exp(-((xx-cx)/50)**4-((yy-cy)/94)**4)
        # Deformation is confined to the pelvis/calyces, with the original
        # whole figure retained here so no clipped labels pretend to be text.
        k=1+amount*radius
        x=np.clip((cx+(xx-cx)/k).astype(int),0,734);y=np.clip((cy+(yy-cy)/k).astype(int),0,419)
        im.paste(Image.fromarray(a[y,x]),(47,199));d=ImageDraw.Draw(im)
        blocked=s in (1,2);flow=[(497,372),(458,377),(408,413),(393,489),(391,589)]
        stream(d,flow[:-1] if blocked else flow,t,13 if s==3 else 8,.28 if s==3 else .11,BLUE,4)
        if blocked:d.rounded_rectangle((381,528,403,541),radius=3,fill=RED)
        labels=[('Follow outflow','Renal pelvis to ureter toward bladder'),('Interrupt drainage','Hydroureter and hydronephrosis are distinct'),('Upstream expansion','Location, completeness and duration matter'),('Release and increased flow','Postobstructive diuresis can disturb fluid and electrolytes'),('Scope remains incomplete','The obstruction-to-hypertension bridge needs the textbook')]
        self.notes(im,[labels[s],('Source-based adaptation','Dilation and output are schematic, not quantitative')])
    def ch39(self,im,t,s):
        base=tile('bladder.jpg',(230,0,1030,1070),(590,460));im.paste(base,(112,177));d=ImageDraw.Draw(im)
        # Original panel (a) only: the separately copyrighted micrograph is excluded.
        left=[(180,183),(190,238),(220,290),(271,344),(342,415)]
        right=[(665,183),(621,252),(579,308),(525,367),(469,415)]
        if s<=1:
            stream(d,left,t,7,.16,BLUE,5);stream(d,right,t,7,.16,BLUE,5)
            if s==1:stream(d,[(413,484),(413,559),(411,623)],t,9,.2,BLUE,5)
        else:
            stream(d,left[::-1],t,10,.18,(105,145,206),5)
            if s>=3:
                stream(d,left[::-1],t,6,.18,(184,77,107),7)
        overlay(im,lambda a:a.ellipse((320,327,492,480),fill=(92,159,214,55)))
        d=ImageDraw.Draw(im);d.text((163,601),'Same anatomy; flow reverses toward the kidney',font=font(20),fill=INK)
        labels=[('Ureter entry','Identify the ureter-bladder junction'),('Protect normal emptying','The junction limits backward movement'),('Retrograde urine','Abnormal junction or insertion permits reflux'),('Infected urine travels upward','Recurrent pyelonephritis may follow'),('Findings and limits','Silent cases, UTIs, fever and poor growth; grading remains a source gap')]
        self.notes(im,[labels[s],('Figure use','Published illustration panel (a); no micrograph reuse')])
def render(ch,frames_only=False,review_dir=None):
    f=Film(ch);f.frame(1).save(MEDIA/f'ch{ch}-poster.jpg',quality=92)
    # Five stage receipts for visual review, not a substitute for playback QA.
    frames=[f.frame((a+b)/2).resize((512,288)) for a,b in zip(f.starts,f.starts[1:])]
    sheet=Image.new('RGB',(1536,576),BG)
    for i,im in enumerate(frames):sheet.paste(im,((i%3)*512,(i//3)*288))
    if review_dir:
        review_dir.mkdir(parents=True,exist_ok=True);sheet.save(review_dir/f'ch{ch}-review.jpg',quality=90)
    if frames_only:return
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','pipe:0','-i',str(MEDIA/f'ch{ch}-clear.mp3'),'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart','-shortest',str(MEDIA/f'ch{ch}-explainer.mp4')]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for i in range(math.ceil(f.duration*FPS)):
        p.stdin.write(f.frame(i/FPS).tobytes())
        if i%(FPS*15)==0:print(ch,round(i/FPS),flush=True)
    p.stdin.close();assert p.wait()==0
    print(ch,'rendered',flush=True)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('chapter',type=int);p.add_argument('--frames-only',action='store_true');p.add_argument('--review-dir',type=Path);a=p.parse_args();render(a.chapter,a.frames_only,a.review_dir)
