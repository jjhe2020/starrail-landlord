import { characterById } from './content.js';

// Absolute milliseconds from the player's spin input. The last effect finishes
// before settle; the remaining budget allows the reward panel to enter.
export const COMBAT_TIMING = Object.freeze({
  roll: 360,
  supportStart: 440,
  supportSpan: 180,
  attackStart: 700,
  attackSpan: 800,
  afterAttacks: 1650,
  retaliation: 1900,
  afterRetaliation: 2040,
  effect: 420,
  settle: 2600,
  maxDuration: 2640,
});

const EFFECTS = Object.freeze({
  shield: { label: '护盾', color: '#74d8ff' },
  heal: { label: '治疗', color: '#88edb9' },
  growth: { label: '培养', color: '#edcb79' },
  power: { label: '增幅', color: '#d2a4ff' },
  powerMultiplier: { label: '增幅', color: '#d2a4ff', multiplier: true },
  vulnerability: { label: '易伤', color: '#caa1ff' },
  retaliationFlat: { label: '减伤', color: '#74d8ff' },
  retaliationMultiplier: { label: '减伤', color: '#74d8ff', reduction: true },
  ignoreArmor: { label: '穿透', color: '#e6d7a8' },
});

const value = input => Number.isFinite(input) ? input : 0;
const rounded = input => Math.round(input * 1e6) / 1e6;
const cellIndex = input => Number.isInteger(input) && input >= 0 && input < 20;
const enemyColumn = input => Number.isInteger(input) && input >= 0 && input < 5;

function currentEffects(state, trace) {
  const record = state?.lastSpin || {};
  const floor = record.floor ?? state?.floor;
  const round = record.round ?? state?.round;
  return (Array.isArray(trace) ? trace : Array.isArray(record.effects) ? record.effects : []).filter(event => event && event.stage !== 'arrival' &&
    (event.floor === undefined || event.floor === floor) &&
    (event.round === undefined || event.round === round));
}

/**
 * Describe the completed engine result without running rules or consuming RNG.
 * Prefer inspectSpin()'s transient hits/effects as the optional third argument:
 * saved records omit phase/provenance, and system hits may use cell zero there.
 * Each positive hit remains in its phase/source-cell/target-column aggregate.
 */
export function createCombatPlan(before, after, { hits, effects: effectTrace } = {}) {
  const board = Array.isArray(after?.board) ? after.board : [];
  const cells = new Map(board.flatMap((unit, index) => unit?.uid ? [[unit.uid, index]] : []));
  const effects = currentEffects(after, effectTrace);
  const hitGroups = new Map();
  const recordedHits = Array.isArray(hits) ? hits : (after?.lastSpin?.hits || []);
  const hasGlobalDamage = effects.some(event => event.type === 'damage' && !event.sourceUid && value(event.amount) > 0);

  for (const hit of recordedHits) {
    if (!hit || hit.stage === 'arrival' || !enemyColumn(hit.targetCol) || !(value(hit.amount) > 0)) continue;
    const stage = hit.stage || 'attack';
    let sourceCell = -1;
    if (hit.sourceUid) sourceCell = cells.get(hit.sourceUid) ?? -1;
    else if (hit.sourceType) {
      if (hit.sourceType === 'character' && cellIndex(hit.cell) && board[hit.cell]) sourceCell = hit.cell;
    } else if (cellIndex(hit.cell) && board[hit.cell] && !(hasGlobalDamage && hit.cell === 0)) {
      sourceCell = hit.cell;
    }
    const unit = board[sourceCell];
    const character = unit ? characterById(unit.id) : null;
    const key = `${stage}:${sourceCell}:${hit.targetCol}`;
    const group = hitGroups.get(key) || {
      kind: 'attack', stage, sourceCell, targetCol: hit.targetCol,
      ...(unit?.uid ? { sourceUid: unit.uid } : {}),
      sourceId: hit.sourceId || unit?.id || 'system',
      color: character?.color || '#e6d7a8',
      element: character?.element || '',
      label: character?.name || '协同攻击',
      amount: 0, hitCount: 0,
    };
    group.amount = rounded(group.amount + hit.amount);
    group.hitCount += 1;
    hitGroups.set(key, group);
  }

  // One aura per actual source/effect, with every affected instance preserved in
  // targets. Twenty simultaneous buffs do not create twenty duplicate auras.
  const supportGroups = new Map();
  for (const event of effects) {
    const definition = EFFECTS[event.type];
    const amount = value(event.amount);
    if (!definition || (definition.multiplier ? amount <= 1 : definition.reduction ? !(amount > 0 && amount < 1) : amount <= 0)) continue;
    const sourceCell = event.sourceUid ? cells.get(event.sourceUid) ?? -1 : -1;
    const targetCell = event.targetUid ? cells.get(event.targetUid) ?? -1 : -1;
    const stage = event.stage || 'beforeAttacks';
    const key = `${stage}:${sourceCell}:${event.type}`;
    const group = supportGroups.get(key) || {
      kind: 'support', stage, sourceCell, targetCell: -1,
      ...(event.sourceUid ? { sourceUid: event.sourceUid } : {}),
      sourceId: event.sourceId || 'system',
      effect: event.type, color: definition.color, label: definition.label,
      amount: 0, targets: [], targetCells: [], eventCount: 0,
    };
    group.targets.push({ targetCell, ...(event.targetUid ? { targetUid: event.targetUid } : {}), amount });
    if (targetCell >= 0 && !group.targetCells.includes(targetCell)) group.targetCells.push(targetCell);
    // Multiplier amounts belong to individual targets. Keep their strongest
    // actual value here and retain the complete values in targets.
    group.amount = definition.multiplier ? Math.max(group.amount, amount)
      : definition.reduction ? (group.eventCount ? Math.min(group.amount, amount) : amount)
        : rounded(group.amount + amount);
    group.eventCount += 1;
    group.targetCell = group.targetCells.length === 1 ? group.targetCells[0] : -1;
    supportGroups.set(key, group);
  }

  const attacks = [...hitGroups.values()];
  const origins = [...new Set(attacks.filter(action => !['afterAttacks', 'afterRetaliation'].includes(action.stage)).map(action => action.sourceCell))];
  attacks.forEach(action => {
    action.at = action.stage === 'afterRetaliation' ? COMBAT_TIMING.afterRetaliation
      : action.stage === 'afterAttacks' ? COMBAT_TIMING.afterAttacks
        : COMBAT_TIMING.attackStart + Math.round(origins.indexOf(action.sourceCell) / Math.max(1, origins.length - 1) * COMBAT_TIMING.attackSpan);
  });
  const supports = [...supportGroups.values()];
  const earlySupports = supports.filter(action => action.stage === 'beforeAttacks');
  supports.forEach(action => {
    action.at = action.stage === 'afterRetaliation' ? COMBAT_TIMING.afterRetaliation
      : action.stage === 'afterAttacks' || action.stage === 'attack' ? COMBAT_TIMING.afterAttacks
        : COMBAT_TIMING.supportStart + Math.round(earlySupports.indexOf(action) / Math.max(1, earlySupports.length - 1) * COMBAT_TIMING.supportSpan);
  });

  const incoming = Math.max(0, value(after?.lastSpin?.incoming));
  const blocked = Math.max(0, rounded(value(after?.resourceStats?.shieldBlocked) - value(before?.resourceStats?.shieldBlocked)));
  const hpLost = Math.max(0, rounded(value(after?.resourceStats?.hpLost) - value(before?.resourceStats?.hpLost)));
  const selfDamage = effects.filter(event => event.type === 'selfDamage').reduce((sum, event) => sum + Math.max(0, value(event.amount)), 0);
  const retaliationHpLost = Math.max(0, rounded(hpLost - selfDamage));
  const retaliationEnemies = new Map((before?.enemies || []).map(enemy => [enemy.col, enemy.hp]));
  for (const action of attacks) if (action.stage !== 'afterRetaliation') {
    retaliationEnemies.set(action.targetCol, Math.max(0, rounded((retaliationEnemies.get(action.targetCol) || 0) - action.amount)));
  }
  const retaliation = incoming > 0 ? [{
    at: COMBAT_TIMING.retaliation, kind: 'retaliation', sourceCell: -1, targetCell: -1,
    targetCols: [...retaliationEnemies].filter(([, hp]) => hp > 0).map(([col]) => col),
    amount: incoming, blocked, hpLost: retaliationHpLost,
    color: blocked > 0 ? '#74d8ff' : '#ff9b93', label: blocked > 0 ? '护盾抵挡' : '敌方反击',
  }] : [];
  return {
    duration: COMBAT_TIMING.maxDuration,
    timeline: [...supports, ...attacks, ...retaliation].sort((a, b) => a.at - b.at),
    enemies: (before?.enemies || []).map(enemy => ({ ...enemy })),
    totals: {
      damage: rounded(attacks.reduce((sum, action) => sum + action.amount, 0)),
      shield: Math.max(0, value(after?.lastSpin?.shield)),
      healing: Math.max(0, value(after?.lastSpin?.healing)),
      growth: rounded(effects.filter(event => event.type === 'growth').reduce((sum, event) => sum + Math.max(0, value(event.amount)), 0)),
      incoming, blocked, hpLost, retaliationHpLost,
    },
  };
}
