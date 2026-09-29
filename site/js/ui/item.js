/* Item renderer shared by practice, cases, boss and mock. Pure DOM, no frameworks. */
(function (root) {
  'use strict';
  var L = root.L = root.L || {};
  var U = L.util, esc = U.esc;
  var TIER = L.CONFIG.tierLabels || { 1: 'Current course', 2: 'Student report', 3: 'Prior course', 4: 'Design inference' };

  function srcChips(list) {
    return (list || []).map(function (c) { var s = L.SOURCES[L.srcBase(c)] || {}; return '<span class="src" title="' + esc(s.t || c) + '">' + esc(L.srcLabel(c)) + '</span>'; }).join('');
  }
  function tierBadge(t) { return t ? '<span class="badge tier' + t + '" title="Evidence tier ' + t + '">' + TIER[t] + '</span>' : ''; }

  function mediaHTML(m, opts) {
    if (!m) return '';
    opts = opts || {};
    if (m.kind === 'img') return '<div class="media"><img src="' + esc(m.src) + '" alt="' + esc(m.alt || '') + '" loading="lazy"></div>';
    if (L.MEDIA_RENDERERS && L.MEDIA_RENDERERS[m.kind]) return '<div class="media">' + L.MEDIA_RENDERERS[m.kind](m.spec, opts) + '</div>';
    return '';
  }
  function caseHeader(it) {
    if (!it.caseId) return '';
    var cs = L.CASES.filter(function (c) { return c.id === it.caseId; })[0]; if (!cs) return '';
    return '<div class="casebox"><div class="spread"><b>Case: ' + esc(cs.title) + '</b><span class="tiny muted">question ' + (it.caseIdx + 1) + ' of ' + cs.items.length + '</span></div>' + cs.stem +
      mediaHTML(cs.media) + (cs.extra ? mediaHTML(cs.extra) : '') + '</div>';
  }

  // order: array of original indexes for display (persisted by caller so review matches)
  function makeOrder(it) {
    if (!it.o) return null;
    var idx = it.o.map(function (_, i) { return i; });
    return it.fixedOrder ? idx : U.shuffle(idx);
  }

  /* render(host, it, cfg)
     cfg: {mode:'practice'|'mock'|'review', order, response (existing), onChange(resp), onSubmit(resp, conf), graded:{ok,sc}, locked, header, confidence:true} */
  function render(host, it, cfg) {
    cfg = cfg || {};
    var order = cfg.order || makeOrder(it);
    var state = { resp: cfg.response !== undefined ? U.clone(cfg.response) : undefined };
    var locked = !!cfg.locked, graded = cfg.graded;
    var h = [];
    h.push('<div class="item card">');
    h.push('<div class="qhead"><span>' + (cfg.header || '') + '</span><span>' + (it.boundary && locked ? '<span class="badge tier1">' + esc(it.boundaryLabel || 'Boundary value') + '</span> ' : '') + (cfg.mode !== 'mock' || locked ? tierBadge(it.tier) : '') + '</span></div>');
    h.push(caseHeader(it));
    h.push('<div class="prompt">' + it.q + '</div>');
    if (it.media) h.push(mediaHTML(it.media, { reveal: locked && it.reveal && cfg.mode !== 'mock-live' }));
    h.push('<div class="answer"></div>');
    h.push('<div class="actions"></div><div class="feedback"></div></div>');
    host.innerHTML = h.join('');
    var ans = host.querySelector('.answer'), act = host.querySelector('.actions'), fbEl = host.querySelector('.feedback');

    function changed() { if (cfg.onChange) cfg.onChange(state.resp); updateActions(); }
    function hasResp() {
      var r = state.resp;
      if (r === undefined || r === null || r === '') return false;
      if (it.t === 'ms') return r.length > 0;
      if (it.t === 'match' || it.t === 'parts') return r.every(function (x) { return x; });
      return true;
    }

    // ----- answer widgets -----
    if (it.t === 'mc' || it.t === 'tf' || it.t === 'ms') {
      var multi = it.t === 'ms';
      if (multi && !locked) ans.insertAdjacentHTML('beforeend', '<p class="small muted">Select all that apply.</p>');
      var wrap = U.el('div', { class: 'opts', role: multi ? 'group' : 'radiogroup' });
      order.forEach(function (oi, pos) {
        var o = it.o[oi];
        var b = U.el('button', { class: 'opt', type: 'button', 'data-oi': oi, 'aria-pressed': 'false' }, '<span class="k">' + (multi ? '&#9633;' : (pos + 1)) + '</span><span class="tx">' + esc(o.t) + '</span>');
        if (locked) b.setAttribute('disabled', 'disabled');
        b.addEventListener('click', function () {
          if (locked) return;
          if (multi) { var arr = (state.resp || []).slice(), at = arr.indexOf(oi); if (at >= 0) arr.splice(at, 1); else arr.push(oi); state.resp = arr; }
          else state.resp = oi;
          paintSel(); changed();
        });
        wrap.appendChild(b);
      });
      ans.appendChild(wrap);
      var paintSel = function () {
        wrap.querySelectorAll('.opt').forEach(function (b) {
          var oi = +b.getAttribute('data-oi'), on = multi ? (state.resp || []).indexOf(oi) >= 0 : state.resp === oi;
          b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
          if (multi) b.querySelector('.k').innerHTML = on ? '&#9635;' : '&#9633;';
        });
      };
      paintSel();
    } else if (it.t === 'num') {
      var inp = U.el('input', { type: 'number', step: 'any', inputmode: 'decimal', 'aria-label': 'Numeric answer' });
      if (state.resp !== undefined) inp.value = state.resp;
      if (locked) inp.disabled = true;
      inp.addEventListener('input', function () { state.resp = inp.value === '' ? undefined : inp.value; changed(); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && hasResp() && cfg.onSubmit && !locked && cfg.mode !== 'mock') { e.preventDefault(); submit('m'); } });
      var fr = U.el('div', { class: 'formrow' }); fr.appendChild(inp); fr.appendChild(U.el('span', { class: 'muted' }, esc(it.unit || '')));
      ans.appendChild(fr);
    } else if (it.t === 'match') {
      var rights = it._rightsOrder || U.shuffle(it.pairs.map(function (p) { return p[1]; }));
      it._rightsOrder = rights;
      if (!state.resp) state.resp = it.pairs.map(function () { return ''; });
      it.pairs.forEach(function (p, i) {
        var row = U.el('div', { class: 'formrow' });
        row.appendChild(U.el('label', { for: 'm' + i + '-' + it.id }, esc(p[0])));
        var sel = U.el('select', { id: 'm' + i + '-' + it.id });
        sel.appendChild(U.el('option', { value: '' }, 'Choose...'));
        rights.forEach(function (rt) { var op = U.el('option', { value: rt }, esc(rt)); if (state.resp[i] === rt) op.selected = true; sel.appendChild(op); });
        if (locked) sel.disabled = true;
        sel.addEventListener('change', function () { state.resp[i] = sel.value; changed(); });
        row.appendChild(sel); ans.appendChild(row);
      });
    } else if (it.t === 'parts') {
      if (!state.resp) state.resp = it.parts.map(function () { return ''; });
      it.parts.forEach(function (p, i) {
        var row = U.el('div', { class: 'formrow' });
        row.appendChild(U.el('label', { for: 'p' + i + '-' + it.id }, esc(p.label)));
        var sel = U.el('select', { id: 'p' + i + '-' + it.id });
        sel.appendChild(U.el('option', { value: '' }, 'Choose...'));
        p.options.forEach(function (op) { var o = U.el('option', { value: op }, esc(op)); if (state.resp[i] === op) o.selected = true; sel.appendChild(o); });
        if (locked) sel.disabled = true;
        sel.addEventListener('change', function () { state.resp[i] = sel.value; changed(); });
        row.appendChild(sel); ans.appendChild(row);
      });
    } else if (it.t === 'order') {
      if (!state.resp) state.resp = cfg.orderStart || shuffledNotIdentity(it.seq);
      var ol = U.el('ol', { class: 'orderlist' });
      var drawOrder = function () {
        ol.innerHTML = '';
        state.resp.forEach(function (txt, i) {
          var li = U.el('li');
          li.appendChild(U.el('b', null, String(i + 1)));
          li.appendChild(U.el('span', null, esc(txt)));
          if (!locked) {
            var up = U.el('button', { class: 'btn ghost', type: 'button', 'aria-label': 'Move up' }, '&#9650;'), dn = U.el('button', { class: 'btn ghost', type: 'button', 'aria-label': 'Move down' }, '&#9660;');
            up.disabled = i === 0; dn.disabled = i === state.resp.length - 1;
            up.onclick = function () { var a = state.resp; var t = a[i - 1]; a[i - 1] = a[i]; a[i] = t; drawOrder(); changed(); };
            dn.onclick = function () { var a = state.resp; var t = a[i + 1]; a[i + 1] = a[i]; a[i] = t; drawOrder(); changed(); };
            li.appendChild(up); li.appendChild(dn);
          }
          ol.appendChild(li);
        });
      };
      drawOrder(); ans.appendChild(ol);
      if (cfg.mode === 'mock' && !locked) { var sv = U.el('button', { class: 'btn', type: 'button', style: 'margin-top:8px' }, 'Save this order as my answer'); sv.onclick = function () { changed(); sv.textContent = 'Saved'; }; ans.appendChild(sv); }
    } else if (it.t === 'teach') {
      var ta = U.el('textarea', { 'aria-label': 'Your explanation', placeholder: 'Type your explanation, then reveal the model answer.' });
      ans.appendChild(ta);
    }

    function updateActions() {
      act.innerHTML = '';
      if (locked) return;
      if (it.t === 'teach') {
        var rv = U.el('button', { class: 'btn', type: 'button' }, 'Reveal model answer');
        rv.onclick = function () {
          fbEl.innerHTML = '<div class="fb"><div class="verdict">Model answer</div><p>' + esc(it.model || '') + '</p><div>' + srcChips(it.s) + '</div><p class="small muted">Teach-back is a self-check. It never counts toward mastery.</p></div>';
          var r2 = U.el('div', { class: 'row' });
          [['Nailed it', 'got'], ['Partly', 'part'], ['Missed it', 'miss']].forEach(function (x) {
            var b = U.el('button', { class: 'btn', type: 'button' }, x[0]); b.onclick = function () { if (cfg.onSubmit) cfg.onSubmit({ self: x[1] }, null); }; r2.appendChild(b);
          });
          fbEl.appendChild(r2); rv.remove();
        };
        act.appendChild(rv); return;
      }
      if (cfg.mode === 'mock') { return; }
      var box = U.el('div', { class: 'confrow' });
      box.appendChild(U.el('div', { class: 'lbl' }, 'Lock in your answer with a confidence level (chosen before you see feedback):'));
      var r = U.el('div', { class: 'row' });
      [['l', 'Low (guessing)'], ['m', 'Medium'], ['h', 'High (certain)']].forEach(function (c) {
        var b = U.el('button', { class: 'btn ' + (c[0] === 'h' ? 'pri' : ''), type: 'button', 'data-conf': c[0] }, 'Submit: ' + c[1]);
        b.disabled = !hasResp(); b.onclick = function () { submit(c[0]); }; r.appendChild(b);
      });
      box.appendChild(r);
      if (cfg.mode === 'mock-live') { act.appendChild(box); return; }
      var hb = U.el('button', { class: 'btn ghost', type: 'button', style: 'margin-top:8px' }, state.assisted ? 'Hint shown' : 'Hint (this attempt will not count toward mastery)');
      hb.disabled = !!state.assisted;
      hb.onclick = function () { state.assisted = true; var hbox = U.el('div', { class: 'small muted', style: 'margin-top:6px' }, 'Where to look: ' + srcChips(it.s)); box.appendChild(hbox); hb.textContent = 'Hint shown'; hb.disabled = true; };
      box.appendChild(hb);
      act.appendChild(box);
    }
    function submit(conf) { if (!hasResp() || locked) return; if (cfg.onSubmit) cfg.onSubmit(state.resp, conf, !!state.assisted); }
    updateActions();
    if (locked && graded) showFeedback(host, it, state.resp, graded, order);
    // keyboard shortcuts for single-choice
    host._keys = function (e) {
      if (locked || cfg.mode === 'mock' && false) return;
      if ((it.t === 'mc' || it.t === 'tf') && /^[1-9]$/.test(e.key)) { var pos = +e.key - 1; if (order[pos] !== undefined && !locked) { state.resp = order[pos]; ans.querySelectorAll('.opt').forEach(function (b, i) { b.classList.toggle('sel', i === pos); }); changed(); } }
    };
    return { order: order, getResp: function () { return state.resp; } };
  }
  function shuffledNotIdentity(seq) { var s; var n = 0; do { s = U.shuffle(seq); n++; } while (n < 10 && s.join('|') === seq.join('|')); return s; }

  function showFeedback(host, it, resp, g, order) {
    var fbEl = host.querySelector('.feedback'), h = [];
    // mark options
    if (it.o) host.querySelectorAll('.opt').forEach(function (b) {
      var oi = +b.getAttribute('data-oi'), o = it.o[oi], chosen = Array.isArray(resp) ? resp.indexOf(oi) >= 0 : resp === oi;
      if (o.ok) b.classList.add('right'); else if (chosen) b.classList.add('wrong');
      if (o.w) b.querySelector('.tx').insertAdjacentHTML('beforeend', '<span class="why">' + (o.ok ? '&#10003; ' : (chosen ? '&#10007; ' : '')) + esc(o.w) + '</span>');
      else if (o.ok) b.querySelector('.tx').insertAdjacentHTML('beforeend', '<span class="why">&#10003; Correct answer</span>');
    });
    if (it.media && it.reveal && L.MEDIA_RENDERERS && L.MEDIA_RENDERERS[it.media.kind]) { var md = host.querySelector('.media'); if (md) md.innerHTML = L.MEDIA_RENDERERS[it.media.kind](it.media.spec, { reveal: true }); }
    var ok = g.ok;
    h.push('<div class="fb ' + (ok ? 'ok' : 'no') + '"><div class="verdict">' + (g.blank ? 'Not answered' : ok ? 'Correct' : (g.sc > 0 ? 'Partly correct (' + Math.round(g.sc * 100) + '%)' : 'Incorrect')) + '</div>');
    if (it.t === 'num') h.push('<p>Key: <b>' + esc(it.a) + (it.unit ? ' ' + esc(it.unit) : '') + '</b>' + (it.tol ? ' (accepted +/-' + it.tol + ')' : '') + '. You entered: ' + esc(resp === undefined ? '-' : resp) + '.</p>');
    if (it.t === 'match') h.push('<table class="t small"><tr><th>Item</th><th>Your match</th><th>Correct</th></tr>' + it.pairs.map(function (p, i) { var r = resp && resp[i]; return '<tr><td>' + esc(p[0]) + '</td><td>' + (r === p[1] ? '&#10003; ' : '&#10007; ') + esc(r || '-') + '</td><td>' + esc(p[1]) + '</td></tr>'; }).join('') + '</table>');
    if (it.t === 'order') h.push('<p>Correct order:</p><ol>' + it.seq.map(function (s, i) { return '<li>' + (resp && resp[i] === s ? '&#10003; ' : '&#10007; ') + esc(s) + '</li>'; }).join('') + '</ol>');
    if (it.t === 'parts') h.push('<table class="t small"><tr><th>Part</th><th>You</th><th>Key</th><th>Why</th></tr>' + it.parts.map(function (p, i) { var r = resp && resp[i]; return '<tr><td>' + esc(p.label) + '</td><td>' + (r === p.a ? '&#10003; ' : '&#10007; ') + esc(r || '-') + '</td><td>' + esc(p.a) + '</td><td>' + esc(p.why || '') + '</td></tr>'; }).join('') + '</table>');
    if (it.explain || it.x) h.push('<p>' + esc(it.explain || it.x) + '</p>');
    if (L.SOURCE_HTML && L.SOURCE_HTML[it.c]) h.push('<details class="source-text"><summary>Direct source material: textbook text and charts</summary>' + L.SOURCE_HTML[it.c] + '</details>');
    h.push('<div>' + srcChips(it.s) + ' ' + tierBadge(it.tier) + '</div></div>');
    fbEl.innerHTML = h.join('');
  }

  L.itemUI = { render: render, showFeedback: showFeedback, mediaHTML: mediaHTML, srcChips: srcChips, tierBadge: tierBadge, makeOrder: makeOrder, TIER: TIER };
})(typeof window !== 'undefined' ? window : globalThis);
