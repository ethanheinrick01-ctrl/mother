/* NU545-only, append-preserving browser storage. No network or DOM. */
(function (root) {
  'use strict';
  var L = root.L = root.L || {}, KEY = L.CONFIG.storageKey, APP = L.CONFIG.id;
  var mem, healthy = true, protectedDisk = false, warning = '', listeners = [];
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function encode(x){return JSON.stringify(x,function(k,v){if(v&&typeof v==='object'&&!Array.isArray(v)){var o={};Object.keys(v).sort().forEach(function(key){o[key]=v[key];});return o;}return v;});}
  function earned(attempts){var histories={},out={};attempts.slice().sort(function(a,b){return a.timestamp-b.timestamp||a.id.localeCompare(b.id);}).forEach(function(a){if(!a.eligible)return;var h=histories[a.conceptId]||(histories[a.conceptId]=[]),p=h[h.length-1];h.push(a);if(p&&p.correct&&a.correct&&!p.assisted&&!a.assisted&&p.rootId!==a.rootId&&a.confidence!=='l'&&out[a.conceptId]===undefined)out[a.conceptId]=a.timestamp;});return out;}
  function object(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  function blank() { return {app:APP,schema:1,attempts:[],runs:{},mastered:{},notes:{},settings:{}}; }
  function validId(x){return typeof x==='string'&&/^[a-zA-Z0-9_:.-]+$/.test(x);}
  function correct(i,r){return i.t==='teach'?false:!!(i.o[r]&&i.o[r].ok);}
  function snapshot(i) {
    if (!object(i) || !validId(i.id) || typeof i.c !== 'string') throw Error('Malformed item snapshot.');
    if (i.t==='mc' || i.t==='tf') { if (!Array.isArray(i.o) || i.o.length<2 || i.o.some(function(o){return !object(o)||typeof o.t!=='string'||typeof o.ok!=='boolean';}) || i.o.filter(function(o){return o.ok;}).length!==1) throw Error('Malformed saved answer key.'); }
    else if(i.t!=='teach') throw Error('Unsupported saved item type.');
  }
  function safeKeys(value) { if(value && typeof value==='object')Object.keys(value).forEach(function(k){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe progress key.');safeKeys(value[k]);}); }
  function validate(s) {
    safeKeys(s);
    if (!object(s) || s.app !== APP) throw Error('Progress belongs to another course.');
    if (s.schema !== 1) throw Error(s.schema > 1 ? 'Future progress schema is unsupported.' : 'Invalid progress schema.');
    if (!Array.isArray(s.attempts) || !object(s.runs) || !object(s.mastered) || !object(s.notes) || !object(s.settings)) throw Error('Malformed progress structure.');
    var ids = {};
    s.attempts.forEach(function(a) {
      if (!object(a) || !validId(a.id) || ids[a.id] || typeof a.itemId !== 'string' || typeof a.rootId !== 'string' || typeof a.conceptId !== 'string' || !['practice','review','case','boss','mock'].includes(a.mode) || !['l','m','h'].includes(a.confidence) || typeof a.correct !== 'boolean' || typeof a.assisted !== 'boolean' || typeof a.eligible !== 'boolean' || !Number.isFinite(a.timestamp) || !object(a.snapshot) || a.response === undefined || a.response === null) throw Error('Malformed attempt record.');
      snapshot(a.snapshot);if(a.itemId!==a.snapshot.id||a.conceptId!==a.snapshot.c||a.rootId!==(a.snapshot.rootId||a.snapshot.id)||a.correct!==correct(a.snapshot,a.response)||(a.snapshot.t==='teach'&&a.eligible))throw Error('Inconsistent attempt evidence.'); if(a.snapshot.t!=='teach' && (!Number.isInteger(a.response)||!a.snapshot.o[a.response]))throw Error('Malformed attempted response.'); ids[a.id] = true;
    });
    Object.keys(s.runs).forEach(function(id) {
      var r = s.runs[id], occ = {};
      if (!object(r) || r.id !== id || !validId(id) || !['practice','review','case','boss','mock'].includes(r.type) || !['active','completed','ended'].includes(r.status) || !Array.isArray(r.items) || !object(r.responses) || !object(r.drafts) || !Array.isArray(r.corrections) || !Number.isFinite(r.startedAt) || !Number.isInteger(r.index) || r.index < 0 || (r.durationSec !== undefined && (!Number.isFinite(r.durationSec) || r.durationSec <= 0))) throw Error('Malformed run record.');
      r.items.forEach(function(i) { if (!object(i) || typeof i.id !== 'string' || !validId(i.occurrenceId) || occ[i.occurrenceId]) throw Error('Malformed run snapshot.'); snapshot(i); occ[i.occurrenceId] = i; });
      Object.keys(r.responses).forEach(function(k) { var a=r.responses[k]; if (!occ[k] || !object(a) || !['l','m','h'].includes(a.confidence) || typeof a.correct !== 'boolean' || typeof a.assisted !== 'boolean' || !Number.isFinite(a.checkedAt) || a.response === undefined || a.response === null) throw Error('Malformed checked response.'); if(occ[k].t!=='teach' && (!Number.isInteger(a.response)||!occ[k].o[a.response]))throw Error('Malformed checked answer.');if(a.correct!==correct(occ[k],a.response))throw Error('Checked score disagrees with saved key.'); });
      Object.keys(r.drafts).forEach(function(k) { var d=r.drafts[k]; if (!occ[k] || !object(d) || !Number.isFinite(d.updatedAt) || ![null,'l','m','h'].includes(d.confidence)) throw Error('Malformed draft.'); });
      r.corrections.forEach(function(c) { if (!object(c) || typeof c.id !== 'string' || !occ[c.occurrenceId] || !Number.isFinite(c.timestamp) || !['l','m','h'].includes(c.confidence)) throw Error('Malformed correction.'); });
    });
    s.attempts.forEach(function(a){Object.keys(s.runs).some(function(id){if(a.id.indexOf(id+':')!==0)return false;var key=a.id.slice(id.length+1),r=s.runs[id],v=r.responses[key],i=r.items.find(function(x){return x.occurrenceId===key;});if(!v||!i||a.itemId!==i.id||a.conceptId!==i.c||a.rootId!==(i.rootId||i.id)||JSON.stringify(v.response)!==JSON.stringify(a.response)||a.confidence!==v.confidence||a.correct!==v.correct||a.assisted!==v.assisted||a.timestamp!==v.checkedAt)throw Error('Attempt and first response disagree.');return true;});});
    Object.keys(s.mastered).forEach(function(k) { if (!Number.isFinite(s.mastered[k])) throw Error('Malformed earned mastery.'); });
    return s;
  }
  function read() {
    try { if (!root.localStorage) throw Error('Storage unavailable'); var raw=root.localStorage.getItem(KEY); if (!raw) return blank(); return validate(JSON.parse(raw)); }
    catch(e) {
      healthy=false; protectedDisk=true; warning='Saved progress could not be read: '+e.message+' Export in-memory progress before closing.';
      try { var bad=root.localStorage.getItem(KEY); if (bad) root.localStorage.setItem(KEY+'-recovery-'+Date.now(),bad); } catch(ignore) {}
      return blank();
    }
  }
  function stable(a,b,time) { if (a[time] !== b[time]) return a[time] < b[time] ? a : b; return JSON.stringify(a) < JSON.stringify(b) ? a : b; }
  function union(a,b) { var rows={}; a.concat(b).forEach(function(x) { if (!rows[x.id]) rows[x.id]=x; else rows[x.id]=stable(rows[x.id],x,'timestamp'); }); return Object.keys(rows).map(function(k){return rows[k];}).sort(function(x,y){return x.timestamp-y.timestamp || x.id.localeCompare(y.id);}); }
  function merge(a,b) {
    var out=copy(a); out.attempts=union(a.attempts,b.attempts);
    Object.keys(b.runs).forEach(function(id) {
      var x=out.runs[id], y=b.runs[id]; if (!x) { out.runs[id]=copy(y); return; }
      // Original occurrence snapshots never change; union only new retry occurrences.
      var known={}; x.items.forEach(function(i){known[i.occurrenceId]=true;}); y.items.forEach(function(i,pos){if(!known[i.occurrenceId]){var prev=pos?y.items[pos-1].occurrenceId:null;var at=prev?x.items.findIndex(function(z){return z.occurrenceId===prev;})+1:0;x.items.splice(at,0,copy(i));known[i.occurrenceId]=true;}});
      Object.keys(y.responses).forEach(function(k){x.responses[k]=x.responses[k]?copy(stable(x.responses[k],y.responses[k],'checkedAt')):copy(y.responses[k]);});
      Object.keys(y.drafts).forEach(function(k){var assisted=!!(x.drafts[k]&&x.drafts[k].assisted)||!!y.drafts[k].assisted;if(!x.drafts[k] || y.drafts[k].updatedAt>x.drafts[k].updatedAt)x.drafts[k]=copy(y.drafts[k]);if(assisted)x.drafts[k].assisted=true;});
      x.corrections=union(x.corrections,y.corrections);
      if (y.status !== 'active' && (x.status==='active' || (y.completedAt||0)<(x.completedAt||Infinity))) { x.status=y.status; x.completedAt=y.completedAt; }
      x.index=x.items.findIndex(function(i){return !x.responses[i.occurrenceId];});if(x.index<0)x.index=x.items.length;
    });
    out.attempts.forEach(function(a){Object.keys(out.runs).some(function(id){var r=out.runs[id],key=a.id.indexOf(id+':')===0?a.id.slice(id.length+1):null,v=key&&r.responses[key];if(!v)return false;a.response=copy(v.response);a.confidence=v.confidence;a.correct=v.correct;a.assisted=v.assisted;a.timestamp=v.checkedAt;return true;});});
    out.mastered=earned(out.attempts);
    out.notes=copy(a.notes);Object.keys(b.notes).forEach(function(k){if(!out.notes[k]||(b.notes[k].updatedAt||0)>(out.notes[k].updatedAt||0))out.notes[k]=copy(b.notes[k]);});out.settings=Object.assign({},a.settings,b.settings);
    return out;
  }
  function emit() { listeners.slice().forEach(function(fn){try{fn(load());}catch(ignore){}}); }
  function load() { if(!mem)mem=read(); return mem; }
  function save() {
    load(); if(protectedDisk) {emit();return false;}
    mem=merge(read(),mem); if(protectedDisk){emit();return false;}
    try {var serialized=encode(mem);if(root.localStorage.getItem(KEY)!==serialized)root.localStorage.setItem(KEY,serialized);healthy=true;} catch(e){healthy=false;warning='Browser storage is blocked or full. Progress is kept in this tab; export it before closing.';emit();return false;}
    emit();return true;
  }
  function transact(fn) { load(); if(!protectedDisk)mem=merge(read(),mem); var before=encode(mem),result=fn(mem);if(encode(mem)!==before)save();return result; }
  function importText(text) {
    var data;
    try {data=JSON.parse(text); if(data && data.state){if(data.app!==APP || data.schema!==1)throw Error('Wrong course or unsupported export schema.');data=data.state;} validate(data);}
    catch(e){return {ok:false,message:e.message+' Existing progress was preserved.'};}
    transact(function(s){mem=merge(s,data);}); return {ok:true,message:healthy?'Progress merged.':'Progress merged in memory. '+warning};
  }
  if(root.addEventListener)root.addEventListener('storage',function(e){if(e.key!==KEY || !e.newValue)return;try{var incoming=validate(JSON.parse(e.newValue));mem=merge(incoming,load());if(!protectedDisk && encode(mem)!==encode(incoming))save();else emit();}catch(err){healthy=false;warning='A different tab wrote invalid progress; existing in-memory progress was preserved.';try{root.localStorage.setItem(KEY+'-recovery-'+Date.now(),e.newValue);}catch(ignore){}}});
  L.store={KEY:KEY,load:load,save:save,transact:transact,exportJSON:function(){return JSON.stringify({app:APP,schema:1,state:load()},null,2);},importText:importText,ok:function(){load();return healthy;},warning:function(){load();return warning;},subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(x){return x!==fn;});};},_blank:blank};
})(typeof window!=='undefined'?window:globalThis);
