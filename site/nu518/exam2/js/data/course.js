/* Source-gated course data. Populate from the audited handoff; do not invent class content. */
(function (root) {
  'use strict';
  var L = root.L = root.L || {};
  L.CONFIG = {
    "id": "nu518-exam2",
    "courseCode": "NU 518",
    "courseTitle": "Advanced Nursing and Health Assessment",
    "examLabel": "Exam 2",
    "title": "NU 518 Exam 2 Study Lab",
    "subtitle": "Bates 14th edition · study guide topics · original practice",
    "examDate": "September 30–October 2, 2026",
    "storageKey": "nu518-exam2-study-lab-v1",
    "callout": "75 multiple-choice questions · 110 minutes · study guide, notes, and Bates allowed under the course's stated conditions.",
    "mockRationale": "Three 75-item practice forms follow the stated exam length. The course gives no per-chapter weighting, so form coverage is balanced across the supplied study guide topics.",
    "tierLabels": {
      "1": "Current course",
      "2": "Student report",
      "3": "Prior course",
      "4": "Design inference"
    }
  };
  L.SECTIONS = [];
  L.CONCEPTS = {};
  L.GUIDE = {};
  L.ITEMS = [];
  L.CASES = [];
  L.BOSSES = [];
  L.DOMAINS = {};
  L.MOCK_BLUEPRINTS = {};
  L.MOCK_FORMS = {};
  L.SOURCES = {};
  L.EVIDENCE = { title: 'Evidence and exam style', tiers: [] };
  L.GEN_FOR = {};
  L.MEDIA_RENDERERS = {};
  L.srcBase = function (code) {
    var keys = Object.keys(L.SOURCES).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var rest = String(code).slice(keys[i].length);
      if (String(code).indexOf(keys[i]) === 0 && (rest === '' || /^-?\d+$/.test(rest))) return keys[i];
    }
    return null;
  };
  L.srcLabel = function (code) {
    var base = L.srcBase(code), source = L.SOURCES[base] || {};
    var rest = base ? String(code).slice(base.length).replace(/^-/, '') : '';
    return (source.short || base || code) + (rest ? (source.page ? ' p. ' : source.slide ? ' slide ' : ' ') + rest : '');
  };
})(typeof window !== 'undefined' ? window : globalThis);
