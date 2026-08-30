# 快速开始

## 环境要求

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`
- pnpm `11.21.0`
- 支持 WebGL 2 的现代浏览器

## 本地开发

```bash
pnpm install
pnpm dev
```

## 项目结构

```text
apps/web/                 Nuxt 4 异火榜展示端
packages/flame-engine/    框架无关的 Three.js 运行时
examples/basic/           原生 DOM 接入示例
playground/               Shader 参数试验场
docs/                     VitePress 文档与设计规范
```

## 质量检查

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm generate
pnpm docs:build
```

`pnpm generate` 的静态输出位于 `apps/web/.output/public`。
