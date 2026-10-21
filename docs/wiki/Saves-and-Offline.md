# 存档、迁移与离线运行

> v0.7.0 · [流程](Run-Flow) · [交互](Interface) · [确定性复原](Reproduction)。

## 自动存档

当前旅程、音效/动画设置及本机统计保存在 `localStorage['astral-reels:v1']`；这里的键名 v1 不代表引擎存档版本，当前战斗状态 `game.version=2`。有效动作通过 `adopt` 后持久化；音效/动画切换、新局、导入也会保存。AI 参数另存 `astral-reels:ai-profile:v1`。

统计包括新局次数 `runs`、普通十二关胜利次数 `wins`、曾抵达最高层 `bestFloor`。代打和手动使用相同存档。自动测试开独立对局，不增加当前旅程的这些资源或战斗状态。

浏览器拒绝存储时，当前页面继续保留内存状态并提示；关闭页面会丢失未成功保存的内容。相同文件在不同目录、不同版本文件、不同浏览器、不同设备以及网站标签页/主屏幕容器之间，可能各有独立存储。

## 导出与导入

默认单 HTML 发行版设置中提供导出/导入。导出文件为 `星穹转轮-存档.json`，外层格式：

```json
{"format":"astral-reels-save","version":1,"payload":{"game":{},"settings":{"sound":false,"animations":true},"stats":{"runs":1,"wins":0,"bestFloor":1},"aiProfile":{}}}
```

示例只展示结构；空 game 和 aiProfile 不是有效存档。导出同样先验证数据；导入最多 2 MiB（UTF-8 字节），要求外层格式/版本正确、统计为非负安全整数（bestFloor ≥1），战斗状态完整。若提供 AI 参数，必须通过参数校验；省略 aiProfile 时采用默认参数。sound 仅严格 `true` 开启，animations 除严格 `false` 外默认开启。

状态校验覆盖阶段、层数、敌阵、角色 uid 唯一性、星级、编队上限、成长、奖励队列、资源、条款与污染目标、委派来源/统计、精华进度及快照字段。技能定义从当前内容库读取，不能通过存档自带技能对象注入。反序列化用 JSON 往返清除原型属性。完整校验式见[引擎附录](Source-Engine)的 `validateSave`。

导入在转动忙碌或实验运行中拒绝；成功后停止代打、终止旧推理 Worker、替换旅程/设置/统计/AI 参数，重建策略随机流并尝试持久化。**更新 HTML 或移动文件前先导出存档。**

## 旧版兼容

旧 v1 战斗存档迁移为 D10，保留当前敌阵和引擎随机状态，缺少的当前字段补默认值；之后新关按当前规则生成。有效 v2 保留原难度。缺失的委派统计补零；累计精华旧数据缺基线时，以当前累计值为新基线，避免重复追溯；条款文案刷新为当前内容。

旧 `classic` 交租模式明确拒绝导入为战斗旅程。角色旧历史快照不会让旧技能继续执行：后续战斗使用 v0.7.0 当前卡牌定义。因此跨版本不保证相同种子重演。

引擎 RNG 状态随 game 保存；**AI 的选择随机流闭包没有随存档导出**，刷新或导入时从 `seed:policy` 重新建立。因此“中途刷新后开启 AI”不能保证等同于不中断代打的后续选择序列，见[复现要求](Reproduction)。

## 默认离线 HTML

v0.7.0 的默认可玩发行物是单个 HTML，图片、CSS、游戏模块和 AI Worker 均内嵌。`IS_PORTABLE` 由构建标记或配置格式 `astral-reels-single-file-v1` 判断；资源以 data URL 取得，AI 使用内嵌源码创建 classic Blob Worker，避免本地文件来源的模块导入问题。

单文件版无需联网、登录或后端；不注册网页 Service Worker，离线状态直接为 `portable/ready`。本地浏览器实际是否允许执行 HTML、Worker、文件下载和存储仍取决于打开方式；聊天软件预览、QuickLook 和桌面窄屏不是移动实机验证。

## 自托管网页与主屏幕

网页版本使用相对路径，安全上下文且浏览器支持 Service Worker 才进入预缓存。后台安装/状态变化不重画战局；新版本下载完整后显示更新，由玩家主动点击“保存进度并更新”。若保存失败，更新函数拒绝刷新，避免丢失仅在内存的进度。

缓存包含游戏代码、AI 和素材；下载失败不替换原有完整离线版。更新先检查 registration.waiting，向等待 worker 发送 `SKIP_WAITING`，控制器切换后才刷新；若其他标签已更新则直接刷新。损坏缓存可以请求 `REPAIR_OFFLINE_CACHE` 修复。具体清单与缓存原子性见 [Service Worker](Source-Service-Worker) 与[离线控制](Source-Offline)。

主屏幕安装提示是浏览器提供的能力，局域网普通 HTTP 不能替代受信任的 HTTPS 离线安装。清除网站数据会同时删除存档和缓存。历史 ChatGPT Site 保留，本版正式入口为私有仓库的 [v0.7.0 Release](https://github.com/jjhe2020/starrail-landlord/releases/tag/v0.7.0)。

## 依据

[导入导出](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/save-transfer.js#L1)、[自动保存](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/app.js#L464)、[离线运行入口](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/runtime.js#L1)、[完整旧版迁移分支](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L1029)。
