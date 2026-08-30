# Getting Started

## Requirements

- A browser with WebGL 2 support
- Three.js `0.185` or compatible

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
