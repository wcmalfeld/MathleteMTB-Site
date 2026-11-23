// The workshop's own page on mathletemtb.com: mounts the module and connects
// it to the site without the module knowing about the site.
//  - Signed in, every answer is also sent to the student's account as
//    question "race-day-workshop:<id>" (registered by supabase/curriculum.sql
//    from content/classes/activities.mjs). The race practice scenarios and
//    each final round send a question key, so new numbers count as new
//    questions. Passing the final certification ends the session as
//    completed. Signed out, nothing is sent and the workshop works the same.
//  - "Back to Algebra 2" goes to the course; "Exit" goes back to the page it
//    came from (?from=classes/...), or to the unit's topic page.
import { mount } from './workshop.js';

const GAME = 'race-day-workshop';
const MP = window.MathleteProgress || null;
let sessionId = null;
const session = () => { if (!sessionId) sessionId = MP.startSession(GAME); return sessionId; };

function onAttempt(r) {
  if (!MP) return;
  MP.recordQuestionAttempt({
    gameId: GAME,
    questionId: GAME + ':' + r.questionId,
    questionKey: r.key || undefined,
    // What Review My Mistakes shows: the question as asked, and its answer.
    questionSnapshot: { title: 'Race-Day Workshop', prompt: r.prompt, answer: r.correctAnswer },
    studentAnswer: r.answer,
    correctAnswer: r.correctAnswer,
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: session()
  });
}
function onComplete(s) {
  if (!MP) return;
  const c = s.certification || {};
  MP.endSession(session(), { completed: true, metrics: {
    missions: s.missionsDone, finalRight: c.right, finalTotal: c.total, finalRound: c.round,
    questions: s.questionsAnswered, attempts: s.attempts, firstTryRight: s.firstTryRight, hints: s.hintsUsed,
    minutes: s.activeMinutes, practice: s.practice
  } });
}

function exitLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(classes|teacher-curriculum)\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) return { href: '../../' + from, label: 'Exit' };
  return { href: '../../classes/algebra-2/solving-equations-and-modeling-constraints/', label: 'Exit' };
}

mount(document.getElementById('race-day-workshop'), {
  onAttempt, onComplete, backLink: exitLink(),
  courseLink: { href: '../../classes/algebra-2/', label: 'Algebra 2' }
});
