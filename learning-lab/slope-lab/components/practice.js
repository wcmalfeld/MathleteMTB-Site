// Practice (three levels) and the transfer Challenge share this runner:
// a strip of question dots, the current question, and a short summary.
import { el, clear, button } from './dom.js';
import { renderQuestion } from './question.js';
import { LEVELS } from '../content/questions.js';
import { questionsFor, nextOpen, recommendLevel, recommendationText } from '../logic/select.js';

function dots(list, P, current, onPick, label) {
  return el('ol', { class: 'sl-dots', 'aria-label': label }, list.map((q, i) => {
    const r = P.question(q.id);
    const state = !r ? 'open' : r.correct ? (r.firstTry ? 'first' : 'later') : r.revealed ? 'shown' : r.attempts ? 'tried' : 'open';
    const words = { open: 'not tried', first: 'right first try', later: 'right after another try', shown: 'solution shown', tried: 'tried, not yet right' }[state];
    const mark = { open: String(i + 1), first: '✓', later: '✓', shown: '•', tried: '!' }[state];
    return el('li', null, el('button', { type: 'button', class: 'sl-dot sl-dot--' + state, 'aria-current': q === current ? 'step' : null,
      'aria-label': `Question ${i + 1}: ${words}`, onclick: () => onPick(q) }, mark));
  }));
}

function runner(ctx, list, opts) {
  const P = ctx.progress;
  const box = el('div', { class: 'sl-runner' });
  let current = opts.start && list.includes(opts.start) ? opts.start : (nextOpen(list, P) || list[0]);
  function draw(focus) {
    clear(box);
    const i = list.indexOf(current);
    box.appendChild(dots(list, P, current, q => { current = q; draw(true); }, opts.label));
    const after = () => {
      const n = nextOpen(list, P);
      if (n) { current = n; draw(true); }
      else { box.replaceChildren(opts.finished()); }
    };
    const qn = renderQuestion(current, { progress: P, kicker: opts.kicker(current, i), onNext: after, nextLabel: nextOpen(list.filter(q => q !== current), P) ? 'Next question →' : 'See how you did →',
      onDone: () => { const d = box.querySelector('.sl-dots'); if (d) d.replaceWith(dots(list, P, current, q => { current = q; draw(true); }, opts.label)); } });
    box.appendChild(qn);
    if (focus) { const h = qn.querySelector('.sl-prompt'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); } }
  }
  if (!nextOpen(list, P) && !opts.start) box.appendChild(opts.finished());
  else draw(false);
  return box;
}

export function renderPractice(ctx, levelArg) {
  const P = ctx.progress;
  const s = P.summary();
  const rec = recommendLevel(s);
  const level = [1, 2, 3].includes(Number(levelArg)) ? Number(levelArg) : rec;
  const page = el('div', { class: 'sl-practice' });
  page.appendChild(el('header', { class: 'sl-section-head' },
    el('p', { class: 'sl-kicker' }, 'Practice'),
    el('h2', { class: 'sl-h2' }, 'Practice with guidance'),
    el('p', { class: 'sl-lede' }, 'Pick a level. Every question has hints if you want them, and wrong answers are fine: you can try again.')));

  const levels = el('div', { class: 'sl-levels', role: 'tablist', 'aria-label': 'Difficulty' });
  [1, 2, 3].forEach(l => {
    const p = s.practice[l];
    levels.appendChild(el('a', { href: '#practice/' + l, role: 'tab', class: 'sl-level', 'aria-selected': l === level ? 'true' : 'false' },
      el('span', { class: 'sl-level-name' }, `Level ${l}: ${LEVELS[l].name}`, l === rec ? el('span', { class: 'sl-badge' }, 'Suggested') : null),
      el('span', { class: 'sl-level-blurb' }, LEVELS[l].blurb),
      el('span', { class: 'sl-level-stat' }, p.attempted ? `${p.attempted} of ${p.total} tried · ${p.firstTry} right first try` : `${p.total} questions`)));
  });
  page.appendChild(levels);
  page.appendChild(el('p', { class: 'sl-note' }, recommendationText(s).text));

  const list = questionsFor('practice', level);
  page.appendChild(runner(ctx, list, {
    label: `Level ${level} questions`,
    kicker: (q, i) => `Level ${level} · Question ${i + 1} of ${list.length}`,
    finished: () => {
      const p = P.summary().practice[level];
      const next = level < 3 ? level + 1 : null;
      return el('div', { class: 'sl-card sl-finished' },
        el('h3', { class: 'sl-h3' }, `${LEVELS[level].name}: all ${p.total} done`),
        el('p', null, `${p.firstTry} right on the first try, ${p.moreAttempts} right after another try${p.revealed ? `, ${p.revealed} where you looked at the solution` : ''}. ${p.hints ? p.hints + ' hint' + (p.hints === 1 ? '' : 's') + ' used.' : 'No hints used.'}`),
        el('p', { class: 'sl-note' }, 'This shows how this session went, not whether you’ve mastered slope. Come back another day and see if it sticks.'),
        el('div', { class: 'sl-row' },
          next ? el('a', { class: 'sl-btn sl-btn--primary', href: '#practice/' + next }, `Try Level ${next}: ${LEVELS[next].name} →`) : el('a', { class: 'sl-btn sl-btn--primary', href: '#challenge' }, 'Take the Challenge →'),
          button('Reset this level', () => { P.resetQuestions(list.map(q => q.id)); ctx.rerender(); }, 'sl-btn--quiet')));
    }
  }));
  return page;
}

export function renderChallenge(ctx) {
  const P = ctx.progress;
  const list = questionsFor('transfer');
  const page = el('div', { class: 'sl-practice' });
  page.appendChild(el('header', { class: 'sl-section-head' },
    el('p', { class: 'sl-kicker' }, 'Challenge'),
    el('h2', { class: 'sl-h2' }, 'Same math, no bikes'),
    el('p', { class: 'sl-lede' }, 'Slope isn’t only about trails. It’s any rate of change: cost per gigabyte, water draining from a barrel, points on a graph. These eight questions use what you learned on the trail, without the trail.'),
    el('p', { class: 'sl-note' }, 'Hints are here too. Your results show up in My Progress.')));
  page.appendChild(runner(ctx, list, {
    label: 'Challenge questions',
    kicker: (q, i) => `Challenge · ${i + 1} of ${list.length}`,
    finished: () => {
      const t = P.summary().transfer;
      return el('div', { class: 'sl-card sl-finished' },
        el('h3', { class: 'sl-h3' }, 'Challenge complete'),
        el('p', null, `${t.correct} of ${t.total} solved, ${t.firstTry} on the first try.`),
        el('p', null, t.firstTry >= 6 ? 'You used slope without any trail to lean on. That’s the point of learning it.' : 'Some of these were tough without the trail picture. Go back to the Learn topics they came from, then try again later.'),
        el('div', { class: 'sl-row' }, el('a', { class: 'sl-btn sl-btn--primary', href: '#progress' }, 'See my progress →'),
          button('Reset the challenge', () => { P.resetQuestions(list.map(q => q.id)); ctx.rerender(); }, 'sl-btn--quiet')));
    }
  }));
  return page;
}
