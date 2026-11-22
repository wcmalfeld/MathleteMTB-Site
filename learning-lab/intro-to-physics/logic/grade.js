// Introduction to Physics: grading. Pure functions (no page), deterministic,
// no AI. Each returns { correct, code, message } with feedback that names
// what to look at again; written answers get encouraging tips, never a mark.

import { CLASSIFY, CATEGORIES, SYSTEMS, MODEL_FACTORS, STATEMENTS, STATEMENT_KINDS, DESIGN, DETECTIVE_STAGES, DETECTIVE_PARTS, CONCEPT_WORDS } from './lesson.js';

const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

// Several categories can be right (PRD 6.5): every pick must apply, and at
// least two of the ones that clearly apply must be picked (or all, if fewer).
export function gradeClassify(id, picks) {
  const c = CLASSIFY[id], ok = [...c.fits, ...c.also];
  if (!picks.length) return { correct: false, code: 'empty', message: 'Pick at least one category.' };
  const wrong = picks.filter(p => !ok.includes(p));
  if (wrong.length) return { correct: false, code: 'extra-' + wrong[0], message: `${CATEGORIES[wrong[0]]} doesn’t really fit this one. Which ideas are actually at work?` };
  const need = Math.min(2, c.fits.length), got = picks.filter(p => c.fits.includes(p)).length;
  if (got < need) return { correct: false, code: 'too-few', message: 'Right so far, but more than one idea is at work here. Look again.' };
  return { correct: true, code: 'correct', missed: c.fits.filter(f => !picks.includes(f)) };
}

export function gradeSystem(id, picks) {
  const s = SYSTEMS[id];
  const extra = picks.filter(p => !s.required.includes(p) && !s.optional.includes(p));
  if (extra.length) return { correct: false, code: 'extra-' + extra[0], message: `${s.objects[extra[0]]}: ${s.notes[extra[0]] || 'that’s outside what this question is about.'}` };
  const missing = s.required.filter(r => !picks.includes(r));
  if (missing.length) return { correct: false, code: 'missing', message: `Something the question is about is still outside your system: think about ${missing.length === 1 ? 'what' : 'which parts'} actually ${missing.length === 1 ? 'does' : 'do'} the thing you’re studying.` };
  return { correct: true, code: 'correct' };
}

export function gradeModel(picks) {
  const left = MODEL_FACTORS.filter(f => f[2]).map(f => f[0]);
  const kept = picks.filter(p => !left.includes(p));
  if (kept.length) { const f = MODEL_FACTORS.find(x => x[0] === kept[0]); return { correct: false, code: 'kept-' + kept[0], message: `${f[1]} is still in the model: it’s one of the few things the model keeps.` }; }
  const missing = left.filter(l => !picks.includes(l));
  if (missing.length) return { correct: false, code: 'missing', message: `Good so far. The model leaves out ${missing.length} more. Compare the two pictures again.` };
  return { correct: true, code: 'correct' };
}

export function gradeSort(answers) {
  const blanks = STATEMENTS.filter(([id]) => !answers[id]);
  if (blanks.length) return { correct: false, code: 'empty', message: 'Sort every statement first.' };
  const wrong = STATEMENTS.filter(([id, , k]) => answers[id] !== k);
  if (!wrong.length) return { correct: true, code: 'correct' };
  const [, text, k] = wrong[0];
  const tip = { observation: 'It’s something you could see or measure directly.', explanation: 'It gives a reason, using a physics idea.', prediction: 'It says what will happen next.' }[k];
  return { correct: false, code: 'wrong-' + k, message: `${wrong.length} to look at again. “${text}” ${tip}`, wrong: wrong.map(w => w[0]) };
}

export function gradeDesign(d) {
  const notes = [], parts = {};
  const iv = DESIGN.iv.find(x => x[0] === d.iv), dv = DESIGN.dv.find(x => x[0] === d.dv);
  parts.iv = !!(iv && iv[2]); parts.dv = !!(dv && dv[2]);
  if (!d.iv || !d.dv) return { correct: false, code: 'empty', message: 'Choose the independent and dependent variables first.', parts };
  if (!parts.iv) notes.push(d.iv === 'accel' ? 'Acceleration is what you measure, so it’s the dependent variable. What do you change on purpose?' : `${iv[1]} isn’t what this question changes. The question is about steepness.`);
  if (!parts.dv) notes.push(d.dv === 'angle' ? 'The trail angle is what you change: the independent variable. What do you measure?' : `${dv[1]} isn’t what the question asks about. What happens to the bike?`);
  const ctrl = d.controls || [];
  const badCtrl = ctrl.filter(c => !(DESIGN.controls.find(x => x[0] === c) || [])[2]);
  parts.controls = ctrl.length >= 3 && !badCtrl.length;
  if (badCtrl.includes('angle')) notes.push('You can’t keep the trail angle the same: it’s the thing you’re changing.');
  else if (badCtrl.includes('accel')) notes.push('Acceleration is what you measure, so it can’t be held constant.');
  else if (ctrl.length < 3) notes.push(`Pick at least three things to keep the same (you have ${ctrl.length}).`);
  const pr = DESIGN.predictions.find(x => x[0] === d.prediction);
  parts.prediction = !!(pr && pr[2]);
  if (!d.prediction) notes.push('Choose a prediction.');
  else if (!parts.prediction) notes.push('Think about gravity on a slope: on a steeper trail, more of it pulls you along the trail.');
  const words = String(d.hypothesis || '').trim().split(/\s+/).filter(Boolean);
  parts.hypothesis = words.length >= 5;
  if (!parts.hypothesis) notes.push('Write your hypothesis as a full sentence, ideally with a reason (“because…”).');
  const correct = parts.iv && parts.dv && parts.controls && parts.prediction && parts.hypothesis;
  return { correct, code: correct ? 'correct' : (!parts.iv ? 'iv' : !parts.dv ? 'dv' : !parts.controls ? 'controls' : !parts.prediction ? 'prediction' : 'hypothesis'), message: notes[0] || null, notes, parts,
    because: /\bbecause\b|\bsince\b|\bdue to\b/i.test(d.hypothesis || '') };
}

export function gradeDetective(picks) {
  const missing = DETECTIVE_STAGES.filter(st => !(picks[st.id] || []).length);
  if (missing.length) return { correct: false, code: 'empty', message: `Pick at least one concept for ${list(missing.map(m => m.title.toLowerCase()))}.` };
  for (const st of DETECTIVE_STAGES) {
    const bad = (picks[st.id] || []).find(p => !(st.options.find(o => o[0] === p) || [])[2]);
    if (bad) return { correct: false, code: 'wrong-' + st.id, message: `${st.title}: “${st.options.find(o => o[0] === bad)[1]}” doesn’t really happen there. Look again.` };
  }
  return { correct: true, code: 'correct' };
}

// Written parts: complete when every part has a few words. The tips reward
// good thinking; they never mark the student down for vocabulary.
export function writeupFeedback(parts) {
  const words = k => String(parts[k] || '').trim().split(/\s+/).filter(Boolean).length;
  const empty = DETECTIVE_PARTS.filter(([k]) => words(k) < 3).map(p => p[1].split(' · ')[0]);
  const tips = [];
  const has = (k, re) => re.test(String(parts[k] || ''));
  const concepts = k => CONCEPT_WORDS.filter(w => String(parts[k] || '').toLowerCase().includes(w));
  if (words('identify') >= 3) tips.push(String(parts.identify).split(/[,;\n]| and /).filter(x => x.trim()).length >= 3 ? 'Part A: three phenomena. That’s exactly the detective’s job.' : 'Part A: try listing three separate things, like “speeding up, leaning in the berm, flying off the jump”.');
  if (words('investigate') >= 3) tips.push(has('investigate', /\?\s*$/) || has('investigate', /^(how|why|what|does|do|is|will|which|when)\b/i) ? 'Part B: that’s a real question you could test.' : 'Part B: phrase it as a question (how, why, what happens if…?).');
  if (words('predict') >= 3) tips.push(has('predict', /\bif\b|\bmore\b|\bless\b|\bfaster\b|\bslower\b|\bhigher\b|\blower\b|\bincrease|\bdecrease|\bchange/i) ? 'Part C: a clear change and what you expect. That’s a prediction.' : 'Part C: say what you’d change and what you expect to happen (“If I…, then…”).');
  if (words('explain') >= 3) { const c = concepts('explain'); tips.push(c.length ? `Part D: you used ${list(c.slice(0, 3).map(w => '“' + w + '”'))}. Good physics ideas.` : 'Part D: try naming a physics idea from the lesson, like gravity, energy, friction or force.'); }
  if (words('reflect') >= 3) tips.push('Part E: thanks for reflecting. That’s what turns riding into investigating.');
  return { complete: !empty.length, empty, tips };
}
