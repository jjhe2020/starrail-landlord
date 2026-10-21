import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPES, getArchetypes, archetypesForCharacter, isArchetypeCore } from '../src/archetypes.js';
import { CHARACTERS } from '../src/content.js';
import { newGame } from '../src/engine.js';
test('internal routes derive every member exclusively from formal public tags and grant no rules',()=>{
  assert.equal(ARCHETYPES.length,8);
  for(const route of ARCHETYPES){
    const expected=CHARACTERS.filter(c=>route.filters.some(f=>Object.entries(f).every(([k,v])=>c[k]===v))).map(c=>c.id);
    assert.deepEqual(route.memberIds,expected);assert.ok(expected.length>=route.threshold);
    assert.ok(route.filters.every(f=>Object.keys(f).every(k=>['path','element','faction'].includes(k))));
    assert.deepEqual(route.effects,[]);assert.deepEqual(route.coreIds,[]);assert.equal(route.coreRequired,0);
  }
  for(const c of CHARACTERS){assert.equal(isArchetypeCore(c.id),false);assert.deepEqual(archetypesForCharacter(c.id),ARCHETYPES.filter(r=>r.memberIds.includes(c.id)));}
});
test('internal coverage counts only distinct permanent noncommission identities',()=>{
  const route=ARCHETYPES[0],s=newGame();
  s.roster=route.memberIds.slice(0,route.threshold).map((id,i)=>({id,uid:`u${i}`,stars:1,growth:0,ticks:0}));
  assert.equal(getArchetypes(s)[0].formed,true);
  s.roster.at(-1).temporary=2;s.roster.push({...s.roster[0],uid:'duplicate'});
  assert.equal(getArchetypes(s)[0].count,route.threshold-1);assert.equal(getArchetypes(s)[0].formed,false);
  delete s.roster.at(-2).temporary;s.roster.at(-2).commission='test';
  assert.equal(getArchetypes(s)[0].count,route.threshold-1);
});
