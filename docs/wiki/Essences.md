# 精华百科

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

当前 **v0.7.0** 共32份精华。每个ID正常只取得一份；各自效果按机制叠加。来源[src/content.js:7564](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7564)。

精华取得时不立即提供持续能力；先从取得后的行为积累进度，转动末达标后执行一次解锁奖励，并激活持续效果。完整快照、计数与进度修正见各精华条目和[效果时序](Effects-and-Timing)。

## 全部精华

| 精华 | 稀有度 | 进度指标 | 门槛 | 解锁收益 |
| --- | --- | --- | --- | --- |
| [银河大乐透·精华](Essence-essence_elation) | 史诗 | `damage`：本轮累计对敌实际伤害 | 100 | 取得后累计造成100伤害：结算达标后，从下次转动起全队威力×1.15，本局持续。 |
| [异木果实·精华](Essence-essence_abundance) | 史诗 | `spins`：已完成转动次数 | 6 | 取得后再转动6次：达标时生命上限永久+20，并按新上限治疗一次；治疗折价可能使实际生命未回满。 |
| [巡猎火漆·精华](Essence-essence_hunt) | 史诗 | `single`：本轮单体攻击实例登场数 | 12 | 取得后单体角色累计登场12次：达标后从下次转动起单体威力×1.35，本局持续。 |
| [毁灭火漆·精华](Essence-essence_destruction) | 史诗 | `spins`：已完成转动次数 | 8 | 取得后再转动8次：达标后从下次转动起所有角色每次威力+1，本局持续，不逐轮叠加。 |
| [智识火漆·精华](Essence-essence_erudition) | 史诗 | `aoe`：本轮群体攻击实例登场数 | 10 | 取得后群体角色累计登场10次：达标后从下次转动起群体角色每次威力+1，本局持续。 |
| [纯美骑士精神·精华](Essence-essence_harmony) | 史诗 | `synergies`：本轮激活的正式羁绊条目数 | 12 | 取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队威力×1.1，本局持续。 |
| [存护火漆·精华](Essence-essence_preservation) | 史诗 | `shield`：本轮转动内实际新增护盾 | 30 | 取得后转动内累计实际自然获得30护盾（不计补给、入关赠盾）：之后护盾获取量×1.3，每个新关获得12基础护盾。 |
| [虚无火漆·精华](Essence-essence_nihility) | 史诗 | `nihility`：本轮虚无实例登场数 | 8 | 取得后虚无角色累计登场8次：达标后从下次转动起虚无角色每次威力+1.5，本局持续。 |
| [分裂金币·精华](Essence-essence_split_coin) | 史诗 | `credits`：本轮转动结算内获得信用点 | 24 | 取得后累计转动内获得信用点（不计取得/通关奖励）达到24：达标时立即获得12信用点。之后本局全队每次威力+0.25。 |
| [降维骰子·精华](Essence-essence_dimensional_dice) | 史诗 | `rerolls`：取得精华后实际使用重掷次数 | 4 | 取得后累计使用重掷达到4：达标时立即返还2次重掷。之后本局传说招募权重×1.2。 |
| [空无烛剪·精华](Essence-essence_void_wick) | 史诗 | `removals`：取得精华后实际使用移除次数 | 3 | 取得后累计使用移除达到3：之后本局，永久编队≤18人时全队每次威力+0.7。 |
| [朋克洛德精神·精华](Essence-essence_punklorde) | 史诗 | `creditsSpent`：取得精华后实际消费信用点总量 | 24 | 取得后累计消费信用点达到24：之后本局单体角色每次威力×1.15。 |
| [时空棱镜·精华](Essence-essence_prism) | 史诗 | `merges`：取得精华后完成的三合一合成次数 | 2 | 取得后累计完成合成达到2：之后本局二星、三星角色每次威力+1。 |
| [跃迁复眼·精华](Essence-essence_compound_eye) | 史诗 | `spins`：已完成转动次数 | 5 | 取得后累计转动达到5：之后本局一星角色每次威力+0.5。 |
| [永不停嘴的羊皮卷·精华](Essence-essence_scroll) | 史诗 | `kills`：本轮击破敌列数 | 8 | 取得后累计击破敌列达到8：之后本局群体角色每次威力+0.8。 |
| [纯美之袍·精华](Essence-essence_beauty_robe) | 史诗 | `spins`：已完成转动次数 | 6 | 取得后累计转动达到6：之后本局，持有信用点≥20时全队威力×1.12。 |
| [欢愉火漆·精华](Essence-essence_elation_wax) | 史诗 | `retirements`：本轮已经计入的退场数 | 4 | 取得后累计角色退场达到4：之后本局临时角色每次威力+1.2。 |
| [记忆火漆·精华](Essence-essence_remembrance) | 史诗 | `spins`：已完成转动次数 | 6 | 取得后累计转动达到6：之后本局记忆角色每次威力+1。 |
| [繁育火漆·精华](Essence-essence_propagation) | 史诗 | `retirements`：本轮已经计入的退场数 | 3 | 取得后累计角色退场达到3：达标时立即获得1次移除机会。之后本局护盾获取量×1.1。 |
| [湮灭烛剪·精华](Essence-essence_annihilation) | 史诗 | `retirements`：本轮已经计入的退场数 | 5 | 取得后累计角色退场达到5：之后本局毁灭角色每次威力+1。 |
| [换境桂冠·精华](Essence-essence_realm_crown) | 史诗 | `shield`：本轮转动内实际新增护盾 | 35 | 取得后累计实际获得护盾达到35：达标时立即获得12基础护盾。之后本局存护防御者的护盾获取量×1.15。 |
| [信标着色剂·精华](Essence-essence_colorant) | 史诗 | `single`：本轮单体攻击实例登场数 | 10 | 取得后累计单体角色登场达到10：之后本局量子角色每次威力+0.8。 |
| [家族缘结·精华](Essence-essence_family) | 史诗 | `synergies`：本轮激活的正式羁绊条目数 | 15 | 取得后累计生效羁绊数达到15：之后本局匹诺康尼角色每次威力+1。 |
| [黑洞之阱·精华](Essence-essence_trap) | 史诗 | `credits`：本轮转动结算内获得信用点 | 30 | 取得后累计转动内获得信用点（不计取得/通关奖励）达到30：达标时本局生命上限+8。达标时恢复8基础生命。 |
| [天才俱乐部普通八卦·精华](Essence-essence_genius) | 史诗 | `aoe`：本轮群体攻击实例登场数 | 12 | 取得后累计群体角色登场达到12：之后本局智识角色每次威力×1.15。 |
| [混沌特效灵药·精华](Essence-essence_medicine) | 史诗 | `healing`：本轮实际恢复生命量 | 25 | 取得后累计实际恢复生命达到25：之后本局治疗量×1.2。 |
| [龋齿星系模型·精华](Essence-essence_cavity) | 史诗 | `damage`：本轮累计对敌实际伤害 | 300 | 取得后累计造成伤害达到300：之后本局生命≤50%时，全队本次威力×1.18。 |
| [邪恶机械卫星#900·精华](Essence-essence_satellite) | 史诗 | `spins`：已完成转动次数 | 7 | 取得后累计转动达到7：之后本局每次转动敌人反击总伤害−1。 |
| [塔拉毒火焰·精华](Essence-essence_tala) | 史诗 | `aoe`：本轮群体攻击实例登场数 | 10 | 取得后累计群体角色登场达到10：之后本局火属性角色每次威力+0.9。 |
| [一撮胡须火药·精华](Essence-essence_whisker) | 史诗 | `damage`：本轮累计对敌实际伤害 | 220 | 取得后累计造成伤害达到220：之后本局扩散角色每次威力+0.8。 |
| [「有机心脏」·精华](Essence-essence_heart) | 史诗 | `healing`：本轮实际恢复生命量 | 30 | 取得后累计实际恢复生命达到30：达标时本局生命上限+10。之后本局治疗量×1.1。 |
| [「楼梯上的水母」·精华](Essence-essence_jellyfish) | 史诗 | `synergies`：本轮激活的正式羁绊条目数 | 16 | 取得后累计生效羁绊数达到16：达标时立即获得2次重掷。之后本局其余未触发精华的进度获取量×1.1。 |

## 按效果类型查阅

- **威力倍率**：[银河大乐透·精华](Essence-essence_elation)、[巡猎火漆·精华](Essence-essence_hunt)、[纯美骑士精神·精华](Essence-essence_harmony)、[朋克洛德精神·精华](Essence-essence_punklorde)、[纯美之袍·精华](Essence-essence_beauty_robe)、[天才俱乐部普通八卦·精华](Essence-essence_genius)、[龋齿星系模型·精华](Essence-essence_cavity)。
- **提高生命上限**：[异木果实·精华](Essence-essence_abundance)、[黑洞之阱·精华](Essence-essence_trap)、[「有机心脏」·精华](Essence-essence_heart)。
- **恢复生命**：[异木果实·精华](Essence-essence_abundance)、[黑洞之阱·精华](Essence-essence_trap)。
- **威力平加**：[毁灭火漆·精华](Essence-essence_destruction)、[智识火漆·精华](Essence-essence_erudition)、[虚无火漆·精华](Essence-essence_nihility)、[分裂金币·精华](Essence-essence_split_coin)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[永不停嘴的羊皮卷·精华](Essence-essence_scroll)、[欢愉火漆·精华](Essence-essence_elation_wax)、[记忆火漆·精华](Essence-essence_remembrance)、[湮灭烛剪·精华](Essence-essence_annihilation)、[信标着色剂·精华](Essence-essence_colorant)、[家族缘结·精华](Essence-essence_family)、[塔拉毒火焰·精华](Essence-essence_tala)、[一撮胡须火药·精华](Essence-essence_whisker)。
- **资源收入**：[纯美骑士精神·精华](Essence-essence_harmony)、[分裂金币·精华](Essence-essence_split_coin)、[降维骰子·精华](Essence-essence_dimensional_dice)、[繁育火漆·精华](Essence-essence_propagation)、[「楼梯上的水母」·精华](Essence-essence_jellyfish)。
- **护盾量倍率**：[存护火漆·精华](Essence-essence_preservation)、[繁育火漆·精华](Essence-essence_propagation)、[换境桂冠·精华](Essence-essence_realm_crown)。
- **获得护盾**：[存护火漆·精华](Essence-essence_preservation)、[换境桂冠·精华](Essence-essence_realm_crown)。
- **招募权重倍率**：[降维骰子·精华](Essence-essence_dimensional_dice)。
- **治疗量倍率**：[混沌特效灵药·精华](Essence-essence_medicine)、[「有机心脏」·精华](Essence-essence_heart)。
- **固定反击削减**：[邪恶机械卫星#900·精华](Essence-essence_satellite)。
- **未解锁精华进度倍率**：[「楼梯上的水母」·精华](Essence-essence_jellyfish)。

## 复原与边界

当前部分早期条目保留`legacy:true`的展示元数据，通用解释器跳过；它们有实际专用分支，每份条目已标出，复原时只执行一次。不要将`stacking:unique`当作通用解释器的额外去重逻辑；正常流程的单份持有由奖励候选排除提供。各条目的JSON保留参数，可与[效果时序](Effects-and-Timing)、[复原规格](Reproduction)一起交叉核对。
