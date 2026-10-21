const protocol='v070-natural-growth-audit-v1';
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const requireValue=(condition,message)=>{if(!condition)throw new Error(message);};
const isSha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
function fingerprint(value,label){
 requireValue(object(value)&&Object.keys(value).length>0&&Object.values(value).every(isSha),`${label} is missing valid frozen source fingerprints.`);
 return JSON.stringify(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
}
function matchCampaignSources(sources,compact,label,difficultyOf){
 requireValue(compact?.validation?.ready===true,`${label} requires a verified compact report.`);
 requireValue(Array.isArray(sources)&&sources.length>0,`${label} has no raw source provenance.`);
 const campaigns=(compact.sources||[]).filter(source=>(source.mode||source.config?.mode)==='campaigns');
 requireValue(campaigns.length>0,`${label} requires matching compact campaign sources.`);
 const matched=new Set();
 for(const source of sources){
  const difficulty=difficultyOf(source);
  requireValue(isSha(source.sha256)&&Number.isInteger(difficulty)&&difficulty>0,`${label} has an invalid raw SHA-256 or difficulty.`);
  const candidate=campaigns.findIndex(expected=>expected.sha256===source.sha256&&expected.config?.difficulty===difficulty);
  requireValue(candidate>=0,`${label} raw SHA-256 or difficulty does not match the compact campaign cohort.`);
  requireValue(!matched.has(candidate),`${label} repeats a raw campaign source.`);
  matched.add(candidate);
 }
 requireValue(matched.size===campaigns.length,`${label} does not cover the compact campaign cohort.`);
 return campaigns;
}

/** The renderer retains terminal ready/protocol/version/rule-fingerprint checks. */
export function validateTerminalCohort(terminal,compact){
 matchCampaignSources(terminal?.sources,compact,'Terminal observations',source=>source.difficulty);
 return true;
}

/** Validate provenance only. All numerical summaries remain producer-owned. */
export function validateNaturalAudit(natural,compact){
 requireValue(natural?.validation?.ready===true&&!(natural.validation.errors?.length),'Natural growth audit has not passed validation.');
 requireValue(compact?.validation?.ready===true,'Natural growth audit requires a verified compact report.');
 requireValue(natural.protocol===protocol,'Unsupported natural growth audit protocol.');
 requireValue(typeof natural.gameVersion==='string'&&natural.gameVersion===compact.gameVersion,'Natural growth audit and compact report have different game versions.');
 requireValue(typeof natural.policyVersion==='string'&&natural.policyVersion.length>0,'Natural growth audit is missing its policy version.');
 requireValue(Array.isArray(compact.sources)&&compact.sources.length>0,'Compact report has no frozen source provenance.');
 const expectedFingerprint=fingerprint(compact.sources[0].sourceHashes,'Compact report');
 requireValue(compact.sources.every(source=>fingerprint(source.sourceHashes,'Compact report source')===expectedFingerprint),'Compact report mixes frozen source fingerprints.');
 requireValue(fingerprint(natural.frozenSourceHashes,'Natural growth audit')===expectedFingerprint,'Natural growth audit uses a different frozen source fingerprint.');
 requireValue(Array.isArray(natural.sources)&&natural.sources.length>0,'Natural growth audit has no raw source provenance.');
 const campaigns=matchCampaignSources(natural.sources,compact,'Natural growth audit',source=>source.config?.difficulty);
 for(const source of natural.sources){
  requireValue(isSha(source.sha256)&&typeof source.path==='string','Natural growth audit has an invalid raw source path or SHA-256.');
  requireValue(source.gameVersion===natural.gameVersion&&source.policyVersion===natural.policyVersion,'Natural growth audit raw source versions disagree.');
  requireValue(fingerprint(source.sourceHashes,'Natural growth audit raw source')===expectedFingerprint,'Natural growth audit raw source uses a different frozen fingerprint.');
  requireValue(source.config?.mode==='campaigns','Natural growth audit raw source is not a natural campaign.');
 }
 requireValue(Array.isArray(natural.difficulties)&&natural.difficulties.length>0,'Natural growth audit has no difficulty summaries.');
 const expectedDifficulties=new Set(campaigns.map(source=>source.config.difficulty));
 requireValue(natural.difficulties.length===expectedDifficulties.size&&new Set(natural.difficulties.map(row=>row.difficulty)).size===expectedDifficulties.size&&natural.difficulties.every(row=>expectedDifficulties.has(row.difficulty)),'Natural growth audit difficulty summaries do not match the compact campaign cohort.');
 requireValue(object(natural.definitions),'Natural growth audit is missing its metric definitions.');
 requireValue(object(natural.analysisSourceHashes)&&Object.keys(natural.analysisSourceHashes).length>0&&Object.values(natural.analysisSourceHashes).every(isSha),'Natural growth audit is missing its analysis source fingerprint.');
 return true;
}

export function naturalDifficultySummaries(natural){
 return (natural?.difficulties||[]).map(row=>Object.fromEntries(['difficulty','campaignCount','sharedSeedBlockCount','policyCount','samplesPerPolicy','finalRosterRunMaximumGrowth','finalRosterInstanceGrowth','lateObservedGrowth','lateRoleAppearanceShares','terminalEncounterStars'].map(key=>[key,row[key]??null])));
}
