import { FlameRuntime } from '@yunyoujun/flame-engine'
import './style.css'

const canvasElement = document.querySelector('canvas')
if (!canvasElement)
  throw new Error('Canvas element is required.')

const canvas = canvasElement

const runtime = new FlameRuntime({
  canvas,
  preset: {
    id: 'purifying-lotus-example',
    rank: 3,
    kernel: 'lotus',
    palette: { core: '#fffef4', inner: '#d8ffff', outer: '#76bfc5' },
    speed: 0.86,
    scale: 0.98,
    turbulence: 0.88,
    intensity: 1.42,
  },
})

let start: { x: number, y: number } | undefined

function updatePointer(event: PointerEvent, pressed = event.buttons > 0) {
  const rect = canvas.getBoundingClientRect()
  const drag = start ? Math.min(Math.hypot(event.clientX - start.x, event.clientY - start.y) / 220, 1) : 0
  runtime.setPointer({
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    pressed,
    drag,
  })
}

canvas.addEventListener('pointerdown', (event) => {
  start = { x: event.clientX, y: event.clientY }
  canvas.setPointerCapture(event.pointerId)
  updatePointer(event, true)
})
canvas.addEventListener('pointermove', updatePointer)
canvas.addEventListener('pointerup', (event) => {
  updatePointer(event, false)
  start = undefined
})

window.addEventListener('beforeunload', () => runtime.dispose())
