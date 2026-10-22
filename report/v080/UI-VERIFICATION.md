# 0.8.0 界面与离线成品验证

验证对象：`artifacts/星穹转轮-v0.8.0.html`，18,196,537字节。SHA-256：`4febf00786db4eef0d357c1ccae141a707aa7ca3cdd65ff28708c329a5b52d9d`。结果、证据哈希及源码哈希见 [manifest.json](ui-validation/manifest.json)。

- [离线成品](ui-validation/portable.log)：6/6通过。1265、390、320、820px首次离线打开；角色/奇物/精华图片内嵌；Blob Worker执行推荐；实际转动、招募、刷新恢复；禁用localStorage后仍能游玩并导出/导入存档。各上下文无HTTP请求。
- [界面](ui-validation/ui.log)：6/6通过，共169项检查、0条未捕获页面错误。1440、390、320px检查卡面三项固有属性、永久值、技能独立、规则明细、图鉴、奖励与无横向溢出。1440与390px实际执行阿格莱雅创建衣匠，点卡查看固有属性/自身删除规则，第1次出场后保留，第2次出场完成正常攻击后删除，从编队消失且不进入招募图鉴。
- [动效](ui-validation/motion.log)：12/12通过，包含11种场景。20个活动格三宽度结算2465–2489ms，完整奖励入场2737–2770ms，最多48个特效节点；每次结果与纯引擎完全一致。覆盖真实触控、敌方行动后反击、单次动效异常、减少动态效果、切后台清理与重复点击拦截。`eventId`保留追加攻击触发先后，不按来源格把追加攻击提到触发者前。
- [专项单测](ui-validation/unit.log)：16/16通过，覆盖属性/伤害分区、永久与本次攻击力百分比同区相加、星级审计、干扰列攻击力减益、环境反射与演出事件顺序。

## 8秒证明视频

- [移动窄屏实际触控](motion-final/motion-mobile-proof.mp4)（7.96秒；桌面浏览器触控视口）
- [桌面完整流程](motion-final/motion-desktop-proof.mp4)（8.64秒）
- [动效原始指标](motion-final/browser-metrics.json)。同时保留原始WebM录屏，MP4只作格式转换。

## 刷新恢复检查与边界

[四宽度入口记录](portable-final/reload-evidence.json)显示：保存后的游戏均通过`validateSave`；刷新初始化脚本读到的原始游戏哈希、应用恢复后的哈希、应用首次写回哈希均与刷新前一致。[另12次独立上下文测试](ui-validation/reload-stress.json)也都保留转动后进度。

此前对正在迭代的构建路径有两次刷新检查返回初始测试fixture；当时未记录启动时的存储原文，无法追溯原因，不能断言由重建竞争导致。最终验证使用发布HTML的不可变字节副本，同一路径反复刷新，上述记录中未再复现。测试副本与发布文件的SHA-256完全一致。

以上证据覆盖macOS Chrome 155桌面和窄屏触控视口，不代表Android、iPhone/iPad实机或Android `content://`文件交接已验证。功能通过不替代平衡性结论。

## 技能实施网页

[实施表](implementation.html)布局在1440与390px检查无页面横向溢出，90卡、13个防御职能筛选、18个重点重构筛选和搜索均正常；[页面检查记录](report-ui/browser-checks.json)保留当次网页哈希。该页面可能随后根据最终数值重生成，页面记录不替代最终平衡数据。
