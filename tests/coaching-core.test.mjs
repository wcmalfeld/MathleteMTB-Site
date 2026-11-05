// Unit tests for js/coaching/core.js, using the seed content.
//   node --test tests/coaching-core.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as core from '../js/coaching/core.js';

const seed = JSON.parse(readFileSync(new URL('../content/coaching/seed.json', import.meta.url), 'utf8'));
const idx = core.indexCatalog(seed);
const ids = r => r.skills.map(x => x.skill.id);

test('the seed has no broken links or cycles', () => {
  assert.deepEqual(core.checkIntegrity(seed), []);
});

test('integrity check catches missing references, bad ids and cycles', () => {
  const bad = structuredClone(seed);
  bad.lessons[0].drills.push('no-such-drill');
  bad.skills.push({ id: 'Bad Id', prerequisites: [] });
  const a = bad.skills.find(s => s.id === 'balance-stability');
  a.prerequisites = [{ id: 'manual', kind: 'optional' }];
  const p = core.checkIntegrity(bad);
  assert.ok(p.some(x => /missing "no-such-drill"/.test(x)));
  assert.ok(p.some(x => /invalid id "Bad Id"/.test(x)));
  assert.ok(p.some(x => /Circular prerequisite/.test(x)));
});

test('search: the PRD example questions find sensible skills', () => {
  const cases = [
    ['How do I manual?', 'manual'],
    ['I want to improve my cornering.', 'cornering'],
    ['I want to jump higher.', 'jumping'],
    ['How do I get more comfortable on steep trails?', 'body-position'],
    ['bunny hop over logs', 'bunny-hop'],
    ['my brakes skid', 'braking'],
    ['tire pressure', 'bike-setup'],
    ['wheelie', 'manual']
  ];
  for (const [q, want] of cases) {
    const r = core.search(idx, q);
    assert.ok(ids(r).slice(0, 3).includes(want), `"${q}" -> ${ids(r).slice(0, 3).join(', ')}`);
  }
});

test('search: "jump higher" also suggests pumping', () => {
  assert.ok(ids(core.search(idx, 'I want to jump higher')).includes('pumping'));
});

test('search: a skill not in the library yet shows up as a planned topic', () => {
  const r = core.search(idx, 'I want to learn a 360');
  assert.ok(r.planned.some(p => p.topic === '360s' && p.discipline.id === 'slopestyle'));
});

test('search: returns foundations and pathways for the best match', () => {
  const r = core.search(idx, 'how do I manual');
  assert.equal(r.best.id, 'manual');
  const f = r.foundations.map(s => s.id);
  assert.ok(f.includes('front-wheel-lift') && f.includes('balance-stability'));
  assert.ok(!f.includes('manual'));
  assert.deepEqual(r.pathways.map(p => p.id), ['learn-to-manual']);
});

test('search: empty or stop-word-only queries return nothing', () => {
  assert.equal(core.search(idx, '').skills.length, 0);
  assert.equal(core.search(idx, 'how do I want to').skills.length, 0);
});

test('foundation chain follows required and recommended links, nearest first', () => {
  const chain = core.foundationChain(idx, 'jumping');
  assert.equal(chain[0].depth, 1);
  const ids_ = chain.map(c => c.id);
  assert.ok(ids_.includes('pumping') && ids_.includes('pressure-control') && ids_.includes('body-position'));
  assert.ok(!ids_.includes('bunny-hop'), 'optional prerequisites are left out by default');
  assert.equal(new Set(ids_).size, ids_.length);
});

test('learning order puts every skill after its prerequisites', () => {
  const order = core.learningOrder(idx, [...idx.skills.keys()]);
  const pos = new Map(order.map((id, i) => [id, i]));
  for (const s of idx.skills.values()) for (const p of s.prerequisites) {
    if (p.kind !== 'optional') assert.ok(pos.get(p.id) < pos.get(s.id), `${p.id} before ${s.id}`);
  }
});

test('cycle detection for the CMS', () => {
  assert.equal(core.wouldCreateCycle(idx, 'balance-stability', 'manual'), true);
  assert.equal(core.wouldCreateCycle(idx, 'manual', 'manual'), true);
  assert.equal(core.wouldCreateCycle(idx, 'manual', 'bike-setup'), false);
});

test('safety: Class 3 never offers self-guided practice, whatever the lesson says', () => {
  const r3 = core.safetyRules({ safety_class: 3 }, { safety: { supervision: false } });
  assert.equal(r3.selfGuidedPractice, false);
  assert.equal(r3.needsSupervision, true);
  const r2 = core.safetyRules({ safety_class: 2 }, null);
  assert.equal(r2.selfGuidedPractice, true);
  assert.equal(r2.needsPrerequisites, true);
  assert.equal(core.safetyRules({ safety_class: 1 }, { safety: { supervision: true } }).needsSupervision, true);
});

test('pathways: shape tags and where a lesson sits', () => {
  const p = idx.pathways.get('jumping-foundations-path');
  const shape = core.pathwayShape(p);
  assert.ok(shape.includes('Branching') && shape.includes('Assessment') && !shape.includes('Linear'));
  assert.deepEqual(core.pathwayShape(idx.pathways.get('cornering-confidence')), ['Linear']);
  const at = core.stageOf(p, 'landing-fundamentals');
  assert.equal(at.index, 2);
  assert.equal(at.previous.length, 2);
  const forSkill = core.pathwaysFor(idx, 'braking');
  assert.ok(forSkill.includes.some(x => x.id === 'learn-to-manual'));
});

test('drills are shared between lessons and listed once', () => {
  const users = core.lessonsUsingDrill(idx, 'lift-and-land').map(l => l.id);
  assert.ok(users.length >= 3);
  const drills = core.drillsFor(idx, users.map(id => idx.lessons.get(id)));
  assert.equal(new Set(drills.map(d => d.id)).size, drills.length);
});

test('filters', () => {
  const c2 = core.filterSkills(idx, { safety: 2 });
  assert.ok(c2.length > 0 && c2.every(s => s.safety_class === 2));
  const dj = core.filterSkills(idx, { discipline: 'downhill', difficulty: 'beginner' });
  assert.ok(dj.every(s => s.difficulty === 'beginner' && s.disciplines.some(d => d.id === 'downhill')));
});

test('a catalog missing linked items never yields dead links', () => {
  const partial = structuredClone(seed);
  partial.drills = partial.drills.slice(0, 2);
  const i2 = core.indexCatalog(partial);
  const l = i2.lessons.get('manual-foundations');
  assert.ok(core.present(i2.drills, l.drills).every(Boolean));
  assert.ok(core.drillsFor(i2, [l]).length <= 2);
});
