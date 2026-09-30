"""Source-figure teaching film. Original textbook files remain unmodified.

Animation composites crop/rescale the attributed illustrations and add schematic
water-flow and hormone-store layers. This is a teaching adaptation, not original
textbook footage. Captions align to the completed Clear audio's sentence pauses.
"""
from pathlib import Path
import json, math, subprocess, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
MEDIA = HERE.parent
W,H,FPS,DURATION = 1280,720,24,57.816
FONT = '/System/Library/Fonts/Supplemental/Arial.ttf'
font=lambda n: ImageFont.truetype(FONT,n)
BG=(15,20,29); WHITE=(242,245,249); BLUE=(84,177,217); MUTED=(164,181,198)
pit=Image.open(MEDIA/'figures/posterior-pituitary.jpg').convert('RGB')
renal=Image.open(MEDIA/'figures/collecting-tubule-water.jpg').convert('RGB')
# Retain the actual tissue/vessel geometry and colors. Original full figures are
# independently accessible in the Guide with their labels and attribution.
clean=Image.open(MEDIA/'renal-clean.png').convert('RGB')
# Annotation removal is an AI-assisted edit of the public textbook reference.
# Use the first cell at its original aspect ratio; two-cell comparison keeps the
# wider anatomical context. Original figure files are never overwritten.
tissue_one=clean.crop((15,15,1340,432))
tissue_two=clean.crop((15,15,1340,863))

sentences=[
(0,7.465,'When plasma osmolality increases, or circulating volume falls, the body signals for antidiuretic hormone, ADH.'),
(7.989,11.598,'Osmoreceptors in the hypothalamus sense the concentration of the plasma.'),
(12.231,14.870,'The hypothalamus also synthesizes ADH.'),
(15.317,18.965,'The hormone is stored in the posterior pituitary, then released into the blood.'),
(19.529,25.100,'Keep those locations separate: synthesis in the hypothalamus, storage and release from the posterior pituitary.'),
(26.217,27.550,'Now follow the blood to the kidney.'),
(28.003,32.742,'ADH acts on the renal collecting ducts and increases their permeability to water.'),
(33.364,35.612,'More water is reabsorbed into the blood.'),
(36.469,40.193,'That is the link between the hormone signal and the fluid response.'),
(40.193,41.964,'Compare that with diabetes insipidus.'),
(42.514,45.547,'In the neurogenic form, there is insufficient ADH.'),
(45.942,49.817,'In the nephrogenic form, the collecting tubules are insensitive to ADH.'),
(50.143,52.839,'Both can leave the patient unable to concentrate urine.'),
(53.463,57.069,'The same result can come from a supply problem or a response problem.')]
stages=[
dict(start=0,title='Stimulus and sensor',text='Higher plasma osmolality or lower circulating volume signals for ADH.'),
dict(start=12.231,title='Synthesis, storage, release',text='Synthesis occurs in the hypothalamus. Storage and release occur in the posterior pituitary.'),
dict(start=26.217,title='Water reabsorption',text='ADH increases collecting-duct water permeability. More water returns to blood.'),
dict(start=40.193,title='Two DI mechanisms',text='Neurogenic DI lacks adequate ADH. Nephrogenic DI has renal insensitivity to ADH. Both impair urine concentration.')]

def ease(a,b,t):
    p=max(0,min(1,(t-a)/(b-a)));return p*p*(3-2*p)

def text(d,xy,value,size=26,color=WHITE,limit=50):
    d.multiline_text(xy,'\n'.join(textwrap.wrap(value,limit)),font=font(size),fill=color,spacing=8)

def draw_header(im,t,title):
    d=ImageDraw.Draw(im)
    d.text((38,20),'NU545  /  EXAM 3',font=font(17),fill=MUTED)
    d.text((38,52),title,font=font(30),fill=WHITE)
    d.line((38,98,1242,98),fill=(53,65,83),width=1)
    d.text((38,682),'Adapted OpenStax College illustrations (2013), CC BY 3.0 · schematic time, flow and scale',font=font(15),fill=MUTED)
    d.text((1138,682),f'{int(t):02d} / 58 s',font=font(15),fill=MUTED)
    d.line((38,668,1242,668),fill=(38,48,64),width=3)
    d.line((38,668,38+int(1204*t/DURATION),668),fill=BLUE,width=3)

def layer_pituitary(im,t):
    im.paste(pit.resize((663,536),Image.Resampling.LANCZOS),(36,112))
    d=ImageDraw.Draw(im)
    if t<7.989:
        text(d,(738,132),'The stimulus',29)
        text(d,(738,196),'Higher plasma osmolality',25,limit=30)
        text(d,(738,250),'or lower circulating volume',25,limit=30)
        text(d,(738,346),'Follow the ADH pathway from the hypothalamus to the posterior pituitary.',25,MUTED,30)
    else:
        text(d,(738,130),'Keep the locations separate',28,limit=30)
        text(d,(738,209),'Hypothalamus',27,BLUE)
        text(d,(738,255),'Senses osmolality and synthesizes ADH',24,limit=29)
        text(d,(738,355),'Posterior pituitary',27,(240,180,118))
        text(d,(738,402),'Stores and releases ADH into blood',24,limit=29)
    # Vesicle quantities accumulate in the actual posterior-pituitary tissue,
    # then release. They indicate stored hormone rather than anatomical scale.
    store=ease(12.2,16.8,t);release=ease(17.0,19.0,t)
    for i in range(int(14*store*(1-.7*release))):
        a=i*2.4;r=10+4*(i%4);x=466+math.cos(a)*r;y=549+math.sin(a)*r
        d.ellipse((x-2,y-2,x+2,y+2),fill=(207,71,43))
    if t>=17:
        for i in range(8):
            p=((t-17)*.32+i/8)%1
            x=464+25*p;y=535+65*p
            d.ellipse((x-2,y-2,x+2,y+2),fill=(219,75,44))
    if 8<t<15.3:d.ellipse((465,282,494,310),outline=(207,71,43),width=3)
    if 15.3<t:d.ellipse((421,483,514,604),outline=(207,71,43),width=3)

def flow_panel(im,box,t,permeability,label,sub,returning=True):
    x,y,w,h=box
    tile=tissue_one if w>600 else tissue_two
    base=tile.resize((w,h),Image.Resampling.LANCZOS).convert('RGBA')
    water=Image.new('RGBA',(w,h),(0,0,0,0));d=ImageDraw.Draw(water)
    # A continuous volume of filtrate moves down the actual collecting lumen.
    # When permeability rises, stream width falls after water crosses the cells.
    left=w*.085;topwidth=w*.20;bottomwidth=topwidth*(1-.55*permeability)
    pts=[]
    for v in np.linspace(0,1,90):
        wave=3*math.sin(v*19-t*2.3)
        pts.append((left+wave,h*v))
    for v in np.linspace(1,0,90):
        wid=topwidth+(bottomwidth-topwidth)*v
        pts.append((left+wid+3*math.sin(v*19-t*2.3),h*v))
    d.polygon(pts,fill=(82,177,214,102))
    for i in range(12):
        yy=((t*75+i*h/12)%h)
        p=yy/h;wid=topwidth+(bottomwidth-topwidth)*p
        d.line((left+10,yy,left+wid-8,yy+6),fill=(238,252,255,138),width=2)
    if returning and permeability>0:
        # Continuous water sheets visibly cross the epithelial layer and join
        # the actual blood-vessel region. No floating decorative pathway dots.
        for lane in [.18,.35,.61,.77]:
            phase=(t*.38+lane)%1
            start=w*.28;end=w*.967;front=start+(end-start)*phase
            depth=(8+11*permeability)*h/500
            ps=[]
            for v in np.linspace(start,front,45):
                yy=h*lane+3*math.sin(v*.036-t*2)
                ps.append((v,yy-depth))
            for v in np.linspace(front,start,45):
                yy=h*lane+3*math.sin(v*.036-t*2)
                ps.append((v,yy+depth))
            d.polygon(ps,fill=(54,161,210,int(115*permeability)))
        # Water-return accumulation changes within the plasma compartment.
        d.polygon([(w*.898+3*math.sin(v*12-t),h*v) for v in np.linspace(.05,.94,50)]+[(w*(.899+.037*permeability)+3*math.sin(v*12-t),h*v) for v in np.linspace(.94,.05,50)],fill=(98,190,215,90))
    base=Image.alpha_composite(base,water).convert('RGB');im.paste(base,(x,y))
    d=ImageDraw.Draw(im);d.text((x,y-66),label,font=font(27),fill=WHITE)
    text(d,(x,y-28),sub,19,MUTED,70 if w>600 else 45)

def frame(t):
    im=Image.new('RGB',(W,H),BG)
    if t<26.217:
        draw_header(im,t,'ADH: from hormone signal to water balance')
        layer_pituitary(im,t)
    elif t<40.193:
        draw_header(im,t,'ADH increases water permeability')
        p=ease(28,34,t)
        flow_panel(im,(45,237,970,305),t,p,'',
                   'Schematic water movement across collecting-tubule epithelium')
        d=ImageDraw.Draw(im)
        d.text((45,136),'Collecting tubule',font=font(26),fill=WHITE)
        d.text((505,136),'Cell layer',font=font(26),fill=WHITE)
        d.text((870,136),'Blood',font=font(26),fill=WHITE)
        d=ImageDraw.Draw(im)
        text(d,(1050,244),'More water returns to blood',24,BLUE,12)
        text(d,(1050,400),'Less water continues down the tubule',22,MUTED,13)
        text(d,(47,566),'Blue shows the moving water. Tissue color and time are schematic.',22,MUTED,83)
        d.text((48,619),'Illustration: OpenStax 2710 · Course mechanism: CH22S14 / CH21S25–26',font=font(18),fill=MUTED)
    else:
        draw_header(im,t,'Diabetes insipidus: supply or response?')
        flow_panel(im,(40,248,574,367),t,0,'Neurogenic DI','Insufficient ADH supply',False)
        flow_panel(im,(667,248,574,367),t,0,'Nephrogenic DI','ADH present; renal response impaired',False)
        d=ImageDraw.Draw(im)
        # The two paths have the same downstream physical result: retained
        # lumen water rather than an increased return to the blood.
        text(d,(43,125),'Different failure sites. Same inability to concentrate urine.',25,BLUE,84)
        d.text((43,628),'Water continues in the tubule · no increased water return shown',font=font(20),fill=MUTED)
    return im

def timestamp(t):
    m=int(t//60);s=t%60;return f'00:{m:02d}:{s:06.3f}'

def captions():
    cues=[]
    for a,b,s in sentences:
        ws=s.split();parts=[ws[i:i+10] for i in range(0,len(ws),10)]
        used=0
        for part in parts:
            st=a+(b-a)*used/len(ws);used+=len(part);en=a+(b-a)*used/len(ws)
            cues.append(f'{timestamp(st)} --> {timestamp(en)}\n'+ ' '.join(part))
    (HERE/'adh-academic.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(cues)+'\n')
    (HERE/'adh-academic.txt').write_text('\n\n'.join(s for a,b,s in sentences)+'\n')

def main():
    HERE.mkdir(exist_ok=True);captions()
    for t in [3,10,18,29,35,43,48,55]:frame(t).save(HERE/f'frame-{t:02d}.jpg',quality=95)
    frame(35).save(HERE/'adh-academic-poster.jpg',quality=95)
    cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(MEDIA/'adh-clear.mp3'),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-shortest','-movflags','+faststart',str(HERE/'adh-academic-sample.mp4')]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for n in range(math.ceil(DURATION*FPS)):p.stdin.write(frame(n/FPS).tobytes())
    p.stdin.close();assert p.wait()==0
    metadata=dict(title='ADH: hormone supply, renal response, and water balance',src='media/adh-academic-sample.mp4',poster='media/adh-academic-poster.jpg',captions='media/adh-academic.vtt',sources=['CH21S25','CH21S26','CH22S14','CH22S17'],stages=stages,voice='AI Voice Generator · Clear',chapters=[21,22],status='visual review pending',figureCredit='OpenStax College, Anatomy & Physiology (2013), CC BY 3.0; cropped/rescaled; AI-assisted annotation removal on the renal figure; original water and hormone animation layers added.')
    (HERE/'sample.json').write_text(json.dumps(metadata,indent=2)+'\n')
    print(HERE/'adh-academic-sample.mp4',flush=True)

if __name__=='__main__':main()
