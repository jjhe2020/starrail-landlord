// Public difficulty is independent of encounter number and resource experiments.
export const DIFFICULTY = {
  version: 'difficulty-v6',
  min: 1,
  max: 20,
  default: 10,
  baseHealthScale: 0.25,
  difficulty10HealthMultiplier: 1,
  // Two continuous public slopes keep the lower resource bands independently tunable.
  difficultyStepMultiplier: 1.235,
  lowerDifficultyPivot: 6,
  lowerDifficultyStepMultiplier: 1.22,
  combatLateHealthMultiplier: 1.5,
  debuffStartFloor: 4,
  ambientDebuffs: 1,
};

export function normalizeDifficulty(value = DIFFICULTY.default) {
  return Number.isFinite(value) ? Math.max(DIFFICULTY.min, Math.min(DIFFICULTY.max, Math.round(value))) : DIFFICULTY.default;
}

export function difficultyHealthMultiplier(difficulty = DIFFICULTY.default) {
  const level = normalizeDifficulty(difficulty);
  const pivot = DIFFICULTY.lowerDifficultyPivot;
  const upper = DIFFICULTY.difficultyStepMultiplier ** ((Math.max(level, pivot) - 10) / 2);
  const lower = DIFFICULTY.lowerDifficultyStepMultiplier ** ((Math.min(level, pivot) - pivot) / 2);
  return DIFFICULTY.baseHealthScale * DIFFICULTY.difficulty10HealthMultiplier * upper * lower;
}

export function lateDifficultyMultiplier(floor, endMultiplier) {
  const progress = Math.max(0, Math.min(1, (floor - 3) / 9));
  return 1 + (endMultiplier - 1) * progress;
}
