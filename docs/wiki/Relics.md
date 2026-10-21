# 奇物百科

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

当前 **v0.7.0** 共64件奇物。每个ID正常只取得一份；各自效果按机制叠加。来源[src/content.js:5844](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L5844)。

奇物持有时提供被动或定时收益，部分有一次性取得效果。基础恢复与护盾不是固定补给：均须经过治疗/护盾倍率、折价和截断。详细公式见[经济与补给](Economy)、[战斗](Combat)。

## 全部奇物

| 奇物 | 稀有度 | 效果 |
| --- | --- | --- |
| [银河大乐透](Relic-cosmic_lotto) | 稀有 | 持有期间，每次转动有20%概率使全队本次威力×1.5；下次转动重新判定。 |
| [福灵胶](Relic-fortune_glue) | 稀有 | 持有期间，招募中的史诗、传说出现权重提高50%；不会永久叠乘。 |
| [天外重声大碟](Relic-gold_coin) | 普通 | 持有期间，所有登场角色的本次威力+0.3；每次重新计算，不永久叠加。 |
| [信仰债券](Relic-faith_bond) | 普通 | 每次转动获得3信用点，可保存后用于重掷或补给。 |
| [存护火漆](Relic-preservation_wax) | 稀有 | 持有期间，护盾获取量×1.5；进入新关时获得8基础护盾。 |
| [丰饶火漆](Relic-abundance_wax) | 稀有 | 持有期间，治疗量×1.5；取得时立即恢复20基础生命。 |
| [巡猎火漆](Relic-hunt_wax) | 稀有 | 持有期间，单体攻击角色每次威力×1.3。 |
| [毁灭火漆](Relic-destruction_wax) | 稀有 | 持有期间，扩散攻击角色每次威力×1.25。 |
| [智识火漆](Relic-erudition_wax) | 稀有 | 持有期间，群体攻击角色每次威力×1.25。 |
| [纯美骑士精神](Relic-harmony_wax) | 史诗 | 持有期间，相邻和定向辅助的威力平加增益×1.5；不永久叠加。 |
| [虚无火漆](Relic-nihility_wax) | 稀有 | 持有期间，虚无角色的本次威力+1；每次重新计算。 |
| [异木果实](Relic-dimension_dice) | 史诗 | 取得时，本局生命上限+15并恢复15基础生命；之后每次转动恢复2基础生命。 |
| [博士之袍](Relic-doctor_robe) | 史诗 | 持有期间，二星和三星角色的本次威力×1.2。 |
| [混沌云芝](Relic-chaos_trametes) | 稀有 | 每次转动有20%概率获得1次重掷；机会可保留至使用。 |
| [天使型谢债发行机](Relic-angel_debt) | 史诗 | 每次完成一关后，额外获得8信用点和1次移除机会；资源可保留。 |
| [虫网](Relic-insect_web) | 普通 | 本次每有1位角色退场，获得4信用点并恢复2基础生命。 |
| [公司咕咕钟](Relic-seal_stamp) | 普通 | 若取得时战斗尚未结束，本关立即多1次转动；持有期间每个新关也多1次转动。 |
| [香涎干酪](Relic-divination_candle) | 史诗 | 持有期间，羁绊的威力增益部分×1.5；不直接放大全队基础威力。 |
| [碎星芳饵](Relic-broken_clock) | 传说 | 持有期间，全队本次威力×1.2；取得时立即获得2次重掷。 |
| [鲁珀特帝国机械齿轮](Relic-rubert_gear) | 史诗 | 持有期间，角色的永久成长获取量×1.5；已获得的成长在之后保留。 |
| [降维骰子](Relic-dimensional_dice) | 史诗 | 取得时获得2次重掷。每个新关开始时获得1信用点。 |
| [跃迁复眼](Relic-compound_eye) | 稀有 | 持有时，一星角色每次威力+0.4。 |
| [测不准匣](Relic-uncertainty_box) | 稀有 | 每第3次转动，获得1次重掷。 |
| [永不停嘴的羊皮卷](Relic-whispering_scroll) | 史诗 | 每个新关开始时，对所有敌人各造成4伤害。 |
| [俱乐部券](Relic-club_coupon) | 普通 | 取得时立即获得18信用点。 |
| [纯美之袍](Relic-beauty_robe) | 稀有 | 持有时，按信用点÷30×0.12增加全队本次威力（最高+0.36，可为小数）。 |
| [分裂金币](Relic-split_coin) | 普通 | 每次转动，持有信用点≤12时获得2信用点。 |
| [无效文字打印机](Relic-invalid_printer) | 稀有 | 每个新关开始时，获得1次重掷。 |
| [空无烛剪](Relic-void_wick) | 稀有 | 永久编队不多于16人时，全队每次威力+0.5。 |
| [万识囊](Relic-omniscient_bag) | 普通 | 每次转动至少有4个生效羁绊时，获得2信用点。 |
| [万象无常骰](Relic-impermanence_dice) | 史诗 | 持有时，角色永久成长获取量×1.2。取得时获得1次移除机会。 |
| [闪耀的偏方三八面骰](Relic-polyhedral_dice) | 稀有 | 持有时，史诗角色招募权重×1.3。 |
| [欢愉火漆](Relic-elation_wax) | 稀有 | 持有时，临时角色每次威力+0.8。 |
| [记忆火漆](Relic-remembrance_wax) | 稀有 | 持有时，记忆角色每次威力+0.8。 |
| [繁育火漆](Relic-propagation_wax) | 史诗 | 本次每登场1名临时角色，获得1护盾（最多5）。 |
| [湮灭烛剪](Relic-annihilation_wick) | 稀有 | 本次常规攻击后，按本次角色退场数量对所有存活敌人各追加1伤害（最多4名）。 |
| [换境桂冠](Relic-realm_crown) | 史诗 | 每个新关开始时获得10护盾。 |
| [时空棱镜](Relic-spacetime_prism) | 史诗 | 持有时，三星角色每次威力×1.3。 |
| [朋克洛德精神](Relic-punklorde_spirit) | 稀有 | 每第3次转动，全队本次攻击无视装甲。 |
| [信标着色剂](Relic-beacon_colorant) | 稀有 | 持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）。 |
| [分裂银币](Relic-split_silver) | 普通 | 每次转动获得1信用点。生命≤50%时，每次转动再获得1信用点。 |
| [家族缘结](Relic-family_ties) | 稀有 | 持有时，匹诺康尼角色每次威力+0.7。 |
| [黑洞之阱](Relic-black_hole_trap) | 普通 | 本次角色支援结算后生命满值，获得3信用点。 |
| [星际大乐透](Relic-interstellar_lotto) | 史诗 | 每次转动有12%概率获得10信用点。 |
| [天才俱乐部普通八卦](Relic-genius_gossip) | 稀有 | 持有时，至少登场3名智识角色则群体角色本次威力+0.7。 |
| [混沌特效灵药](Relic-chaos_medicine) | 稀有 | 每第3次转动恢复6基础生命。 |
| [龋齿星系模型](Relic-cavity_model) | 史诗 | 生命≤45%时，全队本次威力×1.15。 |
| [愚者面具](Relic-fools_mask) | 史诗 | 每次转动有25%概率使全队本次威力×1.15。每次转动有25%概率获得6护盾，独立判定。 |
| [虚构机兵](Relic-fictional_machine) | 稀有 | 每次转动至少登场3名存护角色时，获得3护盾。 |
| [人造陨石球](Relic-meteorite) | 稀有 | 每第4次转动，本次常规攻击后对所有存活敌人各追加2伤害。 |
| [塔拉毒火焰](Relic-tala_flame) | 稀有 | 持有时，火属性角色每次威力+0.5。 |
| [粉红冲撞](Relic-pink_collision) | 普通 | 每次转动生命≤50%时，获得3护盾。 |
| [三角滚奏器](Relic-triangle_instrument) | 稀有 | 持有时，辅助威力平加增益×1.2。 |
| [邪恶机械卫星#900](Relic-evil_satellite) | 史诗 | 每次转动敌人反击总伤害−1。 |
| [一撮胡须火药](Relic-whisker_powder) | 稀有 | 持有时，扩散角色每次威力+0.6。 |
| [血锦之纪徽章](Relic-blood_badge) | 史诗 | 持有时，毁灭角色每次威力+0.7。取得时恢复8基础生命。 |
| [许愿星](Relic-wish_star) | 稀有 | 取得时获得3次重掷。 |
| [猜不透匣](Relic-mystery_box) | 史诗 | 取得时获得1次移除机会。取得时获得8信用点。 |
| [海绵王](Relic-sponge_king) | 稀有 | 取得时，本局生命上限+12。每次转动生命≤40%时，恢复2基础生命。 |
| [和平的代价](Relic-peace_price) | 稀有 | 持有时，护盾获取量×1.2。持有时，单体角色本次威力×0.95。 |
| [腐化异木果实](Relic-corrupt_fruit) | 史诗 | 取得时，本局生命上限+20。每次转动消耗1生命，最多降至1。持有时，治疗量×1.2。 |
| [阿阮袋](Relic-ruan_pouch) | 稀有 | 每个新关开始时获得4信用点。 |
| [「楼梯上的水母」](Relic-stair_jellyfish) | 稀有 | 持有时，未触发精华的进度获取量×1.15。 |
| [「有机心脏」](Relic-organic_heart) | 史诗 | 每次转动恢复1基础生命。每次转动获得1护盾。 |

## 按效果类型查阅

- **威力倍率**：[银河大乐透](Relic-cosmic_lotto)、[巡猎火漆](Relic-hunt_wax)、[毁灭火漆](Relic-destruction_wax)、[智识火漆](Relic-erudition_wax)、[博士之袍](Relic-doctor_robe)、[香涎干酪](Relic-divination_candle)、[碎星芳饵](Relic-broken_clock)、[时空棱镜](Relic-spacetime_prism)、[龋齿星系模型](Relic-cavity_model)、[愚者面具](Relic-fools_mask)、[和平的代价](Relic-peace_price)。
- **招募权重倍率**：[福灵胶](Relic-fortune_glue)、[闪耀的偏方三八面骰](Relic-polyhedral_dice)。
- **威力平加**：[天外重声大碟](Relic-gold_coin)、[虚无火漆](Relic-nihility_wax)、[跃迁复眼](Relic-compound_eye)、[纯美之袍](Relic-beauty_robe)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[记忆火漆](Relic-remembrance_wax)、[信标着色剂](Relic-beacon_colorant)、[家族缘结](Relic-family_ties)、[天才俱乐部普通八卦](Relic-genius_gossip)、[塔拉毒火焰](Relic-tala_flame)、[一撮胡须火药](Relic-whisker_powder)、[血锦之纪徽章](Relic-blood_badge)。
- **资源收入**：[信仰债券](Relic-faith_bond)、[混沌云芝](Relic-chaos_trametes)、[天使型谢债发行机](Relic-angel_debt)、[虫网](Relic-insect_web)、[碎星芳饵](Relic-broken_clock)、[降维骰子](Relic-dimensional_dice)、[测不准匣](Relic-uncertainty_box)、[俱乐部券](Relic-club_coupon)、[分裂金币](Relic-split_coin)、[无效文字打印机](Relic-invalid_printer)、[万识囊](Relic-omniscient_bag)、[万象无常骰](Relic-impermanence_dice)、[分裂银币](Relic-split_silver)、[黑洞之阱](Relic-black_hole_trap)、[星际大乐透](Relic-interstellar_lotto)、[许愿星](Relic-wish_star)、[猜不透匣](Relic-mystery_box)、[阿阮袋](Relic-ruan_pouch)。
- **护盾量倍率**：[存护火漆](Relic-preservation_wax)、[和平的代价](Relic-peace_price)。
- **获得护盾**：[存护火漆](Relic-preservation_wax)、[繁育火漆](Relic-propagation_wax)、[换境桂冠](Relic-realm_crown)、[愚者面具](Relic-fools_mask)、[虚构机兵](Relic-fictional_machine)、[粉红冲撞](Relic-pink_collision)、[「有机心脏」](Relic-organic_heart)。
- **治疗量倍率**：[丰饶火漆](Relic-abundance_wax)、[腐化异木果实](Relic-corrupt_fruit)。
- **恢复生命**：[丰饶火漆](Relic-abundance_wax)、[异木果实](Relic-dimension_dice)、[虫网](Relic-insect_web)、[混沌特效灵药](Relic-chaos_medicine)、[血锦之纪徽章](Relic-blood_badge)、[海绵王](Relic-sponge_king)、[「有机心脏」](Relic-organic_heart)。
- **支援增益量倍率**：[纯美骑士精神](Relic-harmony_wax)、[三角滚奏器](Relic-triangle_instrument)。
- **提高生命上限**：[异木果实](Relic-dimension_dice)、[海绵王](Relic-sponge_king)、[腐化异木果实](Relic-corrupt_fruit)。
- **增加本关转动次数**：[公司咕咕钟](Relic-seal_stamp)。
- **成长获取倍率**：[鲁珀特帝国机械齿轮](Relic-rubert_gear)、[万象无常骰](Relic-impermanence_dice)。
- **独立追加伤害**：[永不停嘴的羊皮卷](Relic-whispering_scroll)、[湮灭烛剪](Relic-annihilation_wick)、[人造陨石球](Relic-meteorite)。
- **本轮无视装甲**：[朋克洛德精神](Relic-punklorde_spirit)。
- **固定反击削减**：[邪恶机械卫星#900](Relic-evil_satellite)。
- **直接消耗生命**：[腐化异木果实](Relic-corrupt_fruit)。
- **未解锁精华进度倍率**：[「楼梯上的水母」](Relic-stair_jellyfish)。

## 复原与边界

当前部分早期条目保留`legacy:true`的展示元数据，通用解释器跳过；它们有实际专用分支，每份条目已标出，复原时只执行一次。不要将`stacking:unique`当作通用解释器的额外去重逻辑；正常流程的单份持有由奖励候选排除提供。各条目的JSON保留参数，可与[效果时序](Effects-and-Timing)、[复原规格](Reproduction)一起交叉核对。
