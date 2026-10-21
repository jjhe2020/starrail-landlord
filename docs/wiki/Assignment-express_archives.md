# 智库外勤归档

[首页](Home) › [委派](Assignments)

[瓦尔特](Card-1004) 主持，派遣 [丹恒](Card-1002) 结案。该关系使用全部[委派通则](Assignments)：每第三次实际登场、八邻域、目标保护、见习优先与候选排序均适用。

| 项目 | 本关系 |
| --- | --- |
| 识别码 | `express_archives` |
| 主持者 | [瓦尔特](Card-1004)，正式实例 |
| 受体 | [丹恒](Card-1002)，合格普通一星或本关系见习 |
| 结案周期 | 主持者第 3、6、9…次登场 |
| 供给周期 | 已解锁后第 4、8、12…次登场；每关系最多 1 位待结案见习 |
| 基础永久成长 | 0.35，按一/二/三星 1 / 1.5 / 2 倍，再过成长修正 |
| 当轮威力 | 无 |
| 信用点 | 2，固定，不按星级放大 |

## 结案实例与效果

必须在同一次棋盘抽取中抽到主持者与合格受体，并摆在八邻域；不能直接从编队移走未登场副本。普通受体须一星、永久成长不超过 1，且结案后仍保留至少一位普通正式同名角色。见习需 commission=express_archives，不受最后普通副本保护。受体在普通技能与攻击之前离队，当轮不会贡献自己的技能、攻击或同场条件。

成长在结案时写入主持者实例，基础 0.35 按 1 / 1.5 / 2 的专用星级因子计算；其余倍率与舍入详见[委派公式](Assignments)。

补充见习需要当前拥有受体普通正式角色，或这组关系已有历史结案；见习轮末加入，下轮才能抽中。多个 [瓦尔特](Card-1004) 实例仍共享这组关系的一位见习上限。

## 角色关系资料

游戏定义采用的背景说明：瓦尔特与丹恒同属列车，明确承诺保护丹恒。 该说明为角色关系引用，委派节奏与收益属于本游戏改编；游戏登记的资料来源为[对应原作条目](https://honkai-star-rail.fandom.com/wiki/Welt/Dialogue)。

## 关联机制

[委派完整规则](Assignments) · [培养与永久成长](Growth-and-Stars) · [相邻与棋盘](Board-and-Targeting) · [信用点](Economy) · [升星差额税](EnemyEffect-star_audit) · [成长折旧](EnemyEffect-growth_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/retirements.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/retirements.js#L5)；[src/retirements.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/retirements.js#L14-L43)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L439-L480)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L124-L145)。
