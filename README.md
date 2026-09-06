# Flames · 异火榜

基于《斗破苍穹》原著设定的非官方实时视觉演绎。

项目以 Three.js 与程序化 Shader 重构异火的形、色与气息。现已开放完整 23 席：22 种基础异火与终局帝炎，涵盖虚无、莲相、冠焰、流火、灵形、风焰、冷焰、心焰、地火九个家族。

每种异火都支持点按唤焰、长按蓄焰与拖动交互。均衡／精细档采用三维体积火焰和受光承台，支持整圈拖拽查看与可选自动环绕；关闭拖拽旋转后可拨动火流。松手或转为旋转时蓄焰平滑回落，轻量档保留家族专属的平面表现。

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
pnpm e2e
pnpm generate
pnpm budget:web
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

九个视觉 kernel 已覆盖并公开全部 23 席。各异火复用共享 GLSL 模块与有限数量的 kernel，按家族和变体定义独立的三维轮廓、配色与运动。来源继续区分原著、授权扩展和项目演绎；第 18、20、21 席不宣称为小说正文命名。

全席检查包含桌面／手机模拟、正侧面、三档画质、交互衰减及绘制预算；软件 WebGL 验证不等同于真实手机 GPU 性能保证。约束详见 [基础约定](./docs/design/flame-foundation.md)。

## 部署

EdgeOne 项目设置使用根目录 `apps/web`、框架预设 `Other`，由 `apps/web/edgeone.json` 指定构建命令 `pnpm --dir ../.. generate` 和相对输出目录 `.output/public`。安装命令为 `pnpm install --frozen-lockfile`，仍使用整个 pnpm workspace。已连接的项目会在推送 `main` 后自动部署，线上地址为 [flames.yunyoujun.cn](https://flames.yunyoujun.cn)。

部署根目录必须指向 Nuxt 应用：EdgeOne 按源码目录自动判断 SPA/SSG，仓库根目录可能被误判为 SPA，导致未知地址返回首页和 HTTP 200，即使产物中已有 `404.html`。

发布前运行 `pnpm generate`，然后用 `pnpm preview:web` 在 `http://127.0.0.1:3100` 检查正式产物。静态托管应优先匹配生成的页面，未知路径返回 `404.html` 和 HTTP 404，不应重写到首页。

CI 将桌面与移动端的浏览器验收分片运行在静态产物上。可用 `FLAMES_E2E_STATIC=1 pnpm e2e --workers=1` 本地复测；设置 `FLAMES_E2E_SOFTWARE=1` 可显式使用软件 WebGL。软件渲染结果用于功能与像素回归，不代表真机帧率验收。

## License

[MIT](./LICENSE) © YunYouJun。小说设定与名称不包含在代码许可证授权范围内，详见 [NOTICE](./NOTICE)。
