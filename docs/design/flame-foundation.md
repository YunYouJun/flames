# 全异火还原基础约定

这份约定锁定完整异火榜的身份、路由、视觉家族与验收边界。九个家族均已有独立实时原型；每一席仍需逐个通过视觉评审，未通过的席位不公开。

## 席位与来源

- 榜单保留 23 个稳定路由；第 2–23 位是基础还原范围，第 1 位帝炎是全部基础异火完成后的终局项目。
- 视觉状态分为 `reserved`、`assigned`、`prototype`、`approved`。生产环境只有 `approved` 加载实时引擎；其余状态显示 SSR/CSS 封印态并设置 `noindex`。
- 原著明确、授权扩展、项目演绎分别标注。第 18、20、21 位采用风怒龙炎、幽冥毒火、阴阳双炎作为扩展身份；风雷怒焱、龙凤焱、六道轮回炎只作为其他衍生版本展示。
- `apps/web/app/data/flames.ts` 是名称、名次、slug、来源、状态和视觉 brief 的唯一元数据来源。Markdown 仅可按 `flameId` 补充长文。

## 九个视觉家族

| 家族 | 席位 | 当前状态 |
|---|---|---|
| `void` | 2 | 已批准 |
| `lotus` | 3、8、19 | 已批准 |
| `crown` | 4、6、7 | 开发原型；帝炎复用终局变体 |
| `fluid` | 5、15、16、20 | 海心焰已批准，其余为开发原型 |
| `spirit` | 9、12、13、22 | 开发原型 |
| `gale` | 10、18 | 开发原型 |
| `cold` | 11 | 已批准 |
| `soul` | 14、21 | 开发原型 |
| `geofire` | 17、23 | 开发原型 |

原型已按 `lotus → fluid → gale → spirit → soul → crown → geofire` 完成。后续仍按家族逐席评审，只有 `approved` 才进入公开目录。

## 导航与公开状态

- 页面底部短榜显示当前席位附近的五席，移动端只露出中间三席。
- 完整榜单始终列出 23 席，并同时显示“基础已现世 x / 22”和“帝炎未启”。
- 已批准席位可索引；封印席可直接访问但不可索引；未知 slug 必须返回项目样式的 404。
- 观测进度只统计已批准的基础异火，不把访问封印页当作完成。

## 性能门槛

- resident programs `≤ 16`；单席 active programs `≤ 4`。
- draw calls：High `≤ 32`、Balanced `≤ 24`、Lite `≤ 8`。
- 单详情页初始 JavaScript 目标 gzip `≤ 250 KiB`，硬上限 `≤ 300 KiB`。
- 单个客户端 chunk 原始体积硬上限 `≤ 600 KiB`，目标回到 `< 500 KiB`。
- CSS gzip `≤ 15 KiB`，完整静态产物 `≤ 3 MiB`。
- 每个家族代表作必须没有 shader compile error、page error 或 console error。

在已批准路由后附加 `?benchmark=1&quality=balanced` 可固定动画时间、指针与画质。Canvas 会通过只读 `data-*` 暴露 renderer diagnostics，供 E2E 对 resident program 与 draw call 预算做机械验证。软件渲染 FPS 只作为预警，不作为真实设备性能结论。
