const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../site/nu545/exam5'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['js/data/course.js','js/data/media.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const L=ctx.window.L;
test('fresh Exam 5 scope and disclosed practice format',()=>{
 assert.equal(L.CONFIG.id,'nu545-exam5');assert.equal(L.CONFIG.storageKey,'nu545-exam5-progress-v1');
 assert.equal(L.SECTIONS.length,6);assert.equal(L.ITEMS.length,136);assert.equal(L.ITEMS.filter(q=>q.pool==='practice').length,64);
 assert.equal(Object.keys(L.CONCEPTS).length,32);assert.equal(L.BOSSES[0].refs.length,25);
 assert.match(L.CONFIG.mockRationale,/Practice design/);assert.match(L.CONFIG.mockRationale,/40 points/);
 const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');assert.match(app,/mock'\?2160/);assert.ok(!/Exam 3|Exam3|41 questions|all seven/.test(app));
});
test('every original has a stable root, one key, rationales, DNA, separate source review and exact evidence',()=>{
 assert.equal(new Set(L.ITEMS.map(q=>q.id)).size,136);assert.equal(new Set(L.ITEMS.map(q=>q.rootId)).size,136);assert.equal(new Set(L.ITEMS.map(q=>q.q)).size,136);
 for(const q of L.ITEMS){
  assert.equal(q.o.length,4,q.id);assert.equal(q.o.filter(o=>o.ok).length,1,q.id);assert.equal(new Set(q.o.map(o=>o.t.toLowerCase())).size,4,q.id);
  assert.ok(q.o.every(o=>o.w&&o.t&&!/[;:—–]/.test(o.t)),q.id);assert.ok(q.explain&&q.decision,q.id);
  assert.equal(q.dnaRevision,'nu545-e5-dna-2026-10-01-r1');assert.equal(q.contentRevision,L.CONTENT_REVISION);assert.equal(q.reviewer,'Codex root');assert.ok(q.sourceReview&&q.scopeReview);
  for(const ref of q.s){assert.match(ref,/^CH(34|35|36|37|38|39)S\d+N?$/);assert.ok(L.SOURCES[ref]&&L.SOURCE_HTML[ref],q.id+' '+ref)}
 }
});
test('two distinct taught roots per mastery concept and six-chapter Boss without filler',()=>{
 for(const [id,c] of Object.entries(L.CONCEPTS)){
  const qs=L.ITEMS.filter(q=>q.pool==='practice'&&q.c===id);assert.equal(qs.length,2,id);assert.notEqual(qs[0].decision,qs[1].decision);
  assert.ok(Object.values(L.GUIDE).flat().some(g=>g.c.includes(id)),id);
 }
 assert.equal(new Set(L.BOSSES[0].refs).size,25);assert.equal(new Set(L.BOSSES[0].refs.map(id=>L.ITEMS.find(q=>q.id===id).sec)).size,6);
});
test('three disjoint mock forms follow the deliberate chapter blueprint',()=>{
 const seen=new Set();for(const f of 'ABC'){
  assert.equal(L.FORMS[f].length,24);const counts={};
  for(const id of L.FORMS[f]){assert.ok(!seen.has(id));seen.add(id);let q=L.ITEMS.find(q=>q.id===id);assert.equal(q.form,f);counts[q.sec]=(counts[q.sec]||0)+1}
  assert.equal(JSON.stringify(counts),JSON.stringify({ch34:4,ch35:6,ch36:4,ch37:3,ch38:4,ch39:3}));
 }
});
test('all 56 guide prompts and all 233 component judgments remain honest',()=>{
 assert.equal(L.COVERAGE.prompts.length,56);assert.ok(Object.values(L.GUIDE).flat().length>=56);
 const rows=L.COVERAGE.prompts.flatMap(p=>p.components);assert.equal(rows.length,233);assert.equal(rows.filter(c=>c.status==='Direct').length,111);assert.equal(rows.filter(c=>c.status==='Partial').length,71);assert.equal(rows.filter(c=>c.status==='Missing').length,51);
 for(const c of rows){assert.ok(c.refs.length);assert.ok(c.refs.every(s=>L.SOURCES[s]));if(c.status!=='Direct')assert.ok(c.missing);}
 for(const n of [18,31,41,55,56])assert.equal(L.COVERAGE.prompts[n-1].status,'Missing');
});
test('released examples retain provenance and conflict warning outside graded modes',()=>{
 assert.equal(L.CASES.length,12);for(const c of L.CASES){const q=c.items[0];assert.equal(q.t,'teach');assert.equal(q.eligible,false);assert.equal(q.pool,'released');assert.ok(q.q&&q.model);assert.equal(typeof c.stem,'string');assert.ok(!Object.values(L.FORMS).flat().includes(q.id));}
 assert.match(L.CASES.find(c=>c.id==='nu545-u5-ch34-case-02').items[0].model,/UNRESOLVED SOURCE CONFLICT/);
 for(const q of L.ITEMS)assert.ok(!q.s.includes('CH39S47N')&&!q.s.includes('CH35S62'),q.id);
});
test('six local complete films, timed captions, editable sources and licensing',()=>{
 assert.equal(L.MEDIA_FILMS.length,6);for(const f of L.MEDIA_FILMS){
  assert.match(f.voice,/AI Voice Generator · Clear/);assert.equal(f.stages.length,5);assert.equal(f.stages[0].start,0);
  for(const key of ['src','captions','poster','transcriptSrc','animationSource'])assert.ok(fs.statSync(path.join(root,f[key])).size>100);
  assert.ok(f.sources.every(s=>L.SOURCES[s]));assert.match(f.figureSource,/commons.wikimedia.org/);
  const probe=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path.join(root,f.src)]));
  const v=probe.streams.find(s=>s.codec_type==='video');assert.equal(v.codec_name,'h264');assert.equal(v.width,1280);assert.equal(v.height,720);assert.equal(probe.streams.find(s=>s.codec_type==='audio').codec_name,'aac');
  assert.ok(Math.abs(+probe.format.duration-f.duration)<.15);
  const vtt=fs.readFileSync(path.join(root,f.captions),'utf8');assert.ok(vtt.startsWith('WEBVTT'));assert.ok([...vtt.matchAll(/ --> /g)].length>=15);
 }
 const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');assert.ok(!app.includes('autoplay'));assert.ok(app.indexOf('chapter-explainer')<app.indexOf('class="tabs">${L.SECTIONS'));
});
test('existing engines and exams stay unchanged; only local store identity differs',()=>{
 for(const f of ['util.js','engine.js'])assert.ok(fs.readFileSync(path.join(root,'js/core',f)).equals(fs.readFileSync(path.join(root,'../exam3/js/core',f))));
 const store=fs.readFileSync(path.join(root,'js/core/store.js'),'utf8');assert.match(store,/KEY = L.CONFIG.storageKey, APP = L.CONFIG.id/);assert.ok(!store.includes('nu545-exam3'));
 const paths=cp.execFileSync('git',['diff','--name-only','9c058c6'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);assert.ok(paths.every(p=>p.startsWith('site/nu545/exam5/')||p.startsWith('docs/nu545/exam5/')||p.startsWith('tests/exam5-')),paths.join('\n'));
});
