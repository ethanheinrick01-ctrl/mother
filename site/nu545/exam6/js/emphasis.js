/* Guide emphasis: selective gold/cyan marking of key terms in Guide cards.
   Gold = wording taken from the instructor's official study-guide prompts tied to that card.
   Cyan = key terms, defined terms, numeric facts, and explicit distinctions.
   Presentation only: reads L.GUIDE/L.CONCEPTS/L.COVERAGE, never changes data, questions or saved progress. */
(function (root) {
  'use strict';
  var STOP = new RegExp('^(?:know|describe|explain|compare|contrast|identify|list|discuss|define|differentiate|distinguish|understand|summarize|outline|recognize|name|state|give|the|and|or|of|a|an|in|to|for|with|on|by|as|is|are|be|from|vs|versus|between|among|that|this|these|those|their|its|it|how|what|why|which|when|where|who|including|include|includes|such|can|may|will|also|not|than|into|during|after|before|about|each|both|all|any|some|other|common|specific|responsible|key|main|major|primary|basic|general|normal|clinical|manifestations?|diagnostics?|diagnosis|treatment|treatments|complications?|etiology|patho|pathophysiology|causes?|types?|role|roles|function|functions|difference|differences|process|processes|related|associated|effects?|changes?|alterations?|disorders?|disease|diseases|conditions?|findings?|signs?|symptoms?|factors?|risk|examples?)$', 'i');
  var GENERIC = /^(?:cells?|system|blood|body|tissue|tissues|organ|organs|protein|proteins|level|levels|increase|increased|decrease|decreased|response|result|results|production|structure|structures|mechanism|mechanisms)$/i;
  var DEF_VERB = '(?:is|are|means|refers to|results from|occurs when|describes|involves|provides?|carr(?:y|ies)|secretes?|releases?|causes?|produces?|stores?|activates?|inhibits?|stimulates?)';
  var CUE = /\b(?:Keep (?:these|this|that|them)? ?(?:separate|distinct|apart)|(?:separate|distinct|different) from|rather than|unlike|versus|as opposed to|instead of|only when|only in|not the same as)\b[^.;]{0,70}/g;
  var NUM = /\b\d+(?:[.,]\d+)?(?:\s?[–-]\s?\d+(?:[.,]\d+)?)?\s?(?:%|percent|days?|hours?|weeks?|months?|years?|mm ?Hg|mg\/dL|g\/dL|mEq\/L|mL|L\/min|bpm|fL|pg|µm|μm|cm|mm|kg|°C|°F)(?=\W|$)/g;
  var MAX_GOLD = 5, MAX_CYAN = 8;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Candidate gold phrases from a verbatim study-guide prompt: runs of non-generic words, then long single words. */
  function promptPhrases(text) {
    var out = [], toks = String(text).replace(/[“”"]/g, ' ').split(/[^A-Za-z0-9'’\-\/]+/).filter(Boolean), run = [];
    function flush() {
      if (!run.length) return;
      if (run.length > 1) out.push(run.slice(0, 4).join(' '));
      run.forEach(function (w) { if (w.length >= 6 && !GENERIC.test(w)) out.push(w); });
      run = [];
    }
    toks.forEach(function (t) { if (STOP.test(t) || t.length < 3) flush(); else run.push(t); });
    flush();
    var seen = {}; return out.filter(function (p) { var k = p.toLowerCase(); if (seen[k] || (p.indexOf(' ') < 0 && GENERIC.test(p))) return false; seen[k] = 1; return true; })
      .sort(function (a, b) { return b.length - a.length; });
  }

  function conceptPhrases(names) {
    var out = [];
    names.forEach(function (n) {
      String(n).split(/[:;,\/]| and | vs\.? | versus /i).forEach(function (p) {
        p = p.trim(); if (p.length >= 5 && !GENERIC.test(p) && (p.indexOf(' ') > 0 || p.length >= 8)) out.push(p);
      });
    });
    return out;
  }

  /* Mark one plain-text segment. ctx tracks per-card usage so each term is marked once per card. */
  function markText(text, ctx) {
    var cands = [], m, i;
    function add(start, end, cls, why) { cands.push({ s: start, e: end, c: cls, w: why }); }
    ctx.gold.forEach(function (g) {
      var key = g.p.toLowerCase(); if (ctx.used[key] || ctx.nGold >= MAX_GOLD) return;
      var re = new RegExp('(^|[^A-Za-z0-9])(' + reEsc(g.p) + ')(?![A-Za-z0-9])', 'i'); m = re.exec(text);
      if (m) add(m.index + m[1].length, m.index + m[1].length + m[2].length, 'gold', 'Study-guide prompt ' + g.n);
    });
    CUE.lastIndex = 0; while ((m = CUE.exec(text))) add(m.index, m.index + m[0].replace(/\s+$/, '').length, 'cyan', 'Distinction');
    NUM.lastIndex = 0; while ((m = NUM.exec(text))) add(m.index, m.index + m[0].length, 'cyan', 'Key number');
    var def = new RegExp('(^|[.;:]\\s+)((?:[A-Z][A-Za-z0-9\\-]*|type [IV0-9]+)(?: [A-Za-z0-9\\-]+){0,3}?) (?=' + DEF_VERB + '\\b)', 'g');
    while ((m = def.exec(text))) {
      var term = m[2]; if (term.split(' ').length > 4 || STOP.test(term.split(' ')[0]) && term.indexOf(' ') < 0) continue;
      add(m.index + m[1].length, m.index + m[1].length + term.length, 'cyan', 'Key term');
    }
    ctx.conc.forEach(function (p) {
      var key = p.toLowerCase(); if (ctx.used[key]) return;
      var re = new RegExp('(^|[^A-Za-z0-9])(' + reEsc(p) + ')(?![A-Za-z0-9])', 'i'); m = re.exec(text);
      if (m) add(m.index + m[1].length, m.index + m[1].length + m[2].length, 'cyan', 'Key term');
    });
    /* Resolve overlaps: gold wins, then longer; drop anything that would exceed caps. */
    cands.sort(function (a, b) { return (a.c === b.c ? 0 : a.c === 'gold' ? -1 : 1) || (b.e - b.s) - (a.e - a.s) || a.s - b.s; });
    var kept = [];
    cands.forEach(function (c) {
      if (c.e - c.s < 3) return;
      if (c.c === 'cyan' && ctx.nCyan >= MAX_CYAN) return;
      if (c.c === 'gold' && ctx.nGold >= MAX_GOLD) return;
      var key = text.slice(c.s, c.e).toLowerCase(); if (ctx.used[key]) return;
      for (i = 0; i < kept.length; i++) if (c.s < kept[i].e && c.e > kept[i].s) return;
      kept.push(c); ctx.used[key] = 1; if (c.c === 'gold') ctx.nGold++; else ctx.nCyan++;
    });
    kept.sort(function (a, b) { return a.s - b.s; });
    var out = '', pos = 0;
    kept.forEach(function (c) {
      out += esc(text.slice(pos, c.s)) + '<mark class="em em-' + c.c + '" data-why="' + esc(c.w) + '">' + esc(text.slice(c.s, c.e)) + '</mark>'; pos = c.e;
    });
    return out + esc(text.slice(pos));
  }

  /* Mark the text nodes of an HTML string (paragraphs only). Entities are decoded for matching and re-escaped on output. */
  function markHtml(html, ctx) {
    return html.replace(/(<[^>]+>)|([^<]+)/g, function (all, tag, txt) {
      if (tag) return tag;
      var dec = txt.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, function (a, h) { return String.fromCharCode(parseInt(h, 16)); }).replace(/&#(\d+);/g, function (a, d) { return String.fromCharCode(+d); });
      return markText(dec, ctx);
    });
  }

  function cardContext(card) {
    var L = root.L, prompts = {}, names = [];
    (card.c || []).forEach(function (id) {
      var c = L.CONCEPTS[id]; if (!c) return; names.push(c.name);
      (c.guidePrompts || []).forEach(function (n) { prompts[n] = 1; });
    });
    var gold = [];
    ((L.COVERAGE && L.COVERAGE.prompts) || []).forEach(function (p) {
      if (!prompts[p.studyGuidePrompt]) return;
      promptPhrases(p.promptVerbatim).forEach(function (ph) { gold.push({ p: ph, n: p.studyGuidePrompt }); });
    });
    gold.sort(function (a, b) { return b.p.length - a.p.length; });
    return { gold: gold, conc: conceptPhrases(names), used: {}, nGold: 0, nCyan: 0 };
  }

  function emphasizeCardHtml(card) {
    var ctx = cardContext(card);
    return card.html.replace(/<p>([\s\S]*?)<\/p>/g, function (all, inner) { return '<p>' + markHtml(inner, ctx) + '</p>'; });
  }

  function applyDom() {
    var L = root.L, doc = root.document; if (!L || !L.GUIDE || !doc) return;
    var lesson = doc.querySelector('main .lesson:not(.chapter-explainer)'); if (!lesson || lesson.getAttribute('data-em')) return;
    var cards = []; Object.keys(L.GUIDE).forEach(function (k) { (L.GUIDE[k] || []).forEach(function (c) { cards.push(c); }); });
    var touched = 0;
    lesson.querySelectorAll('article.card[id]').forEach(function (art) {
      var card = cards.filter(function (c) { return c.id === art.id; })[0]; if (!card || !card.html) return;
      var tmp = doc.createElement('div'); tmp.innerHTML = emphasizeCardHtml(card);
      var ps = art.querySelectorAll(':scope > p:not(.small):not(.scope-note)'), src = tmp.querySelectorAll(':scope > p:not(.small):not(.scope-note)');
      for (var i = 0; i < ps.length && i < src.length; i++) { if (src[i].querySelector('mark')) { ps[i].innerHTML = src[i].innerHTML; touched++; } }
    });
    lesson.setAttribute('data-em', '1');
    if (touched) {
      var key = doc.createElement('p'); key.className = 'em-key small';
      key.innerHTML = '<span class="em-swatch em-gold">Gold</span> wording from the instructor’s official study-guide prompts for that topic · <span class="em-swatch em-cyan">Cyan</span> key terms, numbers and distinctions. Selective aids, not exam predictions.';
      lesson.insertBefore(key, lesson.firstChild);
    }
  }

  root.GuideEmphasis = { promptPhrases: promptPhrases, emphasizeCardHtml: emphasizeCardHtml };
  if (root.document) {
    var main = root.document.getElementById('main');
    if (main && root.MutationObserver) { new root.MutationObserver(function () { applyDom(); }).observe(main, { childList: true }); }
    applyDom();
  }
})(typeof window !== 'undefined' ? window : globalThis);
