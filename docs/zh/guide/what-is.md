# 什么是 Flames？

Flames 是一个框架无关的 Three.js 程序化火焰运行时，也是“异火榜”非官方实时视觉演绎的技术底座。

每个预设选择有限数量的 Shader kernel，并提供色板、速度、尺度、湍流与强度参数。页面使用 Nuxt，但引擎不依赖 Vue 或 Nuxt。

项目不会为 23 个状态维护 23 套彼此割裂的 Shader。共享 kernel 控制 GPU program 数量，少数特殊异火再通过 special pass 保留个性。
