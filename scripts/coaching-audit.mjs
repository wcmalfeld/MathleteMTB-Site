#!/usr/bin/env node
// Regenerates docs/COACHING-CONTENT-AUDIT.md from content/coaching/seed.json.
//   node scripts/coaching-audit.mjs
const root = new URL('..', import.meta.url).pathname;
const [inp, out] = [root + 'content/coaching/seed.json', root + 'docs/COACHING-CONTENT-AUDIT.md'];
const seed = JSON.parse(readFileSync(inp, 'utf8'));
const S = new Map(seed.sources.map(s => [s.id, s]));
const K = new Map(seed.skills.map(s => [s.id, s]));
const MARK = 'SPECIALIST AUTHORING REQUIRED';
const ACCESS = { public_free_instruction: 'Free', public_outline_paid_lesson: 'Paid course outline', public_coaching_framework: 'Coach education', public_reference_index: 'Reference index', expert_demonstration: 'Athlete demonstration', mathlete_original: 'Mathlete original' };
const VER = { text_reviewed: 'Text reviewed', video_only: 'Video only', not_reachable: 'Could not open', not_checked: 'Not checked' };
const esc = t => String(t || '').replace(/\|/g, '\\|');

const PACK = {
  'jump-performance': 'A-JUMP-01', 'jump-response': 'A-JUMP-02', 'landing-flight-control': 'A-JUMP-03', 'jump-lines': 'A-JUMP-04',
  whip: 'T-TRICK-01', tabletop: 'T-TRICK-02', 'trick-180': 'T-TRICK-03', 'trick-360': 'T-TRICK-04', 'no-foot-can': 'T-TRICK-05', 'no-hander': 'T-TRICK-06',
  barspin: 'T-TRICK-07', tailwhip: 'T-TRICK-08', superman: 'T-TRICK-09', 'indian-air': 'T-TRICK-10', backflip: 'T-TRICK-11', frontflip: 'T-TRICK-12',
  'drop-360': 'T-TRICK-13', 'trick-combos': 'T-TRICK-14',
  'dh-body-position': 'DH-PERF-01', 'dh-cornering': 'DH-PERF-02', 'brake-to-go-faster': 'DH-PERF-03', 'line-choice': 'DH-PERF-04', 'race-vision': 'DH-PERF-05',
  'steeps-rock-rolls': 'DH-PERF-06', 'rough-terrain': 'DH-PERF-07', 'linking-sections': 'DH-PERF-08', 'low-grip-conditions': 'DH-PERF-09', 'track-walk': 'DH-PERF-10',
  'practice-laps-analysis': 'DH-PERF-11', 'suspension-testing': 'DH-PERF-12', 'race-run-execution': 'DH-PERF-13'
};
const packRisk = { 'jump-lines': '2–3', whip: '2–3', tabletop: '2–3', 'trick-180': '2–3', 'dh-cornering': '2–3', 'brake-to-go-faster': '2–3', 'line-choice': '2–3', 'race-vision': '2–3', 'steeps-rock-rolls': '3 (terrain)', 'rough-terrain': '2–3', 'linking-sections': '2–3', 'low-grip-conditions': '3 (conditions)', 'track-walk': 'educational; riding 2–3', 'practice-laps-analysis': '2–3', 'suspension-testing': 'equipment', 'race-run-execution': '2–3' };

const lines = [];
const P = (...x) => lines.push(...x);
const status = l => {
  const pend = (l.specialist_required || []).length || JSON.stringify(l).includes(MARK);
  return pend ? 'Needs specialist authoring' : 'Ready for editorial review';
};
const prim = l => l.sources.filter(x => x.role === 'primary').map(x => x.id);
const textBacked = l => l.sources.some(x => S.get(x.id).verification === 'text_reviewed' && x.role !== 'further');

P('# Coaching Lab: Advanced Performance content audit', '',
  `Generated from \`content/coaching/seed.json\` for the *Advanced Performance Lesson Pack (v2)*. Sources checked ${seed.sources[0].accessed_on}.`, '',
  'Nothing listed here is approved. Every lesson is a draft by "Mathlete draft" and needs the review shown before it can be published. The CMS enforces this: anything marked SPECIALIST AUTHORING REQUIRED, or with open specialist items, cannot be published, and Class 3 lessons also need a verified specialist coach credited as reviewer.', '');

const adv = seed.lessons.filter(l => PACK[l.skill_id]);
const ready = adv.filter(l => status(l).startsWith('Ready'));
const fnd = seed.lessons.filter(l => l.lesson_type === 'foundation');
P('## Summary', '',
  `- **${adv.length}** lessons drafted from the pack's ${Object.keys(PACK).length} briefs, plus **${fnd.length}** tightened foundation lessons.`,
  `- **${ready.length}** are ready for editorial review (technical content drafted, awaiting a qualified reviewer).`,
  `- **${adv.length - ready.length}** need specialist authoring first: all trick lessons, plus scrubbing and the steeps progression.`,
  `- **${seed.sources.length}** sources in the registry: ${Object.entries(seed.sources.reduce((a, s) => (a[s.verification] = (a[s.verification] || 0) + 1, a), {})).map(([k, v]) => `${v} ${VER[k].toLowerCase()}`).join(', ')}.`,
  `- **${seed.pathways.length}** pathways, including Downhill Speed, Race Craft, Jump Craft and the Trick Library.`, '');

P('## What the research could and couldn’t verify', '',
  'From this environment, pages were reachable only via web search results. Several sources could not be opened (Red Bull renders by script; YouTube, Riding.Guide, Highland and some GSMBC, Pinkbike and MBR pages weren’t reachable). Many reachable pages, especially MTB Hopper trick pages and Pinkbike “How To Bike” episodes, keep all their technique in the embedded video, which couldn’t be watched.', '',
  'So:', '',
  '- Lesson text only attributes a technical point to a source when that point was in the page text (verification *Text reviewed*).',
  '- Video-only and unreachable sources are cited as demonstrations or further learning, never as the basis for a technique claim.',
  '- Trick technique, progressions, corrections and readiness gates are all left as SPECIALIST AUTHORING REQUIRED, as the pack requires.',
  '- Before review, a reviewer should watch the video-only sources for each lesson and check the Mathlete text against them.', '');

P('## Curriculum coverage', '', '| Pack brief | Mathlete skill | Class | Pack risk | Primary sources | Text-verified support | Review standard | Status |', '|---|---|---|---|---|---|---|---|');
for (const l of adv.sort((a, b) => PACK[a.skill_id].localeCompare(PACK[b.skill_id]))) {
  const k = K.get(l.skill_id);
  P(`| ${PACK[l.skill_id]} | \`${k.id}\` ${esc(k.name)} | ${k.safety_class} | ${packRisk[k.id] || (k.safety_class === 3 ? '3' : '2')} | ${prim(l).join(', ')} | ${textBacked(l) ? 'Yes' : '**No**'} | ${esc(l.review_level)} | ${status(l)} |`);
}
P('', '“Text-verified support” means at least one primary or comparison source’s page text was read and supports the lesson. Lessons marked **No** rely on video or unverified sources: the reviewer must supply or confirm the technical basis.', '');

P('## Risk-class decisions', '', 'Where the pack gave a range, we chose:', '',
  '- **Class 2:** whip and tabletop (style on familiar jumps), jump lines, all Class 2–3 downhill lessons, and wet/low-grip riding. Their practical content still needs the stated reviewer, and whip and tabletop can’t publish until a specialist writes their technique.',
  '- **Class 3:** the 180 (aerial rotation and fakie) and every trick from the 360 up, plus technical steeps and rock rolls (pack: “Class 3 depending on terrain”). Class 3 means theory only on the site, coach-led practice, supervised pathway stages, and a verified specialist reviewer before publishing.',
  '- **Class 1:** track walk (on foot) and suspension testing (equipment process). Riding the track remains Class 2 or higher.',
  'Reviewers should confirm or change these.', '');

P('## Outstanding specialist and coach review', '');
const bySection = {};
for (const l of adv) for (const p of l.specialist_required || []) (bySection[l.id] = bySection[l.id] || []).push(p);
for (const l of adv) {
  const k = K.get(l.skill_id);
  const items = bySection[l.id] || [];
  P(`### ${esc(k.name)} (\`${l.id}\`)`, '', `Reviewer: ${l.review_level}.${k.safety_class === 3 ? ' Class 3: credit a verified specialist coach as reviewer.' : ''}`);
  if (items.length) { P(''); for (const p of items) P(`- **${p.section}:** ${p.needs}`); }
  const pendingMistakes = (l.mistakes || []).map(id => seed.mistakes.find(m => m.id === id)).filter(m => m && m.correction.includes(MARK));
  if (pendingMistakes.length) P(`- **mistake corrections:** ${pendingMistakes.map(m => m.name).join(', ')}`);
  const unverified = l.sources.filter(x => x.role !== 'further' && S.get(x.id).verification !== 'text_reviewed').map(x => `${x.id} (${VER[S.get(x.id).verification].toLowerCase()})`);
  if (unverified.length) P(`- **watch or read before review:** ${unverified.join(', ')}`);
  P('');
}
P('The Trick Library pathway also needs a specialist to approve its stage order and set readiness gates.', '');

P('## Source audit', '', '| ID | Title | Creator · Publisher | Access | What we could check | Used by |', '|---|---|---|---|---|---|');
const usedBy = id => seed.lessons.filter(l => l.sources.some(x => x.id === id)).length;
for (const s of seed.sources) P(`| ${s.id} | [${esc(s.title)}](${s.url}) | ${esc([s.creator, s.publisher].filter(Boolean).join(' · '))} | ${ACCESS[s.access]} | ${VER[s.verification]} | ${usedBy(s.id)} lessons |`);
P('', 'Pack source D16 duplicates A02 (GSMBC Advanced Coach FLOW) and is recorded once as `a02`. Sources `x01`–`x08` were found during the audit and are not in the pack.', '',
  'Each source’s notes (what it covers, in our words, and its limitations) are in the CMS under **Sources**. None of these organisations or creators has endorsed Mathlete; they are linked as further learning only.', '');

P('## Traceability checks', '',
  '- Every lesson cites at least one source, and every cited source is in the registry (enforced by tests).',
  '- No lesson gives universal speeds, jump dimensions, brake ratios, tyre pressures, click counts or sag values.',
  '- No trick lesson contains coaching cues or a step-by-step progression; each lists exactly what the specialist must supply.',
  '- Class 3 lessons require coach supervision, name purpose-built facilities, and offer only off-the-bike drills (video review and a coach session brief).',
  '- Disagreements between sources are recorded rather than merged (for example, flat-turn pedal position in the cornering lessons).', '');

writeFileSync(out, lines.join('\n') + '\n');
console.log('wrote', out, lines.length, 'lines;', ready.length, 'ready,', adv.length - ready.length, 'need specialist');
