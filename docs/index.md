---
layout: home

hero:
  name: "Flames"
  text: "Procedural flame runtime"
  tagline: Framework-agnostic Three.js kernels for real-time fictional flame experiences.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Chinese Guide
      link: /zh/

features:
  - icon: ◉
    title: Real-time
    details: Procedural WebGL rendering without pre-rendered loop assets.
  - icon: ◇
    title: Preset driven
    details: Shared shader kernels keep each flame expressive and maintainable.
  - icon: ↯
    title: Interactive
    details: Pointer, hold, and drag input are first-class runtime controls.
---

## Run locally

```bash
git clone https://github.com/YunYouJun/flames.git
cd flames
pnpm install
pnpm dev
```

Use Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` and pnpm `11.21.0`.
The source code is available under MIT; see the repository's NOTICE for third-party intellectual property boundaries.
The engine is currently a local workspace package and is not published to npm. Try `examples/basic` for a standalone integration.
