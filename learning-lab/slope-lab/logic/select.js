// Slope & Linear Relationships Lab: which questions come next, and what to suggest.

import { QUESTIONS, LEVELS } from '../content/questions.js';

export function questionsFor(set, level) {
  return QUESTIONS.filter(q => q.set === set && (level == null || q.level === level));
}

// Within a list: the first question not yet finished (right, or answer shown).
export function nextOpen(list, progress) {
  return list.find(q => { const r = progress.question(q.id); return !r || !(r.correct || r.revealed); }) || null;
}

// Suggest a practice level from earlier results:
//  - start at Foundations;
//  - move up once a level is fully tried with at least 6 of 8 right first time;
//  - otherwise stay on the first level that isn't there yet.
export function recommendLevel(summary) {
  for (const l of [1, 2, 3]) {
    const p = summary.practice[l];
    if (p.attempted < p.total || p.firstTry < Math.ceil(0.75 * p.total)) return l;
  }
  return 3;
}

export function recommendationText(summary) {
  const l = recommendLevel(summary), p = summary.practice[l];
  if (!summary.practiceAttempted) return { level: 1, text: 'Start with Foundations: rise, run and percentage grade.' };
  if (p.attempted < p.total) return { level: l, text: `Keep going with ${LEVELS[l].name}: ${p.total - p.attempted} question${p.total - p.attempted === 1 ? '' : 's'} left.` };
  if (l < 3 || p.firstTry < Math.ceil(0.75 * p.total)) {
    return { level: l, text: `${LEVELS[l].name} again could help: ${p.firstTry} of ${p.total} were right on the first try. Use Reset level to try them fresh.` };
  }
  return { level: 3, text: 'You’ve worked through every level. Try the Challenge: the same math without the bikes.' };
}

// The next thing to do, for the summary page.
export function nextActivity(summary) {
  if (summary.topics.done < summary.topics.total) return { section: 'learn', text: 'Finish the Learn topics you haven’t opened yet.' };
  if (summary.challenges.done < summary.challenges.total) return { section: 'explore', text: 'Try the remaining Trail Designer challenges.' };
  const r = recommendationText(summary);
  if (summary.practiceAttempted < 8 || summary.practice[r.level].attempted < summary.practice[r.level].total) return { section: 'practice', text: r.text };
  if (summary.transfer.attempted < summary.transfer.total) return { section: 'challenge', text: 'Take the transfer challenge: slope without the mountain bikes.' };
  if (summary.needsWork.length) return { section: 'learn', text: 'Revisit: ' + summary.needsWork.join('; ') + '.' };
  return { section: 'practice', text: 'Next up in Algebra I: writing and graphing equations of lines from any two facts about them.' };
}
