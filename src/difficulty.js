// Shared by the production engine and offline calibration. The multiplier ramps
// from the unchanged first three floors to its full value on floor twelve.
export const DIFFICULTY = {
  version: 'difficulty-v2',
  combatLateHealthMultiplier: 1.5,
  classicLateRentMultiplier: 1.28,
};

export function lateDifficultyMultiplier(floor, endMultiplier) {
  const progress = Math.max(0, Math.min(1, (floor - 3) / 9));
  return 1 + (endMultiplier - 1) * progress;
}
