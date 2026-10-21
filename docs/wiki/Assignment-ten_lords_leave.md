# 十王司结案休假

[首页](Home) › [委派](Assignments)

[寒鸦](Card-1215) 主持，派遣 [雪衣](Card-1214) 结案。该关系使用全部[委派通则](Assignments)：每第三次实际登场、八邻域、目标保护、见习优先与候选排序均适用。

| 项目 | 本关系 |
| --- | --- |
| 识别码 | `ten_lords_leave` |
| 主持者 | [寒鸦](Card-1215)，正式实例 |
| 受体 | [雪衣](Card-1214)，合格普通一星或本关系见习 |
| 结案周期 | 主持者第 3、6、9…次登场 |
| 供给周期 | 已解锁后第 4、8、12…次登场；每关系最多 1 位待结案见习 |
| 基础永久成长 | 0，按一/二/三星 1 / 1.5 / 2 倍，再过成长修正 |
| 当轮威力 | 无 |
| 信用点 | 3，固定，不按星级放大 |

## 结案实例与效果

必须在同一次棋盘抽取中抽到主持者与合格受体，并摆在八邻域；不能直接从编队移走未登场副本。普通受体须一星、永久成长不超过 1，且结案后仍保留至少一位普通正式同名角色。见习需 commission=ten_lords_leave，不受最后普通副本保护。受体在普通技能与攻击之前离队，当轮不会贡献自己的技能、攻击或同场条件。

本关系不奖励永久成长，也不奖励当轮威力，以固定信用点结案。

补充见习需要当前拥有受体普通正式角色，或这组关系已有历史结案；见习轮末加入，下轮才能抽中。多个 [寒鸦](Card-1215) 实例仍共享这组关系的一位见习上限。

## 角色关系资料

游戏定义采用的背景说明：寒鸦与雪衣是姐妹及十王司同僚；寒鸦邀请判决后的姐姐散步。 该说明为角色关系引用，委派节奏与收益属于本游戏改编；游戏登记的资料来源为[对应原作条目](https://honkai-star-rail.fandom.com/wiki/Xueyi/Lore)。

## 关联机制

[委派完整规则](Assignments) · [培养与永久成长](Growth-and-Stars) · [相邻与棋盘](Board-and-Targeting) · [信用点](Economy) · [升星差额税](EnemyEffect-star_audit) · [成长折旧](EnemyEffect-growth_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/retirements.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/retirements.js#L12)；[src/retirements.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/retirements.js#L14-L43)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L439-L480)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L124-L145)。
