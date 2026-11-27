// The Dream Line series: the tutor panel and the results-screen blocks, shared
// by The Dream Line Project (Unit 1) and The Dream Line Goes Pro (Unit 2) so
// both units have one tutor interface and one kind of report. Styles live in
// styles/dream-line.css (both units load it).

import { el, button } from '../../lesson-kit/dom.js';
import { tutorOf, jump, predictionStats } from './labs.js';

// cfg: { missions, sections: { missionId: [[elementId, label]] }, written: { key: label }, questions, stageWord }
export function tutorPanel(ctx, cfg) {
  const P = ctx.progress, T = tutorOf(P), stage = cfg.stageWord || 'Stage';
  const toggle = (k, label, help) => {
    const cid = 'dl-tut-' + k, cb = el('input', { type: 'checkbox', id: cid });
    cb.checked = !!T[k];
    cb.addEventListener('change', () => { P.setData('tutor', { ...tutorOf(P), [k]: cb.checked }); });
    return el('div', { class: 'dl-tut-opt' }, el('label', { class: 'dl-check', for: cid }, cb, ' ', el('b', null, label)), el('p', { class: 'ls-small' }, help));
  };
  const written = Object.entries(P.state.written).filter(([k, v]) => String(v).trim()).map(([k, v]) => [k, v, k.includes(':working')]);
  const missionOf = id => cfg.missions.find(m => m.graded.includes(id) || (m.practice && m.practice.ids && m.practice.ids.includes(id)));
  const wrong = Object.entries(P.state.questions).filter(([, r]) => r.attempts > 0 && (!r.firstTry || !r.correct)).map(([k, r]) => {
    const id = k.split('|')[0], q = (cfg.questions || {})[id], m = missionOf(id);
    return el('li', null, m ? el('a', { href: '#' + m.id }, `${stage} ${m.n}`) : el('span', null, k.includes('|r') ? 'Certification' : 'Practice'), ': ', (q && q.prompt) || id,
      el('span', { class: 'ls-small' }, ` · ${r.attempts} attempt${r.attempts === 1 ? '' : 's'}${r.correct ? ', right in the end' : r.revealed ? ', solution shown' : ''}${r.answer ? ' · last answer “' + String(r.answer).slice(0, 80) + '”' : ''}`));
  });
  return el('details', { class: 'ls-card dl-tutor' }, el('summary', null, el('span', { class: 'dl-wb-tag' }, 'For tutors'), ' Tutor mode'),
    el('p', { class: 'ls-small' }, 'Settings apply on this device and never reset progress. Solutions shown early count as help in the report, not as independent work.'),
    el('div', { class: 'dl-tut-grid' },
      toggle('predict', 'Require predictions', 'Prediction-first steps must be committed before the calculation unlocks.'),
      toggle('hints', 'Show hints', 'Turn off to hide the hint buttons.'),
      toggle('reveal', 'Allow solutions any time', 'Show the solution button before two tries.')),
    el('p', { class: 'ls-kicker' }, 'Go to a challenge'),
    el('div', { class: 'dl-tut-jumps' }, cfg.missions.map(m => el('div', null, el('p', { class: 'dl-tut-m' }, `${stage} ${m.n}: ${m.short}`),
      el('ul', null, (cfg.sections[m.id] || []).map(([id, label]) => el('li', null, el('a', { href: '#' + m.id, onclick: () => { jump.target = id; } }, label))))))),
    el('p', { class: 'ls-kicker' }, 'Written reasoning'),
    written.length ? el('ul', { class: 'dl-tut-written' }, written.map(([k, v, w]) => el('li', null, el('b', null, (w ? 'Working for ' + k.split(':')[0].split('|')[0] : (cfg.written || {})[k] || k) + (P.getData('review:' + k, false) ? ' · flagged for review' : '') + ': '), String(v))))
      : el('p', { class: 'ls-small' }, 'No written responses yet.'),
    el('p', { class: 'ls-kicker' }, 'Incorrect responses to revisit'),
    wrong.length ? el('ul', { class: 'dl-tut-written' }, wrong.slice(0, 30)) : el('p', { class: 'ls-small' }, 'None yet.'));
}

// Accuracy by learning objective, help vs independent, review list, next steps and the action buttons.
// cfg: { objectives: [{ id, name, ideas }], kinds, questions, ideas, missions, stageWord, nextUnit, park: element|null, buttons: { view: [label, href] } }
export function objectiveRows(P, objectives, kinds) {
  const rows = objectives.map(o => ({ ...o, answered: 0, firstTry: 0, right: 0, hints: 0, revealed: 0, help: 0, attempts: 0 }));
  for (const [k, r] of Object.entries(P.state.questions)) {
    if (!(r.attempts > 0 || r.revealed)) continue;
    const ideas = kinds[k.split('|')[0]] || [];
    for (const o of rows) if (ideas.some(i => o.ideas.includes(i))) {
      o.answered++; o.attempts += r.attempts; if (r.firstTry && !r.hints && !r.revealed) o.firstTry++;
      if (r.correct && !r.revealed) o.right++; if (r.correct && !r.revealed && (!r.firstTry || r.hints)) o.help++;
      o.hints += r.hints; if (r.revealed) o.revealed++;
    }
  }
  return rows;
}
export function reportBlocks(ctx, s, cfg) {
  const P = ctx.progress, rows = objectiveRows(P, cfg.objectives, cfg.kinds), recs = Object.entries(P.state.questions).filter(([, r]) => r.attempts > 0 || r.revealed);
  const indep = recs.filter(([, r]) => r.firstTry && !r.hints && !r.revealed).length, helped = recs.filter(([, r]) => r.correct && !r.revealed && (!r.firstTry || r.hints)).length, shown = recs.filter(([, r]) => r.revealed).length;
  const review = recs.filter(([, r]) => r.revealed || r.attempts >= 3).slice(0, 10).map(([k]) => { const id = k.split('|')[0], qd = cfg.questions[id]; return qd ? qd.prompt : (k.includes('|r') ? 'Final certification: ' + id : 'Independent challenge: ' + id); });
  const pr = predictionStats(P), cert = s.certification, stage = cfg.stageWord || 'Stage';
  const pct = (a, b) => (b ? Math.round(100 * a / b) + '%' : '—');
  return el('div', null,
    ctx.card('Accuracy by learning objective', cfg.objectivesTitle || 'By topic',
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ms-report' }, el('thead', null, el('tr', null, ['Objective', 'Answered', 'Attempts', 'Independent (first try, no hints)', 'Right after help', 'Solutions shown'].map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', null, rows.map(o => el('tr', null, el('th', { scope: 'row' }, o.name), el('td', { class: 'ms-mono' }, String(o.answered)), el('td', { class: 'ms-mono' }, String(o.attempts)), el('td', { class: 'ms-mono' }, o.answered ? `${o.firstTry} (${pct(o.firstTry, o.answered)})` : '—'), el('td', { class: 'ms-mono' }, String(o.help)), el('td', { class: 'ms-mono' }, String(o.revealed))))))),
      el('dl', { class: 'ms-stats' }, [['Answered independently', String(indep)], ['Right after hints or retries', String(helped)], ['Solutions shown', String(shown)], ['Predictions made', String(pr.made)], ['Predictions in range', pr.judged ? `${pr.right} of ${pr.judged}` : '—'],
        ['Certification', cert ? `${cert.right} of ${cert.total}, ${cert.firstTry} independent` : s.unlocked ? 'unlocked' : 'locked']].map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))),
      el('p', { class: 'ls-small' }, 'Independent means right on the first try with no hints. Answers reached after hints, retries or a shown solution are practice with help, not demonstrated mastery, and a correct prediction is never counted as mastery.')),
    review.length ? ctx.card('For review', 'Questions needing more practice', el('ul', { class: 'ms-miscon' }, review.map(t => el('li', null, t)))) : null,
    s.practice.length ? ctx.card('Suggested next', 'Where to go next', el('ul', { class: 'ms-miscon' }, s.practice.map(i => { const m = cfg.missions.find(mm => mm.graded.some(id => (cfg.kinds[id] || []).includes(i))); return el('li', null, cfg.ideas[i], m ? [' · ', el('a', { href: '#' + m.id }, `revisit ${stage} ${m.n}: ${m.short}`)] : null); })),
      cfg.nextUnit ? el('p', { class: 'ls-small' }, cfg.nextUnit) : null) : null,
    cfg.park || null,
    el('div', { class: 'ls-actions dl-report-btns' },
      el('a', { class: 'ls-btn ls-btn--quiet', href: '#board' }, 'Revisit a stage'),
      s.unlocked ? button(cfg.retryLabel || 'Retry the certification', () => { P.setData('finalRound', P.getData('finalRound', 1) + (s.final.done ? 1 : 0)); location.hash = '#final'; }, 'ls-btn--quiet') : null,
      el('a', { class: 'ls-btn ls-btn--primary', href: cfg.buttons.view[1] }, cfg.buttons.view[0])));
}
