// ============================================================
// Teacher Curriculum: a lesson page.
//
// The page arrives with the lesson's public overview (objectives, essential
// question, MTB connection, activity). For a signed-in teacher this asks
// Supabase for the full plan (teacher_lesson(), supabase/teacher-curriculum.sql)
// and replaces the overview with it. Whether someone is a teacher is decided
// by the database, never here: a student gets {status: 'not_teacher'} and
// no lesson data at all.
// ============================================================
import { renderLesson, scaleMinutes, el } from './render.js';

const work = document.querySelector('[data-lesson]');
const plan = document.querySelector('[data-lesson-plan]');
const tools = document.querySelector('[data-teacher-tools]');
const A = window.MathleteAuth;
const id = work && work.getAttribute('data-lesson');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
};

function lockedMessage(kind) {
  const box = document.querySelector('[data-locked-msg]');
  if (!box) return;
  const text = {
    not_teacher: 'You’re signed in, but your account isn’t a teacher account. If you teach with Mathlete MTB, ask your school’s Mathlete administrator to make you an instructor.',
    missing: 'This lesson plan hasn’t been uploaded yet. Check back soon.',
    error: 'The lesson plan couldn’t be loaded just now. Check your connection and reload the page.'
  }[kind];
  box.replaceChildren(document.createTextNode(text));
}

async function load() {
  if (!A || !A.configured || !A.hasStoredSession()) return;
  const st = await A.status();
  if (!st.user) return;
  try {
    const sb = await A.client();
    const res = await sb.rpc('teacher_lesson', { p_id: id });
    if (res.error) throw res.error;
    const out = res.data || {};
    if (out.status !== 'ok') return lockedMessage(out.status === 'missing' ? 'missing' : 'not_teacher');
    show(out.lesson, out.review);
  } catch (e) {
    lockedMessage('error');
  }
}

function show(L, review) {
  plan.replaceChildren(renderLesson(L));
  if (review) plan.prepend(el('p', { class: 'tc-review-note' }, 'In review: only platform admins see this lesson until it’s published.'));
  document.documentElement.classList.add('tc-has-plan');
  wireTools(L);
  wireLength(L);
  wireToc();
  // Arriving from a link to a section (#practice) after the plan renders.
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
}

// ---------- toolbar: print, worksheet, student view ----------
function wireTools(L) {
  const studentBtn = el('button', { type: 'button', class: 'tc-tool', 'aria-pressed': 'false' }, 'Student view');
  tools.replaceChildren(
    el('button', { type: 'button', class: 'tc-tool', 'data-print': 'plan' }, 'Print lesson plan'),
    el('button', { type: 'button', class: 'tc-tool', 'data-print': 'worksheet' }, 'Print student worksheet'),
    studentBtn,
    el('p', { class: 'tc-tools-note' }, 'Student view hides the teaching plan, solutions and answer key, for projecting in class.'));
  tools.hidden = false;
  studentBtn.addEventListener('click', () => {
    const on = !document.documentElement.classList.contains('tc-student');
    document.documentElement.classList.toggle('tc-student', on);
    studentBtn.setAttribute('aria-pressed', String(on));
    studentBtn.textContent = on ? 'Teacher view' : 'Student view';
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-print]');
    if (b) printAs(b.getAttribute('data-print'));
  });
}

let opened = [];
function printAs(mode) {
  const html = document.documentElement;
  html.classList.add(mode === 'worksheet' ? 'tc-print-worksheet' : 'tc-print-plan');
  if (mode === 'plan') {
    // A printed plan shows every solution: open them, and put them back after.
    opened = [...document.querySelectorAll('.tc-plan details:not([open])')];
    opened.forEach(d => { d.open = true; });
  }
  window.print();
}
window.addEventListener('afterprint', () => {
  document.documentElement.classList.remove('tc-print-worksheet', 'tc-print-plan');
  opened.forEach(d => { d.open = false; });
  opened = [];
});

// ---------- class length: rescale the stage timings ----------
function wireLength(L) {
  const sel = document.querySelector('[data-class-length]');
  if (!sel) return;
  const apply = total => {
    const mins = scaleMinutes(L.stages, total);
    mins.forEach((m, i) => { const t = document.querySelector(`[data-stage-min="${i}"]`); if (t) t.textContent = String(m); });
    const d = document.querySelector('[data-duration]');
    if (d) d.textContent = String(total);
  };
  const saved = +store.get('tc-class-length');
  if (saved && [...sel.options].some(o => +o.value === saved)) { sel.value = String(saved); apply(saved); }
  sel.addEventListener('change', () => { store.set('tc-class-length', sel.value); apply(+sel.value); });
}

// ---------- contents: mark the section on screen ----------
function wireToc() {
  const links = new Map([...document.querySelectorAll('[data-toc]')].map(a => [a.getAttribute('data-toc'), a]));
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.removeAttribute('aria-current'));
      const a = links.get(en.target.id);
      if (a) a.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.tc-plan .tc-sec[id]').forEach(s => io.observe(s));
}

if (work && plan) load();
