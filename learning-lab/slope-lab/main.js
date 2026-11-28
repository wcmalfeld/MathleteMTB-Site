// The lab's own page on mathletemtb.com: mounts the module and connects it
// to the site, without the module knowing anything about the site.
//
//  - Saving progress: if the site's progress tracking is on this page
//    (js/progress.js, loaded by index.html) every answer is also sent to
//    the student's account, as question "slope-lab:<id>", which
//    supabase/curriculum.sql links to the curriculum skills it practices.
//    Signed out, or embedded somewhere without it, nothing is sent and the
//    lab works exactly the same (progress stays in this browser).
//  - Coming from a Classes topic (?from=classes/...), "Exit" leads back to it.
//  - Map the Line (map-the-line.js) is the Slope Lab, extended to all of
//    Algebra 1 Unit 3. The original 32 questions keep their ids and their
//    detailed snapshots; new questions send their prompt and answer. Practice
//    sets and certification rounds send a question key (new numbers count as
//    new questions). Passing the Ultimate Ride Analysis Challenge ends the
//    session as completed.
import { mount } from './map-the-line.js';
import { questionById } from './content/questions.js';

const MP = window.MathleteProgress || null;
let sessionId = null;

// What gets saved with an answer: the question as it was asked, so Review
// My Mistakes can show it again later.
function snapshot(q) {
  const s = { title: q.skill, prompt: q.prompt + (q.math ? ' ' + q.math.join('; ') : ''), explanation: q.explanation, hint: q.hints[0] };
  if (q.type === 'number' && typeof q.answer === 'number') {
    s.answer = q.answer; s.unit = q.unit || (q.format === 'percent' ? '%' : undefined);
    s.tolerance = typeof q.places === 'number' ? 0.5 * Math.pow(10, -q.places) : 1e-9;
  } else if (q.type === 'choice' && q.options.every(o => o.text)) {
    s.choices = q.options.map(o => o.text); s.answer = q.options.find(o => o.correct).text;
  } else {
    s.answer = correctText(q);
  }
  return s;
}
function correctText(q) {
  if (q.type === 'number') return String(q.answer);
  if (q.type === 'fields') return q.fields.map(f => `${f.label} = ${f.answer}${f.unit ? ' ' + f.unit : ''}`).join(', ');
  if (q.type === 'choice') { const o = q.options.find(x => x.correct); return o.text || 'the first table'; }
  if (q.type === 'plot') return `any two points on y = ${q.line.m}x ${q.line.b < 0 ? '−' : '+'} ${Math.abs(q.line.b)}`;
  return '';
}

function onAttempt(r) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('slope-lab');
  const old = /^[a-z]\d+$/.test(r.questionId) ? questionById(r.questionId.toUpperCase()) : null;
  MP.recordQuestionAttempt({
    gameId: 'slope-lab',
    questionId: 'slope-lab:' + r.questionId,
    questionKey: r.key || undefined,
    questionSnapshot: old ? snapshot(old) : { title: 'Map the Line', prompt: r.prompt, answer: r.correctAnswer },
    studentAnswer: String(r.answer),
    correctAnswer: old ? correctText(old) : r.correctAnswer,
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: sessionId
  });
}
function onComplete(s) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('slope-lab');
  const c = s.certification || {};
  MP.endSession(sessionId, { completed: true, metrics: { missions: s.missionsDone, finalRight: c.right, finalTotal: c.total, finalRound: c.round, questions: s.questionsAnswered, firstTryRight: s.firstTryRight, hints: s.hintsUsed, minutes: s.activeMinutes, badges: s.badges, originalBank: s.bank } });
}

// Only a Classes or Teacher Curriculum page on this site may be the "Exit" target.
function exitLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(classes|teacher-curriculum)\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) return { href: '../../' + from, label: 'Exit' };
  return { href: '../../classes/algebra-1/slope-and-rate-of-change/', label: 'Exit' };
}

mount(document.getElementById('slope-lab'), {
  onAttempt, onComplete, backLink: exitLink(),
  courseLink: { href: '../../classes/algebra-1/', label: 'Algebra 1' },
  breadcrumb: [{ label: 'Courses', href: '../../classes/' }, { label: 'Algebra 1', href: '../../classes/algebra-1/' }, { label: 'Slope and Rate of Change', href: '../../classes/algebra-1/slope-and-rate-of-change/' }, { label: 'Map the Line' }]
});
