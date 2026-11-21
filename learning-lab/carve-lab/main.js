// Carve Lab's own page on mathletemtb.com: mounts the module and connects it
// to the site without the module knowing about the site.
//  - Signed in, every graded answer (predictions, maths questions, simulator
//    targets, the design) is also sent to the student's account as question
//    "carve-lab:<kind>"; supabase/progress.sql lists the kinds and their
//    skills. Signed out, nothing is sent and the lab works the same.
//  - The back link goes to the Ski page it came from (?from=ski/...), or to
//    Mathlete Ski -> Tuning Bench.
import { mount } from './carve-lab.js';

const MP = window.MathleteProgress || null;
let sessionId = null;

function onAttempt(r) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('carve-lab');
  MP.recordQuestionAttempt({
    gameId: 'carve-lab',
    questionId: 'carve-lab:' + r.questionId,
    questionKey: r.key || undefined,
    // What Review My Mistakes shows: the question as asked, and its answer.
    questionSnapshot: { title: 'Carve Lab', prompt: r.prompt, answer: r.correctAnswer },
    studentAnswer: r.answer,
    correctAnswer: r.correctAnswer,
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: sessionId
  });
}
function onComplete(s) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('carve-lab');
  MP.endSession(sessionId, { completed: true, metrics: { score: s.points, challenges: s.challengesDone, predictionsRight: s.predictions.correct } });
}

function backLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(ski\/([a-z0-9-]+\/)?|classes\/[a-z0-9-]+\/([a-z0-9-]+\/)?)$/.test(from)) return { href: '../../' + from, label: from === 'ski/' ? 'Back to Mathlete Ski' : 'Back' };
  return { href: '../../ski/tuning-bench/', label: 'Back to Tuning Bench' };
}

mount(document.getElementById('carve-lab'), { onAttempt, onComplete, backLink: backLink() });
