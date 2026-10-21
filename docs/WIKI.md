# v0.7.0 机制 Wiki 的来源与维护

线上入口：[GitHub Wiki](https://github.com/jjhe2020/starrail-landlord/wiki)。私有仓库及其 Wiki 的访问范围保持不变。

本次规格冻结在 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`（v0.7.0 发行代码），不改游戏规则、版本号、既有标签、Release 或离线 HTML。`docs/wiki/` 是完整、可审核的 Wiki 镜像，GitHub Wiki 使用独立 `.wiki.git` 仓库。

## 覆盖范围

- 315 个正文与附录页面，另有共享侧栏、页脚。
- 90 角色、64 奇物、32 精华、21 羁绊、32 条款、10 剧情委派各有独立条目。
- 机制正文覆盖流程、经济、抽取权重、位置、结算顺序、逐次舍入、增幅/易伤/反击上限、成长与升星、敌阵生成、首领分期、AI、交互、存档与离线。
- 公开标签、目标候选、关联羁绊和机制关键词互链。独立来源审阅覆盖通用解释器、继续执行的历史奇物/精华专用分支、temporary 与 commission 的不同过滤口径。
- 39 个源码与配置附录从冻结提交逐字取得，含 `src/` 全部模块及构建所需非图片配置，附字节数与 SHA-256；所有源代码围栏可独立提取并验证。美术文件不包含在快照中。

## 生成与只读核验

```sh
node scripts/generate-wiki-catalog.mjs
node scripts/generate-wiki-world.mjs
node scripts/generate-wiki-sources.mjs
node scripts/generate-wiki-navigation.mjs
node scripts/check-wiki.mjs
```

四个生成器都支持 `--check`，此模式仅读取对比。总校验自动运行四者的 `--check`，同时检查六类条目数量及 ID 覆盖、内部目标与锚点、从首页可达性、固定提交的源码行号、冻结源码逐字哈希与字节长度。摘要保存在 `docs/wiki-verification.json`。

手写机制正文也需要对照真实 dispatch 与对应行为测试复审；生成检查不能证明全部文字正确。尤其不能把展示用 duration/stacking 元数据当作独立效果执行器，不能将校准结果、旧版兼容分支或 ROADMAP 提案改写为现版规则。

后续游戏版本更新时，先决定新的冻结基线，审阅所有变化，统一更新生成器常量、正文、快照、数字索引与来源；不要只对新的 `content.js` 自动生成后仍声称是 v0.7.0。对纯 Wiki 修正无需生成新游戏版本或移动发行标签。

## 发布

GitHub 连接器当前无 Wiki 专用编辑能力，使用 GitHub 原生 Wiki Git 仓库发布。第一次需在 GitHub Wiki 网页创建 Home 才能克隆；后续使用现有仓库，不重复初始化。示例工作目录位于忽略的 `.local/github-wiki`。

```sh
git clone https://github.com/jjhe2020/starrail-landlord.wiki.git .local/github-wiki
```

先核对远端，保护既有页面，再将 `docs/wiki/` 同步至 Wiki 工作目录，检查变更、提交并普通推送默认分支；不强推，不删除不属于本次生成范围的页面。若远端已有用户修改，先合并并审阅。推送后核对 `HEAD` 与 `git ls-remote origin HEAD`，重新克隆到另一目录，与发布镜像逐文件比较，再在 GitHub 打开首页、机制页和代表条目检查实际排版/链接。

主仓库也提交镜像、生成器与验证结果，后续维护时可以审核 diff。不要将 `.local` 工作克隆、临时日志、浏览器截图或缓存加入交付提交。
