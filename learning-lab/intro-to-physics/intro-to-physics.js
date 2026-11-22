// Introduction to Physics: an interactive lesson (Mathlete MTB, Trail
// Physics, Unit 1, Module 1). The module's public entry point. It runs in
// the shared lesson kit (learning-lab/lesson-kit/); this folder holds the
// content (logic/lesson.js), the grading (logic/grade.js) and the
// interactives and pictures (components/).
//
//   import { mount } from './intro-to-physics.js';
//   mount(element, { studentId, storage, routing, backLink, onAttempt, onProgress, onComplete })
// Events also fire on the element: introphysics:attempt, :progress, :complete.
// Works with no options and no account, and without any AI service.

import { mountLesson } from '../lesson-kit/lesson.js';
import { visual } from './components/scene.js';
import { ACTIVITIES } from './components/activities.js';
import { SECTIONS, QUESTIONS, OBJECTIVES, LEVELS, CHECK_IDS, mastery } from './logic/lesson.js';

export const VERSION = '1.0.0';

export const LESSON = {
  id: 'intro-to-physics', title: 'Introduction to Physics', eventPrefix: 'introphysics',
  kicker: 'Trail Physics · Module 1',
  overview: {
    kicker: 'Trail Physics · Unit 1: Physics Foundations · Module 1',
    lede: 'Every jump, berm, descent, landing and squeeze of the brakes is physics happening right in front of you. Start with the ride, and find out what physicists study, how they simplify the world, and how they test their ideas.',
    questions: ['What can we learn about physics by studying a mountain bike and the way it moves?', 'Why do you lean into a corner?', 'Why does your fork compress when you land?', 'How would you test whether a steeper trail makes you faster?'],
    start: 'Start riding →',
    duration: '35–45 minutes in seven sections. No maths needed yet. Your progress is saved, so you can stop and come back.',
    note: 'This lesson teaches physics with simplified models. Nothing in it is riding, equipment or safety advice.'
  },
  sections: SECTIONS, questions: QUESTIONS, checkIds: CHECK_IDS, objectives: OBJECTIVES, levels: LEVELS,
  activities: ACTIVITIES, visual,
  check: { intro: 'Eight questions on the big ideas. A question counts toward your score when it’s right on the first try. Completing the lesson needs at least 6 of 8 (70%).' },
  mastery,
  masteryText: { done: '★ Introduction to Physics: complete', todo: 'What completing the lesson takes', criteriaTitle: 'Your progress',
    doneBody: 'You can look at a rider on a trail and see the physics: matter, energy, motion and interactions, systems and models, and questions worth investigating. Welcome to Physics of the Ride. Next up: the Mathematics Review.',
    todoBody: 'Finish the sections above, then come back here. You can revisit any section at any time.' }
};

export function mount(target, opts = {}) { return mountLesson(target, LESSON, opts); }

if (typeof window !== 'undefined') window.IntroToPhysics = { mount, VERSION };
