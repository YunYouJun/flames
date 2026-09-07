# Getting Started

## Requirements

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0` and pnpm `11.21.0`
- A browser with WebGL 2 support
- Three.js `0.185` or compatible

## Run from source

```bash
git clone https://github.com/YunYouJun/flames.git
cd flames
pnpm install
pnpm dev
```

The engine is a local workspace package and is not published to npm yet.
The example below runs inside this workspace; see `examples/basic` for a complete integration.

## Create a runtime

```ts
import { FlameRuntime } from '@yunyoujun/flame-engine'

const runtime = new FlameRuntime({
  canvas: document.querySelector('canvas')!,
  preset: {
    id: 'example',
    rank: 1,
    kernel: 'lotus',
    palette: { core: '#ffffff', inner: '#cfffff', outer: '#5f9fa8' },
    speed: 0.8,
    scale: 1,
    turbulence: 0.9,
    intensity: 1.3,
  },
})
```

Call `setPointer`, `setPaused`, `setQuality`, or `setPreset` as the experience changes. Always call `dispose()` when the owning view is removed.
