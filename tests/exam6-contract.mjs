// Exam 6 adapter of build-course-study-lab v2 validator: URL query normalization and browser-global binding only.
/* Structural validator for the reusable v2 contract. Academic keys still require source review. */
import fs from 'node:fs';
import path from 'node:path';
const target = process.argv[2] && path.resolve(process.argv[2]);
const mode = process.argv.includes('--hydrated') ? 'hydrated' : 'shell';
if (!target || !fs.existsSync(path.join(target, 'index.html'))) throw new Error('Usage: node scripts/validate-study-lab-v2.mjs /absolute/lab --shell|--hydrated');
const scripts = [...fs.readFileSync(path.join(target, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
for (const file of scripts) if (!fs.existsSync(path.join(target, file))) throw new Error('Missing runtime file: ' + file);
delete globalThis.L;
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
for (const file of scripts.filter(f => !f.endsWith('/app.js') && !f.endsWith('/item.js'))) {
  new Function('window', fs.readFileSync(path.join(target, file), 'utf8'))(globalThis);
}
const L = globalThis.L, errors = [], warn = [];
function err(id, message) { errors.push(id + ': ' + message); }
function duplicateIds(rows, kind) { const seen = new Set(); rows.forEach(x => { if (!x.id) err(kind, 'missing id'); else if (seen.has(x.id)) err(kind, 'duplicate ' + x.id); else seen.add(x.id); }); }
if (!L || !L.CONFIG) err('config', 'missing L.CONFIG');
else {
  for (const k of ['id', 'courseCode', 'courseTitle', 'examLabel', 'title', 'storageKey']) if (!L.CONFIG[k]) err('config', 'missing ' + k);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(L.CONFIG.id || '')) err('config', 'invalid id');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(L.CONFIG.storageKey || '')) err('config', 'invalid storageKey');
}
const sections = L.SECTIONS || [], concepts = L.CONCEPTS || {}, guide = L.GUIDE || {}, cases = L.CASES || [], items = (L.ITEMS || []).concat(...cases.map(c => c.items || []));
duplicateIds(sections, 'section'); duplicateIds(items, 'item'); duplicateIds(cases, 'case'); duplicateIds(L.BOSSES || [], 'boss');
const secIds = new Set(sections.map(s => s.id)), sourceCodes = new Set(Object.keys(L.SOURCES || {}));
Object.entries(L.DOMAINS || {}).forEach(([id,d]) => { if (!d || !d.name) err(id, 'domain needs a display name'); });
Object.entries(L.SOURCES || {}).forEach(([id,s]) => { if (!s || !s.t || !s.f || ![1,2,3,4].includes(s.tier)) err(id, 'source needs title, file, and evidence tier'); });
sections.forEach(s => { if (!L.DOMAINS[s.dom]) err(s.id, 'unknown domain'); if (!Number.isInteger(s.n) || !s.title || !s.short || !s.src) err(s.id, 'section needs number, title, short name, and source label'); });
Object.entries(concepts).forEach(([id, c]) => { if (!secIds.has(c.sec)) err(id, 'unknown section'); if (!c.name) err(id, 'missing name'); });
const taught = new Set();
Object.entries(guide).forEach(([sec, cards]) => {
  if (!secIds.has(sec)) err(sec, 'guide has unknown section');
  duplicateIds(cards, 'guide ' + sec);
  cards.forEach(c => {
    if (!c.h || !c.html) err(c.id, 'empty teaching card');
    (c.c || []).forEach(x => { if (!concepts[x]) err(c.id, 'unknown concept ' + x); else taught.add(x); });
    (c.src || []).forEach(code => { if (!L.srcBase(code)) err(c.id, 'unknown source ' + code); });
    if (!c.src || !c.src.length) err(c.id, 'missing source');
  });
});
Object.keys(concepts).forEach(id => { if (!taught.has(id)) err(id, 'no teaching card'); });
for (const item of items) {
  if (!concepts[item.c]) err(item.id, 'unknown concept ' + item.c);
  if (!item.q || !item.t) err(item.id, 'missing prompt or type');
  if (![1,2,3,4].includes(item.tier)) err(item.id, 'missing evidence tier');
  if (!item.s || !item.s.length) err(item.id, 'missing source');
  (item.s || []).forEach(code => { if (!L.srcBase(code)) err(item.id, 'unknown source ' + code); });
  if (item.t !== 'teach' && !item.explain && !item.why) warn.push(item.id + ': add overall explanation');
  if (['mc','tf','ms'].includes(item.t)) {
    if (!Array.isArray(item.o) || item.o.length < 2) { err(item.id, 'missing options'); continue; }
    const ok = item.o.filter(x => x.ok).length;
    if (item.t !== 'ms' && ok !== 1) err(item.id, 'exactly one keyed option required');
    if (item.t === 'ms' && (ok < 1 || ok === item.o.length)) err(item.id, 'select-all key must be nonempty and not every option');
    item.o.filter(x => !x.ok).forEach(x => { if (!x.w) err(item.id, 'wrong option lacks a rationale'); });
  } else if (item.t === 'num') { if (typeof item.a !== 'number') err(item.id, 'numeric key must be a number'); }
  else if (item.t === 'match') { if (!Array.isArray(item.pairs) || item.pairs.length < 2) err(item.id, 'missing match pairs'); }
  else if (item.t === 'parts') { (item.parts || []).forEach(x => { if (!x.options || !x.options.includes(x.a)) err(item.id, 'part key missing from options'); }); }
  else if (item.t === 'order') { if (!Array.isArray(item.seq) || item.seq.length < 2) err(item.id, 'missing order sequence'); }
  else if (item.t === 'teach') { if (!item.model) err(item.id, 'teach-back needs a model answer'); }
  else err(item.id, 'unsupported type ' + item.t);
  if (item.media && item.media.kind === 'img' && (!item.media.alt || !fs.existsSync(path.join(target, item.media.src)))) err(item.id, 'image missing or lacks alt text');
}
for (const c of cases) { if (!L.DOMAINS[c.dom]) err(c.id, 'unknown domain'); if (!c.stem || !c.items?.length) err(c.id, 'missing stem or questions'); }
if (mode === 'hydrated') {
  if (!sections.length || !items.length) err('lab', 'no course content');
  try { L.engine.build(); } catch (e) { err('engine', e.message); }
  const byConcept = L.engine.BY_CONCEPT();
  Object.keys(concepts).forEach(id => { const n = (byConcept[id] || []).filter(qid => L.engine.REG()[qid].t !== 'teach').length; if (n < 2 && !(L.GEN_FOR || {})[id]) err(id, 'fewer than two graded item roots'); });
  for (const b of L.BOSSES || []) { if (!b.title || !b.blurb || typeof b.pass !== 'number' || b.pass <= 0 || b.pass > 1) err(b.id, 'Boss needs title, blurb, and a pass fraction'); try { if (L.engine.bossRefs(b.id).length < 25) err(b.id, 'Boss needs at least 25 source-linked items'); } catch (e) { err(b.id, e.message); } }
  for (const [size, bp] of Object.entries(L.MOCK_BLUEPRINTS || {})) {
    if (Object.values(bp.domains || {}).reduce((n,v) => n+v,0) !== +size) err('mock ' + size, 'domain counts do not match length');
    try { if (!L.engine.buildMock(+size)) err('mock ' + size, 'could not build'); } catch (e) { err('mock ' + size, e.message); }
  }
}
const result = { mode, target, sections: sections.length, concepts: Object.keys(concepts).length, guideCards: Object.values(guide).reduce((n,c) => n + c.length, 0), items: items.length, cases: cases.length, bosses: (L.BOSSES || []).length, mocks: Object.keys(L.MOCK_BLUEPRINTS || {}).length, errors, warnings: warn, ok: errors.length === 0 };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
