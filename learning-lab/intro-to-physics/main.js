// The lesson's own page on mathletemtb.com: mounts the module and connects it
// to the site without the module knowing about the site.
//  - Signed in, every graded answer is also sent to the student's account as
//    question "intro-to-physics:<id>" (registered by supabase/curriculum.sql
//    from content/classes/activities.mjs), including the written Physics
//    Detective investigation, so a tutor can read it. Knowledge-check retakes
//    send a question key, so they count as new questions. Signed out,
//    nothing is sent and the lesson works the same.
//  - The back link goes to the page it came from (?from=classes/...), or to
//    Trail Physics, Module 1.
import { mount } from './intro-to-physics.js';

const MP = window.MathleteProgress || null;
let sessionId = null;
const session = () => { if (!sessionId) sessionId = MP.startSession('intro-to-physics'); return sessionId; };

function onAttempt(r) {
  if (!MP) return;
  MP.recordQuestionAttempt({
    gameId: 'intro-to-physics',
    questionId: 'intro-to-physics:' + r.questionId,
    questionKey: r.key || undefined,
    questionSnapshot: { title: 'Introduction to Physics', prompt: r.prompt, answer: r.correctAnswer },
    studentAnswer: r.answer,
    correctAnswer: r.correctAnswer,
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: session()
  });
}
function onComplete(s) {
  if (!MP) return;
  MP.endSession(session(), { completed: true, metrics: { sections: s.sectionsDone, complete: s.mastered, firstTryRight: s.firstTryRight, questions: s.questionsAnswered, minutes: s.activeMinutes } });
}

function backLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^(learning-lab\/[a-z0-9-]+\/|classes\/[a-z0-9-]+\/([a-z0-9-]+\/)?)$/.test(from)) return { href: '../../' + from, label: 'Back' };
  return { href: '../../classes/trail-physics/introduction-to-physics/', label: 'Trail Physics: Module 1' };
}

mount(document.getElementById('intro-to-physics'), { onAttempt, onComplete, backLink: backLink() });
