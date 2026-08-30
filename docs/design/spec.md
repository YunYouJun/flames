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
- 完整目录预计使用 8–10 个 kernel、23 个 preset 与少量 special pass。
- 同时驻留的 Three.js program 目标为 12–16 个以内。
- 不为每种异火生产循环视频、动图或静态海报。
- WebGL 不可用时提供可读的 CSS/SSR 火焰状态。

## MVP 验证对象

1. 虚无吞炎：黑心、吞噬边缘、拖拽涡流。
2. 净莲妖火：乳白莲瓣、长按盛放、指针偏移。
3. 骨灵冷火：冷白焰身、冰晶裂芒、霜环扩散。

## 参考概念图

- [桌面端](https://yunyoujun-assets-prod-1325586649.cos.ap-shanghai.myqcloud.com/published/flames/concept-desktop-cede0c9e.webp)
- [移动端](https://yunyoujun-assets-prod-1325586649.cos.ap-shanghai.myqcloud.com/published/flames/concept-mobile-14039802.webp)

概念图仅作为构图与美术方向基准，生产页面的火焰必须由实时 Shader 生成。
