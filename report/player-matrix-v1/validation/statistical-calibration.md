# 玩家矩阵统计资格验证

结果：正式保守方法资格通过。本次仅构造已知零均值的统计数据，没有运行游戏或调整数值。

原中心化bootstrap在偏斜、有界零均值数据上失准，已明确保留失败结果。正式p取其MC保守上界与Hoeffding有界世界均值p的较大者；退化样本也使用有界p和非零宽保守区间。

耗时 1.53 秒；稀疏校验每类 100,000 个独立合成数据集，每集1000世界。

| 已知零均值场景 | 单项α | 原bootstrap真实错误率 | 正式护栏真实错误率 |
| --- | ---: | ---: | ---: |
| paired-symmetric | 2.5000e-2 | 2.4706e-2 | 3.2526e-3 |
| paired-symmetric | 3.4722e-4 | 3.4770e-4 | 3.3510e-5 |
| paired-symmetric | 2.6042e-4 | 2.7228e-4 | 2.5344e-5 |
| paired-asymmetric | 2.5000e-2 | 2.7175e-2 | 2.8280e-5 |
| paired-asymmetric | 3.4722e-4 | 4.0265e-4 | 3.8864e-9 |
| paired-asymmetric | 2.6042e-4 | 3.1101e-4 | 2.6066e-9 |
| cleared-floors-skewed | 2.5000e-2 | 2.3154e-2 | 0.0000e+0 |
| cleared-floors-skewed | 3.4722e-4 | 1.1790e-3 | 0.0000e+0 |
| cleared-floors-skewed | 2.6042e-4 | 6.0723e-4 | 0.0000e+0 |
| interaction-symmetric | 2.5000e-2 | 2.4706e-2 | 3.2526e-3 |
| interaction-symmetric | 3.4722e-4 | 3.4770e-4 | 3.3510e-5 |
| interaction-symmetric | 2.6042e-4 | 2.7228e-4 | 2.5344e-5 |
| interaction-asymmetric | 2.5000e-2 | 2.2449e-2 | 7.6634e-9 |
| interaction-asymmetric | 3.4722e-4 | 4.4867e-4 | 1.3323e-15 |
| interaction-asymmetric | 2.6042e-4 | 3.2994e-4 | 4.4410e-16 |

完整精确枚举、稀疏数据MC区间、实现与精确重抽样分布复核、源码SHA均在JSON中。精确枚举结果不是抽样误差；稀疏MC只是实现复核，理论界是正式错误率保证的依据。

方法参考：[Hoeffding 1963 原论文](https://www.tandfonline.com/doi/abs/10.1080/01621459.1963.10500830)。正式护栏会降低检出力，不能把不显著解释为平衡，也不追加游戏样本补到显著。
