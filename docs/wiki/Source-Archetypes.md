# 冻结实现：src/archetypes.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/archetypes.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：2320
- SHA-256：`f198849f02fdd1828cb572903f803f47efb0f2d3c81d0f3421c7093b1f0ea4cb`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/archetypes.js#L1)

<!-- frozen-source:start -->
````````````````javascript
import { CHARACTERS } from './content.js';
// Internal draft-policy metadata only. Neither formation nor membership grants
// combat effects, protects a card from retirement, or creates a gameplay tag.
const define = (id, name, filters, threshold = 5) => ({
  id, name, filters, threshold, coreRequired: 0, coreIds: [], effects: [],
  memberIds: CHARACTERS.filter(c => filters.some(filter => Object.entries(filter).every(([key, value]) => c[key] === value))).map(c => c.id),
  description: `测试拿牌偏好：${filters.map(f => Object.values(f).join('＋')).join('或')}。仅用于比较选择策略，没有成型奖励。`,
  activation: '仅统计正式标签覆盖；不会激活额外技能或倍率',
});
export const ARCHETYPES = [
  define('ink_dot', '虚无＋雷', [{ path: '虚无' }, { element: '雷' }]),
  define('follow_up', '公司＋巡猎', [{ faction: '星际和平公司' }, { path: '巡猎' }]),
  define('frost', '冰＋存护', [{ element: '冰' }, { path: '存护' }]),
  define('mentorship', '仙舟＋巡猎', [{ faction: '仙舟罗浮' }, { faction: '仙舟曜青' }, { faction: '仙舟朱明' }, { path: '巡猎' }]),
  define('puppet', '空间站＋智识', [{ faction: '黑塔空间站' }, { path: '智识' }]),
  define('recollection', '翁法罗斯＋记忆', [{ faction: '翁法罗斯' }, { path: '记忆' }]),
  define('elation', '欢愉＋量子', [{ path: '欢愉' }, { element: '量子' }]),
  define('break', '火＋毁灭', [{ element: '火' }, { path: '毁灭' }]),
];
export function getArchetypes(state) {
  const identities = new Set((state?.roster || []).filter(u => !u.temporary && !u.commission).map(u => u.id));
  return ARCHETYPES.map(definition => {
    const members = definition.memberIds.filter(id => identities.has(id));
    const formed = members.length >= definition.threshold;
    return { ...definition, count: members.length, coreCount: 0, members, cores: [], formed, active: formed, progress: Math.min(1, members.length / definition.threshold), effects: [] };
  });
}
// Retained for historical diagnostic readers; there are no route effects left.
export const withoutArchetypeEffects = callback => callback();
export const archetypesForCharacter = id => ARCHETYPES.filter(a => a.memberIds.includes(String(id)));
export const isArchetypeCore = () => false;
````````````````
<!-- frozen-source:end -->
