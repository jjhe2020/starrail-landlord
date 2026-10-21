import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { interval } from '../src/balance-v070.js';
import { readV070Report, hashV070File } from './v070-results-io.mjs';

export const TERMINAL_CARD_PROTOCOL = 'v070-terminal-card-observation-v1';
const METRICS = ['damage', 'healing', 'shieldGenerated', 'growthLevel'];
const zero = () => Object.fromEntries(METRICS.map(key => [key, 0]));
const add = (target, source) => { for (const key of METRICS) target[key] += source[key]; };
const emptyCard = () => ({ held: 0, present: 0, heldValues: zero(), presentValues: zero() });
const outcomeMatches = (run, outcome) => outcome === 'all' || (outcome === 'victory' ? run.won : !run.won);
const round = n => Number.isFinite(n) ? Math.round(n * 1e6) / 1e6 : null;

function observeRun(run, scope, knownIds) {
  const cards = new Map();
  const selected = run.turns.filter(turn => turn.floor === (scope === 'terminal' ? run.floor : 12));
  for (const turn of selected) for (const row of turn.cards) {
    if (!knownIds.has(row.id)) throw new Error(`Unknown terminal card ${row.id}`);
    if (![0, 1].includes(row.held) || ![0, 1].includes(row.present) || row.present > row.held) throw new Error('Held/present flags must describe one recorded instance turn');
    const values = { damage: row.damage, healing: row.healing, shieldGenerated: row.shield, growthLevel: row.endGrowth };
    if (Object.values(values).some(value => !Number.isFinite(value) || value < 0)) throw new Error('Terminal output and retained growth levels must be finite nonnegative records');
    if (!cards.has(row.id)) cards.set(row.id, emptyCard());
    const card = cards.get(row.id); card.held += row.held; card.present += row.present;
    if (row.held) add(card.heldValues, values);
    if (row.present) add(card.presentValues, values);
  }
  return { run, cards, selectedTurns: selected.length };
}

function outcomePanel(observed, metadata, outcome, scope) {
  const selected = observed.filter(entry => outcomeMatches(entry.run, outcome)), bySeed = new Map(), floors = {};
  for (const entry of selected) { if (!bySeed.has(entry.run.seed)) bySeed.set(entry.run.seed, []); bySeed.get(entry.run.seed).push(entry); floors[entry.run.floor] = (floors[entry.run.floor] || 0) + 1; }
  return { id: outcome, scope, campaigns: selected.length, seeds: bySeed.size, reachedCampaigns: selected.filter(entry => entry.selectedTurns > 0).length, terminalFloors: floors,
    cards: metadata.map(definition => {
      let heldCampaigns = 0, appearedCampaigns = 0, heldInstanceTurns = 0, presentInstanceTurns = 0;
      const totals = zero(), appearanceTotals = zero(), clusters = [];
      for (const [seed, entries] of bySeed) {
        const aggregate = emptyCard();
        for (const entry of entries) {
          const card = entry.cards.get(definition.id); if (!card) continue;
          heldCampaigns += Number(card.held > 0); appearedCampaigns += Number(card.present > 0);
          aggregate.held += card.held; aggregate.present += card.present; add(aggregate.heldValues, card.heldValues); add(aggregate.presentValues, card.presentValues);
        }
        heldInstanceTurns += aggregate.held; presentInstanceTurns += aggregate.present; add(totals, aggregate.heldValues); add(appearanceTotals, aggregate.presentValues);
        clusters.push({ seed, campaigns: entries.length, ...aggregate });
      }
      const heldClusters = clusters.filter(cluster => cluster.held > 0), appearedClusters = clusters.filter(cluster => cluster.present > 0);
      const per = (list, valueKey, denominator) => Object.fromEntries(METRICS.map(key => [key, interval(list.map(cluster => cluster[valueKey][key] / cluster[denominator]))]));
      const pooled = (values, denominator) => Object.fromEntries(METRICS.map(key => [key, denominator ? round(values[key] / denominator) : null]));
      return { id: definition.id, name: definition.name, role: definition.role, heldCampaigns, appearedCampaigns, heldInstanceTurns, presentInstanceTurns, heldSeeds: heldClusters.length, appearedSeeds: appearedClusters.length,
        perAppearance: per(appearedClusters, 'presentValues', 'present'), perHeldInstanceTurn: per(heldClusters, 'heldValues', 'held'),
        totals, appearanceTotals, pooledPerAppearance: pooled(appearanceTotals, presentInstanceTurns), pooledPerHeldInstanceTurn: pooled(totals, heldInstanceTurns),
        perCampaignAllSeeds: Object.fromEntries(['damage', 'healing', 'shieldGenerated'].map(key => [key, interval(clusters.map(cluster => cluster.heldValues[key] / cluster.campaigns))])) };
    }) };
}

/** Observational rates: each shared seed is a cluster, never each card/turn/policy. */
export function analyzeTerminalCards(inputs, { final12 = false } = {}) {
  const entries = inputs.map(entry => entry.report ? entry : { report: entry }), errors = [], warnings = [], hashes = new Map(), uniqueRuns = new Set();
  const referenceMetadata = entries[0]?.report.cards || [], knownIds = new Set(referenceMetadata.map(card => card.id));
  if (!entries.length) errors.push('No campaign reports supplied');
  for (const { report } of entries) {
    if (report.config?.mode !== 'campaigns') errors.push('Terminal analysis requires campaign reports');
    if (report.sourceStable !== true) errors.push('Campaign report does not confirm stable source fingerprints');
    if (JSON.stringify(report.cards.map(card => card.id).sort()) !== JSON.stringify([...knownIds].sort())) errors.push('Campaign card populations differ');
    for (const [file, sha] of Object.entries(report.sourceHashes || {})) { if (hashes.has(file) && hashes.get(file) !== sha) errors.push(`Campaign source mismatch: ${file}`); hashes.set(file, sha); }
    for (const run of report.rows) {
      const key = `${report.config.difficulty}|${run.strategyId}|${run.seed}`; if (uniqueRuns.has(key)) errors.push(`Duplicate campaign ${key}`); uniqueRuns.add(key);
      if (run.stopped || !['victory', 'defeat'].includes(run.phase) || run.won !== (run.phase === 'victory')) errors.push(`Incomplete or inconsistent campaign ${key}`);
      if (run.difficulty !== report.config.difficulty || !Number.isInteger(run.floor) || run.floor < 1 || run.floor > 12) errors.push(`Invalid campaign difficulty/floor ${key}`);
      if (!run.turns.some(turn => turn.floor === run.floor)) warnings.push(`No recorded terminal encounter turns: ${key}`);
    }
  }
  const difficulties = [...new Set(entries.map(entry => entry.report.config.difficulty))].sort((a, b) => a - b).map(difficulty => {
    const runs = entries.filter(entry => entry.report.config.difficulty === difficulty).flatMap(entry => entry.report.rows), observed = runs.map(run => observeRun(run, 'terminal', knownIds));
    return { difficulty, outcomes: ['all', 'victory', 'defeat'].map(outcome => outcomePanel(observed, referenceMetadata, outcome, 'terminal')),
      ...(final12 ? { final12Outcomes: ['all', 'victory', 'defeat'].map(outcome => outcomePanel(runs.map(run => observeRun(run, 'floor12', knownIds)), referenceMetadata, outcome, 'floor12')) } : {}) };
  });
  return { gameVersion: entries[0]?.report.gameVersion || null, protocol: TERMINAL_CARD_PROTOCOL, validation: { ready: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)] },
    sources: entries.map(entry => ({ path: entry.path || null, sha256: entry.sha256 || null, split: entry.report.config.split, difficulty: entry.report.config.difficulty, sourceHashes: entry.report.sourceHashes })),
    definitions: { terminalEncounter: 'All recorded turns whose floor equals the actual final run.floor, including failed encounters before floor12.',
      unit: 'Shared seed is the independent cluster. Sum numerators and instance-turn denominators across all included policies with that seed/outcome, calculate one rate per eligible seed, then report the equal-seed mean and Student-t 95% interval.',
      outcomes: 'Victory/defeat are descriptive post-outcome subsets, not causal card effects. all includes every completed campaign.',
      instances: 'All recorded instances are pooled, including normal, temporary and commission instances. Frozen campaign records omit their status/UID, so permanent-only rates cannot be reconstructed.',
      damage: 'Recorded own character-source damage only, including ordinary attacks and declared character attacks. Shared item/resonance/synergy damage is excluded. Support damage can legitimately be zero.',
      support: 'healing is actual source-attributed HP restoration; shieldGenerated is generated shield, not proof that it was used. GrowthLevel is retained growth level at that instance turn, not growth newly granted.',
      denominators: 'perAppearance uses present instance turns and only their outputs/levels; perHeldInstanceTurn includes all held instance turns, with absent instances retained as zero output. Missing exposure gives null mean/CI, not zero.',
      pooled: 'pooledPerAppearance/pooledPerHeldInstanceTurn are exposure-weighted descriptive point rates, separate from the equal-seed estimates/intervals.',
      final12: 'Optional floor12 outcomes keep non-reachers as zero in perCampaignAllSeeds. Per-appearance/per-held rates remain conditional on actual exposure.' }, difficulties };
}

export async function runTerminalCli(args) {
  const options = new Map(); for (let i = 0; i < args.length; i += 2) { const key = args[i]?.slice(2), value = args[i + 1]; if (!['inputs', 'output', 'check-current', 'final12'].includes(key) || options.has(key) || !value) throw new Error('Use --inputs paths --output path [--check-current true|false] [--final12 true|false]'); options.set(key, value); }
  if (!options.has('inputs')) throw new Error('--inputs is required');
  for (const key of ['check-current', 'final12']) if (options.has(key) && !['true', 'false'].includes(options.get(key))) throw new Error(`${key} must be true or false`);
  const inputs = []; for (const path of options.get('inputs').split(',').map(value => resolve(value))) inputs.push({ path, sha256: await hashV070File(path), report: await readV070Report(path) });
  const result = analyzeTerminalCards(inputs, { final12: options.get('final12') === 'true' });
  result.analysisSourceHashes = { 'scripts/v070-terminal-cards.mjs': createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex') };
  if (options.get('check-current') !== 'false') for (const { report } of inputs) for (const [file, sha] of Object.entries(report.sourceHashes)) { const bytes = await readFile(new URL(`../${file}`, import.meta.url)); if (createHash('sha256').update(bytes).digest('hex') !== sha) result.validation.errors.push(`Current source differs: ${file}`); }
  result.validation.errors = [...new Set(result.validation.errors)]; result.validation.ready = result.validation.errors.length === 0;
  const output = resolve(options.get('output') || 'docs/V070-TERMINAL-CARDS.json'); await mkdir(dirname(output), { recursive: true }); await writeFile(`${output}.tmp`, JSON.stringify(result) + '\n'); await rename(`${output}.tmp`, output);
  console.log(JSON.stringify({ output, ...result.validation, difficulties: result.difficulties.map(entry => ({ difficulty: entry.difficulty, campaigns: entry.outcomes.find(panel => panel.id === 'all').campaigns, seeds: entry.outcomes.find(panel => panel.id === 'all').seeds })) }, null, 2));
  return result.validation.ready;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) { if (!await runTerminalCli(process.argv.slice(2))) process.exitCode = 1; }
