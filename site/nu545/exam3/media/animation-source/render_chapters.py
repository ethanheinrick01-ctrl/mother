"""Six source-figure mechanism films, personally authored and reviewed.

Usage: python render_chapters.py CHAPTER [--frames-only]
Needs Pillow, NumPy and FFmpeg. Time maps come from align_narration.py.
Original source files are never changed. All motion, quantity, scale and color
overlays are schematic teaching adaptations of the separately credited art.
No generation or payment happens when a student watches the bundled films.
"""
from pathlib import Path
from functools import lru_cache
import argparse, json, math, subprocess, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE=Path(__file__).resolve().parent
MEDIA=HERE.parent
W,H,FPS=1280,720,24
BG=(15,20,29); WHITE=(242,245,249); BLUE=(84,177,217)
MUTED=(164,181,198); WARM=(243,185,114); RED=(204,79,82)
@lru_cache(None)
def font(n):return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',n)
@lru_cache(None)
def art(name):return Image.open((MEDIA/name) if name.endswith('-clean.png') else (MEDIA/'figures'/name)).convert('RGB')
@lru_cache(None)
def tile(name,crop,size):
    image=art(name)
    if name.endswith('-clean.png'):
        original={'testis-clean.png':(743,686),'lymphatic-clean.png':(1115,1181)}[name]
        sx,sy=image.width/original[0],image.height/original[1]
        crop=tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(crop))
    return image.crop(crop).resize(size,Image.Resampling.LANCZOS)
def ease(a,b,t):
    p=max(0,min(1,(t-a)/max(b-a,.01)));return p*p*(3-2*p)
def write(d,xy,value,size=25,color=WHITE,width=32):
    d.multiline_text(xy,'\n'.join(textwrap.wrap(value,width)),font=font(size),fill=color,spacing=8)
def title(im,value):ImageDraw.Draw(im).text((40,120),value,font=font(24),fill=BLUE)
def panel(im,x,y,w,h):ImageDraw.Draw(im).rounded_rectangle((x,y,x+w,y+h),radius=10,fill=(255,255,255))
def note(im,values):
    d=ImageDraw.Draw(im)
    for i,(head,body) in enumerate(values):
        write(d,(850,160+i*142),head,25,BLUE,29)
        write(d,(850,203+i*142),body,23,WHITE,29)
def cutcell(image,box,size):
    cell=image.crop(box).resize((size,size),Image.Resampling.LANCZOS).convert('RGBA')
    mask=Image.new('L',(size,size));ImageDraw.Draw(mask).ellipse((1,1,size-2,size-2),fill=255)
    cell.putalpha(mask);return cell
@lru_cache(None)
def cell(size):return cutcell(art('ductal-in-situ.jpg'),(617,247,673,303),size)
@lru_cache(None)
def fatcell(size):return cutcell(art('adipose-tissue.jpg'),(186,131,424,369),size)

class Film:
    def __init__(self,ch):
        self.ch=ch
        self.timing=json.loads((HERE/f'ch{ch}-timing.json').read_text())
        self.duration=self.timing['duration']
        self.starts=[s['start'] for s in self.timing['stages']]+[self.duration]
    def stage(self,t):return max(i for i,a in enumerate(self.starts[:-1]) if a<=t)
    def phrase(self,value):
        allwords=self.timing['words']; words=value.lower().split()
        for i in range(len(allwords)-len(words)+1):
            if all(v in allwords[i+j]['text'].lower() for j,v in enumerate(words)):
                return allwords[i]['start']
        raise ValueError((self.ch,value,'Timing phrase missing'))
    def header(self,im,t):
        d=ImageDraw.Draw(im);s=self.stage(t)
        d.text((38,20),f'NU545  /  EXAM 3  /  CHAPTER {self.ch}',font=font(17),fill=MUTED)
        d.text((38,52),self.timing['title'],font=font(30),fill=WHITE)
        d.line((38,98,1242,98),fill=(53,65,83),width=1)
        d.line((38,668,1242,668),fill=(38,48,64),width=3)
        d.line((38,668,38+int(1204*t/self.duration),668),fill=BLUE,width=3)
        credits={22:'OpenStax College (2013), CC BY 3.0',23:'OpenStax College (2013), CC BY 3.0',24:'OpenStax College, CC BY 4.0',25:'NCI / Don Bliss, public domain; OpenStax College, CC BY 3.0',26:'OpenStax A&P (2016), CC BY 4.0',27:'CDC / D. Cox, public domain; OpenStax College, CC BY 3.0'}
        d.text((38,683),credits[self.ch]+' · adapted motion; schematic scale and time',font=font(14),fill=MUTED)
        d.text((1150,683),f'{int(t):02d}/{math.ceil(self.duration):02d}s',font=font(14),fill=MUTED)
    def frame(self,t):
        im=Image.new('RGB',(W,H),BG)
        self.header(im,t)
        getattr(self,f'ch{self.ch}')(im,t,self.stage(t))
        return im

    def ch22(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        # The original pancreatic tissue crop retains the vessel/islet anatomy.
        # Declining viable tissue and released-hormone quantities change together.
        panel(im,40,174,735,438)
        pancreas=tile('glucose-homeostasis.jpg',(21,89,324,304),(575,404)).copy()
        supply=1-.82*ease(5.58,12.48,t) if s==0 else .66
        tissue=Image.new('RGBA',pancreas.size,(0,0,0,0));p=ImageDraw.Draw(tissue)
        if s==0:
            for x,y in [(90,197),(267,216),(454,182)]:
                p.ellipse((x-53,y-40,x+53,y+40),fill=(239,239,239,int(180*(1-supply))))
        pancreas=Image.alpha_composite(pancreas.convert('RGBA'),tissue)
        im.paste(pancreas,(60,194));d=ImageDraw.Draw(im)
        # Hormone released from tissue into the actual upper vascular compartment.
        for i in range(int(22*supply)):
            x=80+((t*42+i*31)%495);y=231+7*math.sin(i+t)
            d.ellipse((x-4,y-4,x+4,y+4),fill=(46,116,189))
        d.text((666,198),'Supply',font=font(20),fill=(42,58,74))
        d.rectangle((695,250,729,565),outline=(60,77,87),width=2)
        d.rectangle((698,562-int(308*supply),726,562),fill=(46,116,189))
        if s==0:
            d.text((64,625),'Pancreatic tissue · schematic loss of insulin supply',font=font(20),fill=MUTED)
            note(im,[('Type 1 diabetes','Beta-cell destruction or loss'),('Insulin supply falls','Less hormone is released')])
        elif s==1:
            # Replace the tissue view with a scholarly liver drawing, changing
            # glucose entry and remaining blood concentration under resistance.
            panel(im,40,174,735,438)
            im.paste(tile('glucose-homeostasis.jpg',(895,145,1025,237),(401,284)),(200,262))
            d=ImageDraw.Draw(im);d.text((75,188),'Blood compartment',font=font(22),fill=(43,59,73))
            d.rectangle((67,228,746,252),fill=(224,117,116))
            for i in range(30):
                x=75+((t*43+i*28)%653);d.rectangle((x,235,x+5,240),fill=(255,218,109))
            # Limited uptake is paired with retained glucose in the blood.
            for i in range(3):
                p=(t*.2+i/3)%1;x=410+25*math.sin(i);y=252+p*130
                d.rectangle((x,y,x+7,y+7),fill=(234,159,34))
            d.text((180,560),'Illustrated liver · reduced insulin effect',font=font(22),fill=(43,59,73))
            d.text((64,625),'Liver shown as one of the insulin-responsive tissues',font=font(20),fill=MUTED)
            note(im,[('Type 2 diabetes','Insulin resistance and decreased secretion'),('Liver, muscle, adipose','Response to insulin is impaired')])
        elif s>=2:
            panel(im,40,174,735,438)
            d=ImageDraw.Draw(im)
            for x,label,sub in [(80,'Supply failure','Reduced insulin'),(435,'Response failure','Reduced tissue effect')]:
                d.text((x,197),label,font=font(24),fill=(43,59,73))
                d.text((x,237),sub,font=font(20),fill=(67,82,92))
                if x==80:im.paste(tile('glucose-homeostasis.jpg',(21,89,324,304),(285,202)),(x,282))
                else:im.paste(tile('glucose-homeostasis.jpg',(895,145,1025,237),(285,202)),(x,282))
                # The original vascular texture anchors both glucose streams.
                im.paste(tile('glucose-homeostasis.jpg',(21,90,323,156),(285,62)),(x,485))
                d=ImageDraw.Draw(im)
                for i in range(24):
                    xx=x+6+((i*37+t*19)%269); yy=505+(i*7)%19
                    d.rectangle((xx,yy,xx+5,yy+5),fill=(247,212,98))
            d.text((110,558),'Glucose remains in the blood in both comparisons',font=font(23),fill=(43,59,73))
            note(im,[('Common finding','Hyperglycemia'),('Interpret the mechanism','Secretion, response, or both')] if s==2 else [('Diabetes mellitus','Insulin and glucose'),('Diabetes insipidus','ADH and urine concentration')])

    def ch23(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        panel(im,40,174,735,438)
        # Teaching adaptation uses the actual adipocyte texture as the substrate.
        # Cell contents visibly enlarge, rather than highlighting a still picture.
        base=tile('adipose-tissue.jpg',(5,4,837,870),(735,438))
        im.paste(base,(40,174));d=ImageDraw.Draw(im)
        if s==0:
            growth=ease(3,17,t)
            for x,y,offset in [(246,314,0),(532,408,.18),(185,519,.07),(637,278,.12)]:
                n=int(96+73*max(0,growth-offset));c=fatcell(n)
                im.paste(c,(int(x-n/2),int(y-n/2)),c)
            note(im,[('White adipose','Triglyceride storage'),('Endocrine function','Adipokines affect energy balance and inflammation')])
        elif s==1:
            # White-adipose art is context, never relabeled a brown micrograph.
            # A second teaching layer contrasts energy storage with heat output.
            panel(im,40,174,735,438);d=ImageDraw.Draw(im)
            im.paste(tile('adipose-tissue.jpg',(1110,5,2175,870),(340,300)),(63,232))
            d.text((61,192),'White adipose · original histology',font=font(20),fill=(43,59,73))
            mitochondrion=tile('glucose-homeostasis.jpg',(887,44,1024,106),(98,47))
            for i in range(6):im.paste(mitochondrion,(446+(i%2)*131,270+(i//2)*77))
            d=ImageDraw.Draw(im);d.text((452,192),'Brown adipose · schematic',font=font(20),fill=(43,59,73))
            p=ease(self.starts[1]+5,self.starts[1]+12,t)
            for i in range(6):
                xx=480+i*38
                pts=[(xx+7*math.sin(j*.3-t*2),550-j) for j in range(int(70*p))]
                if len(pts)>1:d.line(pts,fill=(223,117,53),width=4)
            d.text((460,571),'UCP1-mediated heat',font=font(21),fill=(123,64,40))
            note(im,[('Brown adipose','Rich in mitochondria; heat production'),('Beige adipose','Cold or exercise can induce beige tissue within white adipose')])
        else:
            count=int(3+11*ease(self.starts[2],self.starts[2]+6,t))
            overlay=Image.new('RGBA',im.size);a=ImageDraw.Draw(overlay)
            for i in range(count):
                x=85+(i*181)%620;y=215+(i*137)%340
                a.ellipse((x-18,y-18,x+18,y+18),fill=(153,83,149,220),outline=(90,44,103),width=2)
                a.ellipse((x-7,y-10,x+8,y+8),fill=(83,47,109))
                for j in range(4):
                    phase=(t*.4+j/4)%1;r=22+phase*40
                    xx=x+r*math.cos(j*1.6);yy=y+r*math.sin(j*1.6)
                    a.ellipse((xx-2,yy-2,xx+2,yy+2),fill=(176,41,54,int(240*(1-phase))))
            im.paste(Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB'))
            note(im,[('Obesity-associated change','Macrophage infiltration and inflammatory mediators'),('Possible insulin resistance','Storage, endocrine signals, and inflammation connect')])
        d=ImageDraw.Draw(im)
        d.text((44,625),'Adapted cell contents and macrophages are schematic; colors do not diagnose tissue.',font=font(18),fill=MUTED)

    def ch24(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        panel(im,40,174,735,438);d=ImageDraw.Draw(im)
        d.text((63,194),'Ovary',font=font(23),fill=(43,59,73))
        d.text((63,409),'Endometrium',font=font(23),fill=(43,59,73))
        # Existing textbook art supplies each follicle state. A crossfade marks
        # a change of physiological state, not a claimed numerical time scale.
        follicle=tile('ovarian-cycle.jpg',(139,405,196,461),(146,144)).convert('RGBA')
        luteum=tile('ovarian-cycle.jpg',(300,386,343,461),(104,181)).convert('RGBA')
        if s==0:
            n=int(70+74*ease(3.46,11.54,t));f=follicle.resize((n,n))
            im.paste(f,(int(363-n/2),int(300-n/2)),f)
            note(im,[('Follicular phase','FSH stimulates follicular growth'),('Estrogen','Proliferation of the endometrium')])
        elif s==1:
            p=ease(self.phrase('Watch the mature'),self.phrase('Then follow'),t)
            im.paste(follicle,(290,230),follicle)
            # The ovum separates from the mature follicle, followed by the
            # actual illustrated corpus luteum replacing the follicle state.
            d=ImageDraw.Draw(im);x=373+235*p;y=261-35*math.sin(p*math.pi)
            d.ellipse((x-11,y-11,x+11,y+11),fill=(220,194,235),outline=(136,86,152),width=3)
            q=ease(self.phrase('Then follow'),self.starts[2],t)
            layer=luteum.copy();layer.putalpha(int(255*q));im.paste(layer,(310,214),layer)
            note(im,[('LH surge','Ovulation and release of the ovum'),('Remaining follicle','Becomes the corpus luteum')])
        elif s==2:
            im.paste(luteum,(310,214),luteum)
            note(im,[('Corpus luteum','Secretes progesterone'),('Secretory phase','Glands and vessels branch and curl')])
        else:
            q=ease(self.starts[3],self.phrase('Estrogen and progesterone'),t)
            n=int(104*(1-.6*q));f=luteum.resize((n,int(181*(1-.6*q))))
            im.paste(f,(int(363-n/2),214),f)
            note(im,[('No implantation','Corpus luteum degenerates; hormone levels fall'),('Menstruation','The functional lining sheds')])
        # The real endometrial texture grows from a fixed basal boundary, then
        # curls in its secretory state and fragments above that same boundary.
        # The tissue-only crop omits the printed menstruation annotation, which
        # would otherwise falsely label every ovarian-cycle state.
        lining=tile('ovarian-cycle.jpg',(99,606,399,669),(674,170))
        if s==0:depth=int(62+92*ease(6,14,t))
        elif s in [1,2]:depth=154 if s==1 else int(154+24*ease(self.starts[2],self.starts[2]+7,t))
        else:depth=int(178-130*ease(self.phrase('Estrogen and progesterone'),self.duration-7,t))
        strip=lining.resize((674,max(depth,1)),Image.Resampling.BICUBIC)
        im.paste(strip,(70,603-depth))
        if s==2:
            d=ImageDraw.Draw(im)
            for x in range(100,719,50):
                curl=[(x+8*math.sin(j*.14),598-j) for j in range(depth-8)]
                d.line(curl,fill=(175,65,81),width=2)
        elif s==3:
            q=ease(self.phrase('Estrogen and progesterone'),self.duration-7,t)
            for i in range(int(15*q)):
                flake=lining.crop((i*37%620,50,i*37%620+24,72)).convert('RGBA')
                mask=Image.new('L',flake.size);ImageDraw.Draw(mask).ellipse((1,1,23,21),fill=210);flake.putalpha(mask)
                x=83+i*42;y=462+int(((t*24+i*21)%142)*q)
                im.paste(flake,(x,y),flake)
        d=ImageDraw.Draw(im);d.line((70,604,744,604),fill=(87,65,74),width=3)
        d.text((43,625),'Adapted textbook follicle and tissue states; sequence is schematic.',font=font(20),fill=MUTED)

    def duct(self,im,x,y,t,invasion=False):
        # Don Bliss/NCI tissue illustration stays the base. Added cells use its
        # real cell texture; their number and position change in the lumen.
        base=tile('ductal-in-situ.jpg',(455,190,921,632),(466,442)).copy()
        d=ImageDraw.Draw(base)
        # Existing art depicts DCIS already; added in-lumen cells demonstrate
        # accumulation without changing the intact outer boundary.
        count=int(4+13*ease(16.48,23.06,t))
        for i in range(count):
            cx=240+70*math.cos(i*2.4);cy=249+88*math.sin(i*2.4)
            spr=cell(38);base.paste(spr,(int(cx-19),int(cy-19)),spr)
        im.paste(base,(x,y))
        d=ImageDraw.Draw(im)
        if invasion:
            p=ease(self.phrase('Invasive carcinoma'),self.phrase('These are'),t)
            # An explicit breach in the illustrated duct edge accompanies cell
            # extension into surrounding tissue. This is a separate comparison.
            d.polygon([(x+398,y+179),(x+440,y+182),(x+449,y+245),(x+409,y+256)],fill=(255,255,255))
            for i in range(int(2+6*p)):
                spr=cell(34);cx=x+385+65*p+(i%3)*27;cy=y+187+(i//3)*36
                im.paste(spr,(int(cx),int(cy)),spr)
    def ch25(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        if s==0:
            panel(im,40,174,735,438)
            if t<self.phrase('Now move'):
                im.paste(tile('mammary-anatomy.jpg',(810,1980,1245,2657),(300,418)),(260,184))
                note(im,[('Breast architecture','Branching ducts and lobules'),('Next: the duct wall','Find the boundary around the cells')])
            else:
                self.duct(im,150,175,t)
                note(im,[('Boundary','The basement membrane'),('Compare location','Inside the duct or beyond its boundary')])
        elif s==1:
            panel(im,40,174,735,438);self.duct(im,120,174,t)
            note(im,[('Ductal carcinoma in situ','Abnormal cells stay within the duct/lobule boundary'),('Boundary intact','No basement-membrane invasion')])
        elif s==2:
            panel(im,40,174,575,438);panel(im,667,174,575,438)
            self.duct(im,63,174,t);self.duct(im,693,174,t,True)
            d=ImageDraw.Draw(im);d.text((67,625),'In situ · boundary intact',font=font(22),fill=BLUE)
            d.text((692,625),'Invasive · extension beyond the boundary',font=font(22),fill=WARM)
            d.text((600,123),'Comparison; not inevitable progression',font=font(22),fill=MUTED)
        else:
            panel(im,40,174,735,438);self.duct(im,120,174,t)
            d=ImageDraw.Draw(im)
            d.text((64,574),'A deposit can retain its breast origin',font=font(22),fill=(43,59,73))
            note(im,[('Released case: lung deposit','Location is the lung; origin can be breast'),('Separate the decisions','Location, invasion, and tumor origin')])
        if s!=2:ImageDraw.Draw(im).text((43,625),'NCI duct adapted with added cells; time, color, quantity and scale are schematic.',font=font(18),fill=MUTED)

    def ch26(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        panel(im,40,174,735,438)
        # Keep all original anatomy/labels accessible. The film enlarges the
        # testis/epididymis region and names only the course-supported structures.
        im.paste(tile('testis-clean.png',(103,101,585,668),(357,420)),(180,182))
        d=ImageDraw.Draw(im)
        d.text((66,190),'Vas deferens',font=font(21),fill=(43,59,73))
        d.text((63,444),'Epididymis',font=font(21),fill=(43,59,73))
        d.text((548,486),'Testis',font=font(21),fill=(43,59,73))
        # Route follows the actually illustrated deferens into the tail region.
        path=[(403,267),(359,270),(310,284),(269,311),(252,359),(236,406),(229,453),(258,505),(288,535)]
        overlay=Image.new('RGBA',im.size);o=ImageDraw.Draw(overlay)
        if s<=1:
            direction=1 if s==1 else -1
            p=(t*.12)%1
            for i in range(7):
                q=(direction*p+i/7)%1;k=min(len(path)-2,int(q*(len(path)-1)));f=q*(len(path)-1)-k
                a,b=path[k],path[k+1];x=a[0]+(b[0]-a[0])*f;y=a[1]+(b[1]-a[1])*f
                if s==1:
                    # Microorganisms travel toward the epididymis; no organism
                    # species or prevalence is inferred from this generic symbol.
                    o.line((x-4,y-4,x+4,y+4),fill=(137,61,148,240),width=4)
                else:o.ellipse((x-3,y-3,x+3,y+3),fill=(20,115,172,240))
        if s>=1:
            p=ease(self.phrase('Watch the highlighted'),self.starts[2],t)
            # Inflammation changes the size/color around the depicted epididymis.
            epi=[(487,319),(482,283),(459,264),(418,265),(385,276),(349,280),(318,298),(287,337),(269,388),(249,432),(252,478),(289,542)]
            o.line(epi,fill=(204,79,82,int(60+120*p)),width=int(9+10*p),joint='curve')
        if s==2:
            # A separate testicular field distinguishes orchitis from the
            # epididymal band; labels specify the affected anatomical structure.
            o.ellipse((318,315,472,503),fill=(233,139,78,80),outline=(195,105,54,220),width=4)
        im.paste(Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB'))
        if s==0:values=[('Testis','Produces sperm'),('Epididymis to vas deferens','Maturation, then transport toward the urethra')]
        elif s==1:values=[('Reverse the usual direction','Microorganisms ascend from an infected bladder or urethra'),('Epididymis','Inflammatory change at the reached structure')]
        elif s==2:values=[('Epididymitis','Inflammation of the epididymis'),('Orchitis','Infection of the testis; may occur together')]
        else:values=[('Supplied slide','Pain, Prehn sign, and listed treatments'),('Textbook gap','Full organism and complication lists remain unfilled')]
        note(im,values)
        d=ImageDraw.Draw(im);d.text((43,625),'Adapted route and inflammatory fields; color and size changes are schematic.',font=font(19),fill=MUTED)

    def ch27(self,im,t,s):
        title(im,self.timing['stages'][s]['title'])
        panel(im,40,174,735,438)
        if s==0:
            im.paste(tile('treponema-pallidum.jpg',(0,0,531,500),(447,421)),(60,182))
            d=ImageDraw.Draw(im)
            d.text((526,240),'T. pallidum',font=font(23),fill=(43,59,73))
            write(d,(526,286),'CDC electron micrograph',21,(67,82,92),18)
            note(im,[('Primary syphilis','Firm, indurated, painless chancre'),('Regional lymph nodes','Enlarged, firm and nontender')])
        else:
            # Actual textbook lymphatic anatomy and capillary inset anchor the
            # overlay. Local-to-network change models course-described spread.
            im.paste(tile('lymphatic-clean.png',(10,0,572,1181),(206,432)),(64,177))
            inset=tile('lymphatic-clean.png',(688,376,1006,689),(307,307))
            im.paste(inset,(403,250));d=ImageDraw.Draw(im)
            d.text((355,190),'Lymphatic capillary network',font=font(22),fill=(43,59,73))
            p=ease(self.starts[1],self.starts[1]+8,t)
            overlay=Image.new('RGBA',im.size);o=ImageDraw.Draw(overlay)
            # The illustrated body is anatomical context, not a lesion atlas.
            # Schematic nodes visibly enlarge and become involved more widely.
            for i,(x,y) in enumerate([(161,279),(150,307),(184,309),(151,449),(180,447),(161,245)]):
                involvement=p if s==1 else 0
                r=3+int(6*involvement)
                if s==1:o.ellipse((x-r,y-r,x+r,y+r),fill=(145,62,122,175),outline=(91,47,113),width=2)
            route=[(557,505),(566,461),(574,435),(554,402),(515,366),(491,323),(481,287)]
            for i in range(12 if s==1 else 4):
                phase=(t*.25+i/12)%1
                k=min(len(route)-2,int(phase*(len(route)-1)));q=phase*(len(route)-1)-k
                a,b=route[k],route[k+1];x=a[0]+(b[0]-a[0])*q;y=a[1]+(b[1]-a[1])*q
                o.line((x-4,y-2,x+4,y+2),fill=(137,61,148,220),width=3)
            im.paste(Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB'))
            if s==1:note(im,[('Secondary syphilis','Systemic symptoms and generalized node enlargement'),('Local to systemic','Skin or mucous-membrane lesions can appear')])
            elif s==2:note(im,[('Latent disease','Symptoms may be absent; infection remains'),('Tertiary manifestations','Can include gummas and neurosyphilis')])
            else:note(im,[('Primary syphilitic chancre','Firm, indurated and painless'),('Chancroid','Painful, tender and soft')])
        ImageDraw.Draw(im).text((43,625),'Micrograph is authentic; spread and node changes are schematic, not a prognosis.',font=font(19),fill=MUTED)

    def render(self,frames_only=False):
        qa=MEDIA.parents[4]/'media-review'/'chapter-frames'
        # Keep QA stills outside the public site.
        qa.mkdir(parents=True,exist_ok=True)
        beats=[]
        for a,b in zip(self.starts,self.starts[1:]):beats.extend([a+.7,(a+b)/2,max(a+.8,b-.8)])
        for t in beats:self.frame(min(t,self.duration-.1)).save(qa/f'ch{self.ch}-{t:05.1f}.jpg',quality=94)
        poster_t=(self.starts[1]+self.starts[2])/2
        self.frame(poster_t).save(MEDIA/f'ch{self.ch}-academic-poster.jpg',quality=94)
        if frames_only:return
        command=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(MEDIA/f'ch{self.ch}-clear.mp3'),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-shortest','-movflags','+faststart',str(MEDIA/f'ch{self.ch}-academic.mp4')]
        proc=subprocess.Popen(command,stdin=subprocess.PIPE)
        for n in range(math.ceil(self.duration*FPS)):proc.stdin.write(self.frame(n/FPS).tobytes())
        proc.stdin.close();assert proc.wait()==0
        print(f'Chapter {self.ch} film complete',flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('chapter',type=int);parser.add_argument('--frames-only',action='store_true')
    args=parser.parse_args();Film(args.chapter).render(args.frames_only)
