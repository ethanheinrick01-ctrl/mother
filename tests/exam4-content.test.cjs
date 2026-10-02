const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site/nu545/exam4'),ctx={window:{}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(site,'js/data/course.js'),'utf8'),ctx);
const L=ctx.window.L;
test('Exam 4 has a separate identity, six chapters and supported activity inventory',()=>{
 assert.equal(L.CONFIG.id,'nu545-exam4');assert.equal(L.CONFIG.storageKey,'nu545-exam4-progress-v1');
 assert.equal(L.SECTIONS.length,6);assert.equal(Object.keys(L.CONCEPTS).length,29);
 assert.equal(L.ITEMS.length,133);assert.equal(L.ITEMS.filter(x=>x.pool==='practice').length,58);
 assert.equal(L.BOSSES[0].refs.length,25);assert.equal(new Set(L.BOSSES[0].refs.map(id=>L.ITEMS.find(x=>x.id===id).sec)).size,6);
});
test('all original items have a stable distinct decision, one key, rationales, DNA and exact evidence',()=>{
 for(const key of ['id','rootId','q'])assert.equal(new Set(L.ITEMS.map(x=>x[key])).size,133,key);
 for(const i of L.ITEMS){
  assert.equal(i.o.length,4,i.id);assert.equal(i.o.filter(x=>x.ok).length,1,i.id);
  assert.equal(new Set(i.o.map(x=>x.t.toLowerCase())).size,4,i.id);
  assert.ok(i.o.every(x=>x.w&&x.t),i.id);assert.ok(i.explain&&i.decision&&i.evidenceExcerpt,i.id);
  assert.ok(i.s.every(s=>L.SOURCES[s]&&L.SOURCE_HTML[s]),i.id);
  assert.equal(i.dnaRevision,'u4-personal-2026-10-01-r1');assert.equal(i.editorialRevision,'u4-personal-2026-10-02-r2');
  assert.equal(i.contentRevision,L.CONTENT_REVISION);assert.ok(!i.o.some(x=>/[;:—–]/.test(x.t)),i.id);
 }
});
test('mastery needs two distinct practice roots; held-out forms have the deliberate chapter allocation',()=>{
 for(const [id,c] of Object.entries(L.CONCEPTS)){
  assert.ok(new Set(L.ITEMS.filter(x=>x.c===id&&x.pool==='practice').map(x=>x.rootId)).size>=2,id);
  assert.ok(Object.values(L.GUIDE).flat().some(g=>g.c.includes(id)),id);
 }
 const seen=new Set();
 for(const f of 'ABC'){
  assert.equal(L.FORMS[f].length,25);let n={};
  for(const id of L.FORMS[f]){assert.ok(!seen.has(id));seen.add(id);let i=L.ITEMS.find(x=>x.id===id);assert.equal(i.pool,'mock');n[i.sec]=(n[i.sec]||0)+1;}
  assert.deepEqual(n,{ch28:4,ch29:7,ch30:5,ch31:3,ch32:3,ch33:3});
 }
});
test('all guide prompts and honest component limitations remain visible',()=>{
 assert.equal(L.COVERAGE.prompts.length,40);
 const coverage=JSON.parse(fs.readFileSync(path.join(root,'docs/nu545/exam4/coverage.json')));
 const rows=Array.isArray(coverage)?coverage:coverage.components;
 assert.equal(rows.length,108);let counts={};for(const r of rows)counts[r.status]=(counts[r.status]||0)+1;
 assert.deepEqual(counts,{Direct:59,Partial:35,Missing:14});
 assert.ok(Object.values(L.GUIDE).flat().some(g=>g.conflict));
});
test('all 26 released cases, including both Chapter 29 sets, remain separate self-checks',()=>{
 assert.equal(L.CASES.length,26);let ids=L.CASES.map(c=>c.items[0].id);
 assert.equal(ids.filter(x=>x.startsWith('u4-c29r-')).length,4);assert.equal(ids.filter(x=>x.startsWith('u4-c29l-')).length,2);
 for(const c of L.CASES){const i=c.items[0];assert.equal(i.t,'teach');assert.equal(i.pool,'released');assert.equal(i.eligible,false);assert.ok(i.model&&c.stem);assert.ok(!L.ITEMS.some(x=>x.id===i.id));}
 const q=L.CASES.find(c=>c.items[0].id==='u4-c33-q02').items[0];assert.ok(q.s.includes('CH33S17N'));
});
test('unsupported key claims are excluded; practice settings are explicit and headings stay neutral',()=>{
 const graded=L.ITEMS.map(x=>x.q+' '+x.explain+' '+x.o.map(o=>o.t+' '+o.w).join(' ')).join('\n');
 assert.ok(!/digitalis|hemarthrosis|joint bleeding|valine replaces glutamic|glutamic.*replaces valine/i.test(graded));
 const app=fs.readFileSync(path.join(site,'js/app.js'),'utf8');
 assert.ok(app.includes("durationSec:type==='mock'?2400"));assert.ok(app.includes('Practice design'));
 assert.ok(!app.includes('esc(L.CONCEPTS[it.c]?.name'));
});
test('Exam 4 reuses the verified accepted engine and utility implementation',()=>{
 for(const f of ['js/core/engine.js','js/core/util.js'])assert.ok(fs.readFileSync(path.join(site,f)).equals(cp.execFileSync('git',['show','9c058c6:site/nu545/exam3/'+f],{cwd:root})));
});
