import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { newGame, spin, inspectSpin, validateSave } from '../src/engine.js';
import { BINDING_GROUPS, CHARACTERS, characterById } from '../src/content.js';
import { matchesEffectFilter } from '../src/effect-rules.js';

// Fixed, reviewable mechanism probes. No content definitions are modified,
// no AI decisions are made, and no result is a campaign win-rate estimate.
const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const runs = Number(option('--runs', 100));
const seedPrefix = option('--seed', 'v060-groups-mechanism-20261021');
assert.ok(Number.isInteger(runs) && runs >= 100, '--runs must be an integer >= 100.');
assert.ok(typeof seedPrefix === 'string' && seedPrefix.length < 120, 'Invalid seed prefix.');
const sourcePaths = ['src/engine.js', 'src/content.js', 'src/effect-rules.js', 'src/synergies.js', 'src/enemy-effects.js', 'src/difficulty.js', 'src/retirements.js', 'src/archetypes.js', 'scripts/probe-v060-groups.mjs'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fingerprints = () => Object.fromEntries(sourcePaths.map(path => [path, hash(readFileSync(new URL(path, root)))]));
const sourceHashes = fingerprints();
const round = value => Math.round(value * 1e6) / 1e6;
const sum = values => values.reduce((total, value) => total + value, 0);
const roles = ['defense', 'trainer', 'amplifier', 'disruptor'];
const roleNames = { defense: '防御', trainer: '永久培养', amplifier: '即时增幅', disruptor: '敌方干扰' };
// Each row chooses one genuine published kit per job. The two partners are
// actual group attackers; restricted vulnerability selects matching shapes.
const setups = {
  express: { defense: '1001', trainer: '1009', amplifier: '1313', disruptor: '1004', attackers: ['1002', '1003'] },
  hunters: { defense: '1301', trainer: '1303', amplifier: '1306', disruptor: '1005', attackers: ['1205', '1310'] },
  frost: { defense: '1104', trainer: 'pearl', amplifier: '1101', disruptor: '1106', attackers: ['1102', '1103'] },
  mentorship: { defense: '1211', trainer: '1207', amplifier: '1202', disruptor: '1218', attackers: ['1204', '1206'] },
  puppet: { defense: '1203', trainer: '1009', amplifier: 'announced_rin_tohsaka', disruptor: '1006', attackers: ['1003', '1008'], disruptorAttackers: ['1305', '1305'] },
  follow_up: { defense: '1304', trainer: 'pearl', amplifier: '1309', disruptor: '1218', attackers: ['1107', '1112'] },
  ink_dot: { defense: '1203', trainer: '1307', amplifier: '1202', disruptor: '1005', attackers: ['1205', '1308'], disruptorAttackers: ['1205', 'mortenax_blade'] },
  recollection: { defense: '1409', trainer: '1403', amplifier: 'cerydra', disruptor: 'hysilens', attackers: ['1312', '1404'] },
  elation: { defense: '1105', trainer: 'aha', amplifier: 'evanescia', disruptor: '1108', attackers: ['1109', '1201'] },
  break: { defense: '1222', trainer: '1215', amplifier: 'cerydra', disruptor: 'the_dahlia', attackers: ['1206', '1214'] },
};
const uniqueSeeds = new Set();
const raw = [];
let spinsResolved = 0;
let verificationSpins = 0;

function interval(values) {
  const n = values.length, mean = sum(values) / n;
  const deviation = Math.sqrt(sum(values.map(value => (value - mean) ** 2)) / (n - 1));
  // The default n=100 uses t(99, .975); larger runs use a conservative 1.984.
  const margin = 1.984 * deviation / Math.sqrt(n);
  return { n, mean: round(mean), sd: round(deviation), ci95: [round(mean - margin), round(mean + margin)], min: round(Math.min(...values)), max: round(Math.max(...values)) };
}
function rate(successes, n) {
  const p = successes / n, z = 1.95996398454, denominator = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
  return { successes, n, rate: round(p), wilson95: [round(Math.max(0, center - margin)), round(Math.min(1, center + margin))] };
}
function fixture(ids, seed, growth = {}) {
  const state = newGame({ seed, difficulty: 10 });
  state.roster = ids.map((id, index) => ({ id, uid: `u${index + 1}`, stars: 1, growth: growth[id] || 0, ticks: characterById(id).role === 'attack' ? 0 : 11 }));
  state.uidCounter = ids.length + 1;
  state.board = Array(20).fill(null);
  state.maxHp = 200; state.hp = 100; state.shield = 0;
  state.items = []; state.essences = []; state.activeDebuffs = [];
  state.bossStage = 0; state.spinsLeft = 5;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `probe-${col}`, name: '高血机制靶', col, hp: 1000000, maxHp: 1000000, attack: 8, boss: false }));
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '受控机制靶；本次为第1回合，不触发第3回合加压' };
  state.enemyIntent = { ...state.enemyIntent, damage: 40, round: 1 };
  assert.ok(validateSave(state), 'Probe input must be a valid production save.');
  return state;
}
function observe(input, sourceId, verifyPlainSpin = false) {
  const before = structuredClone(input);
  const result = inspectSpin(input);
  spinsResolved++;
  assert.deepEqual(input, before, 'spin must not mutate the starting fixture.');
  assert.ok(validateSave(result.state), 'Probe result must pass production save validation.');
  if (verifyPlainSpin) { verificationSpins++; assert.deepEqual(result.state, spin(input), 'Native observation must equal the production action.'); }
  const state = result.state;
  const events = state.lastSpin.effects.filter(event => event.sourceId === sourceId && event.sourceUid === 'u1');
  const amount = type => sum(events.filter(event => event.type === type).map(event => event.amount || 0));
  const vulnerability = characterById(sourceId).effects.find(effect => effect.type === 'vulnerability');
  const qualifying = state.board.filter(unit => unit && characterById(unit.id).role === 'attack' && vulnerability && matchesEffectFilter(unit, vulnerability.filter, state.board.find(unit => unit?.uid === 'u1')));
  const qualifyingUids = new Set(qualifying.map(unit => unit.uid));
  const focalCell = state.board.findIndex(unit => unit?.uid === 'u1');
  const observation = {
    damage: state.lastSpin.damage, incoming: state.lastSpin.incoming,
    healing: state.lastSpin.healing, shield: state.lastSpin.shield,
    hpAfter: state.hp, focalHeal: round(amount('heal')), focalShield: round(amount('shield')),
    focalGrowthGranted: round(amount('growth')),
    focalMultiplierIncrement: round(sum(events.filter(event => event.type === 'powerMultiplier').map(event => Math.max(0, (event.amount || 0) - 1)))),
    focalFlatPower: round(amount('power')), vulnerabilityQueued: round(amount('vulnerability')),
    qualifyingAttackers: qualifying.length,
    qualifyingAttackerDamage: round(sum(result.hits.filter(hit => hit.sourceType === 'character' && qualifyingUids.has(hit.sourceUid)).map(hit => hit.amount))),
    focalDamage: round(sum(result.hits.filter(hit => hit.sourceType === 'character' && hit.sourceUid === 'u1').map(hit => hit.amount))),
    utilityDamage: round(sum(result.hits.filter(hit => hit.sourceType === 'character' && characterById(hit.sourceId)?.role !== 'attack').map(hit => hit.amount))),
    focalGrowthInPower: state.lastSpin.powerBreakdown[focalCell].growth,
    totalGrowthGranted: round(sum(state.lastSpin.effects.filter(event => event.type === 'growth').map(event => event.amount || 0))),
    boardUids: state.board.map(unit => unit?.uid || null),
  };
  assert.equal(observation.focalDamage, 0, 'A utility kit must not become a damage dealer.');
  assert.equal(observation.utilityDamage, 0, 'No utility character may deal direct damage.');
  assert.equal(observation.focalGrowthInPower, 0, 'Utility growth must not enter attack power.');
  return observation;
}
function measure(observation, role) {
  return role === 'defense' ? observation.focalHeal + observation.focalShield
    : role === 'trainer' ? observation.focalGrowthGranted
      : role === 'amplifier' ? observation.focalMultiplierIncrement
        : observation.qualifyingAttackerDamage;
}
function summarize(observations, role) {
  const metrics = ['damage', 'incoming', 'focalHeal', 'focalShield', 'focalGrowthGranted', 'focalMultiplierIncrement', 'focalFlatPower', 'vulnerabilityQueued', 'qualifyingAttackers', 'qualifyingAttackerDamage', 'focalDamage', 'utilityDamage', 'focalGrowthInPower'];
  return { mechanicMeasure: interval(observations.map(row => measure(row, role))), positive: rate(observations.filter(row => measure(row, role) > 0).length, observations.length), metrics: Object.fromEntries(metrics.map(metric => [metric, interval(observations.map(row => row[metric]))])) };
}
function outsidersFor(source, partners) {
  const candidates = CHARACTERS.filter(entry => entry.role === 'attack' && entry.groups.every(group => !source.groups.includes(group)));
  const chosen = [];
  return partners.map(id => {
    const shape = characterById(id).attack;
    const matching = candidates.filter(entry => entry.attack === shape);
    assert.ok(matching.length, `${source.name} needs an outside ${shape} attacker.`);
    const selected = matching.find(entry => !chosen.includes(entry.id)) || matching[0];
    chosen.push(selected.id);
    return selected.id;
  });
}

const groups = BINDING_GROUPS.map(group => {
  const setup = setups[group.id]; assert.ok(setup, group.id);
  const cases = roles.map(role => {
    const sourceId = setup[role], source = characterById(sourceId);
    assert.ok(source.role === role && source.groups.includes(group.id), `${group.id}/${role} source mismatch.`);
    const partners = role === 'disruptor' && setup.disruptorAttackers || setup.attackers;
    assert.ok(partners.every(id => group.memberIds.includes(id) && characterById(id).role === 'attack'));
    const outsiders = outsidersFor(source, partners);
    if (role === 'disruptor') assert.ok(partners.every(id => matchesEffectFilter({ id, uid: 'partner' }, source.effects.find(effect => effect.type === 'vulnerability').filter)), 'The intended attack shape must actually qualify.');
    const rows = [];
    for (let index = 0; index < runs; index++) {
      const seed = `${seedPrefix}:${group.id}:${role}:${index}`;
      assert.ok(!uniqueSeeds.has(seed)); uniqueSeeds.add(seed);
      const matched = observe(fixture([sourceId, ...partners], seed), sourceId, index === 0);
      const outside = observe(fixture([sourceId, ...outsiders], seed), sourceId, index === 0);
      const trained = observe(fixture([sourceId, ...partners], seed, { [sourceId]: 12 }), sourceId, index === 0);
      assert.deepEqual(matched.boardUids, outside.boardUids, 'Paired swaps must retain the same layout.');
      assert.deepEqual(matched.boardUids, trained.boardUids, 'Training control must retain the same layout.');
      assert.equal(measure(outside, role), 0, `${group.id}/${role}: outside partner unexpectedly receives the focal mechanic.`);
      if (role === 'trainer') assert.equal(measure(trained, role), measure(matched, role), 'A trainer must not multiply its own growth grants.');
      else assert.ok(measure(trained, role) >= measure(matched, role), `${group.id}/${role}: training did not preserve functional output.`);
      rows.push({ seed, matched, outside, trained });
    }
    const matched = summarize(rows.map(row => row.matched), role), outside = summarize(rows.map(row => row.outside), role), trained = summarize(rows.map(row => row.trained), role);
    assert.ok(matched.positive.successes > 0, `${group.id}/${role}: no activation; revise the probe configuration rather than declaring success.`);
    const deltas = rows.map(row => measure(row.trained, role) - measure(row.matched, role));
    if (role !== 'trainer') assert.ok(deltas.some(delta => delta > 0), `${group.id}/${role}: training showed no functional benefit.`);
    raw.push({ groupId: group.id, role, sourceId, partners, outsiders, rows });
    return { role, roleName: roleNames[role], sourceId, sourceName: source.name, sourceGroups: source.groups, sourceEffects: source.effects,
      partners: partners.map(id => ({ id, name: characterById(id).name, attack: characterById(id).attack })),
      outsidePartners: outsiders.map(id => ({ id, name: characterById(id).name, attack: characterById(id).attack })),
      matched, outside, trained, pairedTrainingDelta: interval(deltas),
      checks: { matchingActivates: true, outsidersReceiveNoFocalMechanic: true, utilityNeverAttacks: true, utilityGrowthNotAttackPower: true, trainerDoesNotSelfMultiply: role === 'trainer' ? true : null, trainingImprovesFunction: role !== 'trainer' ? true : null } };
  });
  const supportIds = roles.map(role => setup[role]);
  const rows = [];
  for (let index = 0; index < runs; index++) {
    const seed = `${seedPrefix}:${group.id}:support-only:${index}`;
    assert.ok(!uniqueSeeds.has(seed)); uniqueSeeds.add(seed);
    const baseline = observe(fixture(supportIds, seed), supportIds[0], index === 0);
    const trained = observe(fixture(supportIds, seed, Object.fromEntries(supportIds.map(id => [id, 12]))), supportIds[0], index === 0);
    assert.equal(baseline.damage, 0, 'A support-only group must not create attack damage.');
    assert.equal(trained.damage, 0, 'Even trained utility cannot replace attack roles.');
    rows.push({ seed, baseline, trained });
  }
  raw.push({ groupId: group.id, role: 'support-only', supportIds, rows });
  return { id: group.id, name: group.name, cases, supportOnly: { supportIds, damage: interval(rows.map(row => row.baseline.damage)), trainedDamage: interval(rows.map(row => row.trained.damage)), realGrowthGranted: interval(rows.map(row => row.baseline.totalGrowthGranted)), checks: { zeroUntrainedDamage: true, zeroTrainedDamage: true } } };
});

assert.deepEqual(fingerprints(), sourceHashes, 'Production sources changed during the probe; rerun after freezing.');
const directory = new URL('../docs/benchmarks/', import.meta.url); mkdirSync(directory, { recursive: true });
const rawPath = 'docs/benchmarks/v060-groups.samples.json.gz';
const bytes = gzipSync(Buffer.from(JSON.stringify({ version: 'v060-groups-probe-v1', sourceHashes, seedPrefix, runs, samples: raw })));
writeFileSync(new URL(rawPath, root), bytes);
const report = {
  version: 'v060-groups-probe-v1', measuredVersion: '0.6.0', date: '2026-10-21', seedPrefix, runsPerRoleAndGroup: runs,
  groupCount: groups.length, roleCases: groups.length * roles.length, uniqueSeedBlocks: uniqueSeeds.size, spinsResolved, verificationSpins,
  sourceStable: true, sourceHashes, raw: { path: rawPath, sha256: hash(bytes), bytes: bytes.length },
  protocol: {
    design: 'Each group uses four separate real-kit cases, one per utility role, with two attacking partners. Same-seed controls swap only partner IDs for outside-group attackers of the same attack shapes, or add 12 growth only to the unchanged focal source.',
    fixture: { difficulty: 10, floor: 1, roundBefore: 0, maxHp: 200, hp: 100, shield: 0, enemyColumns: 5, enemyHpEach: 1000000, enemyAttackEach: 8, stars: 1, utilityTicksBefore: 11, attackerTicksBefore: 0, items: [], essences: [], debuffs: [] },
    timing: 'Utility kits are deliberately placed immediately before their 12th appearance, aligning 2/3/4-appearance gates. This is not an estimate of natural proc frequency. Layouts are sampled by the unmodified seeded spin.',
    metricByRole: { defense: 'Own actual healing plus own actual shield generated, resource points.', trainer: 'Permanent growth actually granted by the focal trainer.', amplifier: 'Sum of actual recipient multiplier increments above one; flat buffs are separately reported.', disruptor: 'Actual damage by character-source attackers matching the focal vulnerability filter, not damage causally attributed to the disruptor.' },
    intervals: 'Mean intervals use sample SD and a conservative 1.984 standard-error multiplier (t99 for default n=100); activation rates use Wilson 95%. Zero-width deterministic intervals describe this fixed fixture only.',
    controls: 'Outside partners preserve attack role and shape but have different identities; total damage can differ due to base kits, attack self-conditions and normal synergies, so cross-identity damage differences are not attributed solely to support. A queued vulnerability with zero qualifying attackers is not treated as an applied benefit.',
    supportOnly: 'Four real utility roles per group are separately spun at growth zero and growth twelve with no attack roles.',
    limitations: 'One seeded spin per variant in an artificial high-HP fixture. No campaign win rates, natural draft probabilities, endgame power ranking, or global balance/causal claim. All observations use frozen real definitions, never modified or disabled effects.',
  }, groups,
};
writeFileSync(new URL('../docs/benchmarks/v060-groups.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
const f = value => Number(value).toFixed(3).replace(/\.?0+$/, '');
const lines = groups.map(group => {
  const byRole = Object.fromEntries(group.cases.map(entry => [entry.role, entry]));
  return `| ${group.name} | ${f(byRole.defense.matched.mechanicMeasure.mean)} → ${f(byRole.defense.trained.mechanicMeasure.mean)} | ${f(byRole.trainer.matched.mechanicMeasure.mean)} | ${f(byRole.amplifier.matched.mechanicMeasure.mean)} → ${f(byRole.amplifier.trained.mechanicMeasure.mean)} | ${byRole.defense.matched.positive.successes}/${runs}；${byRole.trainer.matched.positive.successes}/${runs}；${byRole.amplifier.matched.positive.successes}/${runs} | 0 / 0 |`;
});
const markdown = `# 0.6 绑定组机制与平衡证据\n\n## 真实角色组合探针\n\n使用当前90卡与正式引擎，10组各选防御、培养、增幅、干扰四个真实技能配置，每个配置${runs}个独立种子；另对每组四支援无攻击配置测试${runs}个种子。共${uniqueSeeds.size}个独立种子块、${spinsResolved}次正式单转观测，另${verificationSpins}次正式spin一致性复算。\n\n同一种子保留抽盘布局，对照两名同组攻击伙伴、替换为组外且同攻击范围的伙伴，以及仅给原支援增加12点培养。五列敌人各100万生命、反击各8，玩家生命100/200、无初始护盾；不带奇物、精华、条款，保留真实羁绊。支援预置11次登场，刻意让本次第12次登场对齐2/3/4周期；这是成熟条件下的机制验证，不是自然触发频率或通关率。\n\n| 绑定组 | 防御自产资源均值：未培养→培养12 | 培养实际发放均值 | 增幅倍率增量合计：未培养→培养12 | 防御/培养/增幅正收益种子 | 纯支援伤害：培养0/12 |\n| --- | ---: | ---: | ---: | --- | ---: |\n${lines.join('\n')}\n\n40个角色配置均出现实际正收益；换成不属于来源任何绑定组的同职责攻击伙伴后，目标机制均无收益。邻接型技能的未触发种子真实保留为零，不摆盘、不剔除。永久培养者加12点自身培养不增加发放量；其他支援的可培养职能提高，支援自身实际伤害和攻击威力分解中的成长始终为零。每组纯支援队伍在培养0与12时实际伤害均为零。\n\n干扰探针另保留易伤已排队数值、匹配攻击者数量、其真实伤害和培养前后配对差；组外没有匹配攻击者时，即使易伤已经排队也不算有效收益。不同角色替换会同时改变自身技能和羁绊，因此不能把两套身份的总伤害差直接归因给某一个支援；只改变支援培养的配对在角色与布局上保持一致。\n\n每项均保留含零样本的均值、95%区间、正收益比例的Wilson区间和逐种子结果；该固定高血、缺血、周期对齐的单转实验不能证明全程胜率、自然拿牌概率、终局强度排名或所有套路均衡。它证明上述配置中的绑定门槛、支援不可替代攻击及培养职能转化确实执行。\n\n复现：\n\n\`\`\`sh\nnode scripts/probe-v060-groups.mjs --runs ${runs} --seed ${seedPrefix}\n\`\`\`\n\n[完整汇总](benchmarks/v060-groups.json)；[压缩逐种子数据](benchmarks/v060-groups.samples.json.gz)。汇总记录所有生产规则和探针脚本的SHA-256，开始/结束摘要一致；每个输入和输出均通过正式存档校验，输入未被动作修改，首种子的观测状态另与正式spin逐项相同。全程未修改角色定义或禁用技能。\n\n## 完整对局评测\n\n正式D10/D20独立对局结果另行记录；不使用0.5数据代替0.6结果，也不把上面的机制探针当成通关验收。\n`;
// Re-running a mechanism probe must preserve calibration and campaign evidence
// maintained by the release workflow below their separate headings.
const summaryPath = new URL('../docs/V060-BALANCE.md', import.meta.url);
let finalMarkdown = markdown;
try {
  const existing = readFileSync(summaryPath, 'utf8');
  const indexes = ['## 难度校准', '## 完整对局评测'].map(heading => existing.indexOf(heading)).filter(index => index >= 0);
  if (indexes.length) finalMarkdown = markdown.slice(0, markdown.indexOf('## 完整对局评测')) + existing.slice(Math.min(...indexes));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
writeFileSync(summaryPath, finalMarkdown);
console.log(JSON.stringify({ groups: groups.length, roleCases: report.roleCases, uniqueSeedBlocks: uniqueSeeds.size, spinsResolved, verificationSpins, sourceStable: true, report: 'docs/benchmarks/v060-groups.json', raw: rawPath, summary: 'docs/V060-BALANCE.md' }));
