/* Guide presentation only. Phrase choices live in each exam's reviewed plan. */
(function(root){
  'use strict';
  const VERSION='editorial-20261002';
  const skip='h1,h2,h3,h4,thead,details,.source,.small,.scope-note,.callout,.row,button,a,svg,video,mark';
  const word=c=>!!c && /[\p{L}\p{N}_]/u.test(c);
  function matches(text,terms,used){
    const lower=text.toLocaleLowerCase(), hits=[];
    for(const term of terms){
      const key=term.text.toLocaleLowerCase();
      if(used.has(key))continue;
      let start=lower.indexOf(key);
      while(start>=0){
        const end=start+term.text.length;
        if((!word(term.text[0])||!word(text[start-1]))&&(!word(term.text.at(-1))||!word(text[end]))&&!hits.some(x=>start<x.end&&end>x.start)){
          hits.push({...term,start,end});used.add(key);break;
        }
        start=lower.indexOf(key,start+1);
      }
    }
    return hits.sort((a,b)=>a.start-b.start);
  }
  function paint(card,plan){
    const doc=card.ownerDocument,used=new Set();
    const terms=[...plan.gold.map(x=>({...x,color:'gold'})),...plan.cyan.map(text=>({text,color:'cyan'}))].sort((a,b)=>b.text.length-a.text.length);
    const nodes=[];
    const walker=doc.createTreeWalker(card,4);
    let node;
    while((node=walker.nextNode())){
      const el=node.parentElement;
      if(el?.closest('p,li,td')&&!el.closest(skip))nodes.push(node);
    }
    let count=0;
    for(const node of nodes){
      const text=node.nodeValue,hits=matches(text,terms,used);
      if(!hits.length)continue;
      const frag=doc.createDocumentFragment();let last=0;
      for(const hit of hits){
        frag.append(doc.createTextNode(text.slice(last,hit.start)));
        const mark=doc.createElement('mark');mark.className='em em-'+hit.color;
        mark.textContent=text.slice(hit.start,hit.end);
        mark.title=hit.color==='gold'?'Study-guide focus · prompt '+hit.prompt:'Key relationship or distinction';
        if(hit.prompt)mark.dataset.prompt=String(hit.prompt);
        frag.append(mark);last=hit.end;count++;
      }
      frag.append(doc.createTextNode(text.slice(last)));node.replaceWith(frag);
    }
    return count;
  }
  function apply(){
    const main=root.document?.querySelector('main');
    const lesson=main?.querySelector('.lesson:not(.chapter-explainer)');
    if(!lesson||lesson.dataset.emphasisVersion===VERSION)return;
    const plan=root.GUIDE_EMPHASIS_PLAN||{};
    let count=0;
    for(const card of lesson.querySelectorAll('article.card[id]')){
      if(plan[card.id])count+=paint(card,plan[card.id]);
    }
    lesson.dataset.emphasisVersion=VERSION;
    if(count){
      const key=root.document.createElement('p');key.className='em-key small';key.setAttribute('aria-label','Reading color key');
      key.innerHTML='<span class="em-swatch em-gold">Gold: study-guide focus</span> <span class="em-swatch em-cyan">Cyan: key relationship or distinction</span><br>Gold identifies a supported topic named in the instructor’s guide. Highlights are reading aids, not exam predictions. Unhighlighted material still matters.';
      lesson.prepend(key);
    }
  }
  root.GuideEmphasis={version:VERSION,apply,matches};
  if(root.document){
    const main=root.document.querySelector('main');
    if(main){new MutationObserver(apply).observe(main,{childList:true});apply();}
  }
})(typeof window!=='undefined'?window:globalThis);
