/* Snapshot-based assessment engine; no DOM. All modes share one attempt ledger. */
(function(root){
  'use strict';
  var L=root.L=root.L||{}, seq=0, tabSalt=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+tabSalt+'-'+(++seq).toString(36).padStart(8,'0');}
  function registry(){var out={}; function add(a){(a||[]).forEach(function(it){if(it.items)add(it.items);else if(it.id)out[it.id]=it;});} add(L.ITEMS);add(L.CASES);Object.keys(L.FORMS||{}).forEach(function(k){add(L.FORMS[k]);});add(L.BOSSES);return out;}
  function item(id){return registry()[id]||null;}
  function run(id){return L.store.load().runs[id]||null;}
  function expired(r){return r.type==='mock' && Number.isFinite(r.durationSec) && Date.now()>=r.startedAt+r.durationSec*1000;}
  function validResponse(it,r){
    if(it.t==='mc'||it.t==='tf')return Number.isInteger(r)&&Array.isArray(it.o)&&r>=0&&r<it.o.length;
    if(it.t==='teach')return !!r && typeof r==='object' && typeof r.text==='string' && r.text.trim().length>0 && ['l','m','h',0,1,2,3,'needs-work','partial','complete'].includes(r.self);
    return false;
  }
  function grade(it,response){if(it.t==='teach')return false;return !!it.o[response].ok;}
  function eligible(it){return it.t!=='teach' && it.eligible!==false && !!(L.CONCEPTS||{})[it.c] && L.CONCEPTS[it.c].mastery!==false;}
  function earn(s){
    var histories={},earned={};s.attempts.slice().sort(function(a,b){return a.timestamp-b.timestamp||a.id.localeCompare(b.id);}).forEach(function(a){if(!a.eligible)return;var h=histories[a.conceptId]||(histories[a.conceptId]=[]);h.push(a);var p=h[h.length-2];if(p && p.correct && a.correct && !p.assisted && !a.assisted && p.rootId!==a.rootId && a.confidence!=='l' && earned[a.conceptId]===undefined)earned[a.conceptId]=a.timestamp;});s.mastered=earned;
  }
  function createRun(opt){
    if(!opt || !['practice','review','case','boss','mock'].includes(opt.type) || !Array.isArray(opt.itemIds) || !opt.itemIds.length)throw Error('Choose a valid mode and at least one item.');
    var items=opt.itemIds.map(function(id){var it=item(id);if(!it)throw Error('Unknown item: '+id);var snap=clone(it);var parent=(L.CASES||[]).find(function(c){return (c.items||[]).some(function(i){return i.id===id;});});if(parent){snap.caseStem=parent.stem;snap.caseProvenance=parent.scopeNote||'';}snap.rootId=snap.rootId||snap.id;snap.occurrenceId=uid('occ');return snap;});
    if(opt.durationSec!==undefined && (!Number.isFinite(opt.durationSec)||opt.durationSec<=0))throw Error('Invalid timer duration.');
    var id=uid('run'), r={id:id,type:opt.type,title:opt.title||opt.type,status:'active',items:items,index:0,startedAt:Date.now(),responses:{},drafts:{},corrections:[]};
    if(opt.type==='mock')r.durationSec=opt.durationSec===undefined?3600:opt.durationSec;
    else if(opt.durationSec!==undefined)r.durationSec=opt.durationSec;
    L.store.transact(function(s){s.runs[id]=r;});return id;
  }
  function finishIn(s,r,early){
    if(r.status!=='active')return r;
    r.status=early?'ended':'completed';r.completedAt=Date.now();
    // Unanswered questions stay absent from responses and attempts, and score zero.
    return r;
  }
  function saveDraft(id,occ,response,confidence){return L.store.transact(function(s){var r=s.runs[id];if(!r || r.status!=='active')return {ok:false,message:'Run is closed.'};if(expired(r)){finishIn(s,r,false);return {ok:false,message:'Time has expired.'};}if(!r.items.some(function(i){return i.occurrenceId===occ;}))return {ok:false,message:'Unknown occurrence.'};if(r.responses[occ])return {ok:false,message:'First answer is already checked.'};var assisted=!!(r.drafts[occ]&&r.drafts[occ].assisted);r.drafts[occ]={response:clone(response===undefined?null:response),confidence:confidence||null,updatedAt:Date.now(),assisted:assisted};return {ok:true};});}
  function enqueueRetry(r,it,conf,correct){
    if(!['practice','review'].includes(r.type) || it.t==='teach' || (correct && conf!=='l'))return;
    var gap=correct?4:2, checked=Object.keys(r.responses).length, target=r.index+gap;
    // Fill a short queue with existing authored roots so a retry is never immediate.
    var pool=Object.keys(registry()).map(item).filter(function(x){return x.t==='mc'&&x.pool!=='mock';});
    while(r.items.length<target && pool.length){var bridge=clone(pool[(r.items.length-r.index)%pool.length]);bridge.rootId=bridge.rootId||bridge.id;bridge.occurrenceId=it.occurrenceId+'-bridge-'+r.items.length;bridge.bridge=true;r.items.push(bridge);}
    var retry=clone(it);retry.occurrenceId=it.occurrenceId+'-retry';retry.retry=true;retry.retryOf=it.occurrenceId;retry.dueAfterChecks=checked+gap;r.items.splice(Math.min(target,r.items.length),0,retry);
  }
  function check(id,occ,response,confidence,assisted){
    return L.store.transact(function(s){
      var r=s.runs[id], existing=r&&r.responses[occ];
      if(existing)return {ok:existing.correct,sc:existing.correct?1:0,first:false,message:'First checked answer was preserved.'};
      if(!r || r.status!=='active')return {ok:false,sc:0,first:false,message:'Run is closed.'};
      if(expired(r)){finishIn(s,r,false);return {ok:false,sc:0,first:false,message:'Time has expired.'};}
      var it=r.items.find(function(i){return i.occurrenceId===occ;});
      if(!it)return {ok:false,sc:0,first:false,message:'Unknown occurrence.'};
      if(!['l','m','h'].includes(confidence))return {ok:false,sc:0,first:false,message:'Choose Low, Medium, or High confidence.'};
      if(!validResponse(it,response))return {ok:false,sc:0,first:false,message:'Provide a valid response before checking.'};
      if(it.dueAfterChecks && Object.keys(r.responses).length<it.dueAfterChecks)return {ok:false,sc:0,first:false,message:'Complete the intervening activities before retrying.'};
      var correct=grade(it,response), now=Math.max(Date.now(),s.attempts.reduce(function(n,a){return Math.max(n,a.timestamp+1);},0));assisted=!!assisted||!!(r.drafts[occ]&&r.drafts[occ].assisted);
      r.responses[occ]={response:clone(response),confidence:confidence,correct:correct,checkedAt:now,assisted:assisted};
      s.attempts.push({id:id+':'+occ,itemId:it.id,rootId:it.rootId||it.id,conceptId:it.c||it.id,mode:r.type,response:clone(response),confidence:confidence,correct:correct,assisted:assisted,timestamp:now,snapshot:clone(it),eligible:eligible(it)});
      r.index=r.items.findIndex(function(x){return !r.responses[x.occurrenceId];});if(r.index<0)r.index=r.items.length;
      enqueueRetry(r,it,confidence,correct);earn(s);
      return {ok:correct,sc:it.t==='teach'?0:(correct?1:0),first:true};
    });
  }
  function correction(id,occ,response,confidence){return L.store.transact(function(s){var r=s.runs[id], it=r&&r.items.find(function(i){return i.occurrenceId===occ;});if(!it || !r.responses[occ])return {ok:false,sc:0,first:false,message:'Check an initial response first.'};if(!['l','m','h'].includes(confidence)||!validResponse(it,response))return {ok:false,sc:0,first:false,message:'Provide a valid response and confidence.'};var good=grade(it,response);r.corrections.push({id:uid('correction'),occurrenceId:occ,response:clone(response),confidence:confidence,correct:good,timestamp:Date.now()});return {ok:good,sc:good?1:0,first:false};});}
  function finishRun(id,early){return L.store.transact(function(s){var r=s.runs[id];if(!r)return null;var complete=r.items.every(function(i){return !!r.responses[i.occurrenceId];});finishIn(s,r,expired(r)?false:!!early||(r.type!=='mock'&&!complete));return clone(r);});}
  function activeRuns(){L.store.transact(function(s){Object.keys(s.runs).forEach(function(id){var r=s.runs[id];if(r.status==='active'&&expired(r))finishIn(s,r,false);});});return Object.values(L.store.load().runs).filter(function(r){return r.status==='active';});}
  function stats(){
    L.store.transact(earn);var s=L.store.load(), out={};Object.keys(L.CONCEPTS||{}).forEach(function(c){out[c]={status:'new',mastered:s.mastered[c]!==undefined,attempts:0,correct:0,misconception:false,due:true,reviewReason:'new'};});
    var h={};s.attempts.slice().sort(function(a,b){return a.timestamp-b.timestamp||a.id.localeCompare(b.id);}).forEach(function(a){if(!a.eligible||!out[a.conceptId])return;var st=out[a.conceptId];st.attempts++;if(a.correct)st.correct++;(h[a.conceptId]||(h[a.conceptId]=[])).push(a);});
    Object.keys(out).forEach(function(c){var st=out[c], rows=h[c]||[], a=rows[rows.length-1], consecutive=0, misconception=false;for(var i=rows.length-1;i>=0;i--){if(rows[i].correct&&!rows[i].assisted)consecutive++;else{misconception=!rows[i].correct&&rows[i].confidence==='h'&&consecutive<2;break;}}st.misconception=misconception;if(!a){if(st.mastered){st.status='mastered';st.due=false;st.reviewReason=null;}return;}st.due=!a.correct||a.confidence==='l'||a.assisted||misconception||!st.mastered;st.reviewReason=misconception?'misconception':!a.correct?'miss':a.confidence==='l'?'low-confidence':a.assisted?'assisted':!st.mastered?'learning':null;st.status=st.mastered?'mastered':misconception?'misconception':!a.correct?'shaky':'learning';});return out;
  }
  function reviewItems(){var st=stats();return Object.values(registry()).filter(function(it){return it.pool!=='mock' && it.t!=='teach' && st[it.c] && st[it.c].attempts>0 && st[it.c].due;}).sort(function(a,b){return (st[a.c].misconception?-1:0)-(st[b.c].misconception?-1:0);});}
  function bossBest(){var best=null;Object.values(L.store.load().runs).forEach(function(r){if(r.type!=='boss'||r.status!=='completed'||r.items.length<25||!r.items.every(function(i){return i.t!=='teach'&&r.responses[i.occurrenceId];}))return;var score=r.items.filter(function(i){return r.responses[i.occurrenceId].correct;}).length/r.items.length;best=best===null?score:Math.max(best,score);});return best;}
  L.engine={build:registry,REG:registry,BY_CONCEPT:function(){var out={};Object.values(registry()).forEach(function(i){(out[i.c]||(out[i.c]=[])).push(i.id);});return out;},bossRefs:function(id){var b=(L.BOSSES||[]).find(function(x){return x.id===id;});return b?(b.refs||b.itemIds||[]).map(function(x){return typeof x==='string'?{id:x}:x;}):[];},buildMock:function(size){return (L.FORMS&&L.FORMS.A||[]).slice(0,size).map(function(x){return {id:typeof x==='string'?x:x.id};});},registry:registry,item:item,createRun:createRun,run:run,activeRuns:activeRuns,saveDraft:saveDraft,check:check,correction:correction,finishRun:finishRun,stats:stats,reviewItems:reviewItems,bossBest:bossBest};
})(typeof window!=='undefined'?window:globalThis);
