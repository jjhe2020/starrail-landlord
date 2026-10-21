# 冻结实现：package.json

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`package.json`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：655
- SHA-256：`3ccf53c26029e976fb5617bdc04a67f9dd594bf2647a6e62fa8b6c671cabdea0`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/package.json#L1)

<!-- frozen-source:start -->
````````````````json
{
  "name": "starrail-landlord",
  "version": "0.7.0",
  "private": true,
  "type": "module",
  "description": "A mobile-ready Star Rail themed slot deckbuilding roguelike",
  "scripts": {
    "dev": "node scripts/server.mjs",
    "test": "node --test tests/*.test.js",
    "build": "node scripts/build.mjs",
    "build:portable": "node scripts/build-portable.mjs",
    "check": "node scripts/check.mjs",
    "balance": "node scripts/balance-parallel.mjs",
    "train:ai": "node scripts/train-ai.mjs",
    "balance:growth": "node scripts/growth-balance.mjs"
  },
  "engines": {
    "node": ">=22"
  },
  "devDependencies": {
    "esbuild": "0.28.2"
  }
}
````````````````
<!-- frozen-source:end -->
