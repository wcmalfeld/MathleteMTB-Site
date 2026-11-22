// Lesson kit: progress for one lesson. Works with no account: kept in this
// browser (localStorage) by default, so a student can leave and come back.
// A host page passes callbacks (onAttempt, onProgress, onComplete); each
// lesson's own page (main.js) sends attempts to the student's account.
//
// createProgress({ lesson, studentId, storage, onAttempt, onProgress, onComplete })
//   lesson: { id, sections, questions, checkIds, mastery(api) -> { mastered, criteria } }
//
// Tracked: sections visited and completed; every question's attempts,
// hints, first-try result and answer; written work; the knowledge check
// (each retake is a new round); the student's level; time spent; and any
// activity data a lesson keeps (getData / setData), such as saved
// experiments or which hotspots were explored.

const VERSION = 1;

function blank(now) {
  return { version: VERSION, startedAt: now, updatedAt: now, completedAt: null, activeMs: 0, level: 'apply',
    visited: {}, questions: {}, written: {}, round: 1, data: {} };
}
function makeStorage(kind) {
  if (kind && typeof kind === 'object' && typeof kind.load === 'function') return kind;
  if (kind === 'memory') { const mem = {}; return { load: k => (mem[k] ? JSON.parse(mem[k]) : null), save: (k, v) => { mem[k] = JSON.stringify(v); }, remove: k => { delete mem[k]; } }; }
  return {
    load(k) { try { const s = window.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* keep going in memory */ } },
    remove(k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
}
const qk = (id, key) => id + (key ? '|' + key : '');

export function createProgress(opts = {}) {
  const L = opts.lesson;
  if (!L || !L.id) throw new Error('lesson-kit: createProgress needs a lesson');
  const CHECK = L.checkIds || [];
  const now = opts.now || (() => new Date().toISOString());
  const clock = opts.clock || (() => Date.now());
  const storeKey = 'mathlete-' + L.id + ':v' + VERSION + ':' + (opts.studentId || 'guest');
  const store = makeStorage(opts.storage);
  const call = (fn, arg) => { try { if (typeof fn === 'function') fn(arg); } catch (e) { if (typeof console !== 'undefined') console.warn('[' + L.id + '] callback failed', e); } };
  let state = store.load(storeKey);
  if (!state || state.version !== VERSION) state = blank(now());
  const fresh = blank(now());
  for (const k of Object.keys(fresh)) if (state[k] === undefined) state[k] = fresh[k];
  const listeners = [];
  let lastActive = null;

  // Time spent: gaps between interactions, ignoring gaps over 2 minutes.
  function touch() {
    const t = clock();
    if (lastActive !== null) { const gap = t - lastActive; if (gap > 0 && gap < 120000) state.activeMs += gap; }
    lastActive = t;
  }
  function save() {
    state.updatedAt = now();
    const s = summary();
    if (!state.completedAt && s.complete) { state.completedAt = now(); s.completedAt = state.completedAt; store.save(storeKey, state); call(opts.onComplete, s); }
    store.save(storeKey, state);
    call(opts.onProgress, s);
    listeners.forEach(l => l(s));
  }

  const question = (id, key) => state.questions[qk(id, key)] || null;
  const rec = (id, key) => (state.questions[qk(id, key)] = state.questions[qk(id, key)] || { attempts: 0, hints: 0, correct: false, revealed: false, firstTry: null });
  const done = (id, key) => { const r = question(id, key); return !!(r && (r.correct || r.revealed)); };
  const earned = (id, key) => { const r = question(id, key); return !!(r && r.correct && !r.revealed); };
  const tried = (id, key) => { const r = question(id, key); return !!(r && (r.attempts > 0 || r.revealed)); };
  const checkKey = round => 'r' + (round || state.round);

  function attempt(id, key, answer, correct, meta = {}) {
    touch();
    const r = rec(id, key);
    if (r.correct || r.revealed) return r;
    r.attempts += 1;
    if (r.firstTry === null) r.firstTry = !!correct;
    r.correct = !!correct; r.answer = answer; r.code = meta.code || null; r.at = now();
    call(opts.onAttempt, { questionId: id, key: key ? qk(id, key) : null, prompt: meta.prompt || ((L.questions || {})[id] || {}).prompt || id,
      answer, correctAnswer: meta.correctAnswer || '', correct: !!correct, hintsUsed: r.hints, attempt: r.attempts, code: r.code });
    save();
    return r;
  }
  function hint(id, key) { touch(); rec(id, key).hints += 1; save(); }
  function reveal(id, key) { touch(); rec(id, key).revealed = true; save(); }

  // A section is complete once every graded item in it is answered (right,
  // or the solution read). In the knowledge check, answering counts (its
  // score is first tries) and the current round is used.
  function sectionState(id) {
    const s = L.sections.find(x => x.id === id);
    const n = s.graded.filter(q => CHECK.includes(q) ? tried(q, checkKey()) : done(q)).length;
    return { answered: n, total: s.graded.length, complete: n === s.graded.length, visited: !!state.visited[id] };
  }

  function checkScore(round) {
    const key = checkKey(round);
    const right = CHECK.filter(id => { const r = question(id, key); return r && r.correct && r.attempts === 1 && !r.revealed; }).length;
    return { right, answered: CHECK.filter(id => tried(id, key)).length, total: CHECK.length, round: round || state.round };
  }
  function bestCheck() {
    let best = null;
    for (let r = 1; r <= state.round; r++) { const s = checkScore(r); if (s.answered === s.total && (!best || s.right > best.right)) best = s; }
    return best;
  }

  const api = {
    get state() { return state; },
    get level() { return state.level; },
    get round() { return state.round; },
    question, attempt, hint, reveal, done, earned, tried, checkKey, checkScore, bestCheck, sectionState,
    mastery: () => (L.mastery ? L.mastery(api) : { mastered: false, criteria: [] }),
    summary: () => summary(),
    visit(id) { touch(); if (!state.visited[id]) { state.visited[id] = now(); save(); } },
    setLevel(l) { if (['explore', 'apply', 'engineer'].includes(l)) { state.level = l; save(); } },
    write(id, text) { touch(); state.written[id] = String(text || '').slice(0, 4000); save(); },
    written: id => state.written[id] || '',
    // Activity data. quiet = save without telling the host (frequent changes, e.g. a slider).
    getData: (k, def) => (state.data[k] === undefined ? def : JSON.parse(JSON.stringify(state.data[k]))),
    setData(k, v, quiet) { touch(); state.data[k] = v; if (quiet) store.save(storeKey, { ...state, updatedAt: now() }); else save(); },
    retakeCheck() { state.round += 1; save(); },
    onChange(fn) { listeners.push(fn); },
    reset() { state = blank(now()); if (store.remove) store.remove(storeKey); save(); }
  };

  function summary() {
    const sections = L.sections.map(s => ({ id: s.id, ...sectionState(s.id) }));
    const answered = Object.values(state.questions).filter(r => r.attempts > 0);
    const m = api.mastery();
    return {
      sections, sectionsDone: sections.filter(s => s.complete).length, sectionsTotal: sections.length,
      complete: sections.every(s => s.complete), mastered: m.mastered, mastery: m,
      questionsAnswered: answered.length, firstTryRight: answered.filter(r => r.firstTry).length,
      hintsUsed: Object.values(state.questions).reduce((n, r) => n + r.hints, 0),
      activeMinutes: Math.round(state.activeMs / 60000), level: state.level, completedAt: state.completedAt
    };
  }
  return api;
}
