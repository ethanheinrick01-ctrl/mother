/* Study Lab v2 utilities. No network or build step. Adapted from the COMD 4590 v2 runtime. */
(function (root) {
  'use strict';
  var L = root.L = root.L || {};

  // Deterministic PRNG (mulberry32) so generated items can be re-created from a seed.
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function newSeed() { return (Math.floor(Math.random() * 2147483646) + 1) >>> 0; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function int(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function step(r, lo, hi, s) { s = s || 5; return lo + s * Math.floor(r() * (Math.floor((hi - lo) / s) + 1)); }
  function shuffle(arr, r) {
    r = r || Math.random; var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function round1(x) { return Math.round(x * 10) / 10; }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function todayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000); }
  function addDays(key, n) { var d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return todayKey(d); }
  function pct(n, d) { return d ? Math.round(100 * n / d) : 0; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uniq(a) { var s = {}, out = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; out.push(x); } }); return out; }

  L.util = { rng: rng, newSeed: newSeed, pick: pick, int: int, step: step, shuffle: shuffle, esc: esc, el: el,
    round1: round1, mean: mean, todayKey: todayKey, daysBetween: daysBetween, addDays: addDays, pct: pct, clone: clone, uniq: uniq };
})(typeof window !== 'undefined' ? window : globalThis);
