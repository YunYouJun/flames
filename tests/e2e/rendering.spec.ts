import { expect, test } from '@playwright/test'
import { advanceFlame, openFlame } from './helpers/scene'

test('renders fixed-time scenes only when their visible state changes', async ({ page }) => {
  test.setTimeout(90_000)
  await page.clock.install()
  await page.addInitScript(() => {
    // Count real GPU submissions without replacing the renderer or its output.
    const prototype = WebGL2RenderingContext.prototype
    const drawArrays = prototype.drawArrays
    const drawElements = prototype.drawElements
    const record = (gl: WebGL2RenderingContext) => {
      if (gl.canvas instanceof HTMLCanvasElement)
        gl.canvas.dataset.submissions = String(Number(gl.canvas.dataset.submissions ?? 0) + 1)
    }
    prototype.drawArrays = function (...args) {
      record(this)
      return drawArrays.apply(this, args)
    }
    prototype.drawElements = function (...args) {
      record(this)
      return drawElements.apply(this, args)
    }
  })
  await openFlame(page, '/flames/golden-emperor?benchmark=1&quality=balanced')
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000))
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  const submissions = () => canvas.getAttribute('data-submissions')
  const baseline = await submissions()
  expect(Number(baseline)).toBeGreaterThan(0)
  await advanceFlame(page, 1000)
  expect(await submissions(), 'An unchanged benchmark must not submit duplicate GPU frames').toBe(baseline)

  await page.getByRole('slider', { name: '左右环绕角度' }).fill('90')
  await advanceFlame(page, 100)
  expect(await submissions(), 'Changing the view must invalidate the frozen frame').not.toBe(baseline)
  const turned = await submissions()
  await advanceFlame(page, 1000)
  expect(await submissions()).toBe(turned)

  await canvas.focus()
  await page.keyboard.press('Enter')
  await advanceFlame(page, 100)
  expect(await submissions(), 'Explicit ignition must still render while time is fixed').not.toBe(turned)
  await advanceFlame(page, 2000)
  const settled = await submissions()
  await advanceFlame(page, 1000)
  expect(await submissions(), 'The runtime must become idle after the pulse decays').toBe(settled)
})
