# 敌方条款

[首页](Home) › [难度与敌阵](Difficulty)

条款是当前遭遇对已有机制的定向削弱。当前有 **31 项随机条款＋1 项固定裂界污染**。它们与每关自带的四种[敌阵技能](Difficulty)是两个独立系统。随机条款不永久禁用角色，也不把职业或技能从存档里删除。

## 选取、持续与新增时点

每次需要追加随机条款时，重新建立符合资格的池子，排除固定污染和已存在的同 id 条款，再用种子随机数从余下项目中等概率取一个。没有合格项则此次不追加。不是从全部 31 项盲抽后再改成相关条款，也没有按稀有度赋权。

第 4 层起入关追加一项来源为 difficulty 的随机条款；每逢 3 的倍数首领层，阶段 1 入关另加一项来源为 boss 的条款，升到阶段 2、3 各再尝试加一项。两种来源共用去重池。首领生命与轮数阈值、同轮生效时点见[难度与敌阵](Difficulty)。污染另在固定层数指定 UID。所有条款在下一关 setupFloor 时清空并重新选取。

资格只影响抽选时能否进入池子。选中后不会因条件暂时消失自动重抽；例如满血溢价的生命条件是每轮动态判定，角色已离队的专属条款则暂时没有受影响对象。持有新角色也不会自动加一个新条款。

## 资格筛选的准确口径

命途、攻击方式、指定角色检查的是当前 roster，包含临时援军和见习实例，**不同于羁绊的永久身份计数**。技能来源检查读取角色、持有奇物、已触发精华、已激活羁绊的真实定义；跳过 acquire 一次性效果，不从存档中的文字说明执行规则。

判断治疗/护盾可用性时，若效果依赖退场计数或 temporary 受体，资格函数要求现有临时实例或持续召唤来源；它不会仅因正式委派未来可能发生就推断这些来源可用。治疗转盾还要求有可用治疗来源，单独持有仙舟同盟不保证进入护盾条款池。已有护盾大于 0 本身足以让护盾三类条款入池。

定向增益资格读取技能 target 为 adjacent、row、column、aligned、strongest、matching，或 selection=strongest；不做本轮摆位模拟。实际生效仍须通过技能本身的位置和公开标签条件。

## 完整条款列表

| 条款 | 获得方式 | 游戏内摘要 |
| --- | --- | --- |
| [巡猎征税](EnemyEffect-path_hunt) | 随机，须通过资格筛选 | 巡猎角色威力降低 20%。 |
| [毁灭限额](EnemyEffect-path_destruction) | 随机，须通过资格筛选 | 毁灭角色威力降低 20%。 |
| [智识稽核](EnemyEffect-path_erudition) | 随机，须通过资格筛选 | 智识角色威力降低 20%。 |
| [虚无审查](EnemyEffect-path_nihility) | 随机，须通过资格筛选 | 虚无角色威力、易伤与削弱反击的技能效果降低 20%。 |
| [存护折旧](EnemyEffect-path_preservation) | 随机，须通过资格筛选 | 存护角色产生的护盾降低 25%。 |
| [丰饶限流](EnemyEffect-path_abundance) | 随机，须通过资格筛选 | 丰饶角色的治疗降低 25%。 |
| [同谐隔离](EnemyEffect-path_harmony) | 随机，须通过资格筛选 | 同谐角色提供的平加和倍率增益效果降低 30%（仅削减倍率高于 1 的部分）。 |
| [单体附加税](EnemyEffect-attack_single) | 随机，须通过资格筛选 | 单体攻击角色威力降低 20%。 |
| [扩散限额](EnemyEffect-attack_blast) | 随机，须通过资格筛选 | 扩散攻击角色威力降低 20%。 |
| [群攻摊销](EnemyEffect-attack_aoe) | 随机，须通过资格筛选 | 群体攻击角色威力降低 20%。 |
| [成长折旧](EnemyEffect-growth_audit) | 随机，须通过资格筛选 | 本层新增永久成长降低 50%；已有成长保留。 |
| [邻接隔断](EnemyEffect-adjacency_audit) | 随机，须通过资格筛选 | 相邻与定向的平加和倍率增益效果降低 40%（仅削减倍率高于 1 的部分）。 |
| [升星差额税](EnemyEffect-star_audit) | 随机，须通过资格筛选 | 二星、三星的基础威力和角色技能倍率降低 20%；不会降星。 |
| [追击登记](EnemyEffect-summon_audit) | 随机，须通过资格筛选 | 角色技能造成的追加伤害降低 25%；普通攻击不受影响。 |
| [鼹鼠追击税](EnemyEffect-consume_audit) | 随机，须通过资格筛选 | 虎克的额外追击伤害降低 50%。 |
| [丹恒成长审计](EnemyEffect-danheng_audit) | 随机，须通过资格筛选 | 丹恒本层新增的自身永久成长降低 50%；已有成长保留。 |
| [黑塔转动折损](EnemyEffect-herta_audit) | 随机，须通过资格筛选 | 黑塔周期技能的追加伤害降低 50%。 |
| [暗杠限额](EnemyEffect-qingque_audit) | 随机，须通过资格筛选 | 青雀周期爆发的额外倍率降低 50%（未培养时 2.35 倍变为 1.675 倍）。 |
| [再现滞留](EnemyEffect-seele_audit) | 随机，须通过资格筛选 | 希儿击破追击的威力降低 50%。 |
| [感电稽核](EnemyEffect-kafka_audit) | 随机，须通过资格筛选 | 卡芙卡为相邻雷或虚无扩散攻击者提供的易伤降低 50%。 |
| [禁锢抵抗](EnemyEffect-welt_audit) | 随机，须通过资格筛选 | 瓦尔特降低敌人反击伤害的效果降低 50%。 |
| [穷观阵裂隙](EnemyEffect-fuxuan_audit) | 随机，须通过资格筛选 | 符玄的同行条件反击减伤效果降低 50%（未培养时 12% 变为 6%）。 |
| [六相冰折损](EnemyEffect-march_audit) | 随机，须通过资格筛选 | 三月七产生的护盾降低 50%。 |
| [急救限流](EnemyEffect-natasha_audit) | 随机，须通过资格筛选 | 娜塔莎的治疗降低 50%。 |
| [精华缓释](EnemyEffect-essence_audit) | 随机，须通过资格筛选 | 尚未触发的精华进度获取降低 25%。 |
| [羁绊征收](EnemyEffect-synergy_audit) | 随机，须通过资格筛选 | 已激活羁绊的威力加成降低 25%。 |
| [医疗折价](EnemyEffect-healing_audit) | 随机，须通过资格筛选 | 角色、羁绊和奇物的治疗降低 25%；信用补给维修保持固定数值。 |
| [护盾折价](EnemyEffect-shield_audit) | 随机，须通过资格筛选 | 角色、羁绊和奇物产生的护盾降低 25%；信用补给护盾保持固定数值。 |
| [贯穿反击](EnemyEffect-shield_pierce) | 随机，须通过资格筛选 | 敌人反击的 25% 直接损失生命，其余仍可由护盾抵挡。 |
| [护盾滞纳金](EnemyEffect-shield_decay) | 随机，须通过资格筛选 | 每次转动开始时，已有护盾减少 20%。 |
| [满血溢价](EnemyEffect-healthy_audit) | 随机，须通过资格筛选 | 生命高于上限一半时，攻击角色的威力降低 15%。 |
| [裂界污染](EnemyEffect-rift_pollution) | 固定指定实例 | 指定一星实例实际登场时直接消耗 6 生命，自身威力降低 50%，本轮全队攻击角色最终威力降低 15%；辅助治疗和护盾不受此影响。移除或合成该实例可解除，仅本关有效。 |

## 叠加原则

不同威力税相乘；不同护盾/治疗税也在相应生成入口相乘。倍率技能被削弱时通常只压缩距离 1 的增益/减伤部分，不能把“增益降低 50%”误读为所有最终伤害乘 0.5。例：2.35 倍青雀技能变 1.675；符玄 0.88 反击倍率变 0.94。

这些条款不会把已有永久成长、已有精华进度或已有护盾即时扣回；护盾滞纳金和污染扣血是另外明确规定的持续损失。反击贯穿仍用同一份反击总额，不额外增加伤害。各入口与舍入见[战斗](Combat)、[效果时序](Effects-and-Timing)。

相关：[羁绊](Synergies) · [角色](Cards) · [难度与敌阵](Difficulty) · [成长](Growth-and-Stars) · [经济补给](Economy)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L4-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L650-L684)；[tests/enemy-effects.test.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/tests/enemy-effects.test.js#L1-L251)；[tests/pollution.test.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/tests/pollution.test.js#L1-L237)。
