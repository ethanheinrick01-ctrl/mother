/* Course-neutral Study Lab v2 router. Adapted from the COMD 4590 v2 design. */
(function (root) {
  'use strict';
  var L = root.L, U = L.util, E = L.engine, S = L.store, esc = U.esc, IU = L.itemUI;
  var main, CFG = L.CONFIG;
  var STATUS_LABEL = { mastered: 'Mastered', learning: 'Learning', shaky: 'Missed last time', misconception: 'High-confidence miss', new: 'Not started' };
  var WHY_LABEL = { misconception: 'High-confidence miss', mock: 'Missed on a mock', shaky: 'Missed last time', due: 'Due for spaced review', prior: 'Old-lab miss (prior signal)', new: 'Not started' };

  function $(s, r) { return (r || document).querySelector(s); }
  function toast(msg) { var t = U.el('div', { class: 'toast', role: 'status' }, esc(msg)); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200); }
  function setNav(route) { document.querySelectorAll('nav.main a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === route); }); }
  function secById(id) { return L.SECTIONS.filter(function (s) { return s.id === id; })[0]; }
  function daysToExam() { return CFG.examDate ? U.daysBetween(U.todayKey(), CFG.examDate) : null; }
  function storageBanner() { return S.ok() ? '' : '<div class="warnbox"><b>Browser storage is blocked.</b> You can study, but progress will not survive a reload. Use Data &gt; Export before closing.</div>'; }

  // ---------------- Router ----------------
  function route() {
    var h = (location.hash || '#home').slice(1).split('/'), r = h[0] || 'home';
    setNav(r);
    document.onkeydown = null;
    main.innerHTML = '';
    window.scrollTo(0, 0);
    var pages = { home: pHome, guide: pGuide, practice: pPractice, session: pSession, review: pReview, cases: pCases, boss: pBoss, mock: pMock, progress: pProgress, data: pData, sources: pSources, evidence: pEvidence };
    (pages[r] || pHome)(h.slice(1));
    main.focus({ preventScroll: true });
  }
  function go(h) { if (location.hash === '#' + h) route(); else location.hash = h; }

  // ---------------- Home ----------------
  function pHome() {
    var st = E.conceptStats(), s = S.load(), ids = Object.keys(st).filter(E.hasPracticeContent);
    var mastered = ids.filter(function (c) { return st[c].status === 'mastered'; }).length;
    var mis = ids.filter(function (c) { return st[c].status === 'misconception'; }).length;
    var plan = E.reviewPlan(), due = plan.filter(function (p) { return p.why !== 'new'; }).length;
    var lastMock = s.mocks[s.mocks.length - 1], sess = s.session, d = daysToExam();
    var h = [storageBanner()];
    h.push('<div class="spread"><div><h1>' + esc(CFG.title) + '</h1><p class="muted">' + esc(CFG.subtitle) + (d !== null && d >= 0 ? ' · <b>' + d + ' day' + (d === 1 ? '' : 's') + '</b> to the scheduled exam.' : '') + '</p></div></div>');
    h.push('<div class="lich">' + esc(CFG.callout || 'Study from verified course sources. Practice, review, and test your understanding.') + '</div>');
    h.push('<div class="grid g4">');
    h.push('<div class="tile"><b>' + mastered + '/' + ids.length + '</b><span>concepts mastered (honest rule)</span></div>');
    h.push('<div class="tile"><b>' + due + '</b><span>concepts queued for review</span></div>');
    h.push('<div class="tile"><b>' + mis + '</b><span>high-confidence misses open</span></div>');
    h.push('<div class="tile"><b>' + (lastMock ? U.pct(lastMock.score, lastMock.total) + '%' : '-') + '</b><span>' + (lastMock ? 'last mock (' + lastMock.total + ' items)' : 'no mock yet') + '</span></div>');
    h.push('</div>');
    h.push('<div class="row" style="margin:14px 0">');
    if (sess) h.push('<a class="btn good" href="#session">Resume: ' + esc(sess.title) + ' (' + Math.min(sess.idx + 1, sess.queue.length) + '/' + sess.queue.length + ')</a>');
    if (s.mockActive) h.push('<a class="btn warn" href="#mock/take">Resume mock in progress</a>');
    h.push('<button class="btn pri" id="goReview">Smart review (' + Math.min(15, plan.length) + ')</button><a class="btn" href="#mock">Mock exam</a><a class="btn" href="#boss">Boss drills</a><a class="btn" href="#guide">Study guide</a></div>');
    if (!L.SECTIONS.length) h.push('<div class="card"><h2>Needs evidence</h2><p>Course sources, teaching cards, and questions must be audited before this exam becomes live.</p></div>');
    h.push('<h2>Sections</h2><div class="grid g3">');
    L.SECTIONS.forEach(function (sec) {
      var cs = Object.keys(L.CONCEPTS).filter(function (c) { return L.CONCEPTS[c].sec === sec.id && E.hasPracticeContent(c); });
      var m = cs.filter(function (c) { return st[c].status === 'mastered'; }).length;
      h.push('<div class="card flat"><div class="spread"><b>' + sec.n + '. ' + esc(sec.title) + '</b><span class="badge">' + m + '/' + cs.length + '</span></div><p class="small muted">' + esc(sec.src) + '</p><div class="progress"><i style="width:' + U.pct(m, cs.length) + '%"></i></div><div class="row"><a class="btn" href="#guide/' + sec.id + '">Study</a><button class="btn" data-prac="' + sec.id + '">Practice</button></div></div>');
    });
    h.push('</div>');
    if (s.legacy) h.push('<p class="small muted" style="margin-top:14px">Imported old-lab progress (' + esc(s.legacy.sources.join('; ')) + ') is used only to push previously missed topics up the review queue. It never counts as v2 mastery.</p>');
    main.innerHTML = h.join('');
    $('#goReview').onclick = startReview;
    main.querySelectorAll('[data-prac]').forEach(function (b) { b.onclick = function () { startPractice({ sec: b.getAttribute('data-prac'), n: 12 }, 'Practice: ' + secById(b.getAttribute('data-prac')).title); }; });
  }

  // ---------------- Guide ----------------
  function pGuide(args) {
    var id = args[0];
    if (!id) {
      var h = ['<h1>Study guide</h1><p class="muted">Every card cites its source. Evidence tiers distinguish current course teaching, student reports, prior course history, and design inference. Source conflicts are flagged and contested claims are not scored.</p><div class="grid g3">'];
      L.SECTIONS.forEach(function (s) { h.push('<a class="card flat" style="text-decoration:none;color:inherit" href="#guide/' + s.id + '"><b>' + s.n + '. ' + esc(s.title) + '</b><p class="small muted">' + esc(s.src) + '</p></a>'); });
      h.push('<a class="card flat" style="text-decoration:none;color:inherit" href="#evidence"><b>Evidence and exam style</b><p class="small muted">Instructor statements, student reports, history, and design choices are kept separate.</p></a></div>');
      main.innerHTML = h.join(''); return;
    }
    var sec = secById(id); if (!sec) return go('guide');
    var cards = L.GUIDE[id] || [], s = S.load();
    var hh = ['<div class="guide"><div class="spread"><h1>' + sec.n + '. ' + esc(sec.title) + '</h1><div class="row"><button class="btn pri" id="pracSec">Practice this section</button></div></div><p class="muted">' + esc(sec.src) + '</p>'];
    cards.forEach(function (c) {
      hh.push('<div class="card" id="' + c.id + '"><div class="spread"><h3 style="margin:0">' + esc(c.h) + '</h3><span>' + IU.tierBadge(c.tier) + '</span></div>' + c.html);
      if (c.traps && c.traps.length) hh.push('<div class="traps"><b>Tempting mistakes</b><ul>' + c.traps.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>');
      if (c.conflict) hh.push('<div class="conflict"><b>Flagged in the sources</b><br>' + c.conflict + '</div>');
      hh.push('<div class="spread" style="margin-top:8px"><div>' + IU.srcChips(c.src) + '</div>' + (c.c && c.c.length ? '<button class="btn" data-cc="' + c.c.join(',') + '">Practice these</button>' : '') + '</div></div>');
    });
    hh.push('</div>');
    main.innerHTML = hh.join('');
    cards.forEach(function (c) { s.guideRead[c.id] = s.guideRead[c.id] || Date.now(); }); S.save();
    $('#pracSec').onclick = function () { startPractice({ sec: id, n: 12 }, 'Practice: ' + sec.title); };
    main.querySelectorAll('[data-cc]').forEach(function (b) { b.onclick = function () { var cs = b.getAttribute('data-cc').split(',').filter(E.hasPracticeContent); if (!cs.length) return toast('No practice items for this card.'); startPractice({ concepts: cs, n: Math.min(10, cs.length * 3) }, 'Practice: ' + b.closest('.card').querySelector('h3').textContent); }; });
  }

  // ---------------- Practice setup ----------------
  function pPractice() {
    var st = E.conceptStats();
    var h = ['<h1>Practice</h1><p class="muted">Wrong answers come back after two other questions; low-confidence correct answers come back after four. Generated items use fresh numbers every time.</p>'];
    h.push('<div class="card"><h3>Quick start</h3><div class="row"><button class="btn pri" id="mixedStart">Mixed practice (20)</button></div></div>');
    h.push('<div class="card"><h3>Build your own</h3><div class="formrow"><label for="nq">Number of questions</label><select id="nq"><option>10</option><option selected>15</option><option>20</option><option>30</option></select></div>');
    h.push('<div class="formrow"><label>Include held-back mock items</label><label style="min-width:0"><input type="checkbox" id="inclHeld"' + (S.load().settings.includeHeld ? ' checked' : '') + '> Yes (makes mocks less fresh)</label></div>');
    L.SECTIONS.forEach(function (sec) {
      var cs = Object.keys(L.CONCEPTS).filter(function (c) { return L.CONCEPTS[c].sec === sec.id && E.hasPracticeContent(c); });
      h.push('<details><summary>' + sec.n + '. ' + esc(sec.title) + ' <span class="muted small">(' + cs.length + ' concepts)</span></summary><div class="grid g2" style="margin:8px 0">');
      cs.forEach(function (c) { h.push('<label class="small"><input type="checkbox" class="cc" value="' + c + '"> ' + esc(L.CONCEPTS[c].name) + ' <span class="badge st-' + st[c].status + '">' + STATUS_LABEL[st[c].status] + '</span></label>'); });
      h.push('</div></details>');
    });
    h.push('<div class="row" style="margin-top:10px"><button class="btn pri" id="goCustom">Start with selected concepts</button></div></div>');
    main.innerHTML = h.join('');
    $('#inclHeld').onchange = function () { S.load().settings.includeHeld = this.checked; S.save(); };
    $('#mixedStart').onclick = function () { startPractice({ n: 20 }, 'Mixed practice'); };
    $('#goCustom').onclick = function () {
      var cs = [].slice.call(main.querySelectorAll('.cc:checked')).map(function (x) { return x.value; });
      if (!cs.length) return toast('Pick at least one concept.');
      startPractice({ concepts: cs, n: +$('#nq').value }, 'Custom practice');
    };
  }
  function startPractice(opt, title) {
    var refs = E.practiceRefs(opt);
    if (!refs.length) return toast('Nothing to practice here yet.');
    E.newSession('practice', title, refs); go('session');
  }
  function startReview() {
    var refs = E.reviewRefs(15); if (!refs.length) return toast('Review queue is empty.');
    E.newSession('review', 'Smart review', refs); go('session');
  }

  // ---------------- Session runner (practice, review, case, boss) ----------------
  function pSession() {
    var sess = E.currentSession();
    if (!sess) { main.innerHTML = '<div class="card"><p>No active session.</p><a class="btn pri" href="#practice">Start practicing</a></div>'; return; }
    if (sess.idx >= sess.queue.length) return sessionSummary(sess);
    var q = sess.queue[sess.idx], it = E.resolve(q.ref), key = E.refKey(q.ref);
    if (!it) { E.advance(); return pSession(); }
    var done = sess.results.length, firsts = sess.results.filter(function (r) { return !r.retry; });
    var h = ['<div class="item"><div class="spread"><div><b>' + esc(sess.title) + '</b> <span class="muted small">' + (sess.idx + 1) + ' of ' + sess.queue.length + (sess.retries ? ' (incl. ' + sess.retries + ' retries)' : '') + '</span></div><div class="row"><span class="small muted">' + firsts.filter(function (r) { return r.ok; }).length + '/' + firsts.length + ' first-try</span><button class="btn ghost" id="endS">End</button></div></div>'];
    h.push('<div class="progress"><i style="width:' + U.pct(sess.idx, sess.queue.length) + '%"></i></div></div><div id="host"></div><div class="item row" id="nextRow" style="margin-top:10px"></div>');
    main.innerHTML = h.join('');
    var host = $('#host');
    if (!sess.orders[key + ':' + sess.idx]) { sess.orders[key + ':' + sess.idx] = IU.makeOrder(it); S.save(); }
    var order = sess.orders[key + ':' + sess.idx];
    var secName = (secById(it.sec) || {}).short || '';
    var header = (q.retry ? '<span class="badge tier3">retry</span> ' : '') + esc(secName);
    var headerAfter = (q.retry ? '<span class="badge tier3">retry</span> ' : '') + esc(secName) + ' &middot; ' + esc((L.CONCEPTS[it.c] || {}).name || '');
    var ui = IU.render(host, it, {
      mode: 'practice', order: order, header: header,
      onSubmit: function (resp, conf, assisted) {
        var res = E.answerInSession(resp, conf, assisted);
        if (it.t === 'teach') { E.advance(); return pSession(); }
        IU.render(host, it, { mode: 'practice', order: order, header: headerAfter, response: resp, locked: true, graded: res.grade });
        var nr = $('#nextRow'); nr.innerHTML = '';
        var nb = U.el('button', { class: 'btn pri', id: 'nextBtn' }, 'Next &#8594;'); nb.onclick = function () { E.advance(); pSession(); }; nr.appendChild(nb);
        nr.appendChild(U.el('span', { class: 'small muted' }, 'Press <kbd>Enter</kbd> for next'));
        document.onkeydown = function (e) { if (e.key === 'Enter' && !/INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY|A/.test(e.target.tagName)) { e.preventDefault(); nb.click(); } };
        nb.focus();
      }
    });
    document.onkeydown = function (e) { if (host._keys && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) host._keys(e); };
    $('#endS').onclick = function () { if (confirm('End this session? Answers so far are already saved.')) { var s2 = E.endSession(); if (s2 && s2.mode === 'boss') E.finishBoss(s2); sessionSummary(s2, true); } };
  }
  function sessionSummary(sess, ended) {
    if (!ended) { E.endSession(); }
    var first = sess.results.filter(function (r) { return !r.retry && r.t !== 'teach'; });
    var assigned = sess.queue.filter(function (q) { var it = E.resolve(q.ref); return !q.retry && it && it.t !== 'teach'; }).length;
    var ok = first.filter(function (r) { return r.ok; }).length;
    var missed = U.uniq(sess.results.filter(function (r) { return !r.ok && r.t !== 'teach'; }).map(function (r) { return r.c; }));
    var hiMiss = sess.results.filter(function (r) { return !r.ok && r.cf === 'h'; }).length;
    var h = ['<div class="item card"><h1>' + esc(sess.title) + ': done</h1>'];
    if (sess.mode === 'boss') {
      var b = L.BOSSES.filter(function (x) { return x.id === sess.bossId; })[0];
      var sc = first.length ? ok / first.length : 0, pass = b ? b.pass : 0.8;
      if (!ended) E.finishBoss(sess);
      var complete = assigned > 0 && first.length === assigned;
      h.push('<p style="font-size:1.2rem"><b>' + ok + '/' + assigned + '</b> first-try (' + first.length + ' answered). ' + (!complete ? '<span class="badge st-shaky">Incomplete run: no pass or best score</span>' : sc >= pass ? '<span class="badge st-mastered">Boss defeated</span>' : '<span class="badge st-shaky">Boss survives (needs ' + Math.round(pass * 100) + '%)</span>') + '</p>');
    } else h.push('<p style="font-size:1.2rem"><b>' + ok + '/' + first.length + '</b> correct on the first try; ' + sess.retries + ' retries.</p>');
    if (hiMiss) h.push('<p class="muted">' + hiMiss + ' high-confidence miss' + (hiMiss > 1 ? 'es' : '') + ': those concepts stay flagged until you get them right twice.</p>');
    if (missed.length) h.push('<h3>Concepts to revisit</h3><ul>' + missed.map(function (c) { var sec = L.CONCEPTS[c] && L.CONCEPTS[c].sec; return '<li>' + esc((L.CONCEPTS[c] || {}).name || c) + ' <a href="#guide/' + sec + '">guide</a></li>'; }).join('') + '</ul>');
    h.push('<div class="row">' + (missed.length ? '<button class="btn pri" id="drillMiss">Drill these now</button>' : '') + '<button class="btn" id="goRev">Smart review</button><a class="btn" href="#home">Home</a></div></div>');
    main.innerHTML = h.join('');
    if ($('#drillMiss')) $('#drillMiss').onclick = function () { startPractice({ concepts: missed.filter(E.hasPracticeContent), n: Math.max(6, missed.length * 2) }, 'Drill: missed concepts'); };
    $('#goRev').onclick = startReview;
  }

  // ---------------- Review ----------------
  function pReview() {
    var plan = E.reviewPlan(), h = ['<h1>Smart review</h1><p class="muted">Order: high-confidence misses, then mock misses, then last-time misses, then spaced reviews (1, 2, 4, 7 days), then old-lab misses, then untouched concepts.</p>'];
    h.push('<div class="row" style="margin-bottom:12px"><button class="btn pri" id="goR">Start review (15)</button></div>');
    if (!plan.length) h.push('<p>Nothing is queued yet.</p>');
    else h.push('<table class="stat"><tr><th>Concept</th><th>Section</th><th>Why</th><th>Attempts</th></tr>' + plan.slice(0, 60).map(function (p) { var sec = secById(L.CONCEPTS[p.c].sec); return '<tr><td>' + esc(L.CONCEPTS[p.c].name) + '</td><td class="small">' + sec.n + '. ' + esc(sec.short) + '</td><td><span class="badge ' + (p.why === 'misconception' ? 'st-misconception' : p.why === 'mock' || p.why === 'shaky' ? 'st-shaky' : '') + '">' + WHY_LABEL[p.why] + '</span></td><td>' + p.s.att + '</td></tr>'; }).join('') + '</table>');
    main.innerHTML = h.join('');
    $('#goR').onclick = startReview;
  }

  // ---------------- Cases ----------------
  function pCases() {
    var h = ['<h1>Case blocks</h1><p class="muted">History, data, then linked questions in reading order. Built from lecture content; not claimed to be real exam cases.</p><div class="grid g2">'];
    if (!L.CASES.length) h.push('<p>No source-backed case blocks have been added for this exam.</p>');
    L.CASES.forEach(function (cs) {
      h.push('<div class="card flat"><b>' + esc(cs.title) + '</b><p class="small muted">' + cs.items.length + ' questions; ' + esc((L.DOMAINS[cs.dom] || {}).name || cs.dom) + '</p><div>' + IU.srcChips(cs.src) + '</div><div class="row" style="margin-top:8px"><button class="btn pri" data-case="' + cs.id + '">Work the case</button></div></div>');
    });
    h.push('</div>'); main.innerHTML = h.join('');
    main.querySelectorAll('[data-case]').forEach(function (b) { b.onclick = function () { var cs = L.CASES.filter(function (c) { return c.id === b.getAttribute('data-case'); })[0]; E.newSession('case', 'Case: ' + cs.title, E.caseRefs(cs.id), { noRetry: true, caseId: cs.id }); go('session'); }; });
  }

  // ---------------- Boss ----------------
  function pBoss() {
    var s = S.load(), h = ['<h1>Boss drills</h1><p class="muted">Long integration runs (25+ questions). Feedback after each question, no retries inside the run, pass mark shown. Scores count toward concept mastery.</p><div class="grid g2">'];
    if (!L.BOSSES.length) h.push('<p>Boss drills need source-audited integration questions.</p>');
    L.BOSSES.forEach(function (b) {
      var rec = s.boss[b.id], n = E.bossRefs(b.id).length;
      h.push('<div class="card flat"><div class="spread"><b>' + esc(b.title) + '</b><span class="badge">' + n + ' Qs</span></div><p class="small muted">' + esc(b.blurb) + '</p><p class="small">Pass: ' + Math.round(b.pass * 100) + '%. Best: ' + (rec && rec.best !== null ? Math.round(rec.best * 100) + '% over ' + rec.runs.length + ' run' + (rec.runs.length > 1 ? 's' : '') : 'no completed run') + '</p><button class="btn pri" data-boss="' + b.id + '">Fight</button></div>');
    });
    h.push('</div>'); main.innerHTML = h.join('');
    main.querySelectorAll('[data-boss]').forEach(function (btn) { btn.onclick = function () { var b = L.BOSSES.filter(function (x) { return x.id === btn.getAttribute('data-boss'); })[0]; E.newSession('boss', 'Boss: ' + b.title, E.bossRefs(b.id), { noRetry: true, bossId: b.id }); go('session'); }; });
  }

  // ---------------- Mock ----------------
  function pMock(args) {
    var s = S.load();
    if (args[0] === 'take' && s.mockActive) return mockTake();
    if (args[0] === 'result') return mockResult(args[1]);
    var h = ['<h1>Mock exam</h1>'];
    h.push('<div class="card"><p>Lock each answer with Low, Medium, or High confidence. You then see the correction and exact Bates source immediately. Your first response stays scored and feeds topic mastery. Unchecked questions count as wrong when you end the mock.</p>');
    h.push('<p class="small muted">' + esc(CFG.mockRationale || 'Mock length and domain mix are documented design choices based on the course evidence, not predictions of the real paper.') + '</p>');
    if (s.mockActive) h.push('<div class="row"><a class="btn warn" href="#mock/take">Resume mock in progress (' + Object.keys(s.mockActive.checked || {}).length + '/' + s.mockActive.refs.length + ' checked)</a><button class="btn bad" id="abandon">Abandon it</button></div>');
    else if (Object.keys(L.MOCK_FORMS||{}).length) h.push('<div class="row">' + Object.keys(L.MOCK_FORMS).map(function (id) { return '<button class="btn pri" data-form="' + esc(id) + '">Start Mock ' + esc(id) + ' (75 questions)</button>'; }).join('') + '</div>');
    else if (Object.keys(L.MOCK_BLUEPRINTS).length) h.push('<div class="row">' + Object.keys(L.MOCK_BLUEPRINTS).map(function (n) { return '<button class="btn pri" data-size="' + n + '">Start ' + n + '-question mock</button>'; }).join('') + '</div>');
    else h.push('<p>No mock blueprint is live until course scope and item coverage are verified.</p>');
    h.push('</div>');
    if (s.mocks.length) {
      h.push('<h2>History</h2><table class="stat"><tr><th>Date</th><th>Score</th>' + Object.keys(L.DOMAINS).map(function (d) { return '<th>' + esc(L.DOMAINS[d].name) + '</th>'; }).join('') + '<th></th></tr>');
      s.mocks.slice().reverse().forEach(function (m) {
        h.push('<tr><td>' + new Date(m.ts).toLocaleString() + '</td><td><b>' + m.score + '/' + m.total + '</b> (' + U.pct(m.score, m.total) + '%)</td>' + Object.keys(L.DOMAINS).map(function (d) { var x = m.byDom[d]; return '<td>' + (x ? x.ok + '/' + x.n : '-') + '</td>'; }).join('') + '<td><a href="#mock/result/' + m.id + '">Review</a></td></tr>');
      });
      h.push('</table>');
    }
    main.innerHTML = h.join('');
    main.querySelectorAll('[data-size]').forEach(function (b) { b.onclick = function () { try { if (E.buildMock(+b.getAttribute('data-size'))) go('mock/take'); } catch (e) { toast(e.message); } }; });
    main.querySelectorAll('[data-form]').forEach(function (b) { b.onclick = function () { try { if (E.buildMock(b.getAttribute('data-form'))) go('mock/take'); } catch (e) { toast(e.message); } }; });
    if ($('#abandon')) $('#abandon').onclick = function () { if (confirm('Abandon this mock? Nothing will be recorded.')) { S.load().mockActive = null; S.save(); route(); } };
  }
  function mockTake() {
    var s = S.load(), m = s.mockActive;
    m.checked = m.checked || {};
    var i = m.cur, ref = m.refs[i], it = E.resolve(ref), check = m.checked[i];
    if (!m.orders[i]) { m.orders[i] = IU.makeOrder(it); S.save(); }
    var answered = Object.keys(m.checked).length;
    var h = ['<div class="item"><div class="spread"><b>Mock ' + esc(m.formId||'exam') + ' (' + m.refs.length + ')</b><span class="small muted">' + answered + ' answered; ' + Object.keys(m.flags).filter(function (k) { return m.flags[k]; }).length + ' flagged; started ' + new Date(m.started).toLocaleTimeString() + '</span></div>'];
    h.push('<div class="navgrid" id="ng"></div></div><div id="host"></div>');
    h.push('<div class="item spread" style="margin-top:10px"><div class="row"><button class="btn" id="prev">&#8592; Prev</button><button class="btn" id="next">Next &#8594;</button><button class="btn warn" id="flag">' + (m.flags[i] ? 'Unflag' : 'Flag') + '</button><button class="btn ghost" id="clear">Clear answer</button></div><button class="btn good" id="submit">Submit exam</button></div>');
    main.innerHTML = h.join('');
    var ng = $('#ng');
    m.refs.forEach(function (_, k) {
      var b = U.el('button', { type: 'button', class: (m.checked[k] ? 'ans ' : '') + (k === i ? 'cur ' : '') + (m.flags[k] ? 'flag' : ''), 'aria-label': 'Question ' + (k + 1) }, String(k + 1));
      b.onclick = function () { m.cur = k; S.save(); mockTake(); }; ng.appendChild(b);
    });
    IU.render($('#host'), it, { mode: 'mock-live', order: m.orders[i], header: 'Question ' + (i + 1) + ' of ' + m.refs.length, response: check ? check.r : m.answers[i], locked: !!check, graded: check && check.grade,
      onChange: function (r) { if (m.checked[i]) return; var empty = r === undefined || r === '' || (Array.isArray(r) && (!r.length || (it.t !== 'order' && r.every(function (x) { return x === ''; })))); if (empty) delete m.answers[i]; else m.answers[i] = r; S.save(); },
      onSubmit: function (r, conf) { if (m.checked[i]) return; var g=E.record(it,ref,r,conf,'mock',false); m.answers[i]=r; m.checked[i]={r:r,cf:conf,grade:g,ts:Date.now()}; S.save(); mockTake(); } });
    $('#prev').disabled = i === 0; $('#next').disabled = i === m.refs.length - 1;
    $('#prev').onclick = function () { m.cur = i - 1; S.save(); mockTake(); };
    $('#next').onclick = function () { m.cur = i + 1; S.save(); mockTake(); };
    $('#flag').onclick = function () { m.flags[i] = !m.flags[i]; S.save(); mockTake(); };
    $('#clear').disabled = !!check;
    $('#clear').onclick = function () { if (m.checked[i]) return; delete m.answers[i]; S.save(); mockTake(); };
    $('#submit').onclick = function () {
      var un = m.refs.length - Object.keys(m.checked).length;
      if (!confirm(un ? un + ' question(s) unchecked will count as wrong. End this mock now?' : 'End the mock and see results?')) return;
      var rec = E.submitMock(); go('mock/result/' + rec.id);
    };
  }
  function mockResult(id) {
    var s = S.load(), m = s.mocks.filter(function (x) { return x.id === id; })[0];
    if (!m) return go('mock');
    var h = ['<div class="item"><h1>Mock results: ' + m.score + '/' + m.total + ' (' + U.pct(m.score, m.total) + '%)</h1><p class="muted">' + new Date(m.ts).toLocaleString() + '; ' + Math.round((m.ts - m.started) / 60000) + ' min. This score describes this practice set only; it is not a forecast of the real exam.</p>'];
    h.push('<div class="card"><h3>By domain</h3><div class="bars">' + Object.keys(L.DOMAINS).map(function (k) { var x = m.byDom[k] || { ok: 0, n: 0 }; return '<div class="barrow"><span>' + esc(L.DOMAINS[k].name) + '</span><div class="b"><i style="width:' + U.pct(x.ok, x.n) + '%"></i></div><span>' + x.ok + '/' + x.n + '</span></div>'; }).join('') + '</div></div>');
    var weak = Object.keys(m.byCon).filter(function (c) { return m.byCon[c].ok < m.byCon[c].n; });
    h.push('<div class="card"><h3>Remediation</h3>' + (weak.length ? '<p>Missed concepts (' + weak.length + '): ' + weak.map(function (c) { return esc((L.CONCEPTS[c] || {}).name || c); }).join('; ') + '.</p><div class="row"><button class="btn pri" id="remed">Drill missed concepts</button><a class="btn" href="#review">See review queue</a></div>' : '<p>No missed concepts in this set.</p>') + '</div>');
    h.push('<h2>Question review</h2><div class="navgrid" id="rg"></div><div id="rhost"></div></div>');
    main.innerHTML = h.join('');
    if ($('#remed')) $('#remed').onclick = function () { startPractice({ concepts: weak.filter(E.hasPracticeContent), n: Math.min(30, Math.max(10, weak.length * 2)) }, 'Mock remediation'); };
    var rg = $('#rg'), rhost = $('#rhost');
    function show(k) {
      var x = m.items[k], it = E.resolve(x.ref);
      [].forEach.call(rg.children, function (b, j) { b.classList.toggle('cur', j === k); });
      IU.render(rhost, it, { mode: 'review', order: m.orders[k], header: 'Question ' + (k + 1) + (m.flags[k] ? ' (flagged)' : ''), response: x.r === null ? undefined : x.r, locked: true, graded: { ok: x.ok, sc: x.sc, blank: x.blank } });
    }
    m.items.forEach(function (x, k) { var b = U.el('button', { type: 'button', class: x.ok ? 'r-ok' : 'r-no' }, String(k + 1)); b.onclick = function () { show(k); }; rg.appendChild(b); });
    var firstMiss = m.items.findIndex(function (x) { return !x.ok; }); show(firstMiss >= 0 ? firstMiss : 0);
  }

  // ---------------- Progress ----------------
  function pProgress() {
    var st = E.conceptStats(), s = S.load();
    var h = ['<h1>Progress</h1><p class="muted">Mastery requires two consecutive correct, unhinted answers on distinct questions, with medium or high confidence on the second. Checked mock answers count. A later miss remains in Review.</p>'];
    // calibration
    var cal = { l: [0, 0], m: [0, 0], h: [0, 0] };
    s.attempts.forEach(function (a) { if (a.m !== 'mock' && cal[a.cf]) { cal[a.cf][1]++; if (a.ok) cal[a.cf][0]++; } });
    h.push('<div class="card"><h3>Confidence calibration</h3><div class="bars">' + [['l', 'Low'], ['m', 'Medium'], ['h', 'High']].map(function (x) { var c = cal[x[0]]; return '<div class="barrow"><span>' + x[1] + ' confidence</span><div class="b"><i style="width:' + U.pct(c[0], c[1]) + '%"></i></div><span>' + (c[1] ? U.pct(c[0], c[1]) + '% (' + c[1] + ')' : '-') + '</span></div>'; }).join('') + '</div><p class="small muted">Well calibrated = high-confidence accuracy near 100%. A high-confidence miss is a misconception: dangerous on an exam because you will not second-guess it.</p></div>');
    L.SECTIONS.forEach(function (sec) {
      var cs = Object.keys(L.CONCEPTS).filter(function (c) { return L.CONCEPTS[c].sec === sec.id && E.hasPracticeContent(c); });
      h.push('<h2>' + sec.n + '. ' + esc(sec.title) + '</h2><table class="stat"><tr><th>Concept</th><th>Status</th><th>Accuracy</th><th>Next review</th></tr>');
      cs.forEach(function (c) { var x = st[c]; h.push('<tr><td>' + esc(L.CONCEPTS[c].name) + (x.prior ? ' <span class="badge" title="Old lab: ' + x.prior.miss + ' misses in ' + x.prior.att + ' attempts">old-lab miss</span>' : '') + (x.mockMiss ? ' <span class="badge st-shaky">mock miss</span>' : '') + '</td><td><span class="badge st-' + x.status + '">' + STATUS_LABEL[x.status] + '</span></td><td>' + (x.att ? x.ok + '/' + x.att : '-') + '</td><td class="small">' + (x.att ? x.due : '-') + '</td></tr>'); });
      h.push('</table>');
    });
    var bk = Object.keys(s.boss);
    if (bk.length) { h.push('<h2>Boss history</h2><table class="stat"><tr><th>Boss</th><th>Best</th><th>Runs</th></tr>'); bk.forEach(function (k) { var b = L.BOSSES.filter(function (x) { return x.id === k; })[0]; h.push('<tr><td>' + esc(b ? b.title : k) + '</td><td>' + (s.boss[k].best === null ? '-' : Math.round(s.boss[k].best * 100) + '%') + '</td><td>' + s.boss[k].runs.map(function (r) { return r.score + '/' + r.total + (r.complete ? '' : ' incomplete'); }).join(', ') + '</td></tr>'); }); h.push('</table>'); }
    main.innerHTML = h.join('');
  }

  // ---------------- Data ----------------
  function pData() {
    var s = S.load();
    var h = ['<h1>Data: export, import, reset</h1>', storageBanner()];
    h.push('<div class="card"><h3>Export</h3><p>Downloads everything (attempts, mocks, boss runs, imported prior signal) as JSON. Progress lives in this browser at this address only: a copy opened from a different folder or site has separate storage, so export/import is how you move it.</p><div class="row"><button class="btn pri" id="exp">Download progress file</button><button class="btn" id="expCopy">Copy to clipboard</button></div></div>');
    h.push('<div class="card"><h3>Import</h3><p>Accepts an export from this course and exam. A course-specific legacy importer can bring old misses in as review signals; old mastery is never silently granted.</p><div class="formrow"><input type="file" id="file" accept=".json,application/json"></div><details><summary>Or paste JSON</summary><textarea id="paste"></textarea><button class="btn" id="pasteGo">Import pasted JSON</button></details><p id="impMsg" class="small"></p></div>');
    h.push('<div class="card"><h3>Reset</h3><p class="muted">Deletes all v2 progress in this browser. Export first.</p><button class="btn bad" id="reset">Reset all progress</button></div>');
    h.push('<p class="small muted">Storage key: <code>' + S.KEY + '</code>. Attempts stored: ' + s.attempts.length + '. Mocks: ' + s.mocks.length + '.</p>');
    main.innerHTML = h.join('');
    $('#exp').onclick = function () {
      var blob = new Blob([S.exportJSON()], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = CFG.id + '-progress-' + U.todayKey() + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    };
    $('#expCopy').onclick = function () { try { navigator.clipboard.writeText(S.exportJSON()).then(function () { toast('Copied.'); }, function () { toast('Clipboard blocked; use Download.'); }); } catch (e) { toast('Clipboard blocked; use Download.'); } };
    function doImport(txt) { var r = S.importText(txt); $('#impMsg').textContent = r.message; $('#impMsg').style.color = r.ok ? 'var(--ok)' : 'var(--bad)'; }
    $('#file').onchange = function () { var f = this.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { doImport(rd.result); }; rd.readAsText(f); };
    $('#pasteGo').onclick = function () { doImport($('#paste').value); };
    $('#reset').onclick = function () { if (confirm('Delete ALL v2 progress in this browser? This cannot be undone.') && confirm('Really? Export first if you want a copy.')) { S.reset(false); toast('Progress reset.'); route(); } };
  }

  // ---------------- Sources + professor evidence ----------------
  function pSources() {
    var h = ['<h1>Sources and coverage</h1><p class="muted">See the bundled source ledger for review depth and unresolved claims. Every item cites a source code; hover a chip for the file.</p><table class="stat"><tr><th>Code</th><th>Source</th><th>Tier</th><th>Items citing</th></tr>'];
    var counts = {}; E.itemsFor(function () { return true; }).forEach(function (it) { (it.s || []).forEach(function (c) { var b = L.srcBase(c); if (b) counts[b] = (counts[b] || 0) + 1; }); });
    Object.keys(L.SOURCES).forEach(function (k) { var s = L.SOURCES[k]; h.push('<tr><td><code>' + k + '</code></td><td>' + esc(s.t) + '<br><span class="tiny muted">' + esc(s.f) + '</span></td><td>' + IU.tierBadge(s.tier) + '</td><td>' + (counts[k] || 0) + '</td></tr>'); });
    h.push('</table>');
    main.innerHTML = h.join('');
  }
  function pEvidence() {
    var P = L.EVIDENCE || { title: 'Evidence', tiers: [] };
    var h = ['<h1>' + esc(P.title) + '</h1><p class="muted">Current course statements, student reports, historical patterns, and design choices are separate. The lab does not predict the real exam.</p>'];
    (P.tiers || []).forEach(function (t) { h.push('<div class="card"><div class="spread"><h3 style="margin:0">' + esc(t.name) + '</h3>' + IU.tierBadge(t.tier) + '</div><ul>' + (t.items || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'); });
    if (!P.tiers || !P.tiers.length) h.push('<p>Evidence mapping needs source review.</p>');
    main.innerHTML = h.join('');
  }

  // ---------------- Boot ----------------
  function boot() {
    main = $('#main');
    document.title = CFG.title;
    $('#brand').innerHTML = esc(CFG.courseCode) + ' Lab <small>' + esc(CFG.examLabel) + '</small>';
    E.build();
    S.load();
    window.addEventListener('hashchange', route);
    route();
  }
  L.app = { boot: boot, route: route, go: go };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
