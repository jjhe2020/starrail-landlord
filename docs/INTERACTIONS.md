# 就地机制说明

角色、羁绊、奇物、精华与界面资源使用同一个小浮层说明。说明靠近触发控件，限制在可见屏幕内；不添加遮罩、背景虚化或焦点锁定，也不要求先点「了解了」才能继续操作。

- 桌面：鼠标悬停 160 毫秒后显示。鼠标可移进说明继续阅读；移出后自动收起。点击角色等详情控件可固定说明。
- 手机：长按 450 毫秒后显示并保持。长按过程中移动超过 10 像素会取消，正常滚动不被阻止；已显示时继续滑动会收起。
- 点击说明外的任何位置会收起，同时照常执行该位置的交互；点击另一个详情控件直接切换。点击说明内部可以继续操作。滚动页面、调整窗口或按 Escape 也会收起。
- 键盘聚焦带有说明的控件时显示，说明由 `aria-describedby` 与该控件关联。固定详情使用非模态 `dialog`；纯悬停说明使用 `tooltip`。
- 长按只拦截本次手势在同一个控件上产生的点击，避免误选奖励。下次按下立即清除拦截，不影响点击别的控件。

## 实现约定

`src/inspect.js` 导出 `createInspector({ root, resolve, onOpen?, onClose? })`，返回 `open(anchor, content?, { pinned? })`、`close()`、`isOpen()` 与 `destroy()`。

`resolve(anchor)` 返回 `{ title, bodyHtml, kind? }`，未知说明返回 `null`。调用方负责转义所有进入 `bodyHtml` 的非固定文本。`open` 默认固定；内部悬停调用使用 `{ pinned: false }`。

控件使用 `data-inspect="说明键"`，可以用 `data-id`、`data-index` 等字段传递内容标识。详情控件额外设置 `data-inspect-click="true"`，点击时控制器自动打开；资源标签只需要悬停与长按。不要让同一次点击再走旧的大弹窗详情处理。

浮层挂载在 `document.body`，结构为 `.inspect-popover > .inspect-heading (.inspect-title, 可选 .inspect-close) + .inspect-body`。CSS 负责视觉样式与内容溢出；控制器负责屏幕内定位。可用 `[data-inspector][data-state="open"]` 检测已打开浮层。

重新渲染应用前调用 `close()`，避免说明仍指向被替换的控件。局部刷新移除当前控件时，控制器也会自动收起说明；其他区域的更新不会打断阅读。销毁页面控制器时调用 `destroy()`，清除计时器、DOM 观察与事件监听。

## 浏览器回归

`tests/inspect.test.js` 使用真实浏览器 DOM 验证悬停、浮层内部阅读、详情切换、外部点击透传、长按防误选、滑动取消、手机屏幕边界与键盘说明。它复用已安装的 Playwright 和浏览器，不添加项目依赖。设置 `INSPECT_BROWSER_TESTS=1` 后运行 `node --test tests/inspect.test.js`；Windows 使用系统 Edge，其他平台使用 Playwright 的 Chromium。常规 `npm test` 保持无需浏览器的引擎检查。
