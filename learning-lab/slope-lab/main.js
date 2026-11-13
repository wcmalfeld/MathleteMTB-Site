// The lab's own page on mathletemtb.com: mounts the module and connects it
// to the site, without the module knowing anything about the site.
//
//  - Saving progress: if the site's progress tracking is on this page
//    (js/progress.js, loaded by index.html) every answer is also sent to
//    the student's account, as question "slope-lab:<id>", which
//    supabase/curriculum.sql links to the curriculum skills it practises.
//    Signed out, or embedded somewhere without it, nothing is sent and the
//    lab works exactly the same (progress stays in this browser).
//  - Coming from a Classes topic (?from=classes/...), a link leads back to it.
import { mount } from './slope-lab.js';
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
  const q = questionById(r.questionId);
  if (!q) return;
  if (!sessionId) sessionId = MP.startSession('slope-lab');
  MP.recordQuestionAttempt({
    gameId: 'slope-lab',
    questionId: 'slope-lab:' + q.id.toLowerCase(),
    questionSnapshot: snapshot(q),
    studentAnswer: String(r.answer),
    correctAnswer: correctText(q),
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: sessionId
  });
}
function onComplete(summary) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('slope-lab');
  MP.endSession(sessionId, { completed: true, metrics: { transfer: summary.transfer.firstTry + '/' + summary.transfer.total } });
}

// Only a Classes page on this site may be the "back" target.
function backLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (!/^classes\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) return null;
  const slug = from.split('/').filter(Boolean).pop();
  const label = slug.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
  return { href: '../../' + from, label };
}

mount(document.getElementById('slope-lab'), { onAttempt, onComplete, backLink: backLink() });
