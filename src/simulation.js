import { newGame, spin, chooseReward, removeSymbol, FINAL_FLOOR } from './engine.js';
import { recommendRewards, sampleRecommendation, createPolicyRandom, recommendRemoval, evaluateRun } from './ai.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { DIFFICULTY } from './difficulty.js';

const REWARD_PHASES = ['recruit', 'item', 'essence'];
const TERMINAL_PHASES = ['victory', 'defeat'];
const boundedInt = (value, fallback, max = 1000) => Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;
const modesFor = mode => mode === 'both' ? ['combat', 'classic'] : [mode === 'classic' ? 'classic' : 'combat'];
const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));

/** Policy draws never consume or inspect the engine's seeded random stream. */
export function runCampaign({ mode = 'combat', seed = 'simulation', profile = DEFAULT_PROFILE, policy = 'ai', maxActions = 1000, lookahead = true, policySeed, initialState, trace = false } = {}) {
  let state = initialState ? structuredClone(initialState) : newGame({ mode, seed });
  const random = createPolicyRandom(policySeed ?? `${state.seed}:policy`);
  const limit = boundedInt(maxActions, 1000, 5000);
  const picks = { recruit: {}, item: {}, essence: {} };
  const choices = [];
  let actions = 0;
  let removals = 0;
  let stopped = null;
  while (!TERMINAL_PHASES.includes(state.phase) && actions < limit) {
    if (policy === 'ai' && state.removals > 0 && ['ready', ...REWARD_PHASES].includes(state.phase)) {
      const uid = recommendRemoval(state, { profile });
      if (uid) {
        const next = removeSymbol(state, uid);
        if (next !== state) { state = next; actions += 1; removals += 1; continue; }
      }
    }
    let next;
    if (state.phase === 'ready') next = spin(state);
    else if (REWARD_PHASES.includes(state.phase) && state.choices.length) {
      const recommendation = policy === 'ai' ? recommendRewards(state, { profile, lookahead }) : {
        choices: state.choices.map((id, index) => ({ id, index, probability: 1 / state.choices.length })),
      };
      const draw = random();
      const index = sampleRecommendation(recommendation, draw);
      const id = state.choices[index];
      if (!id) { stopped = 'invalid-policy-choice'; break; }
      picks[state.phase][id] = (picks[state.phase][id] || 0) + 1;
      if (trace) choices.push({ floor: state.floor, phase: state.phase, options: state.choices.slice(), probabilities: recommendation.choices.map(choice => choice.probability), draw, index, id });
      next = chooseReward(state, index);
    } else { stopped = 'unknown-phase'; break; }
    if (next === state) { stopped = 'no-progress'; break; }
    state = next;
    actions += 1;
  }
  if (!TERMINAL_PHASES.includes(state.phase) && !stopped) stopped = 'action-limit';
  const won = state.phase === 'victory';
  return {
    mode: state.mode, seed: state.seed, policy, won, phase: state.phase,
    floor: state.floor, clearedFloors: won ? FINAL_FLOOR : Math.max(0, state.floor - 1),
    hp: state.hp, maxHp: state.maxHp, shield: state.shield, turns: state.stats.spins,
    damage: state.stats.damage, coins: state.stats.coins, merges: state.stats.merges,
    removed: removals, destroyed: state.stats.destroyed, actions, stopped,
    score: evaluateRun(state), picks, rosterSize: state.roster.length,
    itemCount: state.items.length, essenceCount: state.essences.length,
    activatedEssences: state.essences.filter(essence => essence.triggered).length,
    ...(trace ? { choices } : {}),
  };
}

/** Wilson's binomial interval remains useful at 0 / n and n / n wins. */
export function wilsonInterval(wins, runs) {
  if (runs <= 0) return [0, 1];
  const z = 1.959963984540054;
  const p = wins / runs;
  const denominator = 1 + z * z / runs;
  const center = (p + z * z / (2 * runs)) / denominator;
  const radius = z * Math.sqrt(p * (1 - p) / runs + z * z / (4 * runs * runs)) / denominator;
  return [Math.max(0, center - radius), Math.min(1, center + radius)];
}

export function summarizeCampaigns(results) {
  const n = results.length;
  const total = key => results.reduce((sum, result) => sum + result[key], 0);
  const avg = key => n ? total(key) / n : 0;
  const wins = results.filter(result => result.won).length;
  const failureByFloor = Array.from({ length: FINAL_FLOOR }, (_, index) => ({ floor: index + 1, count: results.filter(result => !result.won && result.floor === index + 1 && !result.stopped).length }));
  const picks = { recruit: {}, item: {}, essence: {} };
  for (const result of results) for (const phase of REWARD_PHASES) for (const [id, count] of Object.entries(result.picks[phase])) picks[phase][id] = (picks[phase][id] || 0) + count;
  return {
    runs: n, wins, winRate: n ? wins / n : 0, winRateCI: wilsonInterval(wins, n),
    avgFloor: avg('floor'), avgClearedFloors: avg('clearedFloors'), avgHp: avg('hp'),
    avgTurns: avg('turns'), avgDamage: avg('damage'), avgCoins: avg('coins'),
    avgMerges: avg('merges'), avgRemovals: avg('removed'), avgRosterSize: avg('rosterSize'),
    avgItems: avg('itemCount'), avgEssences: avg('essenceCount'), avgActivatedEssences: avg('activatedEssences'),
    avgScore: avg('score'), failureByFloor, picks, incomplete: results.filter(result => result.stopped).length,
  };
}

function pairedDifference(ai, uniform) {
  const n = ai.length;
  const differences = ai.map((result, index) => Number(result.won) - Number(uniform[index].won));
  const winRate = n ? differences.reduce((sum, value) => sum + value, 0) / n : 0;
  // Do not put a normal CI on paired differences: with no discordant outcomes it
  // degenerates to [0, 0], even though a small sample cannot establish equivalence.
  const outcomes = { aiOnlyWins: 0, uniformOnlyWins: 0, bothWin: 0, bothLoss: 0 };
  for (let index = 0; index < n; index++) outcomes[ai[index].won ? uniform[index].won ? 'bothWin' : 'aiOnlyWins' : uniform[index].won ? 'uniformOnlyWins' : 'bothLoss'] += 1;
  return { winRate, avgFloor: n ? ai.reduce((sum, result, index) => sum + result.floor - uniform[index].floor, 0) / n : 0, pairedSeeds: n, outcomes };
}

/** Async batches let the browser worker emit progress and process cancellation. */
export async function benchmarkPolicies({ mode = 'combat', runs = 100, seed = 'balance-v1', profile = DEFAULT_PROFILE, lookahead = true, onProgress, maxActions } = {}) {
  const started = performance.now();
  const count = boundedInt(runs, 100, 2000);
  const modes = modesFor(mode);
  const reports = [];
  const total = count * modes.length * 2;
  let completed = 0;
  for (const currentMode of modes) {
    const ai = [];
    const uniform = [];
    for (let index = 0; index < count; index++) {
      const gameSeed = `${seed}:holdout:${currentMode}:${index}`;
      for (const policy of ['ai', 'uniform']) {
        const result = runCampaign({ mode: currentMode, seed: gameSeed, policySeed: `${gameSeed}:actions`, profile, policy, lookahead, maxActions });
        (policy === 'ai' ? ai : uniform).push(result);
        completed += 1;
        onProgress?.({ completed, total, mode: currentMode, policy, wins: (policy === 'ai' ? ai : uniform).filter(run => run.won).length, floor: result.floor, stage: 'benchmark', elapsedMs: performance.now() - started });
      }
      if (index % 2 === 0) await yieldToEventLoop();
    }
    reports.push({ mode: currentMode, ai: summarizeCampaigns(ai), uniform: summarizeCampaigns(uniform), difference: pairedDifference(ai, uniform) });
  }
  return { version: 1, seed, rules: structuredClone(DIFFICULTY), profileName: profile.name ?? profile.version, profile: structuredClone(profile), lookahead, runs: count, modes: reports, elapsedMs: performance.now() - started };
}

const campaignObjective = result => Number(result.won) * 1000 + result.clearedFloors * 50 + Math.min(1, Math.max(0, result.hp / result.maxHp)) * 2 + result.score * 0.0001;

async function evaluateProfile({ profile, mode, runs, seed, split, lookahead, onProgress, progress, maxActions }) {
  const results = [];
  for (const currentMode of modesFor(mode)) for (let index = 0; index < runs; index++) {
    const gameSeed = `${seed}:${split}:${currentMode}:${index}`;
    const result = runCampaign({ mode: currentMode, seed: gameSeed, policySeed: `${gameSeed}:actions`, profile, lookahead, maxActions });
    results.push(result);
    progress.completed += 1;
    onProgress?.({ ...progress, stage: split, mode: currentMode, floor: result.floor });
    if (index % 2 === 0) await yieldToEventLoop();
  }
  return { objective: results.reduce((sum, result) => sum + campaignObjective(result), 0) / results.length, summary: summarizeCampaigns(results), modes: modesFor(mode).map(currentMode => ({ mode: currentMode, ...summarizeCampaigns(results.filter(result => result.mode === currentMode)) })) };
}

function perturbProfile(base, random, generation) {
  const candidate = structuredClone(base);
  const keys = Object.keys(candidate.weights);
  // Preserve every profile field and let the same validator as the UI enforce bounds.
  const changes = Math.min(keys.length, 2 + Math.floor(random() * 3));
  for (let index = 0; index < changes; index++) {
    const key = keys[Math.floor(random() * keys.length)];
    const scale = Math.max(0.2, Math.abs(candidate.weights[key]));
    candidate.weights[key] = Math.max(0, Math.min(5, candidate.weights[key] + (random() * 2 - 1) * scale * (0.5 / (generation + 1))));
  }
  candidate.temperature = Math.max(0.25, Math.min(20, candidate.temperature * (0.65 + random() * 0.7)));
  const valid = validateProfile(candidate);
  return valid && typeof valid === 'object' ? valid : valid === true ? candidate : structuredClone(base);
}

/** Disjoint train / validation / holdout seeds; a failed holdout never replaces the profile. */
export async function trainProfile({ mode = 'both', runs = 40, seed = 'training-v1', profile = DEFAULT_PROFILE, generations = 2, candidates = 4, holdoutRuns, lookahead = true, explorationLookahead = false, onProgress, maxActions } = {}) {
  const started = performance.now();
  const count = boundedInt(runs, 40, 250);
  const generationCount = boundedInt(generations, 2, 4);
  const candidateCount = boundedInt(candidates, 4, 6);
  const holdoutCount = boundedInt(holdoutRuns, Math.max(60, count), 500);
  const modeCount = modesFor(mode).length;
  const progress = { completed: 0, total: modeCount * (count * (1 + generationCount * candidateCount + generationCount + 1) + holdoutCount * 2) };
  const random = createPolicyRandom(`${seed}:mutation`);
  const training = [];
  let best = structuredClone(profile);
  let bestTraining = await evaluateProfile({ profile: best, mode, runs: count, seed, split: 'train', lookahead: explorationLookahead, onProgress, progress, maxActions });
  let bestValidation = await evaluateProfile({ profile: best, mode, runs: count, seed, split: 'validation', lookahead: explorationLookahead, onProgress, progress, maxActions });
  const baselineTraining = bestTraining;
  const baselineValidation = bestValidation;
  for (let generation = 0; generation < generationCount; generation++) {
    let candidateBest = best;
    let candidateEvaluation = bestTraining;
    for (let index = 0; index < candidateCount; index++) {
      const candidate = perturbProfile(best, random, generation);
      const evaluation = await evaluateProfile({ profile: candidate, mode, runs: count, seed, split: 'train', lookahead: explorationLookahead, onProgress, progress, maxActions });
      training.push({ generation: generation + 1, candidate: index + 1, objective: evaluation.objective, winRate: evaluation.summary.winRate, avgFloor: evaluation.summary.avgFloor });
      if (evaluation.objective > candidateEvaluation.objective) { candidateBest = candidate; candidateEvaluation = evaluation; }
    }
    const validation = await evaluateProfile({ profile: candidateBest, mode, runs: count, seed, split: 'validation', lookahead: explorationLookahead, onProgress, progress, maxActions });
    if (validation.objective > bestValidation.objective) { best = candidateBest; bestTraining = candidateEvaluation; bestValidation = validation; }
  }
  const baselineHoldout = await evaluateProfile({ profile, mode, runs: holdoutCount, seed, split: 'holdout', lookahead, onProgress, progress, maxActions });
  const candidateHoldout = await evaluateProfile({ profile: best, mode, runs: holdoutCount, seed, split: 'holdout', lookahead, onProgress, progress, maxActions });
  const changed = JSON.stringify(best.weights) !== JSON.stringify(profile.weights) || best.temperature !== profile.temperature;
  const accepted = changed && candidateHoldout.objective > baselineHoldout.objective && candidateHoldout.summary.winRate >= baselineHoldout.summary.winRate && candidateHoldout.summary.avgClearedFloors >= baselineHoldout.summary.avgClearedFloors;
  return {
    version: 1, seed, rules: structuredClone(DIFFICULTY), mode, runs: count, holdoutRuns: holdoutCount, generations: generationCount, candidates: candidateCount,
    accepted, baselineProfile: structuredClone(profile), profile: accepted ? best : structuredClone(profile), candidateProfile: best,
    baseline: baselineHoldout, trained: candidateHoldout,
    holdout: { baseline: baselineHoldout, candidate: candidateHoldout, separateFromTraining: true, lookahead },
    training: { baseline: baselineTraining, best: bestTraining, evaluations: training, lookahead: explorationLookahead },
    validation: { baseline: baselineValidation, best: bestValidation },
    completed: progress.completed, elapsedMs: performance.now() - started,
  };
}
