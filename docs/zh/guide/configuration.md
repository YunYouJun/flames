# 预设配置

每种异火通过 `FlamePreset` 选择 `void`、`lotus` 或 `cold` kernel，并调整下列参数：

| 字段 | 用途 |
| --- | --- |
| `speed` | 动画时钟倍率 |
| `scale` | 火焰在画布内的占用尺度 |
| `turbulence` | 噪声域形变强度 |
| `intensity` | 发光色彩强度 |

开发预设时使用 `validateFlamePreset`，整理目录时使用 `validateFlameCatalog` 拒绝重复 id 与名次。

运行时画质分为 `high`、`balanced` 与 `lite`，设备像素比上限分别为 2、1.5 与 1。移动端默认使用均衡档，且所有环境都支持暂停与 `prefers-reduced-motion`。

## 内容边界

设定摘要必须依据原著重新概括，视觉演绎与事实描述分开。百度百科只用于名称和基础信息交叉核对，不直接复制正文；项目不使用官方动画、游戏或插画素材。
