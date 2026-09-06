import type { CDPSession, Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'
import { flameRoster } from '../../apps/web/app/data/flames'

async function flameCrop(page: Page) {
  const rect = (await page.locator('canvas').boundingBox())!
  // Exclude the controls, pedestal, identity copy and progress indicators.
  return { x: rect.x + rect.width * 0.22, y: rect.y + rect.height * 0.08, width: rect.width * 0.56, height: rect.height * 0.57 }
}

const sessions = new WeakMap<Page, CDPSession>()

async function fireSnapshot(page: Page, clip: Awaited<ReturnType<typeof flameCrop>>) {
  let session = sessions.get(page)
  if (!session) {
    session = await page.context().newCDPSession(page)
    sessions.set(page, session)
  }
  // Capture the next compositor frame directly. Playwright's screenshot preparation
  // can outlast a one-second pulse on software WebGL, hiding a real transient response.
  const result = await session.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } })
  return Buffer.from(result.data, 'base64')
}

for (const flame of flameRoster) {
  test(`accepts ${flame.slug}: tap, hold, side view and quality tiers`, async ({ page, isMobile }, testInfo) => {
    test.setTimeout(120_000)
    const errors: string[] = []
    const warnings: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error')
        errors.push(message.text())
      if (message.type() === 'warning')
        warnings.push(message.text())
    })
    // Explicit user input is still available with reduced motion; its frozen scene
    // also lets us compare real pixels while exercising the actual quality control.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`/flames/${flame.slug}?quality=balanced`)
    await expect(page).toHaveTitle(new RegExp(flame.name))
    await expect(page.getByRole('heading', { name: flame.name, exact: true })).toBeVisible()
    await expect(page.locator('main')).toHaveAttribute('data-visual-state', 'approved')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    await expect(page.getByText('基础异火已现世 22 / 22', { exact: true })).toBeVisible()
    await expect(page.getByText('帝炎已现世', { exact: true })).toBeVisible()
    await expect(page.locator('.identity-state')).toHaveCount(0)
    const canvas = page.locator('canvas[data-programs]')
    await expect(canvas).toBeVisible()
    await expect(page.getByLabel('画质')).toHaveValue('balanced')
    await expect(page.getByRole('button', { name: '唤醒' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('vite-error-overlay')).toHaveCount(0)
    await expect(page.locator('.flame-fallback')).toHaveCount(0)
    await expect(canvas).toHaveAttribute('data-render-mode', 'volume')
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(17)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(25)
    const angle = page.getByRole('slider', { name: '左右环绕角度' })
    await expect(page.getByRole('button', { name: '拖拽旋转' })).toHaveAttribute('aria-pressed', 'true')
    const clip = await flameCrop(page)
    const resting = await fireSnapshot(page, clip)
    // Prove the baseline is stable before treating a pixel difference as input feedback.
    expect((await fireSnapshot(page, clip)).equals(resting)).toBe(true)
    const rect = (await canvas.boundingBox())!
    const point = { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.5 }
    if (isMobile)
      await page.touchscreen.tap(point.x, point.y)
    else
      await page.mouse.click(point.x, point.y)
    await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting), { message: 'Quick tap must change the fire, not just its altar', intervals: [50] }).toBe(false)
    await expect(angle).toHaveValue('0')
    await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting), { timeout: 10_000 }).toBe(true)
    const settled = await fireSnapshot(page, clip)
    expect(settled.equals(resting), 'Tap must decay back to the fixed-time baseline').toBe(true)
    await page.mouse.move(point.x, point.y)
    await page.mouse.down()
    await expect.poll(async () => (await fireSnapshot(page, clip)).equals(settled)).toBe(false)
    await page.waitForTimeout(500)
    await page.screenshot({ path: testInfo.outputPath('hold.png') })
    await page.mouse.up()
    await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting), { message: 'Released hold returns to baseline', timeout: 10_000 }).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('front.png') })
    await angle.fill('90')
    await page.screenshot({ path: testInfo.outputPath('side.png') })
    expect((await fireSnapshot(page, clip)).equals(resting), 'Volume must have a distinct side view').toBe(false)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)

    await page.getByRole('button', { name: '复位' }).click()
    for (const quality of ['high', 'lite'] as const) {
      await page.getByLabel('画质').selectOption(quality)
      await expect(canvas).toBeVisible()
      await expect(canvas).toHaveAttribute('data-render-mode', quality === 'lite' ? 'planar' : 'volume')
      expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(17)
      expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(quality === 'lite' ? 8 : 32)
      const tierClip = await flameCrop(page)
      const tierResting = await fireSnapshot(page, tierClip)
      const tierRect = (await canvas.boundingBox())!
      await page.mouse.click(tierRect.x + tierRect.width * 0.5, tierRect.y + tierRect.height * 0.5)
      await expect.poll(async () => (await fireSnapshot(page, tierClip)).equals(tierResting), { message: `${quality} tap feedback`, intervals: [50] }).toBe(false)
      await page.waitForTimeout(1200)
      await page.screenshot({ path: testInfo.outputPath(`${quality}.png`) })
    }
    expect(errors).toEqual([])
    // Chromium software-WebGL warnings are recorded, never treated as real-GPU acceptance.
    await testInfo.attach('console-warnings', { body: warnings.join('\n'), contentType: 'text/plain' })
    expect(warnings.filter(warning => !/GPU stall due to ReadPixels/.test(warning))).toEqual([])
  })
}

test('supports paused keyboard ignition, gesture cancellation and quality changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/flames/myriad-beasts')
  const canvas = page.locator('canvas[data-render-mode="volume"]')
  await expect(canvas).toBeVisible()
  await expect(page.getByRole('button', { name: '唤醒' })).toHaveAttribute('aria-pressed', 'true')
  const clip = await flameCrop(page)
  const resting = await fireSnapshot(page, clip)
  await canvas.focus()
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting)).toBe(false)
  await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting), { timeout: 10_000 }).toBe(true)
  await page.keyboard.press('Space')
  await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting)).toBe(false)
  const rect = (await canvas.boundingBox())!
  await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5)
  await page.mouse.down()
  await canvas.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', isPrimary: true })
  await page.mouse.up()
  await expect.poll(async () => (await fireSnapshot(page, clip)).equals(resting)).toBe(true)
  await page.getByLabel('画质').selectOption('lite')
  await expect(page.locator('canvas')).toHaveAttribute('data-render-mode', 'planar')
  await page.getByLabel('画质').selectOption('balanced')
  await expect(canvas).toBeVisible()
  await expect(page.getByRole('slider', { name: '左右环绕角度' })).toHaveValue('0')
})
