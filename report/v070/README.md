# 0.7.0 测试报告界面

报告由已核验 compact JSON 驱动，不重新计算推断统计。没有输入时只显示明确的待测状态和当前 90 卡设计；`validation.ready=false` 的输入会直接拒绝，不覆盖已有成品。有效的校准数据仍明确标为校准，不冒充正式留出。

使用 Data build-report 的公共报告壳、可编辑叙述、表格、图表、来源检视和离线导出。运行时由本机安装的 Data 插件提供，生成在被忽略的 `.local/v070-report-app/`；该目录中已有的报告 ID 在更新时保留。版本库只保存本目录的 authored 内容和 `scripts/render-v070-report.mjs`，不复制整套供应商运行时。

```sh
node scripts/render-v070-report.mjs \
  --input docs/V070-TEST-RESULTS.json \
  --terminal docs/V070-TERMINAL-CARDS.json \
  --natural docs/V070-NATURAL-GROWTH.json \
  --status complete
```

终止遭遇附加数据默认从 `docs/V070-TERMINAL-CARDS.json` 读取，也可用 `--terminal` 指定；尚无文件时显示待测。它必须通过自身核验，且与主 compact 的生产源指纹逐项一致；原始对局文件 SHA-256 与难度也须一一对应，来源不得重复或缺失。因此不能混用旧冻结批次，也不能在相同规则下将旧样本量终止数据挂到新主报告。终止遭遇面板按难度、胜败、每实例登场或每持有实例回合筛选，保留有效种子与曝光分母；可选 `final12Outcomes` 在折叠区另外展示未到达/未持有计零的全体对局口径。

技能详情前的“终局总表”按同一终止数据列出全部 90 卡的伤害、治疗、盾与记录成长均值和 95% 区间，不按选中角色过滤；共用难度、胜败和曝光口径，保留有效种子数及登场/持有曝光，点行联动单卡细节。界面只格式化已有区间，不重新计算统计；数值列按原始均值排序。

自然对局 `zeroTriggerAppearances` 只表示没有非零效果日志声明，不能称为实际收益触发率；易伤等声明可能无受益者，实际非零配对收益另由受控卡牌测量的 `nonzeroMarginal` 提供。

自然输出受星级、奇物、队友和实际到达楼层影响，胜败切片不是卡牌或成长的因果效果；自然与终止面板的成长水平是每实例回合 `endGrowth` 记录快照，当轮离队实例沿用 `unit.growth` 最后快照，并非结算后最终编队中所有永久牌的成长库存。

可选自然成长尾部分布审计默认读取 `docs/V070-NATURAL-GROWTH.json`，也可用 `--natural` 指定。要求 `v070-natural-growth-audit-v1`、核验通过、版本与全部冻结指纹一致，并将每个自然原始文件的 SHA-256/难度与主 compact 对局来源对应，防止同规则下混用旧样本量。审计 JSON 路径、SHA、方法与分析源码指纹附入 `report_meta` 来源链，`v070.natural.difficulties` 保留分难度小摘要。每局最大成长取 `finalRoster`，描述分位不生成 CI；晚期职能份额和终止星级份额只计实际登场，不在界面重算统计。

输出：`artifacts/星穹转轮-v0.7.0-测试报告.html`。首次生成会调用标准 preparer；随后均在同一报告中更新数据。先构建分离数据版本，再由标准 `export-offline` 导出单 HTML，不需要网络或 Sites 发布。Data 插件不在默认位置时，传 `--data-plugin-root /absolute/plugin-directory` 或设置 `DATA_ANALYTICS_PLUGIN_ROOT`。

`--narrative /path/to/reviewed-narrative.json` 可补入根代理根据实测写的结论，字段为 `title`、`summaryMarkdown`、`designMarkdown`；不得把没有数据支持的判断写入这个文件。缺省结论只说明已提供的分量比较与证据缺项，不宣布整体平衡通过。可用 `--input` 显式指定校准 compact，不会合并不同源码批次。

公共叙述组件不解析 GFM 表格，显示层会把两列结论表展开为问题小标题和原结论正文；原始 narrative JSON、来源 SHA 及统计文字不变。

作者状态：开始制作可用 `--status creating`，继续修改用 `updating`。数据或解释尚未完成且暂时交接用 `paused`；完整内容和数据准备好后用 `complete` 重建。它独立于 `validation.ready` 和统计判定。

验证：

```sh
node report/v070/verify-report.mjs \
  --file artifacts/星穹转轮-v0.7.0-测试报告.html

node --test tests/v070-report-natural.test.js
```

检查 1440 / 390 / 320 宽度、目录搜索、职责过滤与恢复全部、选卡、精确规则、来源菜单、可用测量切片，以及导出文件首次离线加载无 HTTP 请求。终止遭遇数据到位后，总表逐页确认 90 行覆盖、点行联动，并按难度、胜败和两种口径核对伤害与成长源值；单卡面板逐项核对四项源值、六项曝光分母和第 12 层补充口径。没有相应数据时只核对待测状态，不宣称图表、对局或终局统计验证通过。浏览器可通过 `BROWSER_EXECUTABLE_PATH` 指定，Playwright 包可通过 `PLAYWRIGHT_MODULE` 指定。此处是桌面 Chromium 环境，不是移动设备实机验收。

本地预览需通过 loopback HTTP 提供 `.local/v070-report-app/dist/` 整个目录，不能只传 `index.html`（分离构建需要同目录的快照 sidecar）。交付用上面的已导出完整单 HTML。
