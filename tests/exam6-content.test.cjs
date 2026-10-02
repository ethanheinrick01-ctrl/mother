const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const file of ['course','media'])vm.runInContext(fs.readFileSync(path.join(root,`site/nu545/exam6/js/data/${file}.js`),'utf8'),ctx);
const L=ctx.window.L;
test('Exam 6 identities and evidence-bounded practice design',()=>{
 assert.equal(L.SECTIONS.length,6);assert.equal(Object.keys(L.CONCEPTS).length,30);assert.equal(L.ITEMS.length,150);assert.equal(L.ITEMS.filter(i=>i.pool==='practice').length,60);assert.equal(L.CONFIG.id,'nu545-exam6');assert.equal(L.CONFIG.storageKey,'nu545-exam6-progress-v1');assert.equal(L.CONFIG.mockDurationSec,2700);assert.match(L.CONFIG.mockRationale,/40 points, not 40 questions/);assert.equal(L.BOSSES[0].refs.length,25);
});
test('complete source-backed authored records and nonleaking choices',()=>{
 for(const i of L.ITEMS){assert.match(i.reviewer,/separate source\/key and style passes/,i.id);assert.equal(i.dnaRevision,'u6-dna-2026-10-01-r1');assert.equal(i.o.length,4);assert.equal(i.o.filter(o=>o.ok).length,1);assert.equal(new Set(i.o.map(o=>o.t.toLowerCase())).size,4);assert.ok(i.o.every(o=>o.w&&o.t&&!/[;:—–]/.test(o.t)),i.id);assert.ok(i.explain&&i.evidenceExcerpt);assert.ok(i.s.every(r=>L.SOURCES[r]&&L.SOURCE_HTML[r]),i.id);}
 assert.equal(new Set(L.ITEMS.map(i=>i.q)).size,150);assert.equal(new Set(L.ITEMS.map(i=>i.rootId)).size,150);
});
test('three disjoint original forms and two taught practice roots per concept',()=>{
 const seen=new Set();for(const f of 'ABC'){assert.equal(L.FORMS[f].length,30);let ch={};for(const id of L.FORMS[f]){assert.ok(!seen.has(id));seen.add(id);const i=L.ITEMS.find(x=>x.id===id);assert.equal(i.pool,'mock');ch[i.sec]=(ch[i.sec]||0)+1}for(let n=40;n<=45;n++)assert.equal(ch['ch'+n],5);}
 for(const id of Object.keys(L.CONCEPTS)){assert.equal(new Set(L.ITEMS.filter(i=>i.c===id&&i.pool==='practice').map(i=>i.rootId)).size,2,id);assert.ok(Object.values(L.GUIDE).flat().some(g=>g.c.includes(id)),id);}
});
test('component gaps and released source conflicts remain explicit',()=>{
 assert.equal(L.COVERAGE.prompts.length,52);for(const [s,n] of Object.entries({Direct:17,Partial:34,Missing:1}))assert.equal(L.COVERAGE.prompts.filter(p=>p.status===s).length,n);
 for(const p of L.COVERAGE.prompts){assert.ok(p.components.length);for(const c of p.components){assert.ok(c.refs.every(r=>L.SOURCES[r]));assert.ok(c.detail);}}
 assert.equal(L.CASES.length,12);for(const c of L.CASES){assert.equal(c.items[0].eligible,false);assert.equal(c.items[0].t,'teach');assert.equal(c.items[0].pool,'released');}
 assert.match(L.CASES.find(c=>c.id.endsWith('ch43-case-02')).stem,/SOURCE CONFLICT/);assert.match(L.SOURCE_ISSUES,/ultraviolet/);
});
test('standalone code is isolated and release assets omit private material',()=>{
 const site=path.join(root,'site/nu545/exam6');for(const f of ['index.html','js/app.js','js/core/store.js'])assert.ok(!fs.readFileSync(path.join(site,f),'utf8').includes('nu545-exam3'));
 function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])};for(const f of walk(site)){assert.ok(!/\.(pptx|docx|pdf)$/i.test(f));if(/\.(js|html|json|md|py|txt)$/.test(f)){const s=fs.readFileSync(f,'utf8');assert.ok(!/X-Amz-Signature|X-Goog-Signature|\/Users\/ethanheinrick|sk-proj-/.test(s),f)}}
});
