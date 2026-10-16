import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTERS, characterById } from '../src/content.js';

const evidence = JSON.parse(readFileSync(new URL('../docs/character-roster-source.json', import.meta.url), 'utf8'));
const additions = ['march_hunt','dan_heng_imbibitor_lunae','dan_heng_pt','fugue','the_herta','hysilens','cerydra','evernight','cyrene','saber','archer','yao_guang','sparxie','ashveil','silver_wolf_lv999','evanescia','mortenax_blade','the_dahlia','announced_himeko_nova','announced_gilgamesh','announced_rin_tohsaka','aha','pearl','robin_summeretto','aventurine_waveflair','aeon_star_aha'];

test('every non-Trailblazer source row and the requested Aeon has a distinct playable adaptation', () => {
  assert.equal(evidence.snapshotPlayableEntries - evidence.excludedTrailblazerForms, 88);
  assert.equal(evidence.characters.filter(c => c.status === 'released').length, 88);
  assert.equal(evidence.characters.filter(c => c.status === 'announced').length, 1);
  assert.equal(evidence.characters.filter(c => c.status === 'adapted-aeon').length, 1);
  assert.equal(CHARACTERS.length, 90);
  assert.equal(evidence.revision, 472778);
  assert.equal(createHash('sha256').update(JSON.stringify(evidence.sourceRows)).digest('hex'), evidence.sourceRowsSha256);
  assert.equal(evidence.sourceRows.length, 94);
  assert.deepEqual(CHARACTERS.map(c => c.id).sort(), evidence.characters.map(c => c.id).sort());
  for (const row of evidence.characters) {
    const actual = characterById(row.id);
    for (const key of ['name','enName','path','element','faction','officialRarity']) assert.equal(actual[key], row[key], `${row.id}: ${key}`);
    assert.equal(actual.publicationStatus, row.status);
    assert.equal(actual.sourceUrl, row.source);
    assert.ok(!/Trailblazer|开拓者|NICKNAME/i.test(actual.name + actual.enName + actual.id));
  }
  for (const id of additions) assert.ok(characterById(id), id);
  const paths = {Destruction:'毁灭','The Hunt':'巡猎',Erudition:'智识',Harmony:'同谐',Nihility:'虚无',Preservation:'存护',Abundance:'丰饶',Remembrance:'记忆',Elation:'欢愉'};
  for (const source of evidence.sourceRows.filter(row => row.name !== 'Trailblazer')) {
    const matches = CHARACTERS.filter(c => c.sourceUrl === source.url && c.path === paths[source.path]);
    assert.equal(matches.length, 1, source.name + ': each current source identity maps to exactly one adaptation');
    assert.equal(matches[0].publicationStatus, source.status);
    assert.equal(matches[0].officialRarity, source.rarity);
  }
});

test('official star ratings and source-announcement states are separate from game rarity and adaptations', () => {
  const fourStars = CHARACTERS.filter(c => c.officialRarity === 4);
  assert.equal(fourStars.length, 23);
  assert.ok(fourStars.some(c => c.id === 'march_hunt'));
  assert.equal(characterById('aha').officialRarity, null);
  assert.equal(characterById('aha').element, '无（改编）');
  assert.equal(characterById('aha').portraitKind, 'text-symbol');
  for (const c of CHARACTERS) {
    assert.ok(['common','uncommon','rare','legendary'].includes(c.rarity));
    if (c.id !== 'aha') assert.ok([4,5].includes(c.officialRarity));
    if (c.publicationStatus === 'announced') assert.match(c.adaptation, /公开名单标注已公布/);
  }
});
