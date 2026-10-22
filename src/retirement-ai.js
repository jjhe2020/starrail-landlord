import { RETIREMENT_RULES, retirementEligibility } from './retirements.js';
import { characterById, itemById, essenceById } from './content.js';
import { effectAmount, matchesEffectFilter } from './effect-rules.js';
import { SPATIAL_METRICS, spatialMetricMean, expectedEffectAmountForAi } from './ai-spatial.js';
import { abilityEffectAmount } from './enemy-effects.js';

const clamp = value => Math.max(0, Math.min(1, value));
const stars = unit => [0, 1, 3, 9][unit.stars] || 1;
const effectStars = (state, unit) => stars(unit);
const add = (map, key, value) => map.set(key, (map.get(key) || 0) + value);

// Finite public-information forecast. Binomial appearance distributions respect
// cadence offsets without reading the seed, prior board, or next hidden draw.
export function estimateRetirementsForAi(state, { horizon = 24, growthRates = new Map(), growthMultiplier } = {}) {
  const result = { growthRates: new Map(), powerAdds: new Map(), availability: new Map(), economy: 0, flexibility: 0, expectedCompletions: 0, completionRate: 0, byRule: {} };
  const turns = Math.max(0, Math.min(96, Math.ceil(state.floor >= 12 && !state.endless ? Math.min(horizon, state.spinsLeft) : horizon)));
  if (!turns || !state.roster?.length) return result;
  const n = state.roster.length, draw = Math.min(1, 20 / n), adjacent = 5.5 / 19 * Math.min(1, 19 / Math.max(1, n - 1));
  const distributions = [[1]];
  for (let turn = 1; turn < turns; turn++) {
    const previous = distributions[turn - 1], next = Array(turn + 1).fill(0);
    previous.forEach((mass, appearances) => { next[appearances] += mass * (1 - draw); next[appearances + 1] += mass * draw; });
    distributions.push(next);
  }
  const cadence = (unit, turn, every) => distributions[turn - 1].reduce((sum, mass, appearances) => sum + (((unit.ticks || 0) + appearances + 1) % every === 0 ? mass * draw : 0), 0);
  let passiveGrowth = growthMultiplier ?? 1;
  if (growthMultiplier === undefined) {
    for (const definition of [...(state.items || []).map(itemById), ...(state.essences || []).filter(e => e.triggered).map(e => essenceById(e.id))]) {
      for (const effect of definition?.effects || []) if (!effect.legacy && effect.type === 'attackGrowthMultiplier') passiveGrowth += (effect.value || 1) - 1;
    }
  }
  const auditGrowth = (state.activeDebuffs || []).some(d => d.id === 'growth_audit') ? 0.5 : 1;
  const growthScale = auditGrowth * passiveGrowth;
  const futureGrowth = (unit, turn) => {
    const appearances = Math.floor(Math.max(0, turn - 1) * draw);
    const interval = (state.activeDebuffs || []).some(d => d.id === 'danheng_audit') ? 4 : 3;
    let native = !(characterById(unit.id)?.kitVersion >= 6) && unit.id === '1002' ? Math.floor(((unit.ticks || 0) + appearances) / interval) - Math.floor((unit.ticks || 0) / interval) : 0;
    if (characterById(unit.id)?.kitVersion >= 6) {
      for (let appearance = 1; appearance <= appearances; appearance++) {
        const appearing = { ...unit, ticks: (unit.ticks || 0) + appearance };
        const context = { state, unit: appearing, trigger: 'appearance', star: effectStars(state, unit), metricOverrides: (metric, filter = {}) => {
          const partners = state.roster.filter(other => matchesEffectFilter(other, filter, unit));
          if (metric === 'present') return partners.reduce((sum, other) => sum + (other.uid === unit.uid ? 1 : n <= 20 ? 1 : 19 / (n - 1)), 0);
          if (SPATIAL_METRICS.includes(metric)) return spatialMetricMean(state, unit, metric, filter);
          if (metric === 'ticks') return appearing.ticks;
          return undefined;
        } };
        for (const effect of characterById(unit.id).effects || []) if (effect.type === 'attackGrowth' && effect.target === 'self' && effect.trigger === 'appearance') native += abilityEffectAmount(state, appearing, effect, expectedEffectAmountForAi(effect, context)) * (effect.chance ?? 1);
      }
    }
    const declared = growthRates.get(unit.uid) || 0;
    return (unit.attackBonus ?? unit.growth ?? 0) + (native + declared * Math.max(0, turn - 1) * draw) * growthScale;
  };
  for (const rule of RETIREMENT_RULES) {
    const hosts=state.roster.filter(u=>u.id===rule.sourceId&&!u.status);
    const targets=state.roster.filter(u=>u.id===rule.targetId&&!u.status);
    if(!hosts.length||(!targets.length&&!state.retirementStats?.byRule?.[rule.id]?.completed))continue;
    const existing=targets.find(u=>u.commission===rule.id),normal=targets.filter(u=>u!==existing);
    // A finite public Markov forecast tracks copy counts and the one creation
    // slot. Origin determines creation capacity, never deletion eligibility.
    let distribution=[{count:normal.length,pending:Boolean(existing),originalPending:Boolean(existing),mass:1}];
    const hostEvents=new Map(),hostArea=new Map();let total=0,supplied=0,normalArea=0,existingArea=0;
    const collapse=rows=>{
      const grouped=new Map();for(const row of rows){if(row.mass<1e-12)continue;const key=[row.count,+row.pending,+row.originalPending].join(':');const prior=grouped.get(key);if(prior)prior.mass+=row.mass;else grouped.set(key,{...row});}return [...grouped.values()];
    };
    for(let turn=1;turn<=turns;turn++){
      const supplyChance=n<200?1-hosts.reduce((miss,host)=>miss*(1-cadence(host,turn,rule.supplyEvery)),1):0;
      const eligibleRatio=normal.length?normal.filter(u=>u.stars===1&&futureGrowth(u,turn)<=1).length/normal.length:0;
      let next=[];
      for(const start of distribution){
        let branches=[{...start}];
        for(const host of hosts){
          const due=cadence(host,turn,rule.every),after=[];
          for(const branch of branches){
            if(branch.count+Number(branch.pending)<=1||!due){after.push(branch);continue;}
            const pendingEligible=branch.pending&&(!branch.originalPending||existing?.stars===1&&futureGrowth(existing,turn)<=1);
            // Lower appearance counts prefer a newly created instance only if
            // it is adjacent. Otherwise an eligible original copy may leave.
            const removePending=pendingEligible?due*adjacent:0;
            const eligibleNormals=branch.count*eligibleRatio;
            const removeNormal=due*(1-(pendingEligible?adjacent:0))*(1-(1-adjacent)**eligibleNormals);
            const completed=(removePending+removeNormal)*branch.mass;
            if(removePending)after.push({...branch,pending:false,originalPending:false,mass:branch.mass*removePending});
            if(removeNormal)after.push({...branch,count:branch.count-1,mass:branch.mass*removeNormal});
            after.push({...branch,mass:branch.mass*(1-removePending-removeNormal)});
            total+=completed;add(hostEvents,host.uid,completed);add(hostArea,host.uid,completed*(rule.attackGrowth||0)*auditGrowth*(turns-turn+1));
          }
          branches=collapse(after);
        }
        for(const branch of branches){
          if(!start.pending&&supplyChance){
            next.push({...branch,pending:true,originalPending:false,mass:branch.mass*supplyChance});
            next.push({...branch,mass:branch.mass*(1-supplyChance)});supplied+=branch.mass*supplyChance;
          }else next.push(branch);
        }
      }
      distribution=collapse(next);
      normalArea+=distribution.reduce((sum,row)=>sum+row.mass*row.count,0);
      existingArea+=distribution.reduce((sum,row)=>sum+row.mass*Number(row.originalPending),0);
    }
    for(const host of hosts){const completed=hostEvents.get(host.uid)||0;add(result.growthRates,host.uid,2*(hostArea.get(host.uid)||0)/Math.max(1e-9,turns*horizon*draw));add(result.powerAdds,host.uid,completed*rule.power/Math.max(1e-9,turns*draw));}
    const retainedNormals=distribution.reduce((sum,row)=>sum+row.mass*row.count,0);
    for(const unit of normal){
      if(normalArea<normal.length*turns-1e-9)result.availability.set(unit.uid,clamp(normalArea/Math.max(1,normal.length*turns)));
      if((state.activeDebuffs||[]).some(d=>d.id==='rift_pollution'&&d.targetUid===unit.uid))result.flexibility+=(1-retainedNormals/normal.length)*.1/turns;
    }
    if(existing)result.availability.set(existing.uid,clamp(existingArea/turns));
    result.expectedCompletions+=total;result.economy+=total*rule.coins/turns;
    result.byRule[rule.id]={completed:total,supplied,retainedCopies:retainedNormals+distribution.reduce((sum,row)=>sum+row.mass*Number(row.pending),0),ordinaryRemoved:normal.length-retainedNormals,pending:clamp(distribution.reduce((sum,row)=>sum+row.mass*Number(row.pending),0))};
  }
  result.completionRate = result.expectedCompletions / turns;
  return result;
}
