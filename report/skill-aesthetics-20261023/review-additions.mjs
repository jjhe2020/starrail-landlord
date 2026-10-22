// Review proposals only. This module is never imported by the game.
export const userDirections = {
  title: '补充评审：称谓、明确属性与剧情依据',
  confirmed: [
    '所有出场者统一称“角色”，不再使用“伙伴”作为第二套称谓。',
    '不要建立“临时角色”类别；创建一个角色，并把限次删除写成该角色自己的技能。',
    '优先取消“成长”这种抽象点数，技能应直接说清威力、倍率、治疗量或护盾量改变多少。',
    '逐角色核对IP身份、能力意象和剧情互动，尤其审查召唤对象与人物关系。'
  ],
  notYetDecided: [
    '“登场3次后删除”是用户举例，不代表所有新建角色统一3次。衣匠草案暂以旧召援的2次作对照，仍待讨论。',
    '导师全部改为只增加攻击角色威力，是便于比较的重构起点，尚未采纳；数值沿用旧基础数，不等于已平衡。',
    '衣匠的威力、攻击范围、标签、合成后期限及创建上限尚未确定。',
    '用户提到阿格莱雅与赛飞儿、那刻夏的互动，作为剧情核查线索；不据此声明官方恋爱关系，也不把关系密切等同于可以召唤对方。'
  ],
  auditPolicy: '把角色故事、原作能力和本作改编分开：有官方身份不等于本作职能贴合；找不到资料不等于剧情中绝无交集；没有公开完整资料时不使用泄露内容补全。',
  legacyPolicy: '当前技能原文保留旧称谓以便核对。首轮美学评分和草案留作历史对照；本轮新增草案优先展示。游戏源码与规则没有应用这些提案。'
};

const clean = text => text.replaceAll('伙伴', '角色').replaceAll('攻击者', '攻击角色').replaceAll('防御者', '防御角色').replaceAll('本轮', '本次转动').replaceAll('每轮', '每次转动');

export function termReview(character, originalReview) {
  let termCopy = clean(originalReview.copy);
  let termStatus = '称谓统一';
  let termNote = '建议统一称“角色”，保留现有公开标签、位置条件和作用范围。';
  let termRuleChange = false;
  let createdCharacter = null;
  const growth = character.effects.find(effect => effect.type === 'growth');

  if (growth && character.role === 'attack') {
    termCopy = termCopy.replace(/自身(?:本局)?永久成长\+/g, '自身威力永久+').replaceAll('自身成长+', '自身威力永久+');
    termCopy += '（永久增益仅在本局保留。）';
    termStatus = '直接写明威力';
    termNote = `这里原来的+${growth.value}直接加到攻击角色威力，可明确写成“威力永久+${growth.value}（本局）”。它不是百分比，也不是乘法；不新增一个名叫成长的属性。`;
  } else if (growth) {
    const labels = character.id === 'yao_guang' ? '欢愉或仙舟' : growth.filter.anyOf.map(filter => filter.element || filter.path || filter.faction).join('或');
    const range = {adjacent:'相邻', row:'同行', column:'同列'}[growth.target];
    if (growth.selection === 'strongest') {
      termCopy = `每第${growth.every}次登场，从${range}的${labels}攻击角色中，选择威力最高的1名（不计本次转动加成），使其威力永久+${growth.value}（本局）。`;
    } else {
      termCopy = `每第${growth.every}次登场，使至多${growth.targetLimit}名${range}的${labels}攻击角色各获得威力永久+${growth.value}（本局）。`;
    }
    if (character.id === '1215') termCopy += '每第3次登场且相邻有物理或仙舟罗浮角色，获得1信用点。';
    if (character.id === 'aha') termCopy += '每第4次登场且位于角落，获得1次重掷。';
    if (character.id === 'pearl') termCopy += '每第3次登场且相邻有星际和平公司或存护角色，获得1信用点。';
    termStatus = '目标与属性需重构';
    termNote = '下方是只提升攻击角色威力的讨论基线，改变了现有对防御、增幅、干扰角色的收益，不能直接替换旧文案。若要强化辅助，应单独写出增加的治疗量、护盾量或增幅量并重新定值；不以“效能”“潜能”等词保留同一套隐藏点数。';
    termRuleChange = true;
  }

  if (character.id === '1313') {
    termCopy = '同列的记忆或毁灭攻击角色，本次转动威力×1.45。';
    termStatus = '身份条件需重构';
    termNote = '先保留公开标签增幅，暂删按特殊身份筛选的第二条，作为减法候选。若要保留对创建角色的加值，应依据具体角色或公开技能建立条件，不能换一个名称继续筛选隐藏的临时类别。';
    termRuleChange = true;
  }

  if (character.id === '1402') {
    termCopy = '每第2次登场且相邻有记忆或翁法罗斯角色，常规攻击后追加自身威力65%的双人攻击。每第4次登场且同行有其他记忆或翁法罗斯角色，创建1名衣匠；下次转动起可登场。';
    createdCharacter = {
      name: '衣匠',
      skill: '累计登场2次后，在第2次登场的本次转动全部结算结束时，删除自身。',
      pending: '新增角色草案：攻击范围、威力和标签待设计，不继承素裳的技能。2次沿用旧参数作对照，不是用户要求所有创建角色均只能登场2次。'
    };
    termStatus = '创建角色需重构';
    termNote = '把当前创建素裳改为创建有剧情与能力依据的衣匠，限次删除写在衣匠自己的技能中。父技能的两套周期是否仍需保留，应与单核心重构一起讨论；这里保留作对照，不代表新设计已定。';
    termRuleChange = true;
  }

  if (originalReview.mismatch && !termRuleChange) {
    termStatus = '语义待确认';
    termNote += ' 另有原文与实现的语义分歧，须先核对命中次数或连续比例；称谓统一不代表此分歧已经解决。';
  }
  if (/伙伴|临时角色|成长/.test(termCopy)) throw new Error(`新草案仍含已撤回术语：${character.name}`);
  return {termCopy, termStatus, termNote, termRuleChange, createdCharacter};
}

export const relationshipNotes = {
  express_photography:'照顾与赠弓能支持指导意象，但“摄影完成后删除角色、主持者变强”是本作规则，不是原作事件。',
  express_archives:'同为列车成员与保护承诺，可以支持协作；并不直接证明瓦尔特固定派丹恒外勤或凭其离队强化自己。',
  guardian_report:'上下级和战斗报告适合情报交接；仍须把角色离队与收益写成明确的游戏改编。',
  landau_maintenance:'姐弟关系有依据；装备检修与谁主持委派，要按两人的职责解释，不能只因亲属关系自动建立消耗链。',
  wildfire_training:'地火同事和约战可支持切磋，但不自动构成固定师徒关系；建议表达共同训练，而非一方制造另一方副本。',
  moles_expedition:'朋友及鼹鼠党关系可支持探险，不能据此把克拉拉写成支配虎克的召唤者或上级。',
  ipc_settlement:'熟识艾丝妲与其家人，不等于艾丝妲欠托帕债；账目交接与角色离队的因果需要另行说明。',
  divination_shift:'太卜司上下级适合轮值叙事；固定离队、复制角色与永久属性奖励仍是本作改编。',
  ten_lords_leave:'姐妹及同僚可支撑结案休假，角色离队应明确是游戏删除，不写成剧情死亡。',
  ghost_hunt_wrap:'捉鬼互动可支持直播收工；不能把互相照应改成单向召唤或无穷生成同名见习角色。'
};
