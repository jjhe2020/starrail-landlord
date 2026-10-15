import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, spin, chooseReward } from '../src/engine.js';
import { DEFAULT_PROFILE } from '../src/ai-profile.js';
import { MAX_SAVE_BYTES, exportSave, importSave } from '../src/save-transfer.js';

const payloadFor = game => ({ game, settings: { sound: false, animations: false }, stats: { runs: 3, wins: 1, bestFloor: Math.max(12, game.floor) }, aiProfile: structuredClone(DEFAULT_PROFILE) });

for (const mode of ['combat']) {
  test(`${mode}: exported saves preserve RNG, reward choices, settings and the next action`, () => {
    const reward = spin(newGame({ mode, seed: 'portable-save-transfer-fixture' }));
    const payload = payloadFor(reward);
    payload.aiProfile.temperature = 4;
    const before = structuredClone(payload);
    const text = exportSave(payload);
    const document = JSON.parse(text);
    assert.equal(document.format, 'astral-reels-save');
    assert.equal(document.version, 1);
    const restoredReward = importSave(text);
    assert.deepEqual(restoredReward, payload, 'an undecided offer restores all live run data');
    const chosen = chooseReward(reward, 0);
    assert.deepEqual(chooseReward(restoredReward.game, 0), chosen, 'the same selection resumes the same seeded journey');
    const restoredChosen = importSave(exportSave(payloadFor(chosen)));
    assert.deepEqual(spin(restoredChosen.game), spin(chosen), 'next spin uses the saved random generator state');
    assert.deepEqual(payload, before, 'exporting never changes the current run');
    restoredReward.game.roster[0].growth += 1;
    restoredReward.aiProfile.weights.damage += 0.1;
    assert.deepEqual(payload, before, 'imported objects have no shared references to the exported state');
  });
}

test('legacy rental saves are explicitly rejected without converting their progress', () => {
  const payload = payloadFor(newGame({ seed: 'removed-rental-fixture' }));
  payload.game.mode = 'classic';
  const before = structuredClone(payload);
  assert.throws(() => exportSave(payload), /交租模式已移除/);
  assert.throws(() => importSave(JSON.stringify({ format: 'astral-reels-save', version: 1, payload })), /交租模式已移除/);
  assert.deepEqual(payload, before);
});

test('original version-one combat exports migrate without replacing the current encounter', () => {
  const legacy = JSON.parse(readFileSync(new URL('./fixtures/legacy-combat-v1.json', import.meta.url), 'utf8'));
  const restored = importSave(JSON.stringify({ format: 'astral-reels-save', version: 1, payload: payloadFor(legacy) }));
  assert.equal(restored.game.version, 2);
  assert.equal(restored.game.difficulty, 10);
  for (const key of ['seed', 'rngState', 'floor', 'phase', 'hp', 'shield', 'coins', 'roster', 'board', 'enemies', 'choices', 'items', 'essences']) {
    assert.deepEqual(restored.game[key], legacy[key], `migration preserves ${key}`);
  }
  assert.deepEqual(importSave(exportSave(restored)), restored, 'migrated games can be exported and restored again');
});

test('save import rejects damaged runs, wrong formats and invalid statistics or AI profiles', () => {
  const payload = payloadFor(newGame({ seed: 'save-validation-fixture' }));
  const source = JSON.parse(exportSave(payload));
  for (const mutate of [
    file => { file.payload.game.rngState = 0; },
    file => { file.payload.game.board.pop(); },
    file => { file.payload.stats.wins = -1; },
    file => { file.payload.stats.bestFloor = 0; },
    file => { file.payload.aiProfile.weights.damage = Infinity; },
    file => { file.payload.aiProfile.version = '<script>'; },
  ]) {
    const document = structuredClone(source);
    mutate(document);
    assert.throws(() => importSave(JSON.stringify(document)), /存档/);
  }
  assert.throws(() => importSave('{not JSON'), /有效的存档/);
  assert.throws(() => importSave('{}'), /星穹转轮导出的存档/);
  assert.throws(() => importSave(JSON.stringify({ ...source, version: 2 })), /星穹转轮导出的存档/);
  assert.throws(() => exportSave({ ...payload, game: null }), /不兼容|不完整/);
});

test('save size limits count UTF-8 bytes and do not parse oversized files', () => {
  assert.equal(MAX_SAVE_BYTES, 2 * 1024 * 1024);
  const multibyte = '星'.repeat(Math.ceil(MAX_SAVE_BYTES / 3));
  assert.ok(multibyte.length < MAX_SAVE_BYTES);
  assert.throws(() => importSave(multibyte), /文件过大/);
  assert.throws(() => importSave(' '.repeat(MAX_SAVE_BYTES + 1)), /文件过大/);
  assert.throws(() => importSave(null), /文件过大/);
});
