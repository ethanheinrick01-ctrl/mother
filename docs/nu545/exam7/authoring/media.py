from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent;ROOT=P.parents[3];M=ROOT/'site/nu545/exam7/media';A=M/'animation-source'
originals=[
('transcription.png',[4],'DNA transcription','NHGRI; vector adaptation by Sulai (2009)','https://commons.wikimedia.org/wiki/File:DNA_transcription.svg','public domain','https://creativecommons.org/publicdomain/mark/1.0/','Crop, rescale, progressive RNA reveal and departing RNA copy; moving markers.'),
('glucose-homeostasis.jpg',[5],'Homeostatic regulation of glucose','OpenStax College, Anatomy & Physiology (2013)','https://commons.wikimedia.org/wiki/File:1822_The_Homostatic_Regulation_of_Blood_Glucose_Levels.jpg','CC BY 3.0','https://creativecommons.org/licenses/by/3.0/','Cropped liver and pancreas; declining response/supply, moving particles and tissue opacity.'),
('epigenetics.png',[6],'Epigenetic mechanisms','NIH (2005)','https://commons.wikimedia.org/wiki/File:Epigenetic_mechanisms.png','public domain','https://creativecommons.org/publicdomain/mark/1.0/','Cropped chromatin; transition between accessible/compact states; regulatory markers.'),
('ductal-in-situ.jpg',[12],'Ductal carcinoma in situ','NCI / Don Bliss (2005)','https://commons.wikimedia.org/wiki/File:Breast_cancer_ductal_carcinoma_in_situ.jpg','public domain','https://creativecommons.org/publicdomain/mark/1.0/','Cropped duct and cell texture; schematic boundary opening and migration. Does not claim inevitable DCIS progression.'),
('adipose-tissue.jpg',[13],'Adipose tissue','OpenStax College, Anatomy & Physiology (2013)','https://commons.wikimedia.org/wiki/File:409_Adipose_Tissue.jpg','CC BY 3.0','https://creativecommons.org/licenses/by/3.0/','Cropped illustration with increasing/decreasing signaling particles.'),
('stem-cell.jpg',[14],'Stem-cell differentiation','OpenStax Anatomy & Physiology v8.25 (2016)','https://commons.wikimedia.org/wiki/File:422_Feature_Stem_Cell.jpg','CC BY 4.0','https://creativecommons.org/licenses/by/4.0/','Cropped mesodermal and cardiac-muscle textures; maturation comparison and retained immature pattern; not tumor histology.'),
('skin.jpg',[46,47],'Structure of skin','OpenStax College, Anatomy & Physiology (2013)','https://commons.wikimedia.org/wiki/File:501_Structure_of_the_skin.jpg','CC BY 3.0','https://creativecommons.org/licenses/by/3.0/','Cropped tissue; compression, flow, ischemic color field, scratching and epidermal thickening.'),
('lymphatic-system.jpg',[48,49],'Lymphatic system with blood-capillary inset','OpenStax College, Anatomy & Physiology (2013)','https://commons.wikimedia.org/wiki/File:2201_Anatomy_of_the_Lymphatic_System.jpg','CC BY 3.0','https://creativecommons.org/licenses/by/3.0/','Blood-capillary inset only; moving blood/fluid markers and relative perfusion/pressure states.')]
figs=[]
for file,chs,title,creator,url,lic,lu,adapt in originals:
 for ch in chs:
  figs.append(dict(chapter=ch,src='media/figures/'+file,title=title,alt=title+'; original scholarly reference',credit=creator+' · '+lic+' · original unchanged',url=url,license=lic,licenseUrl=lu,sha256=hashlib.sha256((M/'figures'/file).read_bytes()).hexdigest(),adaptation=adapt,notice='Supplemental visualization only. Tested facts remain bounded by the Unit 7 course packet. Film motion, scale, colors and quantities are schematic.'))
films=[]
for ch in [4,5,6,12,13,14,46,47,48,49]:
 t=json.loads((A/f'ch{ch}-timing.json').read_text());src=[]
 for g in t['sources'].split(';'):
  c,ss=g.split(':');src += [f'C{c}S{s}' for s in ss.split(',')]
 f=next(f for f in figs if f['chapter']==ch)
 films.append(dict(title=t['title'],chapters=[ch],src=f'media/ch{ch}-academic.mp4',poster=f'media/ch{ch}-academic-poster.jpg',captions=f'media/ch{ch}-academic.vtt',transcriptSrc=f'media/ch{ch}-academic.txt',animationSource='media/animation-source/render_chapters.py',sources=src,stages=t['stages'],voice='AI Voice Generator · Clear',figureCredit=f['credit']+'; film adaptation: '+f['adaptation'],duration=t['duration'],status='Course-supported mechanism; source gaps remain visible'))
(ROOT/'site/nu545/exam7/js/data/media.js').write_text('(function(){Object.assign(L,'+json.dumps(dict(MEDIA_FILMS=films,ACADEMIC_FIGURES=figs))+');})();\n')
(A/'figure-manifest.json').write_text(json.dumps(figs,indent=2));(ROOT/'docs/nu545/exam7/media-manifest.json').write_text(json.dumps(films,indent=2))
print('10 films; 8 original reference figures; scripts, timings and captions saved.')
