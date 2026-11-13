// My Progress: what was explored, what was practised, what may need work,
// and what to do next. Activity completed is kept apart from questions
// answered correctly; nothing here claims mastery.
import { el, clear, button } from './dom.js';
import { QUESTIONS, OBJECTIVES } from '../content/questions.js';
import { TOPICS, CHALLENGES } from '../content/lessons.js';
import { nextActivity } from '../logic/select.js';

const day = iso => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export function renderSummary(ctx) {
  const P = ctx.progress, s = P.summary(), st = P.state;
  const page = el('div', { class: 'sl-summary' });
  const nx = nextActivity(s);
  page.appendChild(el('header', { class: 'sl-section-head' },
    el('p', { class: 'sl-kicker' }, 'My Progress'),
    el('h2', { class: 'sl-h2' }, s.complete ? 'Module complete' : 'Where you are'),
    el('p', { class: 'sl-lede' }, s.complete
      ? `You finished the module on ${day(s.completedAt)}. That’s real work. Keep practising now and then so it sticks.`
      : s.practiceAttempted || s.topics.done > 1 ? 'Nice work so far. Here’s what you’ve done and what to try next.' : 'Nothing much yet. Start anywhere: everything you do is saved in this browser.')));

  page.appendChild(el('div', { class: 'sl-next' }, el('p', { class: 'sl-mini' }, 'Suggested next'), el('p', null, nx.text), el('a', { class: 'sl-btn sl-btn--primary', href: '#' + nx.section }, 'Go →')));

  // Activity (what you did)
  const tiles = el('ul', { class: 'sl-tiles' },
    tile('Learn topics opened', `${s.topics.done} of ${s.topics.total}`),
    tile('Trail Designer challenges', `${s.challenges.done} of ${s.challenges.total}`),
    tile('Predictions made', `${s.predictions.done}`, s.predictions.done ? `${s.predictions.correct} right` : null),
    tile('Practice questions tried', `${s.practiceAttempted} of 24`));
  page.appendChild(el('section', { class: 'sl-block', 'aria-labelledby': 'act-title' }, el('h3', { class: 'sl-h3', id: 'act-title' }, 'What you explored'), tiles,
    el('p', { class: 'sl-note' }, 'These count activity: things you opened or finished. The next part shows how your answers went.')));

  // Understanding (how the answers went)
  const rows = [1, 2, 3].map(l => { const p = s.practice[l]; return [`Level ${l}: ${p.name}`, `${p.attempted} of ${p.total}`, p.firstTry, p.moreAttempts, p.revealed, p.hints]; });
  const t = s.transfer;
  rows.push(['Challenge (no bikes)', `${t.attempted} of ${t.total}`, t.firstTry, t.moreAttempts, t.revealed, t.hints]);
  page.appendChild(el('section', { class: 'sl-block', 'aria-labelledby': 'ans-title' }, el('h3', { class: 'sl-h3', id: 'ans-title' }, 'How your answers went'),
    el('div', { class: 'sl-table-wrap' }, el('table', { class: 'sl-table' },
      el('thead', null, el('tr', null, ['', 'Tried', 'Right first try', 'Right after another try', 'Solution shown', 'Hints'].map(h => el('th', { scope: 'col' }, h)))),
      el('tbody', null, rows.map(r => el('tr', null, el('th', { scope: 'row' }, r[0]), r.slice(1).map(c => el('td', { class: 'sl-num' }, String(c))))))))));

  // Objectives
  const tried = s.objectives.filter(o => o.attempted);
  const objList = el('ul', { class: 'sl-objectives' }, s.objectives.map(o => {
    const state = !o.attempted ? ['not-yet', 'Not tried yet'] : o.attempted < 2 ? ['early', o.missed ? 'Too early to tell' : 'Good start'] : o.missed === 0 ? ['good', 'Going well'] : (o.missed / o.attempted) >= 0.5 ? ['work', 'Needs more work'] : ['mixed', 'Getting there'];
    return el('li', { class: 'sl-obj sl-obj--' + state[0] }, el('span', { class: 'sl-obj-name' }, o.name),
      el('span', { class: 'sl-obj-state' }, el('span', { class: 'sl-obj-icon', 'aria-hidden': 'true' }, { good: '✓', mixed: '↗', work: '!', 'not-yet': '–', early: '·' }[state[0]]), state[1]),
      el('span', { class: 'sl-obj-n' }, o.attempted ? `${o.attempted - o.missed} of ${o.attempted} right first try` : ''));
  }));
  page.appendChild(el('section', { class: 'sl-block', 'aria-labelledby': 'obj-title' }, el('h3', { class: 'sl-h3', id: 'obj-title' }, 'By skill'),
    tried.length ? null : el('p', { class: 'sl-note' }, 'Answer some questions to see this.'), objList,
    s.needsWork.length ? el('p', null, el('b', null, 'May need more work: '), s.needsWork.join('; ') + '.') : null));

  // Review: every question tried, with the original question and your answers
  const done = QUESTIONS.filter(q => st.questions[q.id] && (st.questions[q.id].attempts || st.questions[q.id].revealed));
  if (done.length) {
    const list = el('ol', { class: 'sl-review' }, done.map(q => {
      const r = st.questions[q.id];
      return el('li', null, el('details', null,
        el('summary', null, `${q.set === 'transfer' ? 'Challenge' : 'Level ' + q.level} · ${q.skill}`, el('span', { class: 'sl-review-mark' }, r.correct ? (r.firstTry ? ' ✓ first try' : ' ✓') : r.revealed ? ' • solution shown' : ' ! not yet')),
        el('p', null, q.prompt), q.math ? el('p', null, q.math.join('   ')) : null,
        el('p', { class: 'sl-mini' }, 'Your answers'),
        el('ul', null, r.answers.map(a => el('li', null, `${a.correct ? '✓' : '✗'} ${a.answer}`))),
        el('p', { class: 'sl-mini' }, 'Solution'), el('p', null, q.explanation),
        el('a', { href: q.set === 'transfer' ? '#challenge' : '#practice/' + q.level }, 'Go to this set')));
    }));
    page.appendChild(el('section', { class: 'sl-block', 'aria-labelledby': 'rev-title' }, el('h3', { class: 'sl-h3', id: 'rev-title' }, 'Review your answers'), list));
  }

  page.appendChild(el('section', { class: 'sl-block' },
    el('p', { class: 'sl-note' }, `Started ${day(s.startedAt)}. Progress is saved in this browser only${ctx.studentId ? '' : ' (no account needed)'}.`),
    button('Start over (clears all progress)', () => { if (window.confirm('Clear all your progress in this lab?')) { P.reset(); ctx.go('intro'); } }, 'sl-btn--quiet')));
  return page;
}

function tile(label, value, sub) {
  return el('li', { class: 'sl-tile' }, el('p', { class: 'sl-tile-label' }, label), el('p', { class: 'sl-tile-value' }, value), sub ? el('p', { class: 'sl-tile-sub' }, sub) : null);
}
