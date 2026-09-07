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

## 本地运行

```bash
git clone https://github.com/YunYouJun/flames.git
cd flames
pnpm install
pnpm dev
```

需要 Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` 与 pnpm `11.21.0`。
原创代码采用 MIT 许可证，第三方知识产权边界详见仓库中的 NOTICE。
引擎目前作为本地 workspace 包使用，尚未发布到 npm；独立接入方式可参考 `examples/basic`。
