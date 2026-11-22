// ============================================================
// Teacher Curriculum: tells a signed-in visitor whether the full lesson
// plans are open to them (the database decides: teacher_curriculum_access()).
// ============================================================
const box = document.querySelector('[data-tc-access]');
const A = window.MathleteAuth;

async function check() {
  if (!box || !A || !A.configured || !A.hasStoredSession()) return;
  const st = await A.status();
  if (!st.user) return;
  try {
    const sb = await A.client();
    const res = await sb.rpc('teacher_curriculum_access');
    if (res.error) return;
    const p = document.createElement('p');
    p.className = 'tc-access-text';
    if (res.data && res.data.teacher) {
      box.classList.add('tc-access--ok');
      p.textContent = 'You’re signed in as a teacher: every lesson plan, worksheet and answer key is open to you.';
    } else {
      p.textContent = 'You’re signed in, but your account isn’t a teacher account, so you’ll see lesson overviews only. Instructors: ask your school’s Mathlete administrator for access.';
    }
    box.replaceChildren(p);
    box.hidden = false;
  } catch (e) { /* leave the default note */ }
}
check();
