#!/usr/bin/env python3
"""Compile personally authored Unit 6 records against its accepted private intake.
Usage: python3 docs/nu545/exam6/build.py /absolute/path/to/NU545-Unit-6
No question-generation templates; TSV contains every complete authored item.
"""
from pathlib import Path
import sys,re,json,html,hashlib,collections,zipfile,xml.etree.ElementTree as ET
from curriculum import ROWS
from components import COMPONENTS
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
SITE=ROOT/'site/nu545/exam6'
PACKET=Path(sys.argv[1])
REV='u6-dna-2026-10-01-r1'
E=html.escape
chapters={40:'Structure and Function of the Digestive System',41:'Alterations of Digestive Function',42:'Alterations of Digestive Function in Children',43:'Structure and Function of the Musculoskeletal System',44:'Alterations of Musculoskeletal Function',45:'Alterations of the Musculoskeletal System in Children'}
D={k:{} for k in ['CONCEPTS','GUIDE','SOURCES','SOURCE_HTML','FORMS']}
D.update(CONFIG=dict(id='nu545-exam6',courseCode='NU545',courseTitle='Physio-Patho Basis of Advanced Nursing',examLabel='Exam 6',title='NU545 · Exam 6',subtitle='Digestive and musculoskeletal systems across the lifespan',storageKey='nu545-exam6-progress-v1',examDate='2026-11-16',mockDurationSec=2700,callout='Supported slide-depth preparation. Exact textbook and instructor gaps remain visible.',mockRationale='Practice design: three distinct 30-question, four-choice forms, 45 minutes each; five questions per chapter. Official evidence confirms 40 points, not 40 questions. Actual question count, timing, attempts, item mix and weights are unknown. These forms cover supplied material only.'),SECTIONS=[],ITEMS=[],CASES=[],BOSSES=[],VISUALS=[],GEN_FOR={},ACADEMIC_FIGURES=[],DOMAINS={'digestive':{'name':'Digestive'},'musculoskeletal':{'name':'Musculoskeletal'}},DNA=[REV,'All 12 released case examples and deck examples read before authoring. Same-category options; explanations after checking; linked clinical context retained.','Observed course-selected style is not verified instructor authorship or promised recurrence.','Three 30-question/45-minute mocks and equal chapter allocations are practice design. No previous-unit cumulative requirement was found.'],MOCK_BLUEPRINTS={'30':{'domains':{'digestive':15,'musculoskeletal':15},'includeCase':False}})
raw={};folders={}
for ch,title in chapters.items():
 f=next(PACKET.glob(f'Chapter {ch}*'));folders[ch]=f
 d=json.loads((f/'slide-and-notes-text.json').read_text());slides={s['slide']:s['text'] for s in d['slides']};notes={n['xmlPart']:n['text'] for n in d['notesParts']}
 # Relationship lookups preserve notes-to-slide association; no bulk re-extraction.
 with zipfile.ZipFile(next(f.glob('*.pptx'))) as z:
  for n,t in slides.items():
   rel=f'ppt/slides/_rels/slide{n}.xml.rels'
   nt=[]
   if rel in z.namelist():
    for r in ET.fromstring(z.read(rel)):
     if r.attrib.get('Type','').endswith('/notesSlide'):
      part='ppt/'+r.attrib['Target'].replace('../','');v=notes.get(part,'')
      if len(v.strip())>8:nt.append(v)
   raw[f'CH{ch}S{n}']=(t,nt)
 D['SECTIONS'].append(dict(id=f'ch{ch}',n=ch,title=title,short=title,dom='digestive' if ch<43 else 'musculoskeletal',src=f'CH{ch}S1'))
 D['GUIDE'][f'ch{ch}']=[]
def refs(spec):
 out=[]
 for group in spec.split(';'):
  ch,nums=group.split(':')
  for n in nums.split(','):
   a,*b=n.split('-')
   out += [f'CH{ch}S{i}' for i in range(int(a),int(b[0] if b else a)+1)]
 return out
def source(r):
 if r in D['SOURCES']:return
 t,notes=raw[r];ch=int(re.search(r'CH(\d+)',r)[1]);n=int(r.split('S')[1]);isq='Question ' in t or 'Discussion Questions' in t
 D['SOURCES'][r]={'t':f'Chapter {ch}, slide {n}'+(' and speaker notes' if notes else ''),'f':'#sources/'+r,'tier':1,'short':r,'provenance':'Supplied Fall 2026 course deck, McCance & Huether ninth edition. Original wording preserved; listed conflicts remain excluded from scored claims.'}
 # Full course deck stays private; selected textual disclosures only. Publisher quiz stems not republished in this original bank.
 lines=t.splitlines()
 text='\n'.join(lines) if not isq else 'Source quiz wording remains in the private packet. The following supplied speaker explanation supports this reference.'
 text=re.sub(r'\n\d+$','',text)
 D['SOURCE_HTML'][r]='<p class="small">Verbatim selected source text. Consult the source-issues record for excluded details.</p><pre class="longtext">'+E(text)+'</pre>'
 if notes:D['SOURCE_HTML'][r]+='<h4>Supplied speaker notes</h4><pre class="longtext">'+E('\n\n'.join(notes))+'</pre>'
D['SOURCE_ISSUES']=(HERE/'SOURCE-ISSUES.md').read_text()
for ch in chapters:source(f'CH{ch}S1')
# Exact numbered prompt wording from accepted extraction.
guide=(PACKET/'Unit 6 Study Guide 2021.txt').read_text().replace('\f','\n')
ps={int(n):' '.join(t.split()) for n,t in re.findall(r'(\d+)\.\s+(.*?)(?=\n\s*\d+\.\s|\Z)',guide,re.S)}
coverage=[]
for n,spec,teach,gap in ROWS:
 rs=refs(spec);chs=sorted({int(re.search(r'CH(\d+)',r)[1]) for r in rs});status='Missing' if n==26 else 'Partial' if gap else 'Direct'
 for r in rs:source(r)
 # Components are split by the guide's explicit requested categories, with supported and missing claims separately visible.
 components=[]
 for name,cs,crefs,missing in COMPONENTS[n]:
  cr=refs(crefs)
  for r in cr:source(r)
  components.append(dict(name=name,status=cs,detail=missing or 'Direct support at supplied-slide depth; see teaching and exact source disclosure.',refs=cr))
 cp=dict(studyGuidePrompt=n,promptVerbatim=ps[n],status=status,supported=teach,remainingGapOrLimit=gap,chapters=chs,components=components,sources=[{'sourceId':f'NU545-U6-CH{c}','locator':', '.join(r.replace(f'CH{c}S','') for r in rs if r.startswith(f'CH{c}S')),'file':f'Chapter_{c:03}.pptx'} for c in chs])
 coverage.append(cp)
 for ch in chs:
  local=[r for r in rs if r.startswith(f'CH{ch}S')]
  D['GUIDE'][f'ch{ch}'].append(dict(id=f'nu545-e6-guide-{n}-ch{ch}',h=f'Guide {n} · '+ps[n].removeprefix('Know ').removeprefix('Understand ')[:110],html='<p>'+E(teach)+'</p>',c=[],src=local,tier=1,conflict=gap))
D['COVERAGE']={'updatedAt':'2026-10-01','scope':'Component-level source coverage; independent of implementation readiness','counts':dict(collections.Counter(x['status'] for x in coverage)),'prompts':coverage}
# Compile complete personally authored questions. Rotate option position by stable identity, never rewrite roots.
for line in (HERE/'bank.tsv').read_text().splitlines():
 if not line or line.startswith('#'):continue
 ch,c,pool,slug,spec,stem,choices,why=line.split('|');ch=int(ch);os=choices.split(';');ws=why.split(';');assert len(os)==len(ws)==4,(slug,os,ws)
 cid=f'nu545-e6-c{ch}-{c}';iid=f'nu545-e6-{pool.lower()}-c{ch}-{slug}';rs=refs(spec)
 for r in rs:source(r)
 if cid not in D['CONCEPTS']:D['CONCEPTS'][cid]={'sec':f'ch{ch}','name':c.replace('-',' ').title(),'mastery':True,'guidePrompts':[]}
 options=[dict(t=o,w=w,ok=i==0) for i,(o,w) in enumerate(zip(os,ws))];k=int(hashlib.sha256(iid.encode()).hexdigest()[:6],16)%4;options=options[k:]+options[:k]
 item=dict(id=iid,rootId=iid,c=cid,sec=f'ch{ch}',dom='digestive' if ch<43 else 'musculoskeletal',t='mc',q=stem,o=options,s=rs,tier=1,pool='practice' if pool=='practice' else 'mock',explain=ws[0]+'.',decision={'conjugation-failure':'bilirubin origin','intestinal-defense':'salivary functions'}.get(slug,slug.replace('-',' ')),evidenceExcerpt='\n\n'.join(r+'\n'+raw[r][0]+'\nSpeaker notes: '+'\n'.join(raw[r][1]) for r in rs),editorialRevision=REV,author='Codex root',reviewer='Pending separate editorial pass',dnaRevision=REV)
 D['ITEMS'].append(item)
 if pool!='practice':D['FORMS'].setdefault(pool,[]).append(iid)
 # Taught concept links depend on evidence overlap, not just chapter.
 for g in D['GUIDE'][f'ch{ch}']:
  if set(g['src'])&set(rs):
   if cid not in g['c']:g['c'].append(cid)
   n=int(g['id'].split('-')[3]);gp=D['CONCEPTS'][cid]['guidePrompts']
   if n not in gp:gp.append(n)
# The source examples remain unscored and identified separately. Original private HTML never copied.
for ch,f in folders.items():
 t=(f/'Case Study Questions and Answers.md').read_text();qpart,apart=t.split('## Case Study Answers');intro=qpart.split('## Case Study',1)[1].split('### Question',1)[0].strip();qs=qpart.split('### Question ')[1:];ans=apart.split('### Question ')[1:]
 for i,(q,a) in enumerate(zip(qs,ans),1):
  q=q.split('\n',1)[1].strip();a=a.split('\n',1)[1].strip()
  if ch==45 and i==2:intro=qs[0].split('\n',1)[1].split('This deformity is also known as:')[0].strip()
  sid=f'CH{ch}CASE{i}';iid=f'nu545-u6-ch{ch}-case-{i:02}'
  warning=''
  if ch==43 and i==2:warning='SOURCE CONFLICT: supplied key says Gomphosis, while its own explanation identifies this stem as Syndesmosis. This is unscored. An instructor-corrected key is needed.'
  if ch==41 and i==1:warning='SOURCE CONFLICT: the supplied small-volume answer contrasts with slide62 large-volume wording for ulcerative colitis. Do not generalize this volume key.'
  if ch==40:warning='SOURCE TIMELINE: 13 weeks gestation and approximately 10 weeks until delivery conflict. Timing is not tested.'
  c=next(cid for cid,co in D['CONCEPTS'].items() if co['sec']==f'ch{ch}')
  D['SOURCES'][sid]={'t':f'Chapter {ch}, released case {i}','f':'#sources/'+sid,'tier':1,'short':sid,'provenance':'Identifiable course-selected released example; instructor authorship and exam recurrence unverified.'}
  D['SOURCE_HTML'][sid]='<p>'+E(warning)+'</p><h4>Shared introduction</h4><p>'+E(intro)+'</p><h4>Supplied question</h4><pre class="longtext">'+E(q)+'</pre><h4>Supplied answer, preserved</h4><pre class="longtext">'+E(a)+'</pre>'
  D['CASES'].append({'id':'case-'+iid,'dom':'digestive' if ch<43 else 'musculoskeletal','title':f'Chapter {ch} · released example {i}','stem':(warning+'\n\n'+intro).strip() or 'The case context is included in the released question below.','src':[sid],'scopeNote':warning,'items':[dict(id=iid,rootId=iid,c=c,sec=f'ch{ch}',dom='digestive' if ch<43 else 'musculoskeletal',t='teach',q=q,model=(warning+'\n\n'+a).strip(),s=[sid],pool='released',eligible=False,tier=1)]})
# Balanced 25-item Boss samples the first practice root of each concept, excluding five by a fixed rotation.
practice=[i for i in D['ITEMS'] if i['pool']=='practice'];first={}
for i in practice:first.setdefault(i['c'],i['id'])
boss=[x for j,x in enumerate(first.values()) if j not in [4,9,14,19,24]]
D['BOSSES']=[dict(id='nu545-e6-boss',title='Unit 6 Boss Drill',blurb='25 original decisions across six chapters. Unfinished runs do not set a completed best.',passScore=.8,refs=boss,**{'pass':.8})]
# Extra source-depth cards for broad guide2, teaching complete supported chapter41 topic ranges without copying entire decks.
from topics import TOPICS
for ch,h,body,spec in TOPICS:
 rs=refs(spec)
 for r in rs:source(r)
 D['GUIDE'][f'ch{ch}'].append(dict(id=f'nu545-e6-topic-{ch}-'+re.sub(r'[^a-z0-9]+','-',h.lower()).strip('-'),h=h,html='<p>'+E(body)+'</p>',c=[],src=rs,tier=1))
review_file=HERE/'review-status.json'
if review_file.exists():
 reviewed=json.loads(review_file.read_text())
 for i in D['ITEMS']:
  if reviewed.get(i['id'])==hashlib.sha256(json.dumps({k:i[k] for k in ['q','o','s','explain']},sort_keys=True).encode()).hexdigest():i['reviewer']='Codex root · separate source/key and style passes'
bankhash=hashlib.sha256(json.dumps(D['ITEMS'],sort_keys=True).encode()).hexdigest();revision='bank-'+bankhash[:16]
for i in D['ITEMS']:i['contentRevision']=revision
D['CONTENT_REVISION']=revision;D['BANK_SHA256']=bankhash
(SITE/'js/data/course.js').write_text('(function(root){var L=root.L=root.L||{};Object.assign(L,'+json.dumps(D,ensure_ascii=False,indent=1)+');L.srcBase=function(c){return L.SOURCES[c]?c:null};L.srcLabel=function(c){return (L.SOURCES[c]||{}).t||c;};})(typeof window!=="undefined"?window:globalThis);\n')
(HERE/'coverage.json').write_text(json.dumps(D['COVERAGE'],indent=2,ensure_ascii=False))
(HERE/'coverage.md').write_text('# Exam 6 component coverage\n\nDirect means supplied-slide depth, not full textbook completeness. '+str(D['COVERAGE']['counts'])+'\n\n'+ '\n\n'.join(f'## {p["studyGuidePrompt"]}. {p["promptVerbatim"]}\n**{p["status"]}**\n\nSupported components: {p["supported"]}\n\nMissing/partial components: {p["remainingGapOrLimit"] or "None within the stated source-depth scope."}\n\nSources: '+ '; '.join(x['sourceId']+' slides '+x['locator'] for x in p['sources']) for p in coverage)+'\n\n## Component matrix\n\n'+ '\n\n'.join('### Prompt '+str(p['studyGuidePrompt'])+'\n\n| Component | Status | Exact source | Remaining need |\n|---|---|---|---|\n'+'\n'.join('| '+c['name']+' | '+c['status']+' | '+', '.join(c['refs'])+' | '+c['detail']+' |' for c in p['components']) for p in coverage))
# Editorial sheet: every original option, key, rationale, decision and exact source locator.
# Optional third argument writes an evidence-expanded sheet outside the public tree.
review=['<!doctype html><html><head><meta charset="utf-8"><title>NU545 Exam 6 editorial review</title><style>body{max-width:1000px;margin:30px auto;font:17px/1.5 system-ui;padding:20px}article{border-bottom:2px solid #789;padding:20px;break-inside:avoid}pre{white-space:pre-wrap}li{margin:12px 0}strong{color:#075b36}@media print{article{break-after:page}}</style></head><body><h1>NU545 Exam 6 · complete editorial sheet</h1>']
for i in D['ITEMS']:
 review.append('<article id="'+i['id']+'"><h2>'+E(i['id'])+'</h2><p>'+E(i['q'])+'</p><ol>'+''.join('<li>'+('<strong>KEY · ' if o['ok'] else '')+E(o['t'])+('</strong>' if o['ok'] else '')+'<p>'+E(o['w'])+'</p></li>' for o in i['o'])+'</ol><p>'+E(i['explain'])+'</p><p>Decision: '+E(i['decision'])+' · Concept: '+E(i['c'])+' · DNA: '+REV+'</p><p>Sources: '+', '.join(i['s'])+'</p><pre>'+E(i['evidenceExcerpt'])+'</pre></article>')
review.append('</body></html>')
if len(sys.argv)>2:
 private_review=Path(sys.argv[2]).resolve()
 if ROOT in private_review.parents: raise ValueError('Evidence review must stay outside the repository')
 private_review.parent.mkdir(parents=True,exist_ok=True);private_review.write_text('\n'.join(review))
(HERE/'editorial-review.html').write_text(re.sub(r'<pre>.*?</pre>','', '\n'.join(review),flags=re.S))
print(json.dumps({'items':len(D['ITEMS']),'concepts':len(D['CONCEPTS']),'forms':{k:len(v) for k,v in D['FORMS'].items()},'coverage':D['COVERAGE']['counts'],'cards':sum(map(len,D['GUIDE'].values()))}))
