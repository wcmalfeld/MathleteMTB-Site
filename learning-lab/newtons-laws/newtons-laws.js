// Newton's Laws of Motion: an interactive lesson (Mathlete MTB, Trail
// Physics, Module 7). The module's public entry point. It runs in the shared
// lesson kit (learning-lab/lesson-kit/), which draws the sections, keeps
// progress and runs the knowledge check; this folder holds the content
// (logic/lesson.js), the physics (logic/physics.js) and the interactives
// (components/).
//
//   import { mount } from './newtons-laws.js';
//   mount(element, { studentId, storage: 'local' | 'memory' | { load, save },
//                    routing: 'hash' | 'memory', backLink: { href, label },
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: newtonslaws:attempt, :progress, :complete.
// Works with no options and no account, and without any AI service.

import { mountLesson } from '../lesson-kit/lesson.js';
import { visual } from './components/visuals.js';
import { ACTIVITIES } from './components/activities.js';
import { SECTIONS, QUESTIONS, OBJECTIVES, LEVELS, CHECK_IDS, mastery } from './logic/lesson.js';

export const VERSION = '1.1.0';

export const LESSON = {
  id: 'newtons-laws', title: 'Newton’s Laws of Motion', eventPrefix: 'newtonslaws',
  kicker: 'Trail Physics · Module 7',
  overview: {
    kicker: 'Trail Physics · Unit 3: Forces & Cornering · Module 7',
    lede: 'Why does a bike keep rolling when you stop pedalling? Why does a heavier rider need more force to get going? Why does the ground push back on your tires? Three laws explain all of it, and you’ll use the maths to prove it.',
    questions: ['Why does a rider keep moving after they stop pedalling?', 'Why does a heavier rider need more force to accelerate at the same rate?', 'Why does the ground push back against a tire?', 'What forces act on a bike climbing a steep trail?'],
    duration: '45–60 minutes in seven sections. Your progress is saved, so you can stop and come back.',
    note: 'This lesson teaches physics with simplified models. Nothing in it is riding, equipment or safety advice.'
  },
  sections: SECTIONS.map(s => ({ ...s, navTitle: s.title.replace(/^Newton’s (\w+) Law: /, '$1 law: ') })),
  questions: QUESTIONS, checkIds: CHECK_IDS, objectives: OBJECTIVES, levels: LEVELS,
  activities: ACTIVITIES, visual,
  check: { intro: 'Eight questions on everything in the lesson. A question counts toward your score when it’s right on the first try. Mastery needs at least 7 of 8 (80%).' },
  mastery,
  masteryText: { done: '★ Newton’s laws: mastered', todo: 'What mastery takes', criteriaTitle: 'Your mastery',
    doneBody: 'You can explain why the bike keeps moving, why it speeds up, why mass matters and why the ground pushes back, and back it up with the maths. Next up: Berm Lab uses all of it to explain cornering.',
    todoBody: 'Mastery is about showing what you understand, not finishing pages. Go back to the sections above, then come back and try again.' }
};

export function mount(target, opts = {}) { return mountLesson(target, LESSON, opts); }

if (typeof window !== 'undefined') window.NewtonsLaws = { mount, VERSION };
