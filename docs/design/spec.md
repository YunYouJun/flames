# 视觉与交互规范

## 核心方向

异火榜不是百科卡片集，而是一座陈列异火的黑暗仪式空间。用户进入页面后先看到火焰，其次读取名次与名字，最后才展开设定资料。

## 设计系统

- 墨黑 `#030608`：主背景与吞光区域
- 蓝黑 `#08131A`：空间结构与石台暗部
- 骨白 `#E8E0D0`：主文字与高温焰心
- 陈铜 `#A88A55`：名次、刻度与交互边界
- 冷青 `#9FD8DA`：实时反馈与净莲妖火光晕
- 展示字体：宋体体系；界面字体：系统黑体体系

排名被设计为“石座”而非卡片：名次是铭刻，火名是席位。页面不使用玻璃拟态、圆角卡片阵列或官方插画。

## 架构约束

- 共享 GLSL 噪声、火焰梯度、指针输入和画质策略。
- 完整目录固定为 9 个视觉家族、22 个基础异火 preset；帝炎作为第 1 席终局视觉单独开启。
- 同时驻留的 Three.js program 硬上限为 16 个，单席活跃 program 不超过 4 个。
- 不为每种异火生产循环视频、动图或静态海报。
- WebGL 不可用时提供可读的 CSS/SSR 火焰状态。

完整席位、来源分层、视觉状态与视觉 brief 以 Web 应用的 flame manifest 为唯一元数据来源。Nuxt Content 只承载可选长文，Markdown frontmatter 仅保存 `flameId` 外键，不重复名称、名次或 slug。

## 已公开验证对象

1. 虚无吞炎：黑心、吞噬边缘、拖拽涡流。
2. 净莲妖火：乳白莲瓣、长按盛放、指针偏移。
3. 骨灵冷火：紊乱冷白焰身、炽白焰心、霜环扩散。
4. 红莲业火：业火轮、闭合火茧、错相旋转。
5. 海心焰：深蓝潮盆、液膜焰舌、同心涟漪。
6. 青莲地心火：低伏青莲、地脉裂隙、根焰游走。

其余基础席位与帝炎已有开发原型，但在逐席视觉评审通过前保持 `prototype` 与 `noindex`。

## 参考概念图

- [桌面端](https://assets.yunyoujun.cn/published/flames/concept-desktop-cede0c9e.webp)
- [移动端](https://assets.yunyoujun.cn/published/flames/concept-mobile-14039802.webp)

概念图仅作为构图与美术方向基准，生产页面的火焰必须由实时 Shader 生成。

## Shader 参考

- [Fires](https://www.shadertoy.com/view/XsXSWS)：参考二维火苗轮廓、焰心分层与多种火焰形态。
- [Procedural fire with sparks](https://www.shadertoy.com/view/MlKSWm)：当前主要参考；学习以网格、伪随机数、生命周期和单元内旋转生成程序化火星，以及用噪声位移塑造上升气流。
- [Combustible Voronoi Layers](https://www.shadertoy.com/view/4tlSzl)：参考 Voronoi 层叠的燃烧纹理与温度色板。
- [Flame](https://www.shadertoy.com/view/MdX3zr)：参考三维噪声扰动 SDF、ray marching 与步进累积辉光。
- [Bring the Heat](https://www.shadertoy.com/view/4sfBWj)：参考火焰生成、模糊和最终合成的多 Pass 管线。

这些作品用于研究表现方法并指导独立实现。引入具体源码前，必须检查原作者在作品中声明的许可证与署名要求。
