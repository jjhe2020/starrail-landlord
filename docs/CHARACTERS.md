# 角色范围与来源核对

核对日期：2026-10-16（Asia/Shanghai）。本轮由64位扩至90位同行者，保留原有64个内容ID和存档身份。

## 用户指定页面的当前名单

用户指定的[英文 Character/List](https://honkai-star-rail.fandom.com/wiki/Character/List)网页直读受402/403及robots限制；改用同站公开MediaWiki parse API，成功取得当前完整渲染表格，修正了搜索引擎三个月前缓存遗漏的真珠、知更鸟·晴歌、砂金·戏浪及星神★阿哈，并更新此前三位已公布角色的发行状态。

- 请求：[https://honkai-star-rail.fandom.com/api.php?action=parse&page=Character%2FList&prop=text%7Crevid&format=json](https://honkai-star-rail.fandom.com/api.php?action=parse&page=Character%2FList&prop=text%7Crevid&format=json)。
- 页面revision：`472778`；抓取时间：`2026-10-16T03:19:08.647Z`（UTC）。
- 可玩表93条，排除全部5种Trailblazer形态后为88条；三月七的存护与巡猎形态分别计数。
- 已公布表1条：星神★阿哈，公开身份为5星、欢愉、量子；只用公开身份，本作技能均为规则改编。
- 另保留用户点名的神祇‘阿哈’本体作为独立改编同行者：无官方可玩星级、无（改编）属性，不用已公布的人形可玩形态覆盖其神祇身份。总计88+1+1=90。

当前两张名单表的精简逐项证据、版本列、来源URL与可复核SHA-256存于[角色来源JSON](./character-roster-source.json)。`sourceRows`保持渲染表行序，使用UTF-8 `JSON.stringify(sourceRows)`计算SHA-256：`8c1fb85ed1799fbfc042cd61aa2f6aff9378e90cd706e6554b9b34ff90ebb84f`。没有把原站整页HTML或角色故事复制到仓库。页面revision固定的是名单页源码版本，模板所展开的名单值另以本次抓取时间及全名单哈希固定。

## 公开身份与本作规则

`officialRarity`记录公开角色4/5星，阿哈本体为null；本作`rarity`仍是普通/稀有/史诗/传说四档抽取稀有度，两者没有一一对应关系。`publicationStatus`记录本次当前表中的已发行/已公布状态；`sourceUrl`记录对应身份来源；`portraitKind`区分游戏美术与项目文字标识。

命途/属性取对应可玩形态的战斗资料，不把剧情信仰替换为战斗命途。例如爻光战斗命途为欢愉、属性为物理；千冶·刃为虚无/火；真珠为欢愉/冰；知更鸟·晴歌为记忆/风；砂金·戏浪为欢愉/量子。三月七、丹恒、姬子、知更鸟、砂金及阿哈的形态使用独立本作ID；此前以announced_开头加入的三位ID保持稳定，但状态已经更新为released，ID前缀不代表当前发行状态。

阵营是本作羁绊的简化编队分组，可能合并公开资料中的地域/组织；阿哈本体的‘星神’与联动角色的‘异世界’是游戏分组。长夜月使用翁法罗斯、大丽花使用焚化工，避免将对应角色的身份关系或原组织误写成现属阵营。

全部description/effects/套路属于本作改编，不复制官方技能数值或声称复刻未公开技能。新增26个定义均使用可执行DSL；行为探针对每条新效果执行启用/禁用的真实转动对照。需要本轮退场数的加成在退场之后的passive阶段计算，覆盖自然到期；不提前捕获登场时退场数。

## 本轮新增26位

| 本作稳定ID | 中文名 | 公开星级 | 战斗命途 / 属性 | 编队分组 | 来源状态 |
| --- | --- | --- | --- | --- | --- |
| march_hunt | [三月七·巡猎](https://honkai-star-rail.fandom.com/wiki/March_7th) | 4 | 巡猎 / 虚数 | 星穹列车 | 已发行 |
| dan_heng_imbibitor_lunae | [丹恒·饮月](https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Imbibitor_Lunae) | 5 | 毁灭 / 虚数 | 星穹列车 | 已发行 |
| dan_heng_pt | [丹恒·腾荒](https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Permansor_Terrae) | 5 | 存护 / 物理 | 星穹列车 | 已发行 |
| fugue | [忘归人](https://honkai-star-rail.fandom.com/wiki/Fugue) | 5 | 虚无 / 火 | 仙舟罗浮 | 已发行 |
| the_herta | [大黑塔](https://honkai-star-rail.fandom.com/wiki/The_Herta) | 5 | 智识 / 冰 | 黑塔空间站 | 已发行 |
| hysilens | [海瑟音](https://honkai-star-rail.fandom.com/wiki/Hysilens) | 5 | 虚无 / 物理 | 翁法罗斯 | 已发行 |
| cerydra | [刻律德菈](https://honkai-star-rail.fandom.com/wiki/Cerydra) | 5 | 同谐 / 风 | 翁法罗斯 | 已发行 |
| evernight | [长夜月](https://honkai-star-rail.fandom.com/wiki/Evernight) | 5 | 记忆 / 冰 | 翁法罗斯 | 已发行 |
| cyrene | [昔涟](https://honkai-star-rail.fandom.com/wiki/Cyrene) | 5 | 记忆 / 冰 | 翁法罗斯 | 已发行 |
| saber | [Saber](https://honkai-star-rail.fandom.com/wiki/Saber) | 5 | 毁灭 / 风 | 异世界 | 已发行 |
| archer | [Archer](https://honkai-star-rail.fandom.com/wiki/Archer) | 5 | 巡猎 / 量子 | 异世界 | 已发行 |
| yao_guang | [爻光](https://honkai-star-rail.fandom.com/wiki/Yao_Guang) | 5 | 欢愉 / 物理 | 仙舟玉阙 | 已发行 |
| sparxie | [火花](https://honkai-star-rail.fandom.com/wiki/Sparxie) | 5 | 欢愉 / 火 | 假面愚者 | 已发行 |
| ashveil | [不死途](https://honkai-star-rail.fandom.com/wiki/Ashveil) | 5 | 巡猎 / 雷 | 巡海游侠 | 已发行 |
| silver_wolf_lv999 | [银狼LV.999](https://honkai-star-rail.fandom.com/wiki/Silver_Wolf_LV.999) | 5 | 欢愉 / 虚数 | 星核猎手 | 已发行 |
| evanescia | [绯英](https://honkai-star-rail.fandom.com/wiki/Evanescia) | 5 | 欢愉 / 物理 | 二相乐园 | 已发行 |
| mortenax_blade | [千冶·刃](https://honkai-star-rail.fandom.com/wiki/Mortenax_Blade) | 5 | 虚无 / 火 | 星核猎手 | 已发行 |
| the_dahlia | [大丽花](https://honkai-star-rail.fandom.com/wiki/The_Dahlia) | 5 | 虚无 / 火 | 焚化工 | 已发行 |
| announced_himeko_nova | [姬子·启行](https://honkai-star-rail.fandom.com/wiki/Himeko_%E2%80%A2_Nova) | 5 | 智识 / 火 | 星穹列车 | 已发行 |
| announced_gilgamesh | [吉尔伽美什](https://honkai-star-rail.fandom.com/wiki/Gilgamesh) | 5 | 毁灭 / 雷 | 异世界 | 已发行 |
| announced_rin_tohsaka | [远坂凛](https://honkai-star-rail.fandom.com/wiki/Rin_Tohsaka) | 5 | 智识 / 量子 | 异世界 | 已发行 |
| aha | [阿哈](https://honkai-star-rail.fandom.com/wiki/Aha) | 不适用 | 欢愉 / 无（改编） | 星神 | 本作星神改编 |
| pearl | [真珠](https://honkai-star-rail.fandom.com/wiki/Pearl) | 5 | 欢愉 / 冰 | 星际和平公司 | 已发行 |
| robin_summeretto | [知更鸟·晴歌](https://honkai-star-rail.fandom.com/wiki/Robin_%E2%80%A2_Summeretto) | 5 | 记忆 / 风 | 匹诺康尼 | 已发行 |
| aventurine_waveflair | [砂金·戏浪](https://honkai-star-rail.fandom.com/wiki/Aventurine_%E2%80%A2_Waveflair) | 5 | 欢愉 / 量子 | 星际和平公司 | 已发行 |
| aeon_star_aha | [星神★阿哈](https://honkai-star-rail.fandom.com/wiki/Aeon_%E2%98%85_Aha) | 5 | 欢愉 / 量子 | 假面愚者 | 已公布 |

## 单角色与一级来源交叉核对

- [HoYoverse官方角色目录](https://hsr.hoyoverse.com/en-us/character?charIndex=12&worldIndex=11)、[HoYoverse 3.7官方新闻](https://www.hoyoverse.com/en-us/news/160640)、[HoYoLAB 4.3角色跃迁公告](https://www.hoyolab.com/article/45275874)：核对公开角色与战斗身份。
- [真珠角色公布](https://twitter.com/honkaistarrail/status/2087026221645267031)、[知更鸟·晴歌角色公布](https://twitter.com/honkaistarrail/status/2071805931151561125)、[砂金·戏浪角色公布](https://twitter.com/honkaistarrail/status/2071821028209131931)、[星神★阿哈角色公布](https://twitter.com/honkaistarrail/status/2099709793959027163)：上述链接逐项由对应当前单角色API的公开参考文献取回，非上游技术索引推测。
- 单角色公开API `action=parse&prop=wikitext%7Crevid&format=json&page=角色英文标题`交叉读取真珠、知更鸟·晴歌、砂金·戏浪、星神★阿哈及大丽花的Infobox和Other Languages字段，核对姓名、命途、属性、阵营和公开状态。没有采用泄漏版技能。
- [阿哈本体](https://honkai-star-rail.fandom.com/wiki/Aha)与[星神★阿哈公开可玩形态](https://honkai-star-rail.fandom.com/wiki/Aeon_%E2%98%85_Aha)保持身份区别。

## 素材与离线

88张人物头像均为既有固定提交StarRailRes的原始PNG（新增24张）。阿哈本体使用本项目金色AHA文字标识；星神★阿哈使用独立蓝色AHA★文字标识。后者的Wiki原头像可通过imageinfo查询为160×160，但原始CDN下载返回403，因此没有伪造下载或借用别人的头像。清单保留查询URL、文件页ID、上传时间、原站SHA-1和不可下载原因；当前实际字节的来源仍明确标为project文字标识，不冒充官方人物美术。

最终90张本地PNG全部256×256，来源、字节数、尺寸与SHA-256见[头像清单](../public/assets/characters/source-manifest.json)。素材归属见[美术来源](./ASSETS.md)。

## 验证

`tests/roster-completeness.test.js`校验93-5+1+1范围、当前API名单哈希、90项字段和公开身份逐行覆盖；检查每个非Trailblazer身份恰好映射到一个本作同行者。`tests/content-contract.test.js`继续验证旧ID、每条新增效果的实际结算，以及90张本地头像的尺寸、字节数、哈希和来源。
