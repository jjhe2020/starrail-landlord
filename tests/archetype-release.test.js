import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARCHETYPE_REFERENCE } from '../src/archetype-reference.js';
import { CHARACTERS } from '../src/content.js';
import { ARCHETYPES } from '../src/archetypes.js';
import { POLICY_VERSION } from '../src/ai.js';

const root = fileURLToPath(new URL('..', import.meta.url));

test('the embedded balance record comes from complete historical v0.6 campaigns and is not advertised as current', () => {
  assert.ok(ARCHETYPE_REFERENCE, 'release must embed the actual holdout, never a placeholder');
  assert.equal(ARCHETYPE_REFERENCE.contentCount, CHARACTERS.length);
  assert.notEqual(ARCHETYPE_REFERENCE.policyVersion, POLICY_VERSION, 'old data must not be accepted as current UI evidence');
  for (const reference of [ARCHETYPE_REFERENCE, ARCHETYPE_REFERENCE.stress]) {
    assert.ok(reference?.sourceStable);
    assert.equal(reference.runsPerStrategy, 100);
    const path = resolve(root, reference.reportPath);
    assert.ok(path.startsWith(resolve(root, 'docs', 'benchmarks') + sep), 'evidence is a workspace benchmark');
    const report = JSON.parse(readFileSync(path, 'utf8'));
    assert.ok(report.sourceStable);
    assert.equal(report.campaigns.length, 1100);
    assert.ok(report.campaigns.every(campaign => ['victory', 'defeat'].includes(campaign.phase)), 'all enrolled runs reach a real terminal state');
    assert.equal(report.strategies.length, 11);
    assert.equal(report.strategies.reduce((sum, row) => sum + row.incomplete, 0), 0);
    assert.deepEqual(reference.sourceHashes, report.sourceHashes);
    for (const [file, hash] of Object.entries(reference.sourceHashes)) {
      assert.match(hash, /^[a-f0-9]{64}$/);

    }
    for (const row of reference.strategies) {
      const actual = report.strategies.find(entry => entry.id === row.id);
      for (const key of ['n', 'wins', 'losses', 'winRate', 'winRateCI95', 'formation', 'beforeFormation', 'afterFormation', 'checks']) assert.deepEqual(row[key], actual[key], `${row.id}: ${key}`);
    }
    assert.ok(report.archetypes.every(a => a.effects.length > 0), 'archive preserves the actual old rules rather than rewriting history');
  }
  assert.equal(ARCHETYPE_REFERENCE.difficulty, 10);
  assert.equal(ARCHETYPE_REFERENCE.stress.difficulty, 20);
});
