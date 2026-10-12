// This is an inspectable local policy, not a remote model or a win predictor.
export const DEFAULT_PROFILE = Object.freeze({
  version: 'context-v2-skip',
  weights: Object.freeze({ damage: 1, defense: 0.36, growth: 0.7, synergy: 0.9, merge: 0.85, economy: 0.32, tempo: 1.1, lookahead: 0.55, dilution: 1.1, flexibility: 0.7 }),
  temperature: 5,
  lookaheadSamples: 4,
});

export const PROFILE_WEIGHT_KEYS = Object.freeze(Object.keys(DEFAULT_PROFILE.weights));

export function validateProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (typeof input.version !== 'string' || !/^[a-zA-Z0-9._-]{1,80}$/.test(input.version)) return null;
  if (!input.weights || typeof input.weights !== 'object' || Array.isArray(input.weights)) return null;
  if (Object.keys(input.weights).length !== PROFILE_WEIGHT_KEYS.length || Object.keys(input.weights).some(key => !PROFILE_WEIGHT_KEYS.includes(key))) return null;
  if (PROFILE_WEIGHT_KEYS.some(key => !Number.isFinite(input.weights[key]) || input.weights[key] < 0 || input.weights[key] > 5)) return null;
  if (!Number.isFinite(input.temperature) || input.temperature < 0.25 || input.temperature > 20) return null;
  if (!Number.isInteger(input.lookaheadSamples) || input.lookaheadSamples < 0 || input.lookaheadSamples > 8) return null;
  return { version: input.version, weights: Object.fromEntries(PROFILE_WEIGHT_KEYS.map(key => [key, input.weights[key]])), temperature: input.temperature, lookaheadSamples: input.lookaheadSamples };
}
