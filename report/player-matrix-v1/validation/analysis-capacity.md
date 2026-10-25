# 玩家矩阵合成容量检查

通过此合成容量负载。 **仅基础设施容量，不运行游戏，不产生胜率或平衡证据。**

- 负载：15,740格 ×16世界 ×2行为复本，503,680条轨迹，每条到达全部12关。
- Node heap上限：8 GiB；子进程RSS保护：6 GiB；macOS系统free保护：12%。
- 峰值观察RSS：3.051 GiB；采样heapUsed峰值：5.022 GiB。
- 总耗时：39.68秒；退出：{"code":0,"signal":null}。
- 终止原因：无；源文件身份一致：true。

This exact worst-arrival synthetic aggregator and writer workload completed under an 8 GiB Node heap. It does not qualify game worker heaps, other applications, formal inference cost, or arbitrary data growth.

完整阶段测量、运行环境、产物字节数及SHA身份见同名JSON。
