// Introduction: one screen, under a minute to take in.
import { el, svg } from './dom.js';
import { INTRO } from '../content/lessons.js';

// A trail with a clear elevation profile: climb, flat, descent, steep pitch.
function heroArt() {
  const pts = [[0, 230], [120, 200], [230, 130], [300, 125], [380, 160], [440, 90], [520, 60], [600, 120], [680, 140]];
  const d = 'M' + pts.map(p => p.join(',')).join(' L');
  return svg('svg', { viewBox: '0 0 680 280', class: 'sl-hero-art', role: 'img', 'aria-label': 'A mountain bike trail seen from the side: it climbs, flattens, climbs steeply, then descends.' },
    svg('path', { d: 'M0,200 L90,120 L170,170 L260,70 L360,150 L460,40 L560,130 L680,80 L680,280 L0,280 Z', class: 'sl-hero-hills' }),
    svg('path', { d: d + ' L680,280 L0,280 Z', class: 'sl-ground' }),
    svg('path', { d, class: 'sl-trail' }),
    // rise/run on the steep pitch
    svg('line', { x1: 380, y1: 160, x2: 440, y2: 160, class: 'sl-run' }),
    svg('line', { x1: 440, y1: 160, x2: 440, y2: 90, class: 'sl-rise' }),
    svg('text', { x: 410, y: 180, class: 'sl-leg-label', 'text-anchor': 'middle' }, 'run'),
    svg('text', { x: 448, y: 130, class: 'sl-leg-label' }, 'rise'),
    // a rider on the climb
    svg('g', { transform: 'translate(205,128) rotate(-32)', class: 'sl-rider' },
      svg('circle', { cx: -14, cy: 0, r: 9 }), svg('circle', { cx: 14, cy: 0, r: 9 }),
      svg('path', { d: 'M-14,0 L-2,-12 L14,0 M-2,-12 L6,-12 M-6,-24 L-2,-12 M-6,-24 L4,-30' }), svg('circle', { cx: 6, cy: -34, r: 4.5 })));
}

export function renderIntro(ctx) {
  const P = ctx.progress, s = P.summary();
  const started = s.topics.done || s.practiceAttempted || s.challenges.done;
  return el('div', { class: 'sl-intro' },
    el('div', { class: 'sl-intro-text' },
      el('p', { class: 'sl-kicker' }, INTRO.kicker),
      el('h1', { class: 'sl-h1' }, INTRO.title),
      el('p', { class: 'sl-lede' }, INTRO.lede),
      el('p', { class: 'sl-question' }, INTRO.question),
      el('div', { class: 'sl-row' },
        el('a', { class: 'sl-btn sl-btn--primary sl-btn--big', href: '#learn/rise-run' }, INTRO.action + ' →'),
        started ? el('a', { class: 'sl-btn sl-btn--quiet', href: '#progress' }, 'Pick up where I left off') : null)),
    el('div', { class: 'sl-intro-art' }, heroArt()),
    el('ol', { class: 'sl-stages' }, INTRO.stages.map(([name, text], i) =>
      el('li', null, el('a', { href: '#' + ['learn', 'explore', 'practice', 'challenge'][i] }, el('span', { class: 'sl-stage-n' }, String(i + 1)), el('b', null, name), el('span', null, text))))));
}
