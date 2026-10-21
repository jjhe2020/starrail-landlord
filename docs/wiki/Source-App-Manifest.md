# 冻结实现：manifest.webmanifest

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`manifest.webmanifest`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：672
- SHA-256：`3772d86341e936c54ad59831ad60730abaf707b37fb57379157edd3cba6d75cc`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/manifest.webmanifest#L1)

<!-- frozen-source:start -->
````````````````json
{
  "id": "./",
  "name": "星穹转轮",
  "short_name": "星穹转轮",
  "description": "星穹铁道主题的转轮构筑同人游戏，可离线游玩。",
  "lang": "zh-CN",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#10131d",
  "background_color": "#10131d",
  "icons": [
    { "src": "./public/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "./public/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "./public/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
````````````````
<!-- frozen-source:end -->
