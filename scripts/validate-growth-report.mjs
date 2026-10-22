import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
const summaryPath = process.argv[2];
if (!summaryPath) throw new Error('Usage: node scripts/validate-growth-report.mjs summary.json[.gz] raw.campaigns.json.gz ...');
const rawPaths = process.argv.slice(3).length ? process.argv.slice(3) : ['docs/benchmarks/growth-v050-pilot-d10.campaigns.json.gz'];
const report = JSON.parse(summaryPath.endsWith('.gz') ? gunzipSync(readFileSync(summaryPath)) : readFileSync(summaryPath));
const raws = rawPaths.map(path => ({ path, ...JSON.parse(gunzipSync(readFileSync(path))) }));
const all = raws.flatMap(raw => raw.campaigns), failures = [], checked = { comparisons: 0, cards: 0, outcomeCardGroups: 0, sourceHashes: 0, stages: 0 };
const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
function compare(path, actual, expected) {
  checked.comparisons++;
  const okay = actual === expected || Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= 0.000000501;
  if (!okay) failures.push({ path, actual, expected });
}
const finite = values => values.filter(Number.isFinite);
const ratio = (row, numerator, denominator) => row?.[denominator] > 0 ? numerator(row) / row[denominator] : null;
const metricFns = {
  powerPerAppearance: r => ratio(r, x => x.power, 'appearances'),
  damagePerAppearance: r => ratio(r, x => x.normalDamage + x.skillDamage, 'appearances'),
  damagePerInstanceTurn: r => ratio(r, x => x.normalDamage + x.skillDamage, 'instanceTurns'),
  normalDamagePerAppearance: r => ratio(r, x => x.normalDamage, 'appearances'),
  skillDamagePerAppearance: r => ratio(r, x => x.skillDamage, 'appearances'),
  growthPerAppearance: r => ratio(r, x => x.growthReceived, 'appearances'),
  growthPerInstanceTurn: r => ratio(r, x => x.growthReceived, 'instanceTurns'),
  healingPerAppearance: r => ratio(r, x => x.healing, 'appearances'),
  shieldPerAppearance: r => ratio(r, x => x.shield, 'appearances'),
  buffPerAppearance: r => ratio(r, x => x.buff, 'appearances'),
  appearanceRate: r => ratio(r, x => x.appearances, 'instanceTurns'),
  heldTurns: r => r.heldTurns,
  instanceTurns: r => r.instanceTurns,
  appearances: r => r.appearances,
};
function validateMetricGroup(path, actual, rows) {
  compare(path + '.n', actual.n, rows.length);
  for (const [metric, fn] of Object.entries(metricFns)) {
    const values = finite(rows.map(fn));
    compare(`${path}.${metric}.n`, actual[metric].n, values.length);
    compare(`${path}.${metric}.mean`, actual[metric].mean, mean(values));
  }
}
const recomputed = [];
function validateCard(path, actual, records, campaigns) {
  checked.outcomeCardGroups++;
  compare(path + '.campaigns', actual.campaigns, campaigns.length);
  compare(path + '.everHeld', actual.everHeld, records.length);
  compare(path + '.offered', actual.offered, campaigns.filter(c => c.offered.includes(actual.id || path.split('.')[0])).length);
  const held = records.filter(r => r.endCount > 0);
  compare(path + '.endHeld', actual.endHeld, held.length);
  for (const field of ['endCount', 'endGrowth', 'endStars', 'endTicks']) {
    const values = finite(held.map(r => r[field]));
    compare(`${path}.${field}.n`, actual[field].n, values.length);
    compare(`${path}.${field}.mean`, actual[field].mean, mean(values));
  }
  const lifetimeRows = records.map(r => {
    const stages = ['early', 'mid', 'late'].map(stage => r.windows[stage]).filter(Boolean);
    if (!stages.length) return null;
    const total = {};
    for (const stage of stages) for (const [key, value] of Object.entries(stage)) total[key] = (total[key] || 0) + value;
    return total;
  }).filter(Boolean);
  validateMetricGroup(path + '.lifetime', actual.lifetime, lifetimeRows);
  for (const stage of ['probe', 'noGrowthProbe', 'early', 'mid', 'late', 'terminal', 'final12']) {
    const rows = records.map(r => ['probe', 'noGrowthProbe'].includes(stage) ? r[stage] : r.windows[stage]).filter(Boolean);
    validateMetricGroup(path + '.' + stage, actual[stage], rows);
    checked.stages++;
  }
  for (const metric of ['damagePerAppearance', 'damagePerInstanceTurn', 'powerPerAppearance']) {
    const deltas = finite(records.map(r => r.probe && r.noGrowthProbe ? metricFns[metric](r.probe) - metricFns[metric](r.noGrowthProbe) : null));
    compare(`${path}.growthDelta.${metric}.n`, actual.growthDelta[metric].n, deltas.length);
    compare(`${path}.growthDelta.${metric}.mean`, actual.growthDelta[metric].mean, mean(deltas));
  }
}
for (const raw of raws) {
  for (const [path, expected] of Object.entries(raw.manifest.sourceHashes)) {
    const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
    compare(`source:${path}`, actual, expected); checked.sourceHashes++;
    compare(`summarySource:${path}`, report.metadata.sourceHashes[path], expected);
  }
  compare(raw.path + '.manifest.n', raw.manifest.n, raw.campaigns.length);
}
compare('n', report.n, all.length);
compare('independentSeeds', report.independentSeeds, new Set(all.map(c => c.seed)).size);
for (const group of report.groups) {
  const enrolled = all.filter(c => c.difficulty === group.difficulty && (c.strategyKind === 'coverage' ? 'coverage' : 'natural') === group.cohort);
  const completed = enrolled.filter(c => !c.stopped && ['victory', 'defeat'].includes(c.phase));
  const prefix = `D${group.difficulty}:${group.cohort}`;
  compare(prefix + '.n', group.n, enrolled.length);
  compare(prefix + '.independentSeeds', group.independentSeeds, new Set(enrolled.map(c => c.seed)).size);
  compare(prefix + '.completed', group.completed, completed.length);
  compare(prefix + '.incomplete', group.incomplete, enrolled.length - completed.length);
  compare(prefix + '.wins', group.wins, completed.filter(c => c.phase === 'victory').length);
  compare(prefix + '.defeats', group.defeats, completed.filter(c => c.phase === 'defeat').length);
  compare(prefix + '.reached12.count', group.reached12.count, completed.filter(c => c.floor >= 12).length);
  compare(prefix + '.allDamage.mean', group.allDamage.mean, mean(completed.map(c => c.allDamage)));
  compare(prefix + '.sharedDamage.mean', group.sharedDamage.mean, mean(completed.map(c => c.sharedDamage)));
  const cardOrder = raws[0].manifest.metadata.map(c => c.id);
  compare(prefix + '.cards', group.cards.length, cardOrder.length);
  compare(prefix + '.cardIdentitySet', [...group.cards.map(c => c.id)].sort().join(','), [...cardOrder].sort().join(','));
  for (const card of group.cards) {
    checked.cards++;
    const records = completed.map(c => c.cards.find(r => r.id === card.id)).filter(Boolean);
    validateCard(`${card.id}.${prefix}`, card, records, completed);
    for (const phase of ['victory', 'defeat']) {
      const campaigns = completed.filter(c => c.phase === phase), records = campaigns.map(c => c.cards.find(r => r.id === card.id)).filter(Boolean);
      validateCard(`${card.id}.${prefix}.${phase}`, { id: card.id, ...card.outcomes[phase] }, records, campaigns);
    }
    const p = finite(records.map(r => r.probe ? metricFns.damagePerAppearance(r.probe) : null));
    recomputed.push({ group: prefix, id: card.id, name: card.name, attack: card.attack, endHeld: records.filter(r => r.endCount > 0).length,
      endGrowth: mean(finite(records.map(r => r.endGrowth))), probeN: p.length, probeDamage: mean(p),
      pooledProbeDamage: (() => { const rows = records.map(r => r.probe).filter(r => r?.appearances > 0); return rows.reduce((a, r) => a + r.normalDamage + r.skillDamage, 0) / rows.reduce((a, r) => a + r.appearances, 0); })(),
      growthDelta: mean(finite(records.map(r => r.probe && r.noGrowthProbe ? metricFns.damagePerAppearance(r.probe) - metricFns.damagePerAppearance(r.noGrowthProbe) : null))),
      probePower: mean(finite(records.map(r => r.probe ? metricFns.powerPerAppearance(r.probe) : null))),
      healing: mean(finite(records.map(r => r.probe ? metricFns.healingPerAppearance(r.probe) : null))),
      shield: mean(finite(records.map(r => r.probe ? metricFns.shieldPerAppearance(r.probe) : null))),
      buff: mean(finite(records.map(r => r.probe ? metricFns.buffPerAppearance(r.probe) : null))),
    });
  }
}
let permanentDamage = 0, sharedDamage = 0, allDamage = 0, negativeResiduals = 0, final12OutsideFloor12 = 0, malformed = 0;
for (const c of all) {
  let own = 0;
  if (c.won !== (c.phase === 'victory')) malformed++;
  for (const card of c.cards) {
    for (const stage of ['early', 'mid', 'late']) { const row = card.windows[stage]; if (row) own += row.normalDamage + row.skillDamage; }
    if (c.floor < 12 && card.windows.final12) final12OutsideFloor12++;
    if (card.probe && card.endCount <= 0) malformed++;
  }
  const residual = c.allDamage - c.sharedDamage - own;
  if (residual < -0.021) negativeResiduals++;
  permanentDamage += own; sharedDamage += c.sharedDamage; allDamage += c.allDamage;
}
const attackRows = recomputed.filter(c => c.attack !== 'support');
const output = {
  version: 'growth-independent-validation-v1', scope: 'Independent counts, normalized means, source hashes, stage eligibility and damage accounting; bootstrap intervals are not independently recalculated here.', summaryPath, rawPaths,
  passed: failures.length === 0 && !negativeResiduals && !final12OutsideFloor12 && !malformed,
  checked, failureCount: failures.length, failures: failures.slice(0, 50),
  campaigns: { n: all.length, uniqueSeeds: new Set(all.map(c => c.seed)).size, wins: all.filter(c => c.phase === 'victory').length, defeats: all.filter(c => c.phase === 'defeat').length, floors: Object.fromEntries([...new Set(all.map(c => c.floor))].sort().map(floor => [floor, all.filter(c => c.floor === floor).length])) },
  boundaries: { permanentDamage, sharedDamage, allDamage, excludedTemporaryOrCommissionCharacterDamage: allDamage - sharedDamage - permanentDamage, negativeResiduals, final12OutsideFloor12, malformed },
  highestGrowth: [...attackRows].sort((a, b) => b.endGrowth - a.endGrowth).slice(0, 10),
  lowestGrowth: [...attackRows].sort((a, b) => a.endGrowth - b.endGrowth).slice(0, 12),
  highestProbeDamage: [...attackRows].sort((a, b) => b.probeDamage - a.probeDamage).slice(0, 10),
  lowestProbeDamage: [...attackRows].sort((a, b) => a.probeDamage - b.probeDamage).slice(0, 10),
  supports: recomputed.filter(c => c.role ? c.role !== 'attack' : c.attack === 'support').sort((a, b) => b.probePower - a.probePower).slice(0, 8),
  sampleLimits: { below100: recomputed.filter(c => c.probeN < 100).map(c => ({ id: c.id, name: c.name, n: c.probeN })), minN: Math.min(...recomputed.map(c => c.probeN)), maxN: Math.max(...recomputed.map(c => c.probeN)), failedRunCount: all.filter(c => c.phase === 'defeat').length },
  cards: recomputed,
};
writeFileSync(summaryPath.replace(/\.json(?:\.gz)?$/, '') + '.validation.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ passed: output.passed, checked, failureCount: output.failureCount, failures: output.failures.slice(0, 8), campaigns: output.campaigns, boundaries: output.boundaries, sampleLimits: output.sampleLimits, highestGrowth: output.highestGrowth.slice(0, 5), lowestProbeDamage: output.lowestProbeDamage.slice(0, 4) }, null, 2));

if (!output.passed) process.exitCode = 1;
