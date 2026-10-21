import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeGrowthCampaigns, renderGrowthMarkdown, classifyGrowthMechanisms } from '../src/growth-report.js';

const definitions = [{ id: 'a', name: '攻击甲', attack: 'single', basePower: 1 }, { id: 'b', name: '辅助乙', attack: 'support', basePower: 1 }, { id: 'c', name: '未持有丙', attack: 'single', basePower: 2 }];
const observation = (damage = 10, appearances = 1, instanceTurns = appearances) => ({ heldTurns: 1, instanceTurns, appearances, power: damage / 3, normalDamage: damage, skillDamage: 0, growthReceived: 0, healing: 0, shield: 0, buff: 0 });
function campaign(seed, options = {}) {
  const row = { id: 'a', endCount: 1, endGrowth: 2, endStars: 1, endTicks: 4, probe: observation(), noGrowthProbe: observation(4), windows: { terminal: observation(), final12: observation(), early: observation() } };
  return { seed, strategyId: 'baseline', strategyKind: 'baseline', difficulty: 10, won: true, phase: 'victory', floor: 12, turns: 20, stopped: null, offered: ['a'], finalFormed: [], allDamage: 100, sharedDamage: 5, cards: [row], ...options };
}
const summarize = rows => summarizeGrowthCampaigns(rows, { cards: definitions, source: 'fixture' });

test('growth reports normalize inside each campaign before averaging, preserve paired effects, and reproduce intervals', () => {
  const first = campaign('one'), second = campaign('two');
  first.cards[0].probe = observation(100, 10, 20);
  first.cards[0].noGrowthProbe = observation(50, 10, 20);
  second.cards[0].probe = observation(1000, 1, 2);
  second.cards[0].noGrowthProbe = observation(10, 1, 2);
  first.cards[0].windows.terminal = observation(100, 10, 20);
  second.cards[0].windows.terminal = observation(1000, 1, 2);
  const report = summarize([first, second]), card = report.groups[0].cards[0];
  assert.equal(card.probe.damagePerAppearance.mean, 505);
  assert.equal(card.probe.damagePerAppearance.n, 2);
  assert.equal(card.probe.damagePerInstanceTurn.mean, 252.5);
  assert.equal(card.terminal.damagePerAppearance.mean, 505);
  assert.equal(card.growthDelta.damagePerAppearance.mean, 497.5);
  assert.deepEqual(report, summarize([second, first]));
  assert.equal(card.precision.damagePerAppearance.status, 'insufficient-campaigns');
  assert.deepEqual(report.metadata, { source: 'fixture' });
});

test('difficulty, natural/coverage, outcomes, and incomplete runs remain separate', () => {
  const win = campaign('win'), loss = campaign('loss', { phase: 'defeat', won: false, floor: 6, defeatCause: 'hp' });
  delete loss.cards[0].windows.final12;
  loss.cards[0].probe = observation(20);
  const coverage = campaign('coverage', { strategyId: 'coverage:a', strategyKind: 'coverage', targetId: 'a' });
  const stress = campaign('stress', { difficulty: 20 });
  const partial = campaign('partial', { phase: 'recruit', won: false, floor: 9, stopped: 'action-limit' });
  const report = summarize([win, loss, coverage, stress, partial]);
  assert.equal(report.groups.length, 3);
  const group = report.groups.find(row => row.difficulty === 10 && row.cohort === 'natural');
  assert.equal(group.n, 3);
  assert.equal(group.completed, 2);
  assert.equal(group.incomplete, 1);
  assert.equal(group.wins, 1);
  assert.equal(group.defeats, 1);
  assert.equal(group.reached12.count, 1);
  assert.equal(group.reached12.n, 2);
  const card = group.cards[0];
  assert.equal(card.endHeld, 2);
  assert.equal(card.censoredEverHeld, 1);
  assert.equal(card.outcomes.victory.probe.damagePerAppearance.mean, 10);
  assert.equal(card.outcomes.defeat.probe.damagePerAppearance.mean, 20);
  assert.equal(card.final12.damagePerAppearance.n, 1);
  assert.equal(group.strategies[0].defeatCauses.hp, 1);
  assert.equal(card.outcomes.defeat.precision.damagePerAppearance.minimumCampaigns, 30);
});

test('missing cards and no appearances remain missing; zero damage and auxiliary production remain valid', () => {
  const row = campaign('zero');
  row.cards.push({ id: 'b', endCount: 1, endGrowth: 0, endStars: 1, endTicks: 2, probe: { ...observation(0), healing: 12, shield: 5, buff: 4 }, noGrowthProbe: observation(0), windows: { terminal: observation(0, 0, 3) } });
  const report = summarize([row]), cards = report.groups[0].cards;
  assert.equal(cards[1].probe.damagePerAppearance.mean, 0);
  assert.deepEqual(cards[1].probe.damagePerAppearance.ci95, [null, null]);
  assert.equal(cards[1].allDirectDamageZero, true);
  assert.match(cards[1].roleCaution, /不能按直接伤害判定强弱/);
  assert.equal(cards[1].probe.healingPerAppearance.mean, 12);
  assert.equal(cards[1].terminal.damagePerAppearance.n, 0);
  assert.equal(cards[1].terminal.damagePerInstanceTurn.mean, 0);
  assert.equal(cards[2].everHeld, 0);
  assert.equal(cards[2].endGrowth.mean, null);
  assert.equal(cards[2].probe.damagePerAppearance.n, 0);
  assert.deepEqual(cards[2].probe.damagePerAppearance.ci95, [null, null]);
  const markdown = renderGrowthMarkdown(report);
  for (const definition of definitions) assert.match(markdown, new RegExp(definition.name));
  assert.match(markdown, /自然构筑/);
  assert.match(markdown, /胜败终局单卡对照/);
  assert.match(markdown, /未做多重比较校正/);
});

test('a card removed before terminal remains ever-held but contributes no fabricated end/probe zero', () => {
  const row = campaign('removed');
  row.cards[0] = { ...row.cards[0], endCount: 0, endGrowth: null, endStars: null, endTicks: null, probe: null, noGrowthProbe: null };
  const card = summarize([row]).groups[0].cards[0];
  assert.equal(card.everHeld, 1);
  assert.equal(card.endHeld, 0);
  assert.equal(card.endGrowth.n, 0);
  assert.equal(card.probe.damagePerAppearance.n, 0);
  assert.equal(card.early.damagePerAppearance.n, 1);
});

test('100 independent zero-output campaigns pass precision without ranking support strength', () => {
  const rows = Array.from({ length: 100 }, (_, index) => {
    const row = campaign(`zero-${index}`);
    row.cards[0].probe = observation(0);
    row.cards[0].noGrowthProbe = observation(0);
    row.cards[0].endGrowth = 0;
    return row;
  });
  const card = summarize(rows).groups[0].cards[0];
  assert.equal(card.precision.damagePerAppearance.precise, true);
  assert.equal(card.precision.damagePerAppearance.criterion, 'absolute-half-width');
  assert.equal(card.precision.endGrowth.precise, true);
  assert.ok(card.roleCaution);
});

test('duplicate seeds are rejected even across difficulties and duplicate card rows are rejected', () => {
  assert.throws(() => summarize([campaign('duplicate'), campaign('duplicate', { difficulty: 20 })]), /Duplicate campaign seed/);
  assert.throws(() => summarize([campaign('')]), /nonempty seed/);
  const row = campaign('duplicate-card');
  row.cards.push(structuredClone(row.cards[0]));
  assert.throws(() => summarize([row]), /Duplicate card row/);
});

test('default metadata includes the complete current 90-card pool', () => {
  const report = summarizeGrowthCampaigns([campaign('default')]);
  assert.equal(report.groups[0].cards.length, 90);
});

test('one campaign never produces a deterministic confidence interval, including zero damage/growth', () => {
  const row = campaign('single');
  row.cards[0].endGrowth = 0;
  row.cards[0].probe = observation(0);
  const card = summarize([row]).groups[0].cards[0];
  assert.deepEqual(card.probe.damagePerAppearance.ci95, [null, null]);
  assert.deepEqual(card.endGrowth.ci95, [null, null]);
  assert.deepEqual(card.endStars.ci95, [null, null]);
  assert.equal(card.precision.endGrowth.precise, false);
  const repeated = structuredClone(row);
  repeated.seed = 'single-independent';
  assert.deepEqual(summarize([row, repeated]).groups[0].cards[0].probe.damagePerAppearance.ci95, [0, 0]);
});

test('current growth classification distinguishes limited attack self-growth and group-bound trainers', () => {
  const mechanisms = new Map(classifyGrowthMechanisms().map(card => [card.id, card]));
  assert.equal(mechanisms.size, 90);
  for (const id of ['1002', '1205', 'march_hunt']) assert.ok(mechanisms.get(id).sources.some(source => source.kind === 'intrinsic' && !source.legacy));
  assert.ok(mechanisms.get('1107').sources.some(source => source.kind === 'commission'));
  assert.ok([...mechanisms.values()].every(card => card.sources.every(source => source.kind !== 'archetype')), 'archetypes no longer grant automatic permanent growth');
  assert.ok(mechanisms.get('1402').sources.some(source => source.kind === 'external-character' && source.sourceId === 'cyrene'));
  assert.ok(!mechanisms.get('cyrene').hasIntrinsicGrowth, 'a trainer cannot recursively train itself');
  assert.ok(!mechanisms.get('1102').sources.some(source => source.sourceId === 'cyrene'), 'unrelated groups receive no cross-training');
});

test('temporary and commission damage reconciles all raw stage totals without counting overlapping windows', () => {
  const first = campaign('damage-reconcile-one', { allDamage: 100, sharedDamage: 7 });
  first.cards[0].windows = { early: observation(10), mid: observation(20), late: { ...observation(30), skillDamage: 5 }, terminal: observation(999), final12: observation(999) };
  first.cards.push({ id: 'b', endCount: 0, windows: { early: { ...observation(2), skillDamage: 3 } } });
  const second = campaign('damage-reconcile-two', { allDamage: 50, sharedDamage: 5 });
  second.cards[0].windows = { early: observation(10), mid: observation(15), late: observation(20) };
  const report = summarize([first, second]), group = report.groups[0];
  assert.equal(group.temporaryOrCommissionDamage.n, 2);
  assert.equal(group.temporaryOrCommissionDamage.mean, 11.5);
  assert.equal(group.allDamage.mean, 75);
  assert.equal(group.sharedDamage.mean, 6);
  const permanentMean = ((10 + 20 + 30 + 5 + 2 + 3) + (10 + 15 + 20)) / 2;
  assert.equal(group.sharedDamage.mean + group.temporaryOrCommissionDamage.mean + permanentMean, group.allDamage.mean);
  const markdown = renderGrowthMarkdown(report);
  assert.match(markdown, /临时援军与委派见习不计入同名卡均值/);
  assert.match(markdown, /个别单卡差值可呈微小负数/);
});

test('damage reconciliation tolerates floating point error and rejects contradictory stage totals', () => {
  const floating = campaign('floating', { allDamage: 0.3, sharedDamage: 0 });
  floating.cards[0].windows = { early: observation(0.1), mid: observation(0.2) };
  assert.equal(summarize([floating]).groups[0].temporaryOrCommissionDamage.mean, 0);
  const broken = campaign('broken-total', { allDamage: 1, sharedDamage: 0 });
  broken.cards[0].windows = { early: observation(2) };
  assert.throws(() => summarize([broken]), /damage components exceed total/);
});

test('lifetime growth adds raw stages, weights exposure inside each campaign, then averages campaigns equally', () => {
  const first = campaign('lifetime-one'), second = campaign('lifetime-two');
  first.cards[0].windows = { early: { ...observation(0, 1, 2), growthReceived: 2 }, mid: { ...observation(0, 9, 18), growthReceived: 0 }, terminal: { ...observation(0, 1, 1), growthReceived: 999 }, final12: { ...observation(0, 1, 1), growthReceived: 999 } };
  second.cards[0].windows = { late: { ...observation(0, 1, 1), growthReceived: 9 } };
  const report = summarize([first, second]), card = report.groups[0].cards[0];
  assert.equal(card.lifetime.growthPerAppearance.n, 2);
  assert.equal(card.lifetime.growthPerAppearance.mean, 4.6);
  assert.equal(card.lifetime.growthPerInstanceTurn.mean, 4.55);
  assert.equal(card.lifetime.appearances.mean, 5.5);
  assert.equal(card.early.growthPerAppearance.mean, 2);
  assert.equal(card.mid.growthPerAppearance.mean, 0);
  assert.equal(card.outcomes.victory.lifetime.growthPerAppearance.mean, 4.6);
  const markdown = renderGrowthMarkdown(report);
  assert.match(markdown, /全程实战成长\/登场/);
  assert.match(markdown, /初始 5 张卡与后期招募卡的培养时长不同/);
  assert.match(markdown, /不会直接平均三个阶段的已归一化成长率/);
});
