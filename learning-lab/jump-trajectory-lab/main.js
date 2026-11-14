// The lab's own page on mathletemtb.com: mounts the module and connects it to
// the site without the module knowing about the site.
//  - Signed in, every answer is also sent to the student's account as
//    question "jump-trajectory-lab:<kind>" (keyed by the jump's numbers);
//    supabase/curriculum.sql links each kind to curriculum skills.
//    Signed out, nothing is sent and the lab works the same.
//  - "Back to Algebra 1" goes to the Classes topic it came from, or to
//    Algebra 1 → Graphing Quadratics.
import { mount } from './jump-lab.js';

const MP = window.MathleteProgress || null;
let sessionId = null;

function onAttempt(r) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('jump-trajectory-lab');
  MP.recordQuestionAttempt({
    gameId: 'jump-trajectory-lab',
    questionId: 'jump-trajectory-lab:' + r.questionId,
    questionKey: r.key || undefined,
    // What Review My Mistakes shows: the question as asked, and its answer.
    // (Kept identical on every try: it identifies the question.)
    questionSnapshot: { title: 'Jump Trajectory Lab', prompt: r.prompt, answer: r.correctAnswer },
    studentAnswer: r.answer,
    correctAnswer: r.correctAnswer,
    isCorrect: !!r.correct,
    hintsUsed: r.hintsUsed || 0,
    gameSessionId: sessionId
  });
}
function onComplete(s) {
  if (!MP) return;
  if (!sessionId) sessionId = MP.startSession('jump-trajectory-lab');
  MP.endSession(sessionId, { completed: true, metrics: { score: s.score, missions: s.missionsDone } });
}

function backLink() {
  const from = new URLSearchParams(location.search).get('from') || '';
  if (/^classes\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/.test(from)) {
    const course = from.split('/')[1];
    return { href: '../../' + from, label: 'Back to ' + course.replace(/-/g, ' ').replace(/\b(\w)/g, c => c.toUpperCase()) };
  }
  return { href: '../../classes/algebra-1/graphing-quadratics/', label: 'Back to Algebra 1' };
}

mount(document.getElementById('jump-lab'), { onAttempt, onComplete, backLink: backLink() });
