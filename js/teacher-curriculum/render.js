// ============================================================
// Teacher Curriculum: the lesson plan components (PRD section 5).
//
// renderLesson(lesson) builds the full plan from a lesson's data; every
// lesson uses the same components, so they all look and work alike.
// Anything only a teacher should see is marked data-teacher, which the
// "Student view" switch and the worksheet print hide.
// Never innerHTML: lesson text goes through richNodes() (text nodes).
// ============================================================
import { richNodes, mathNode } from './math.js';
import { graphSvg } from './graph.js';

export const KINDS = { tool: 'Interactive Mathlete Tool', lab: 'Mathlete MTB Lab', classroom: 'MTB Classroom Activity', problem: 'MTB Problem-Based Exercise' };
export const LEVELS = { concept: 'Check the idea', standard: 'Core practice', mtb: 'On the trail', challenge: 'Extension' };

// ---------- DOM helpers ----------
export function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  put(e, kids);
  return e;
}
function put(e, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    e.append(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
  }
}
const R = s => richNodes(s);                       // rich text -> nodes
const P = (s, cls) => el('p', { class: cls }, R(s));

function section(id, n, title, opts, ...kids) {
  return el('section', { class: 'tc-sec' + (opts.cls ? ' ' + opts.cls : ''), id, 'aria-labelledby': id + '-h', 'data-teacher': opts.teacher },
    el('h2', { class: 'tc-sec-title', id: id + '-h' }, el('span', { class: 'tc-sec-n' }, String(n)), title,
      opts.teacher ? el('span', { class: 'tc-teacher-tag' }, 'Teacher only') : null),
    kids);
}
function figure(g, caption) {
  return el('figure', { class: 'tc-figure' }, graphSvg(g, caption || 'Diagram'), caption ? el('figcaption', {}, R(caption)) : null);
}
function reveal(label, ...kids) {
  // An expandable answer (PRD component 10). Teacher-only.
  return el('details', { class: 'tc-reveal', 'data-teacher': true }, el('summary', {}, label), el('div', { class: 'tc-reveal-body' }, kids));
}
function steps(list) {
  return el('ol', { class: 'tc-steps' }, list.map(s => el('li', {}, R(s))));
}

// ---------- 4. mathematical foundation blocks ----------
function block(b) {
  if ('p' in b) return P(b.p);
  if ('formula' in b) return el('div', { class: 'tc-formula' },
    b.name ? el('p', { class: 'tc-formula-name' }, b.name) : null,
    el('div', { class: 'tc-formula-math' }, mathNode(b.formula, true)),
    b.note ? P(b.note, 'tc-formula-note') : null);
  if ('graph' in b) return figure(b.graph, b.caption);
  if ('example' in b) return workedExample(b.example);
  if ('note' in b) return el('aside', { class: 'tc-callout' + (b.kind ? ' tc-callout--' + b.kind : '') },
    b.title ? el('p', { class: 'tc-callout-title' }, b.title) : null, P(b.note));
  if ('list' in b) return el('ul', { class: 'tc-list' }, b.list.map(x => el('li', {}, R(x))));
  if ('steps' in b) return steps(b.steps);
  if ('table' in b) return table(b.table);
  return null;
}
function table(t) {
  return el('div', { class: 'tc-table-wrap' }, el('table', { class: 'tc-table' },
    t.caption ? el('caption', {}, R(t.caption)) : null,
    el('thead', {}, el('tr', {}, t.head.map(h => el('th', { scope: 'col' }, R(h))))),
    el('tbody', {}, t.rows.map(r => el('tr', {}, r.map(c => el('td', {}, R(String(c)))))))));
}
function workedExample(x) {
  return el('div', { class: 'tc-example' },
    el('p', { class: 'tc-example-label' }, x.title || 'Worked example'),
    P(x.q, 'tc-example-q'),
    x.graph ? figure(x.graph, x.caption) : null,
    steps(x.steps),
    el('p', { class: 'tc-example-answer' }, el('span', {}, 'Answer: '), R(x.answer)));
}

// ---------- 6. teaching plan ----------
export function scaleMinutes(stages, total) {
  // Largest-remainder rounding: every stage keeps at least 1 minute and the
  // stages always add up to the class length.
  const sum = stages.reduce((n, s) => n + s.min, 0);
  const raw = stages.map(s => Math.max(1, s.min * total / sum));
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } });
  while (left < 0) { const i = out.indexOf(Math.max(...out)); out[i]--; left++; }
  return out;
}
function timeline(L) {
  return el('ol', { class: 'tc-timeline' }, L.stages.map((s, i) => el('li', { class: 'tc-stage' },
    el('div', { class: 'tc-stage-time' }, el('span', { class: 'tc-stage-min', 'data-stage-min': i }, String(s.min)), el('span', {}, 'min')),
    el('div', { class: 'tc-stage-body' },
      el('h3', { class: 'tc-stage-name' }, s.name),
      el('div', { class: 'tc-stage-grid' },
        el('div', { class: 'tc-stage-col' }, el('p', { class: 'tc-mini' }, 'Teacher'), P(s.teach),
          s.show ? el('div', { class: 'tc-stage-show' }, R(s.show)) : null),
        el('div', { class: 'tc-stage-col' }, el('p', { class: 'tc-mini' }, 'Students'), P(s.students))),
      s.ask && s.ask.length ? el('div', { class: 'tc-ask' }, el('p', { class: 'tc-mini' }, 'Ask'), el('ul', {}, s.ask.map(q => el('li', {}, R(q))))) : null,
      el('p', { class: 'tc-expect' }, el('span', { class: 'tc-mini' }, 'Look for '), R(s.expect))))));
}

// ---------- 7. the activity ----------
function activity(L) {
  const A = L.activity, tool = L.context && L.context.tool;
  return el('article', { class: 'tc-activity' },
    el('header', { class: 'tc-activity-head' },
      el('p', { class: 'tc-launch-kind' }, KINDS[A.kind]),
      el('h3', { class: 'tc-activity-title' }, R(A.title)),
      P(A.objective, 'tc-activity-obj'),
      tool ? el('a', { class: 'button', href: tool.route, target: '_blank', rel: 'noopener' }, 'Open ' + tool.name + ' ',
        el('span', { 'aria-hidden': 'true' }, '↗'), el('span', { class: 'visually-hidden' }, ' (opens in a new tab)')) : null),
    el('div', { class: 'tc-activity-meta' },
      el('div', {}, el('p', { class: 'tc-mini' }, 'Connection to the math'), P(A.connection)),
      el('div', {}, el('p', { class: 'tc-mini' }, 'Materials and technology'), el('ul', { class: 'tc-list' }, A.materials.map(m => el('li', {}, R(m)))))),
    el('div', { class: 'tc-activity-cols' },
      el('div', { class: 'tc-activity-col tc-activity-col--teacher', 'data-teacher': true }, el('h4', {}, 'Teacher instructions'), steps(A.teacher)),
      el('div', { class: 'tc-activity-col tc-activity-col--student' }, el('h4', {}, 'Student instructions'), steps(A.students))),
    el('div', { class: 'tc-investigate' }, el('h4', {}, 'Questions to investigate'),
      el('ol', {}, A.investigate.map((q, i) => el('li', {}, R(q), reveal('Expected answer', P(A.answers[i])))))),
    el('div', { class: 'tc-outcomes' }, el('h4', {}, 'Expected learning outcomes'), el('ul', { class: 'tc-list' }, A.outcomes.map(o => el('li', {}, R(o))))));
}

// ---------- 8–10. practice ----------
function guided(L) {
  return el('ol', { class: 'tc-problems' }, L.guided.map((g, i) => el('li', { class: 'tc-problem' },
    el('div', { class: 'tc-problem-head' }, el('span', { class: 'tc-problem-n' }, 'Example ' + (i + 1)),
      el('span', { class: 'tc-tag' }, g.concept), g.mtb ? el('span', { class: 'tc-tag tc-tag--mtb' }, 'MTB') : null),
    P(g.q, 'tc-problem-q'),
    g.graph ? figure(g.graph, g.caption) : null,
    reveal('Step-by-step solution', steps(g.steps), el('p', { class: 'tc-answer' }, el('span', {}, 'Answer: '), R(g.answer))))));
}
function practice(L) {
  let n = 0;
  return Object.entries(LEVELS).map(([lv, label]) => {
    const items = L.practice.filter(p => p.level === lv);
    if (!items.length) return null;
    return el('div', { class: 'tc-level' }, el('h3', { class: 'tc-level-title' }, label),
      el('ol', { class: 'tc-qlist', start: n + 1 }, items.map(p => { n++; return el('li', { class: 'tc-q' },
        P(p.q), p.graph ? figure(p.graph, p.caption) : null, el('div', { class: 'tc-workspace-lines', 'aria-hidden': 'true' }),
        reveal('Answer', P(p.a), p.work ? steps(p.work) : null)); })));
  });
}
function exitTicket(L) {
  return el('ol', { class: 'tc-exit' }, L.exit.map((x, i) => el('li', { class: 'tc-exit-card' },
    el('p', { class: 'tc-exit-n' }, 'Question ' + (i + 1)), P(x.q, 'tc-problem-q'),
    x.graph ? figure(x.graph, x.caption) : null,
    el('div', { class: 'tc-workspace-lines tc-workspace-lines--short', 'aria-hidden': 'true' }),
    reveal('Answer and explanation', el('p', { class: 'tc-answer' }, el('span', {}, 'Answer: '), R(x.a)), P(x.why, 'tc-why')))));
}

// ---------- 11. teacher resources ----------
function resources(L) {
  const R0 = L.resources;
  let n = 0;
  const key = el('div', { class: 'tc-res-card tc-res-card--key' }, el('h3', {}, 'Answer key'),
    el('p', { class: 'tc-mini' }, 'Independent practice'),
    el('ol', { class: 'tc-key' }, L.practice.map(p => { n++; return el('li', {}, R(p.a)); })),
    el('p', { class: 'tc-mini' }, 'Exit ticket'),
    el('ol', { class: 'tc-key' }, L.exit.map(x => el('li', {}, R(x.a)))));
  return el('div', { class: 'tc-res-grid' },
    key,
    el('div', { class: 'tc-res-card' }, el('h3', {}, 'Teaching notes'), el('ul', { class: 'tc-list' }, R0.notes.map(x => el('li', {}, R(x))))),
    el('div', { class: 'tc-res-card tc-res-card--wide' }, el('h3', {}, 'Common misconceptions'),
      el('dl', { class: 'tc-miscon' }, R0.misconceptions.map(([m, fix]) => el('div', {}, el('dt', {}, R(m)), el('dd', {}, R(fix)))))),
    el('div', { class: 'tc-res-card' }, el('h3', {}, 'Differentiation'),
      el('p', { class: 'tc-mini' }, 'Support'), el('ul', { class: 'tc-list' }, R0.support.map(x => el('li', {}, R(x)))),
      el('p', { class: 'tc-mini' }, 'Extend'), el('ul', { class: 'tc-list' }, R0.extend.map(x => el('li', {}, R(x)))),
      R0.ell ? [el('p', { class: 'tc-mini' }, 'Language support'), el('ul', { class: 'tc-list' }, R0.ell.map(x => el('li', {}, R(x))))] : null),
    el('div', { class: 'tc-res-card' }, el('h3', {}, 'Challenge questions'),
      el('ol', { class: 'tc-qlist' }, R0.challenge.map(c => el('li', { class: 'tc-q' }, P(c.q), reveal('Answer', P(c.a)))))),
    el('div', { class: 'tc-res-card tc-res-card--print' }, el('h3', {}, 'Printable student worksheet'),
      el('p', {}, 'The independent practice and exit ticket on their own, with room to work and no answers.'),
      el('button', { type: 'button', class: 'button button--ghost', 'data-print': 'worksheet' }, 'Print the worksheet')));
}

// ---------- the whole plan ----------
export function renderLesson(L) {
  const frag = document.createDocumentFragment();
  frag.append(
    section('objectives', 2, 'Learning objectives', {},
      el('p', { class: 'tc-sec-lead' }, 'By the end of this lesson, students will be able to:'),
      el('ul', { class: 'tc-objectives' }, L.objectives.map(o => el('li', {}, R(o))))),
    section('question', 3, 'Essential question', {}, el('blockquote', { class: 'tc-eq' }, P(L.question))),
    section('math', 4, 'Mathematical foundation', {},
      el('div', { class: 'tc-vocab' }, el('h3', { class: 'tc-sub' }, 'Key vocabulary'),
        el('dl', { class: 'tc-vocab-grid' }, L.vocab.map(([t, d]) => el('div', { class: 'tc-term' }, el('dt', {}, R(t)), el('dd', {}, R(d)))))),
      el('div', { class: 'tc-blocks' }, L.foundation.map(block))),
    section('mtb', 5, 'MTB connection', { cls: 'tc-sec--mtb' },
      L.image ? el('figure', { class: 'tc-photo' }, el('img', { src: L.image.src, alt: L.image.alt, loading: 'lazy', decoding: 'async' }),
        L.image.caption ? el('figcaption', {}, L.image.caption) : null) : null,
      L.mtb.text.map(p => P(p)),
      el('table', { class: 'tc-pairs' }, el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'The math'), el('th', { scope: 'col' }, 'On the trail'))),
        el('tbody', {}, L.mtb.pairs.map(p => el('tr', {}, el('td', {}, R(p[0])), el('td', {}, R(p[1])))))),
      L.mtb.assumptions ? el('aside', { class: 'tc-callout tc-callout--model' }, el('p', { class: 'tc-callout-title' }, 'Model assumptions'), P(L.mtb.assumptions)) : null),
    section('timeline', 6, 'Teaching plan', { teacher: true },
      el('div', { class: 'tc-length' }, el('label', { for: 'tc-length' }, 'Class length'),
        el('select', { id: 'tc-length', 'data-class-length': true }, [40, 45, 50, 55, 60, 75, 90].concat(L.minutes).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)
          .map(m => el('option', { value: m, selected: m === L.minutes }, m + ' minutes'))),
        el('p', { class: 'tc-length-note' }, 'Stage timings rescale to fit. Planned for ' + L.minutes + ' minutes.')),
      timeline(L)),
    section('activity', 7, 'MTB activity', {}, activity(L)),
    section('guided', 8, 'Guided practice', {}, P('Work these together. Each builds on the last; solutions are under each example.', 'tc-sec-lead'), guided(L)),
    section('practice', 9, 'Independent practice', {}, practice(L)),
    section('exit', 10, 'Assessment: exit ticket', {}, P('About five minutes, on paper, at the end of class. It checks the lesson’s objectives, not the activity.', 'tc-sec-lead'), exitTicket(L)),
    section('resources', 11, 'Teacher resources', { teacher: true }, resources(L))
  );
  return frag;
}
