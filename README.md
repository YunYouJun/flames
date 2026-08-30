# Flames · 异火榜

基于《斗破苍穹》原著设定的非官方实时视觉演绎。

项目以 Three.js 与程序化 Shader 重构异火的形、色与气息。当前 MVP 收录：

- 第二位：虚无吞炎
- 第三位：净莲妖火
- 第十一位：骨灵冷火

每种异火都支持指针移动、长按与拖拽三类实时交互，并拥有不同的反馈方式。

> 本项目为非官方、非商业的视觉实验，不隶属于原著作者、出版方、动画或游戏版权方。设定摘要均为重新概括，原作内容与相关商标归各自权利人所有。

## 开发

需要 Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` 与 pnpm `11.21.0`。

```bash
pnpm install
pnpm dev
```

常用命令：

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm generate
```

## 仓库结构

```text
apps/web/                 Nuxt 4 展示站
packages/flame-engine/    框架无关的 Three.js 火焰运行时
examples/basic/           原生 DOM 接入示例
playground/               Shader 参数试验场
docs/                     VitePress 文档与设计规范
```

## 路线

MVP 先验证三类视觉 kernel 与交互语言。最终目标是完成异火榜 22 种基础异火，以及作为终局状态呈现的帝炎。各异火将复用共享 GLSL 模块与有限数量的 kernel，而不是维护 23 套彼此割裂的着色器。

## 部署

仓库内的 `edgeone.json` 已将 EdgeOne Pages 构建命令设为 `pnpm generate`，静态输出目录为 `apps/web/.output/public`。当前阶段仅准备部署配置，不会自动创建远程项目或发布站点。

## License

[MIT](./LICENSE) © YunYouJun。小说设定与名称不包含在代码许可证授权范围内，详见 [NOTICE](./NOTICE)。
