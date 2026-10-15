import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('experiment CLIs reject invalid sample counts before silently substituting or running a batch', () => {
  const cases = [
    ['balance.mjs', '--runs', '0'], ['balance.mjs', '--runs', '2001'],
    ['balance.mjs', '--runs', 'NaN'], ['train-ai.mjs', '--runs', '251'],
    ['train-ai.mjs', '--generations', '0'], ['train-ai.mjs', '--candidates', '7'],
    ['train-ai.mjs', '--holdout', '1.5'], ['resource-balance.mjs', '--scope', 'invalid'],
  ];
  for (const [script, flag, value] of cases) {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL(`../scripts/${script}`, import.meta.url)), flag, value],
      { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.error, undefined, `${script} should fail before starting a batch`);
    assert.notEqual(result.status, 0, `${script} ${flag} ${value}`);
    assert.match(result.stderr, /must be/);
    assert.equal(result.stdout, '', 'no batch progress or report was written');
  }
});
