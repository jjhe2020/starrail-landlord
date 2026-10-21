import { createReadStream } from 'node:fs';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createGunzip } from 'node:zlib';
import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const NATURAL_GROWTH_AUDIT_PROTOCOL = 'v070-natural-growth-audit-v1';
const ROLES = ['attack', 'defense', 'amplifier', 'trainer', 'disruptor'];
const STARS = [1, 2, 3];
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))));
const finiteNonnegative = value => Number.isFinite(value) && value >= 0;
const integer = (value, minimum = 0) => Number.isInteger(value) && value >= minimum;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const emptyRoleCounts = () => Object.fromEntries(ROLES.map(role => [role, 0]));
const emptyRoleMaxima = () => Object.fromEntries(ROLES.map(role => [role, null]));
const emptyStarCounts = () => Object.fromEntries(STARS.map(star => [star, 0]));
const add = (map, key) => map.set(key, (map.get(key) || 0) + 1);

/** R-7 linear quantiles. These are descriptive; no independence or CI is claimed. */
export function descriptiveQuantiles(values) {
  if (!values.length) return { n: 0, median: null, p90: null, p95: null, p99: null, max: null };
  requireValue(values.every(finiteNonnegative), 'Nonfinite or negative growth observation');
  const sorted = values.slice().sort((a, b) => a - b);
  const at = probability => { const index = (sorted.length - 1) * probability, lower = Math.floor(index); return sorted[lower] + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * (index - lower); };
  return { n: sorted.length, median: at(.5), p90: at(.9), p95: at(.95), p99: at(.99), max: sorted.at(-1) };
}
async function fileHash(path) { const hash = createHash('sha256'); for await (const chunk of createReadStream(path)) hash.update(chunk); return hash.digest('hex'); }

async function consumeCampaignFile(path, onHeader, onCampaign) {
  requireValue(/\.jsonl(?:\.gz)?$/.test(path), 'Natural audit inputs must be .jsonl or .jsonl.gz raw reports');
  const source = createReadStream(path), output = new PassThrough(), hash = createHash('sha256');
  source.on('data', chunk => hash.update(chunk));
  const pumping = path.endsWith('.gz') ? pipeline(source, createGunzip(), output) : pipeline(source, output);
  pumping.catch(() => {});
  const lines = createInterface({ input: output, crlfDelay: Infinity });
  let header = null, ended = false, rows = 0, lineNumber = 0;
  try {
    for await (const line of lines) {
      lineNumber++;
      requireValue(line.trim().length > 0, `Blank JSONL record: ${path}:${lineNumber}`);
      const record = JSON.parse(line);
      requireValue(object(record) && !ended, `Invalid record or data after footer: ${path}:${lineNumber}`);
      if (!header) {
        requireValue(record.kind === 'header' && record.format === 'v070-results-jsonl-v1' && object(record.value), `Invalid report header: ${path}`);
        requireValue(object(record.expectedCounts) && integer(record.expectedCounts.rows, 1) && record.expectedCounts.future === 0, `Expected nonempty campaign rows and no future records: ${path}`);
        header = record; onHeader(header.value); continue;
      }
      if (record.kind === 'row') {
        requireValue(object(record.value), `Invalid campaign row: ${path}:${lineNumber}`);
        rows++; requireValue(rows <= header.expectedCounts.rows, `Too many campaign rows: ${path}`);
        onCampaign(record.value);
      } else if (record.kind === 'end') {
        requireValue(record.counts?.rows === rows && record.counts?.future === 0 && rows === header.expectedCounts.rows, `Raw report count mismatch: ${path}`);
        ended = true;
      } else throw new Error(`Unexpected raw record kind ${record.kind}: ${path}:${lineNumber}`);
    }
    await pumping;
    requireValue(header && ended, `Truncated raw report: ${path}`);
    const sha256 = hash.digest('hex');
    requireValue(sha256 === await fileHash(path), `Raw report changed while auditing: ${path}`);
    return { path, sha256, rows, gameVersion: header.value.gameVersion, policyVersion: header.value.policyVersion, config: header.value.config, sourceHashes: header.value.sourceHashes };
  } finally { lines.close(); output.destroy(); source.destroy(); await pumping.catch(() => {}); }
}
function groupFor(difficulty) {
  return { difficulty, campaigns: 0, sampleCountsByPolicy: new Map(), seedsByPolicy: new Map(), seeds: new Set(), strategies: null, runMaxima: [], finalGrowth: [], maxLateGrowth: null, maxPresentLateGrowth: null, maxLateGrowthByRole: emptyRoleMaxima(), maxPresentLateGrowthByRole: emptyRoleMaxima(), lateHeldTurns: 0, latePresentTurns: 0, lateRoles: emptyRoleCounts(), terminalStars: emptyStarCounts(), terminalPresentTurns: 0, terminalObservedCampaigns: 0, terminalObservedSeeds: new Set(), terminalFloors: new Map(), atLeast6: 0, atLeast12: 0 };
}
function validateUnit(unit, cards, context) {
  requireValue(object(unit) && cards.has(unit.id), `Unknown card in ${context}`);
  requireValue(STARS.includes(unit.stars), `Invalid stars in ${context}`);
  return cards.get(unit.id);
}

export async function auditNaturalGrowthInputs(inputPaths) {
  requireValue(Array.isArray(inputPaths) && inputPaths.length > 0, 'At least one raw input is required');
  const paths = await Promise.all(inputPaths.map(path => realpath(resolve(path))));
  requireValue(new Set(paths).size === paths.length, 'Duplicate raw input path');
  const groups = new Map(), observed = new Set(), sources = [];
  let frozen = null, cards = null;
  for (const path of paths) {
    let header = null, group = null;
    sources.push(await consumeCampaignFile(path, value => {
      header = value;
      requireValue(header.sourceStable === true && header.config?.mode === 'campaigns', 'Only stable natural campaign reports may be audited');
      requireValue(object(header.sourceHashes) && Object.keys(header.sourceHashes).length > 0 && Object.values(header.sourceHashes).every(hash => /^[a-f0-9]{64}$/.test(hash)), 'Missing frozen source fingerprint');
      requireValue(typeof header.gameVersion === 'string' && typeof header.policyVersion === 'string', 'Missing game/policy version');
      const identity = { gameVersion: header.gameVersion, policyVersion: header.policyVersion, sourceHashes: canonical(header.sourceHashes) };
      if (frozen) requireValue(canonical(identity) === canonical(frozen), 'Different frozen source fingerprint or game/policy version');
      else frozen = identity;
      requireValue(Array.isArray(header.cards) && header.cards.length > 0 && new Set(header.cards.map(card => card.id)).size === header.cards.length && header.cards.every(card => typeof card.id === 'string' && ROLES.includes(card.role)), 'Invalid card role metadata');
      const nextCards = new Map(header.cards.map(card => [card.id, { id: card.id, name: card.name, role: card.role }]));
      if (cards) requireValue(canonical(Object.fromEntries(nextCards)) === canonical(Object.fromEntries(cards)), 'Different card role metadata');
      else cards = nextCards;
      const difficulty = header.config.difficulty;
      requireValue(integer(difficulty, 1), 'Missing report difficulty');
      if (!groups.has(difficulty)) groups.set(difficulty, groupFor(difficulty));
      group = groups.get(difficulty);
      requireValue(Array.isArray(header.strategies) && header.strategies.length > 0 && header.strategies.every(strategy => typeof strategy.id === 'string'), 'Missing policy declarations');
      const strategies = [...new Set(header.strategies.map(strategy => strategy.id))].sort();
      requireValue(strategies.length === header.strategies.length, 'Duplicate declared policy');
      if (group.strategies) requireValue(JSON.stringify(strategies) === JSON.stringify(group.strategies), 'Policy sets differ within a difficulty');
      else group.strategies = strategies;
    }, run => {
      requireValue(run.difficulty === group.difficulty && typeof run.seed === 'string' && run.seed.length > 0 && group.strategies.includes(run.strategyId), 'Invalid natural sample/policy identity');
      requireValue(['victory', 'defeat'].includes(run.phase) && !run.stopped, 'Incomplete natural campaign');
      requireValue(integer(run.floor, 1) && Array.isArray(run.finalRoster) && Array.isArray(run.turns), 'Missing final roster or turn trace');
      const key = JSON.stringify([run.difficulty, run.seed, run.strategyId]);
      requireValue(!observed.has(key), 'Duplicate campaign sample/policy observation'); observed.add(key);
      group.campaigns++; group.seeds.add(run.seed); add(group.sampleCountsByPolicy, run.strategyId);
      if (!group.seedsByPolicy.has(run.strategyId)) group.seedsByPolicy.set(run.strategyId, new Set());
      group.seedsByPolicy.get(run.strategyId).add(run.seed);
      let maximum = 0;
      for (const unit of run.finalRoster) {
        validateUnit(unit, cards, 'finalRoster'); requireValue(finiteNonnegative(unit.growth), 'Invalid final retained growth');
        maximum = Math.max(maximum, unit.growth); group.finalGrowth.push(unit.growth);
      }
      group.runMaxima.push(maximum); group.atLeast6 += Number(maximum >= 6); group.atLeast12 += Number(maximum >= 12);
      add(group.terminalFloors, run.floor);
      let terminalObserved = false;
      for (const turn of run.turns) {
        requireValue(integer(turn.floor, 1) && turn.floor <= run.floor && Array.isArray(turn.cards), 'Invalid turn floor or card trace');
        const late = turn.floor >= 9, terminal = turn.floor === run.floor;
        if (terminal) terminalObserved = true;
        for (const unit of turn.cards) {
          const definition = validateUnit(unit, cards, 'turn trace');
          requireValue(unit.role === undefined || unit.role === definition.role, 'Turn role conflicts with frozen content');
          requireValue(unit.present === 0 || unit.present === 1 || typeof unit.present === 'boolean', 'Missing actual appearance flag');
          requireValue(finiteNonnegative(unit.endGrowth), 'Invalid observed retained growth');
          if (late) {
            group.lateHeldTurns++; group.maxLateGrowth = Math.max(group.maxLateGrowth ?? 0, unit.endGrowth);
            group.maxLateGrowthByRole[definition.role] = Math.max(group.maxLateGrowthByRole[definition.role] ?? 0, unit.endGrowth);
            if (unit.present) {
              group.latePresentTurns++; group.lateRoles[definition.role]++; group.maxPresentLateGrowth = Math.max(group.maxPresentLateGrowth ?? 0, unit.endGrowth);
              group.maxPresentLateGrowthByRole[definition.role] = Math.max(group.maxPresentLateGrowthByRole[definition.role] ?? 0, unit.endGrowth);
            }
          }
          if (terminal && unit.present) { group.terminalPresentTurns++; group.terminalStars[unit.stars]++; }
        }
      }
      if (terminalObserved) { group.terminalObservedCampaigns++; group.terminalObservedSeeds.add(run.seed); }
    }));
  }
  const difficulties = [...groups.values()].sort((a, b) => a.difficulty - b.difficulty).map(group => {
    const seeds = [...group.seeds].sort();
    for (const strategy of group.strategies) requireValue(JSON.stringify([...(group.seedsByPolicy.get(strategy) || [])].sort()) === JSON.stringify(seeds), 'Policies do not share the complete seed set; mixture is not uniform');
    return {
      difficulty: group.difficulty, campaignCount: group.campaigns, sharedSeedBlockCount: seeds.length, policyCount: group.strategies.length,
      samplesPerPolicy: Object.fromEntries(group.strategies.map(id => [id, group.sampleCountsByPolicy.get(id)])), sharedSeeds: seeds,
      finalRosterRunMaximumGrowth: { ...descriptiveQuantiles(group.runMaxima), campaignsAtLeast6: group.atLeast6, campaignsAtLeast12: group.atLeast12 },
      finalRosterInstanceGrowth: descriptiveQuantiles(group.finalGrowth),
      lateObservedGrowth: { maxAllHeld: group.maxLateGrowth, maxActuallyPresent: group.maxPresentLateGrowth, maxAllHeldByRole: group.maxLateGrowthByRole, maxActuallyPresentByRole: group.maxPresentLateGrowthByRole, heldInstanceTurns: group.lateHeldTurns, presentInstanceTurns: group.latePresentTurns },
      terminalEncounterStars: { campaignsWithRecordedTerminalTurn: group.terminalObservedCampaigns, sharedSeedsWithRecordedTerminalTurn: group.terminalObservedSeeds.size, actualTerminalFloorCounts: Object.fromEntries([...group.terminalFloors].sort(([a], [b]) => a - b)), presentInstanceTurns: group.terminalPresentTurns, counts: group.terminalStars, shares: Object.fromEntries(STARS.map(star => [star, group.terminalPresentTurns ? group.terminalStars[star] / group.terminalPresentTurns : null])) },
      lateRoleAppearanceShares: { presentInstanceTurns: group.latePresentTurns, counts: group.lateRoles, shares: Object.fromEntries(ROLES.map(role => [role, group.latePresentTurns ? group.lateRoles[role] / group.latePresentTurns : null])) },
    };
  });
  return {
    protocol: NATURAL_GROWTH_AUDIT_PROTOCOL, gameVersion: frozen.gameVersion, policyVersion: frozen.policyVersion,
    definitions: {
      population: 'Descriptive uniform mixture of the included policies, not independent human-player observations. No confidence intervals are produced.',
      statisticalUnit: 'Shared seed block count is listed separately; each seed appears under every declared policy within its difficulty.',
      quantiles: 'R-7 linearly interpolated descriptive quantiles; per-campaign maxima use finalRoster only, never a departed-card snapshot.',
      terminalEncounter: 'All recorded turns at the actual run.floor; only present=1 instance turns contribute to star shares. The actual final floor need not be 12.',
      late: 'Recorded floor >= 9; role shares count actual appearances, while maxAllHeld also includes held but absent instances.',
      instances: 'Normal, temporary and commission instances are pooled because frozen records do not preserve the status/UID needed to separate them.',
    },
    validation: { ready: true, checks: ['stable identical frozen source fingerprint', 'compressed/raw file SHA-256 stable across audit', 'unique campaign sample/policy identities', 'complete common seed set for every included policy', 'finalRoster versus observed turn provenance', 'actual terminal floor and actual appearances'] },
    frozenSourceHashes: JSON.parse(frozen.sourceHashes), sources, difficulties,
    analysisSourceHashes: { 'scripts/v070-natural-growth-audit.mjs': createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex') },
  };
}

async function main() {
  const args = process.argv.slice(2), options = new Map();
  for (let index = 0; index < args.length; index += 2) { const key = args[index], value = args[index + 1]; requireValue(['--inputs', '--output'].includes(key) && value && !value.startsWith('--') && !options.has(key), 'Use --inputs path1,path2 --output audit.json'); options.set(key, value); }
  requireValue(options.has('--inputs') && options.has('--output'), 'Use --inputs path1,path2 --output audit.json');
  const paths = options.get('--inputs').split(',').map(path => path.trim()); requireValue(paths.every(Boolean), 'Empty input path');
  const result = await auditNaturalGrowthInputs(paths), output = resolve(options.get('--output'));
  const actualOutput = await realpath(output).catch(error => { if (error.code !== 'ENOENT') throw error; return output; });
  requireValue(!result.sources.some(source => source.path === actualOutput), 'Output must not overwrite a raw input');
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(result, null, 2) + '\n');
  console.log(`${result.difficulties.map(row => `D${row.difficulty}: ${row.campaignCount} campaigns / ${row.sharedSeedBlockCount} shared seeds / ${row.policyCount} policies`).join('; ')}; ${output}`);
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
