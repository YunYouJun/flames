import type { FlameKernelId, FlamePreset } from '@yunyoujun/flame-engine'
import { FlameRuntime } from '@yunyoujun/flame-engine'
import './style.css'

const canvasElement = document.querySelector('canvas')
const formElement = document.querySelector('form')
if (!canvasElement || !formElement)
  throw new Error('Playground elements are required.')

const canvas = canvasElement
const form = formElement

const palettes: Record<FlameKernelId, FlamePreset['palette']> = {
  lotus: { core: '#fffef4', inner: '#d8ffff', outer: '#76bfc5' },
  void: { core: '#d8a8ff', inner: '#6e3d92', outer: '#110917' },
  cold: { core: '#ffffff', inner: '#c9f9ff', outer: '#498f9d' },
  fluid: { core: '#d9ffff', inner: '#25b9ef', outer: '#08245f' },
  gale: { core: '#dce9e6', inner: '#718487', outer: '#101619' },
  spirit: { core: '#ffffff', inner: '#b9d9ff', outer: '#3d4668' },
  soul: { core: '#ffffff', inner: '#ffe3b5', outer: '#4c2030' },
}

function readPreset(): FlamePreset {
  const data = new FormData(form)
  const kernel = String(data.get('kernel')) as FlameKernelId
  return {
    id: 'playground',
    rank: 1,
    kernel,
    palette: palettes[kernel],
    speed: Number(data.get('speed')),
    scale: Number(data.get('scale')),
    turbulence: Number(data.get('turbulence')),
    intensity: Number(data.get('intensity')),
  }
}

const runtime = new FlameRuntime({ canvas, preset: readPreset(), quality: 'balanced' })
form.addEventListener('input', () => runtime.setPreset(readPreset()))

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect()
  runtime.setPointer({
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    pressed: event.buttons > 0,
    drag: event.buttons > 0 ? 0.6 : 0,
  })
})

window.addEventListener('beforeunload', () => runtime.dispose())
