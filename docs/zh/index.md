---
layout: home

hero:
  name: "Flames"
  text: "异火实时视觉引擎"
  tagline: 以有限的 Shader kernel 与数据预设，构建可交互、可维护的异火视觉演绎。
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 查看设计规范
      link: /design/spec

features:
  - icon: ◉
    title: 实时生成
    details: 不依赖循环动画与逐异火截图，全部由 WebGL 在浏览器中生成。
  - icon: ◇
    title: 预设驱动
    details: 共享 GLSL 能力与有限 kernel，避免维护 23 套彼此割裂的 Shader。
  - icon: ↯
    title: 原生交互
    details: 移动、长按与拖拽直接进入火焰运行时，而非装饰性页面动效。
---

## 安装

```bash
pnpm add @yunyoujun/flame-engine three
```

完整异火目录完成前，包与仓库保持私有。
