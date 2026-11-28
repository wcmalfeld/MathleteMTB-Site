// The lab's own page on mathletemtb.com: mounts the module and connects it
// to the site without the module knowing about the site.
//  - Signed in, every answer is also sent to the student's account as
//    question "wrap-lab:<id>" (registered by the generated
//    curriculum SQL from content/classes/activities.mjs). Practice sets and
//    certification rounds send a question key, so new numbers count as new
//    questions. Passing the Custom Frame Designer Certification ends the session as
//    completed. Signed out, nothing is sent and the lab works the same.
//  - "← Algebra 1" goes to the course; "Exit" goes back to the page it came
//    from (?from=classes/...), or to Algebra 1 → Adding and Subtracting Polynomials.
import { mount } from './wrap.js';

const GAME = 'wrap-lab';
const MP = window.MathleteProgress || null;
let sessionId = null;
const session = () => { if (!sessionId) sessionId = MP.startSession(GAME); return sessionId; };

function onAttempt(r) {
  if (!MP) return;
  MP.recordQuestionAttempt({
    gameId: GAME,
    questionId: GAME + ':' + r.questionId,
    questionKey: r.key || undefined,
    questionSnapshot: { title: 'Wrap Lab', prompt: r.prompt, answer: r.correctAnswer },
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
    minutes: s.activeMinutes, practice: s.practice, badges: s.badges, kit: s.kit, zones: s.zones, slips: s.slips
  } });
}

function exitLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(classes|teacher-curriculum)\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) return { href: '../../' + from, label: 'Exit' };
  return { href: '../../classes/algebra-1/adding-and-subtracting-polynomials/', label: 'Exit' };
}

mount(document.getElementById('wrap-lab'), {
  onAttempt, onComplete, backLink: exitLink(),
  courseLink: { href: '../../classes/algebra-1/', label: 'Algebra 1' },
  breadcrumb: [{ label: 'Courses', href: '../../classes/' }, { label: 'Algebra 1', href: '../../classes/algebra-1/' }, { label: 'Adding and Subtracting Polynomials', href: '../../classes/algebra-1/adding-and-subtracting-polynomials/' }, { label: 'Wrap Lab' }]
});
