# 委派

[首页](Home) › [成长与星级](Growth-and-Stars)

委派是 **10 组固定角色关系**的自动结案机制：主持者在规定登场周期，派走一位相邻且合格的受体，换取永久成长、当轮威力和信用点。受体永久离队，语义是完成工作，不是死亡。角色关系借用原作背景，委派条件与收益是本游戏改编。十名受体的原作稀有度均为四星，这不是本游戏招募品质或实例星级的额外限制。

## 触发时序

转动抽出 5×4 棋盘后，按格索引从小到大处理主持者；本次普通登场技能和攻击尚未执行。主持者须为非 temporary、非 commission 且未被消耗的实例。对每个主持者，以 `nextTick = 旧 ticks + 1` 判断节奏：每第 3 次实际登场尝试结案，每第 4 次尝试补充见习。这些计数跨关保留，未抽中不前进；不是每关第三轮。补充见习先检查，随后检查结案。

当次结案要求受体位于[八邻域](Board-and-Targeting)，并通过下列保护条件；每个主持者本次最多派走一个。受体立即标记 consumed，从本次技能、威力、攻击、同场条件中排除，轮末从 roster 真正移除。不相邻或周期不到则不结案，不从整支编队远程找人。

## 受体保护与候选排序

- 必须是该关系指定的目标角色 id；不能是主持者自身 UID。
- 不能是临时角色、已有 status 或本轮已被消耗实例；所有二星/三星都受保护。
- 普通正式一星实例永久成长必须 `≤1`；成长恰为 1 仍可，超过 1 则保护。
- 普通受体需要编队里仍有至少两位未消耗的普通正式同名实例，保证保留最后一位；见习不算这份保底副本。
- 见习受体仅可由相同关系 id 结案，不受“最后普通副本”限制；其 commission 必须匹配。

多个候选时先选见习，再按永久成长升序、ticks 升序、UID 字符串升序选择。多名主持者按棋盘顺序先后处理，同一受体不能重复结案。内部测试“核心”或“套路”标记不会赋予额外保护。

## 见习补充

每逢主持者第 4、8、12…次登场，若该关系已解锁，且 roster 加待生成实例尚未达到 200，且该关系没有未消耗的见习等待中，则补充一个一星见习受体。解锁指当前拥有至少一位该受体的普通正式实例，或这组关系历史结案数大于 0。多个主持者共享**每关系最多一个待结案见习**，不能倍增供给。见习的 origin 记录创建者，但结案资格只检查关系 id；同关系的另一位正式主持者也能结案它，不要求 origin 等于自己的 UID。

新见习在轮末加入 roster，下次抽取起才可登场；当轮生成的见习不能立刻被主持者结案。见习带 commission 与 origin 标记，不带 temporary，因而没有 1–3 次登场的过期计数。它会参与抽取、能使用自己的角色技能与攻击，也可作为下一次相邻结案受体；不参加自动合成，不增加羁绊编队身份数。现有技能筛选若没有明确排除 commission，仍可能让它受益或成为同场身份。

## 收益与公式

所有关系基本周期均为结案 3、供给 4。结案即时获得信用点，不要求主持者为攻击者。令 `g`、`p`、`c` 为下表数值，`F星 = 1 / 1.5 / 2`，`T星 = 1 / 3 / 9`：

`永久成长增加 = g × F星 × 高星税系数 × 齿轮系数 × 成长折旧系数 × 主持者适用成长被动`

高星税系数仅二/三星且有[升星差额税](EnemyEffect-star_audit)时为 0.8；齿轮为 1.5 或 1；成长折旧为 0.5 或 1。结果保留两位小数后写入主持者永久成长，攻击职能会在本轮基础威力阶段使用这份新成长；非攻击职能按通用培养公式增强专职技能，growth 技能本身不吃培养递归放大。

只有攻击职能主持者获得 `p × T星 × 高星税系数` 当轮平加威力；不把这个平加留到下一轮。信用点增加固定 c，不按星级、培养或羁绊进攻增幅放大。寒鸦关系特例 g=0、p=0、c=3。

| 关系 | 主持者 → 受体 | g：基础成长 | p：当轮威力 | c：信用点 |
| --- | --- | --- | --- | --- |
| [巡航摄影委派](Assignment-express_photography) | [姬子](Card-1003) → [三月七](Card-1001) | 0.35 | 1.5 | 2 |
| [智库外勤归档](Assignment-express_archives) | [瓦尔特](Card-1004) → [丹恒](Card-1002) | 0.35 | 0 | 2 |
| [银鬃情报交接](Assignment-guardian_report) | [布洛妮娅](Card-1101) → [佩拉](Card-1106) | 0.35 | 0 | 2 |
| [朗道装备检修](Assignment-landau_maintenance) | [杰帕德](Card-1104) → [希露瓦](Card-1103) | 0.35 | 0 | 2 |
| [地火拳术集训](Assignment-wildfire_training) | [希儿](Card-1102) → [卢卡](Card-1111) | 0.35 | 1.5 | 2 |
| [鼹鼠队探险收工](Assignment-moles_expedition) | [克拉拉](Card-1107) → [虎克](Card-1109) | 0.35 | 1.5 | 2 |
| [空间站账目结清](Assignment-ipc_settlement) | [托帕&账账](Card-1112) → [艾丝妲](Card-1009) | 0.35 | 1.5 | 2 |
| [太卜司轮值交接](Assignment-divination_shift) | [符玄](Card-1208) → [青雀](Card-1201) | 0.35 | 0 | 2 |
| [十王司结案休假](Assignment-ten_lords_leave) | [寒鸦](Card-1215) → [雪衣](Card-1214) | 0 | 0 | 3 |
| [捉鬼直播收工](Assignment-ghost_hunt_wrap) | [藿藿](Card-1217) → [桂乃芬](Card-1210) | 0.35 | 0 | 2 |

## 统计与其他系统

每次结案增加本轮 retirements 和总退场数；普通受体另计 permanentRetirements，见习结案不增加该项。轮末 stats.destroyed 同时包含委派、临时消耗和临时过期，不能把这个字段当作死亡人数。每关系保存 completed、permanent、supplied，并校验总数与见习库存；存档不能靠伪造标记获得免费见习。界面预览中的 nextAppearance 取所有正式主持者到下一次三登场周期的最小距离，eligibleUids 只列资格合格受体，不保证它们下次会被抽中或相邻。

本轮激活羁绊列表在委派前取得，所以本次普通受体离队不会追溯取消已取得的激活档位；下一次转动再重算。若受体是污染指定 UID，离队会清除污染，后续转动不再支付其污染代价；本轮污染在委派前已经扣掉的生命不会退还。

相关：[成长与星级](Growth-and-Stars) · [效果时序](Effects-and-Timing) · [棋盘与目标](Board-and-Targeting) · [羁绊](Synergies) · [裂界污染](EnemyEffect-rift_pollution) · [信用点](Economy)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/retirements.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/retirements.js#L1-L43)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L396-L418)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L439-L480)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L684-L699)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L890-L898)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L119-L145)；[tests/retirements.test.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/tests/retirements.test.js#L1-L176)。
