const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'site/nu545/exam3/js/data/course.js'),'utf8'),ctx);
const L=ctx.L,plain=x=>JSON.parse(JSON.stringify(x));

test('fresh course identity, seven chapters, exact practice/mock/Boss counts',()=>{
 assert.equal(L.SECTIONS.length,7);assert.equal(Object.keys(L.CONCEPTS).length,36);
 assert.equal(L.ITEMS.filter(i=>i.pool==='practice').length,72);
 for(const f of 'ABC')assert.equal(L.FORMS[f].length,41);
 assert.equal(L.BOSSES[0].refs.length,25);
 assert.equal(L.CONFIG.courseCode,'NU545');assert.equal(L.CONFIG.id,'nu545-exam3');assert.equal(L.CONFIG.storageKey,'nu545-exam3-progress-v1');
});
test('all 195 root-authored items have one key, parallel distinct options, full rationales and direct evidence',()=>{
 assert.equal(L.ITEMS.length,195);
 for(const i of L.ITEMS){
  assert.equal(i.editorialRevision,'root-manual-2026-09-30',i.id);
  assert.equal(i.reviewer,'Codex root',i.id);assert.equal(i.contentRevision,L.CONTENT_REVISION,i.id);
  assert.equal(i.o.length,4,i.id);assert.equal(i.o.filter(o=>o.ok).length,1,i.id);
  assert.equal(new Set(i.o.map(o=>o.t.trim().toLowerCase())).size,4,i.id);
  assert.ok(i.o.every(o=>o.w&&o.t),i.id);assert.ok(i.explain&&i.decision&&i.evidenceExcerpt,i.id);
  assert.ok(i.s.every(s=>L.SOURCES[s]&&L.SOURCE_HTML[s]),i.id);
  assert.ok(i.o.every(o=>!/[;:—–]/.test(o.t)),i.id);
 }
});
test('question roots and mock forms do not reuse originals; full chapter allocation remains deliberate',()=>{
 assert.equal(new Set(L.ITEMS.map(i=>i.id)).size,195);
 assert.equal(new Set(L.ITEMS.map(i=>i.rootId)).size,195);
 assert.equal(new Set(L.ITEMS.map(i=>i.q.toLowerCase())).size,195);
 const seen=new Set();
 for(const f of 'ABC'){
  const chapters={};for(const id of L.FORMS[f]){assert.ok(!seen.has(id),id);seen.add(id);const i=L.ITEMS.find(i=>i.id===id);assert.equal(i.pool,'mock');chapters[i.sec]=(chapters[i.sec]||0)+1;}
  assert.deepEqual(chapters,{ch21:7,ch22:12,ch23:5,ch24:6,ch25:5,ch26:2,ch27:4});
 }
 assert.equal(new Set(L.BOSSES[0].refs.map(id=>L.ITEMS.find(i=>i.id===id).sec)).size,7);
});
test('every mastery concept has at least two distinct taught practice roots',()=>{
 for(const [id,c] of Object.entries(L.CONCEPTS)){
  if(c.mastery===false)continue;
  assert.ok(new Set(L.ITEMS.filter(i=>i.c===id&&i.pool==='practice').map(i=>i.rootId)).size>=2,id);
  assert.ok(Object.values(L.GUIDE).flat().some(g=>g.c.includes(id)),id);
 }
});
test('all 52 prompts, including the two missing topics, remain visible in their associated chapters',()=>{
 assert.equal(L.COVERAGE.prompts.length,52);
 assert.equal(L.COVERAGE.prompts.filter(p=>p.status==='Direct').length,30);
 assert.equal(L.COVERAGE.prompts.filter(p=>p.status==='Partial').length,20);
 assert.equal(L.COVERAGE.prompts.filter(p=>p.status==='Missing').length,2);
 for(const p of L.COVERAGE.prompts)assert.ok(p.chapters.length>0,p.promptVerbatim);
});
test('20 source examples remain verbatim self-checks outside original mastery and mocks',{skip:!fs.existsSync(path.join(root,'../UNIT 3 CASE STUDY LEDGER.json'))},()=>{
 const raw=JSON.parse(fs.readFileSync(path.join(root,'../UNIT 3 CASE STUDY LEDGER.json'),'utf8'));
 assert.equal(L.CASES.length,20);
 for(const c of L.CASES){
  assert.equal(c.items.length,1);const i=c.items[0],r=raw.find(x=>x.id===i.id);assert.ok(r,i.id);
  assert.equal(i.eligible,false);assert.equal(i.pool,'released');assert.equal(i.t,'teach');
  for(const b of r.questionBlocks){if(b.items){for(const t of b.items)assert.ok(i.q.includes(t),i.id);}else assert.ok(i.q.includes(b.text),i.id);}
  for(const b of r.sharedCaseBlocks)assert.ok(c.stem.includes(b.text),i.id);
  for(const b of r.answerBlocks.slice(1))assert.ok(i.model.includes(b.text),i.id);
  assert.ok(!Object.values(L.FORMS).flat().includes(i.id));
 }
});
test('documented source errors never supply a graded key and question headings do not leak concept names',()=>{
 for(const i of L.ITEMS)assert.ok(!i.s.includes('CH22S107')&&!i.s.includes('CH21S41'),i.id);
 const app=fs.readFileSync(path.join(root,'site/nu545/exam3/js/app.js'),'utf8');
 assert.ok(!app.includes("esc(L.CONCEPTS[it.c]?.name"));
 assert.ok(!app.includes("title=b.dataset.concept?L.CONCEPTS"));
 assert.ok(!app.includes('function visualDraw('));
});
test('supplemental figures are local credited original assets; rejected media remains outside the deployed site',()=>{
 for(const f of L.ACADEMIC_FIGURES){
  assert.ok(f.credit.includes('OpenStax'));assert.ok(f.licenseUrl&&f.sha256);
  assert.ok(fs.existsSync(path.join(root,'site/nu545/exam3',f.src)));
 }
 assert.ok(!fs.existsSync(path.join(root,'site/nu545/exam3/media/adh-sample.mp4')));
 assert.ok(!fs.existsSync(path.join(root,'site/nu545/exam3/media/adh-audio.m4a')));
});
test('legacy NU518 moved copy preserves every tracked original asset except the new root portal',()=>{
 const cp=require('node:child_process');
 const baseline='41439104b0ce3ed90677e6be377b870ccfa6bc3b';
 const files=cp.execFileSync('git',['ls-tree','-r','--name-only',baseline,'site'],{cwd:root,encoding:'utf8'}).trim().split('\n');
 for(const file of files){const old=cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,maxBuffer:32*1024*1024});const moved=fs.readFileSync(path.join(root,'site/nu518/exam2',file.slice(5)));assert.ok(old.equals(moved),file);}
});
