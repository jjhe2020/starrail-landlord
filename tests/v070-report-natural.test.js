import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNaturalAudit, naturalDifficultySummaries, validateTerminalCohort } from '../report/v070/natural-audit.mjs';

// Provenance fixtures contain no gameplay measurements and are never rendered.
const hash='a'.repeat(64),rawHash='b'.repeat(64),analysisHash='c'.repeat(64);
function fixtures(){
 const sourceHashes={'src/fixture.js':hash},config={mode:'campaigns',difficulty:10};
 const compact={gameVersion:'fixture',validation:{ready:true},sources:[{mode:'campaigns',sha256:rawHash,sourceHashes,config}]};
 const natural={protocol:'v070-natural-growth-audit-v1',gameVersion:'fixture',policyVersion:'fixture-policy',validation:{ready:true},frozenSourceHashes:sourceHashes,sources:[{path:'fixture.jsonl.gz',sha256:rawHash,gameVersion:'fixture',policyVersion:'fixture-policy',sourceHashes,config}],difficulties:[{difficulty:10}],definitions:{population:'Provenance fixture only'},analysisSourceHashes:{'fixture-analysis.mjs':analysisHash}};
 return JSON.parse(JSON.stringify({compact,natural}));
}
test('accepts one validated matching natural campaign cohort',()=>{const{natural,compact}=fixtures();assert.equal(validateNaturalAudit(natural,compact),true);});
for(const[label,mutate,pattern]of[
 ['rejected analysis',({natural})=>{natural.validation.ready=false;},/passed validation/],
 ['different protocol',({natural})=>{natural.protocol='other';},/protocol/],
 ['different game version',({natural})=>{natural.gameVersion='other';},/game versions/],
 ['mixed source fingerprint',({natural})=>{natural.sources[0].sourceHashes['src/fixture.js']='d'.repeat(64);},/different frozen fingerprint/],
 ['stale raw cohort under the same rules',({natural})=>{natural.sources[0].sha256='d'.repeat(64);},/compact campaign cohort/],
 ['duplicate raw source',({natural})=>{natural.sources.push(structuredClone(natural.sources[0]));},/repeats/],
 ['missing difficulty summary',({natural})=>{natural.difficulties=[];},/difficulty summaries/],
 ['missing analysis method fingerprint',({natural})=>{natural.analysisSourceHashes={};},/analysis source fingerprint/],
])test(`rejects ${label}`,()=>{const data=fixtures();mutate(data);assert.throws(()=>validateNaturalAudit(data.natural,data.compact),pattern);});
test('small summary preserves producer values and omits long seed lists',()=>{const{natural}=fixtures();natural.difficulties[0].sharedSeeds=['fixture-seed'];natural.difficulties[0].finalRosterRunMaximumGrowth={n:0,max:null};const summary=naturalDifficultySummaries(natural);assert.deepEqual(summary[0].finalRosterRunMaximumGrowth,natural.difficulties[0].finalRosterRunMaximumGrowth);assert.equal('sharedSeeds'in summary[0],false);assert.equal(summary[0].lateRoleAppearanceShares,null);});

function terminalFixtures(){
 const{compact}=fixtures(),stressHash='e'.repeat(64);
 compact.sources.push({...structuredClone(compact.sources[0]),sha256:stressHash,config:{mode:'campaigns',difficulty:20}});
 const terminal={sources:compact.sources.map(source=>({path:'fixture-only.jsonl.gz',sha256:source.sha256,difficulty:source.config.difficulty,sourceHashes:source.sourceHashes}))};
 compact.sources.unshift({mode:'cards',sha256:'f'.repeat(64),config:{mode:'cards',difficulty:10}});
 return JSON.parse(JSON.stringify({compact,terminal}));
}
test('terminal cohort accepts every matching raw SHA and difficulty without config',()=>{const{terminal,compact}=terminalFixtures();assert.equal(validateTerminalCohort(terminal,compact),true);});
for(const[label,mutate,pattern]of[
 ['same-rule stale n100 raw SHA',({terminal})=>{terminal.sources[0].sha256='d'.repeat(64);},/does not match the compact campaign cohort/],
 ['missing raw campaign source',({terminal})=>{terminal.sources.pop();},/does not cover/],
 ['duplicate raw campaign source',({terminal})=>{terminal.sources.push(structuredClone(terminal.sources[0]));},/repeats/],
 ['matching SHA assigned to the wrong difficulty',({terminal})=>{terminal.sources[0].difficulty=20;},/does not match the compact campaign cohort/],
])test(`terminal cohort rejects ${label}`,()=>{const data=terminalFixtures();mutate(data);assert.throws(()=>validateTerminalCohort(data.terminal,data.compact),pattern);});
