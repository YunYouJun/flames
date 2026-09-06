import type { Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'
import { FireFrame } from './helpers/fire-frame'
import { advanceFlame, openFlame } from './helpers/scene'

async function gestureScene(page: Page, mobile: boolean) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFlame(page, '/flames/myriad-beasts?quality=balanced')
  const canvas = page.locator('canvas[data-programs]')
  await expect(canvas).toBeVisible()
  const rect = (await canvas.boundingBox())!
  const x = Math.round(rect.x + rect.width / 2)
  const y = Math.round(rect.y + rect.height * 0.4)
  const session = await page.context().newCDPSession(page)
  const pointer = async (type: 'down' | 'move' | 'up', dx = 0) => {
    if (mobile) {
      await session.send('Input.dispatchTouchEvent', {
        type: type === 'down' ? 'touchStart' : type === 'move' ? 'touchMove' : 'touchEnd',
        touchPoints: type === 'up' ? [] : [{ x: x + dx, y, id: 1 }],
      })
    }
    else if (type === 'down') {
      await page.mouse.move(x, y)
      await page.mouse.down()
    }
    else if (type === 'move') {
      await page.mouse.move(x + dx, y)
    }
    else {
      await page.mouse.up()
    }
  }
  const frame = async () => new FireFrame(Buffer.from((await session.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: rect.x + rect.width * 0.22, y: rect.y + rect.height * 0.08, width: rect.width * 0.56, height: rect.height * 0.57, scale: 1 },
  })).data, 'base64'))
  return { canvas, pointer, frame }
}

test('fades a held charge when mouse or touch hands over to rotation, even while paused', async ({ page, isMobile }, testInfo) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.clock.install()
  const { canvas, pointer, frame } = await gestureScene(page, isMobile)
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000))
  await pointer('down')
  await expect(canvas).toHaveAttribute('data-gesture', 'pending')
  await advanceFlame(page, 1100)
  await expect(canvas).toHaveAttribute('data-gesture', 'holding')
  await expect(page.getByRole('group', { name: '环绕查看' }).getByRole('status')).toContainText('蓄焰中')
  await page.screenshot({ path: testInfo.outputPath('holding.png') })
  await pointer('move', 40)
  await advanceFlame(page, 100)
  const releasing = await frame()
  await expect(canvas).toHaveAttribute('data-gesture', 'dragging')
  await expect(page.getByRole('group', { name: '环绕查看' }).getByRole('status')).toContainText('环视中')
  await expect(page.getByRole('slider', { name: '左右环绕角度' })).not.toHaveValue('0')
  // The camera is now stationary but the fire must keep fading, not cut to rest.
  await advanceFlame(page, 200)
  expect((await frame()).equals(releasing), 'The rotated charge must continue fading').toBe(false)
  await advanceFlame(page, 1000)
  const settled = await frame()
  await advanceFlame(page, 300)
  expect((await frame()).equals(settled), 'Holding after rotation must not resume charge').toBe(true)
  await page.screenshot({ path: testInfo.outputPath('rotating.png') })
  await pointer('up', 40)
  await advanceFlame(page, 100)
  await expect(canvas).toHaveAttribute('data-gesture', 'idle')
  expect((await frame()).equals(settled), 'Releasing a rotation must not trigger a click pulse').toBe(true)
  expect(errors).toEqual([])
})

test('cancels pending holds and distinguishes rotation from fire steering', async ({ page, isMobile }) => {
  test.setTimeout(90_000)
  const { canvas, pointer, frame } = await gestureScene(page, isMobile)
  // Deliver the rapid down/move in one browser task to exercise the pre-hold
  // boundary independently of the software GPU delaying separate commands.
  await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const init = { pointerId: 42, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2, bubbles: true }
    // Synthetic pointers cannot capture; native capture is covered above.
    const capture = element.setPointerCapture
    element.setPointerCapture = () => {}
    try {
      element.dispatchEvent(new PointerEvent('pointerdown', init))
      element.dispatchEvent(new PointerEvent('pointermove', { ...init, clientX: init.clientX + 40 }))
    }
    finally {
      element.setPointerCapture = capture
    }
  })
  await expect(canvas).toHaveAttribute('data-gesture', 'dragging')
  const directDrag = await frame()
  await page.waitForTimeout(400)
  await expect(canvas).toHaveAttribute('data-gesture', 'dragging')
  expect((await frame()).equals(directDrag), 'Direct rotation must not flash a charged fire').toBe(true)
  await canvas.dispatchEvent('pointercancel', { pointerId: 42, isPrimary: true })
  await expect(canvas).toHaveAttribute('data-gesture', 'idle')
  await page.getByRole('button', { name: '拖拽旋转' }).click()
  const angle = await page.getByRole('slider', { name: '左右环绕角度' }).inputValue()
  await pointer('down')
  await pointer('move', 40)
  await expect(page.getByRole('group', { name: '环绕查看' }).getByRole('status')).toContainText('拨焰中')
  await expect(page.getByRole('slider', { name: '左右环绕角度' })).toHaveValue(angle)
  await pointer('up', 40)
  await expect(canvas).toHaveAttribute('data-gesture', 'idle')
  await pointer('down')
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await page.waitForTimeout(400)
  await expect(canvas).toHaveAttribute('data-gesture', 'idle')
  await pointer('up')
  await page.getByLabel('画质').selectOption('lite')
  await expect(canvas).toHaveAttribute('data-gesture', 'idle')
  await expect(canvas).toHaveAttribute('data-render-mode', 'planar')
})
