// The lab's own page on mathletemtb.com: mounts the module and connects it
// to the site without the module knowing about the site.
//  - Signed in, every answer is also sent to the student's account as
//    question "dream-line-goes-pro:<id>" (registered by the generated
//    curriculum SQL from content/classes/activities.mjs). Practice sets and
//    certification rounds send a question key, so new numbers count as new
//    questions. Passing the Final Park Engineer Certification ends the session as
//    completed. Signed out, nothing is sent and the lab works the same.
//  - "← Algebra 1" goes to the course; "Exit" goes back to the page it came
//    from (?from=classes/...), or to Algebra 1 → One-Step Equations.
import { mount } from './goes-pro.js';

const GAME = 'dream-line-goes-pro';
const MP = window.MathleteProgress || null;
let sessionId = null;
const session = () => { if (!sessionId) sessionId = MP.startSession(GAME); return sessionId; };

function onAttempt(r) {
  if (!MP) return;
  MP.recordQuestionAttempt({
    gameId: GAME,
    questionId: GAME + ':' + r.questionId,
    questionKey: r.key || undefined,
    questionSnapshot: { title: 'The Dream Line Goes Pro', prompt: r.prompt, answer: r.correctAnswer },
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
    minutes: s.activeMinutes, practice: s.practice, badges: s.badges, fromUnit1: s.project && s.project.fromUnit1, rearranged: s.rearranged
  } });
}

function exitLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(classes|teacher-curriculum)\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) return { href: '../../' + from, label: 'Exit' };
  return { href: '../../classes/algebra-1/one-step-equations/', label: 'Exit' };
}

mount(document.getElementById('dream-line-goes-pro'), {
  onAttempt, onComplete, backLink: exitLink(),
  courseLink: { href: '../../classes/algebra-1/', label: 'Algebra 1' },
  breadcrumb: [{ label: 'Courses', href: '../../classes/' }, { label: 'Algebra 1', href: '../../classes/algebra-1/' }, { label: 'One-Step Equations', href: '../../classes/algebra-1/one-step-equations/' }, { label: 'The Dream Line Goes Pro' }]
});
