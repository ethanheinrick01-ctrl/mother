/* Browser-local progress and portable exports. Adapted from the COMD 4590 v2 store. */
(function (root) {
  'use strict';
  var L = root.L = root.L || {}, KEY = L.CONFIG.storageKey;
  var mem = null, storageOK = true;
  function blank() {
    return { app: L.CONFIG.id, schema: 2, created: Date.now(), updated: Date.now(), attempts: [], mocks: [],
      mockActive: null, session: null, boss: {}, seenX: {}, guideRead: {}, teach: {}, legacy: null,
      settings: { includeHeld: false } };
  }
  function get(k) { try { return root.localStorage ? root.localStorage.getItem(k) : null; } catch (e) { storageOK = false; return null; } }
  function set(k, v) { try { if (!root.localStorage) throw Error('unavailable'); root.localStorage.setItem(k, v); return true; } catch (e) { storageOK = false; return false; } }
  function normalize(x) {
    var b = blank(); if (!x || typeof x !== 'object') return b;
    Object.keys(b).forEach(function (k) { if (x[k] === undefined) x[k] = b[k]; });
    if (!Array.isArray(x.attempts)) x.attempts = [];
    if (!Array.isArray(x.mocks)) x.mocks = [];
    if (!x.settings || typeof x.settings !== 'object') x.settings = b.settings;
    x.schema = 2; x.app = L.CONFIG.id; return x;
  }
  function load() {
    if (mem) return mem;
    var raw = get(KEY), x = null;
    if (raw) { try { x = JSON.parse(raw); } catch (e) { storageOK = false; } }
    mem = normalize(x); return mem;
  }
  function save() {
    if (!mem) return false;
    mem.updated = Date.now();
    if (mem.attempts.length > 6000) mem.attempts = mem.attempts.slice(-6000);
    return set(KEY, JSON.stringify(mem));
  }
  function reset(keepLegacy) { var old = keepLegacy && load().legacy; mem = blank(); if (old) mem.legacy = old; return save(); }
  function exportJSON() { return JSON.stringify({ app: L.CONFIG.id, schema: 2, exported: new Date().toISOString(), state: load() }, null, 2); }
  function mergeV2(into, from) {
    var seen = {};
    into.attempts.forEach(function (a) { seen[a.i + '|' + a.t + '|' + a.c] = true; });
    (from.attempts || []).forEach(function (a) { var k = a.i + '|' + a.t + '|' + a.c; if (!seen[k]) { into.attempts.push(a); seen[k] = true; } });
    into.attempts.sort(function (a, b) { return a.t - b.t; });
    var mockIds = {}; into.mocks.forEach(function (m) { mockIds[m.id] = true; });
    (from.mocks || []).forEach(function (m) { if (!mockIds[m.id]) into.mocks.push(m); });
    Object.keys(from.boss || {}).forEach(function (id) {
      var cur = into.boss[id] || { best: null, runs: [] }, ext = from.boss[id], runs = {};
      cur.runs.forEach(function (r) { runs[r.ts] = true; });
      (ext.runs || []).forEach(function (r) { if (!runs[r.ts]) cur.runs.push(r); });
      (ext.runs || []).forEach(function (r) { if (r.complete && r.total > 0) cur.best = cur.best === null ? r.score / r.total : Math.max(cur.best, r.score / r.total); });
      into.boss[id] = cur;
    });
    ['seenX', 'guideRead', 'teach'].forEach(function (k) { Object.keys(from[k] || {}).forEach(function (id) { if (!into[k][id]) into[k][id] = from[k][id]; }); });
    if (from.legacy && !into.legacy) into.legacy = from.legacy;
  }
  function importText(text) {
    var d; try { d = JSON.parse(text); } catch (e) { return { ok: false, message: 'This is not valid JSON.' }; }
    var s = load();
    if (d && d.app === L.CONFIG.id && d.schema === 2 && d.state) {
      var before = s.attempts.length; mergeV2(s, normalize(d.state)); save();
      return { ok: true, kind: 'v2', message: 'Merged ' + (s.attempts.length - before) + ' new attempts.' };
    }
    if (L.importLegacy && typeof L.importLegacy === 'function') {
      var prior = L.importLegacy(d);
      if (prior && prior.signal) {
        s.legacy = { imported: Date.now(), sources: [prior.label || 'Legacy import'], signal: prior.signal };
        save(); return { ok: true, kind: 'legacy', message: 'Imported old results as review signals. Mastery must be earned here.' };
      }
    }
    return { ok: false, message: 'Unrecognized progress file for this course. Existing data was not changed.' };
  }
  L.store = { KEY: KEY, load: load, save: save, reset: reset, exportJSON: exportJSON, importText: importText,
    ok: function () { return storageOK; }, _setMem: function (x) { mem = normalize(x); }, _blank: blank };
})(typeof window !== 'undefined' ? window : globalThis);
