# 美术来源与归属

核验日期：2026-10-12。运行时使用本地资源，不请求远程图片。

## 角色头像

`public/assets/characters/*.png` 的 24 张头像来自 [Mar-7th/StarRailRes](https://github.com/Mar-7th/StarRailRes)，是《崩坏：星穹铁道》的游戏素材，原作品及角色权利归 HoYoverse / 米哈游等相关权利人所有。这些头像不是本项目原创，也不代表官方授权或官方合作。

来源锁定为提交 [`dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487`](https://github.com/Mar-7th/StarRailRes/tree/dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487)。原文件路径为 `icon/character/{id}.png`；下载后保留原始文件字节，没有重绘或更改。中文名称经该提交的 `index_new/cn/characters.json` 核验。全部头像均成功解码为 256 × 256 PNG。

| ID | 角色 | ID | 角色 |
| --- | --- | --- | --- |
| 1001 | 三月七 | 1104 | 杰帕德 |
| 1002 | 丹恒 | 1105 | 娜塔莎 |
| 1003 | 姬子 | 1106 | 佩拉 |
| 1004 | 瓦尔特 | 1107 | 克拉拉 |
| 1005 | 卡芙卡 | 1108 | 桑博 |
| 1006 | 银狼 | 1109 | 虎克 |
| 1008 | 阿兰 | 1201 | 青雀 |
| 1009 | 艾丝妲 | 1202 | 停云 |
| 1013 | 黑塔 | 1203 | 罗刹 |
| 1101 | 布洛妮娅 | 1204 | 景元 |
| 1102 | 希儿 | 1205 | 刃 |
| 1103 | 希露瓦 | 1208 | 符玄 |

每个文件的完整原始 URL、字节数与 SHA-256 位于 [`source-manifest.json`](../public/assets/characters/source-manifest.json)。例如，[三月七头像原文件](https://raw.githubusercontent.com/Mar-7th/StarRailRes/dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487/icon/character/1001.png)。

上游仓库标注 AGPL-3.0，其完整许可文本保留在 [`StarRailRes-LICENSE.txt`](../public/assets/StarRailRes-LICENSE.txt)。上游仓库许可与游戏美术本身的权利应分别理解；头像不纳入本项目的原创素材归属声明。

## 本项目绘制的矢量资源

以下 SVG 为本项目从基本形状与路径绘制的原创抽象视觉，不是从《幸运房东》或《崩坏：星穹铁道》提取的怪物图：

| 文件 | 视觉用途 |
| --- | --- |
| `public/assets/enemies/automaton.svg` | 带青色核心的机械守卫 |
| `public/assets/enemies/voidranger.svg` | 紫色装甲虚空士兵 |
| `public/assets/enemies/frostspawn.svg` | 尖锐晶体组成的冰霜精灵 |
| `public/assets/enemies/mara.svg` | 绿色与金色的叶甲武士 |
| `public/assets/enemies/boss.svg` | 环绕分段光环的机械巨眼 |
| `public/assets/astral-backdrop.svg` | 星空与航线背景 |

敌人使用透明背景，以便血条、伤害数值与技能提示独立布局。上述原创图形不改变角色头像的第三方归属。

## 主屏幕图标

`public/icons/icon-192.png`、`icon-512.png`、`maskable-512.png` 与 `apple-touch-icon.png` 是本项目使用基础形状绘制的原创转轮、星芒与轨道图标。沿用深蓝、紫、青与浅金配色，未使用第三方角色画像。maskable 图案位于中心安全区域，适用于安卓桌面裁剪；iPad 使用 180 × 180 PNG。

## 规则参考

《幸运房东》的玩法参考来自 [TrampolineTales 的 Steam 官方商店页](https://store.steampowered.com/app/1404850/Luck_be_a_Landlord/) 与开发者 [Content Patch #9 — Essences 公告](https://steamcommunity.com/ogg/1404850/announcements/detail/5510701238793103300)。公告由 Steam 官方新闻 API 核验，作者为 TrampolineTales。

项目自行实现规则和界面，使用新文案；没有复制原游戏程序、音乐、图标、背景或原版完整效果目录。完整目录复刻不属于当前版本的完成声明。
