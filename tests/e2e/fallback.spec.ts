import { expect, test } from '@playwright/test'
import { flameRosterBySlug, getFlameEntry } from '../../apps/web/app/data/flames'

test.beforeEach(async ({ page }) => {
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
        if (contextId.includes('webgl'))
          return null
        return Reflect.apply(getContext, this, [contextId, ...args])
      },
    })
  })
})

test('keeps themed fallback, pause, and roster navigation usable without WebGL', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type()) && !/Error creating WebGL context|Unable to initialize the flame runtime/.test(message.text()))
      errors.push(message.text())
  })

  await page.goto('/flames/golden-emperor')
  await expect(page).toHaveTitle(/金帝焚天炎/)
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 30_000 })
  const fallback = page.getByRole('status', { name: '轻量火焰意象' })
  await expect(fallback).toBeVisible()
  await expect(page.getByText('实时火焰暂不可用，已呈现轻量意象，可刷新重试')).toBeVisible()
  await expect(page.locator('vite-error-overlay')).toHaveCount(0)
  await expect(fallback).not.toContainText('凝聚火息')
  const golden = getFlameEntry(flameRosterBySlug.get('golden-emperor')!)!
  expect(await fallback.evaluate(element => (element as HTMLElement).style.getPropertyValue('--ember-inner'))).toBe(golden.palette.inner)

  await page.getByRole('button', { name: '静止' }).click()
  await expect(fallback).toHaveClass(/flame-fallback--paused/)
  expect(await fallback.locator('.flame-fallback__wisp').first().evaluate(element => getComputedStyle(element).animationPlayState)).toBe('paused')
  await page.getByRole('button', { name: '唤醒' }).click()
  await expect(fallback).not.toHaveClass(/flame-fallback--paused/)
  expect(await fallback.locator('.flame-fallback__wisp').first().evaluate(element => getComputedStyle(element).animationPlayState)).toBe('running')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('fallback.png') })

  await page.getByRole('button', { name: '展开全榜' }).click()
  await page.getByRole('dialog', { name: '廿三席' }).getByRole('link', { name: /05.*生灵之焱/ }).click()
  await expect(page).toHaveURL(/\/flames\/life-spirit$/)
  await expect(page.getByRole('heading', { name: '生灵之焱' })).toBeVisible()
  await expect(fallback).toBeVisible()
  const verdant = getFlameEntry(flameRosterBySlug.get('life-spirit')!)!
  await expect.poll(() => fallback.evaluate(element => (element as HTMLElement).style.getPropertyValue('--ember-inner'))).toBe(verdant.palette.inner)
  expect(errors).toEqual([])
})

test('honors reduced motion and benchmark freeze without WebGL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/flames/emperor')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 30_000 })
  const fallback = page.getByRole('status', { name: '轻量火焰意象' })
  await expect(fallback).toBeVisible()
  await expect(fallback).toHaveClass(/flame-fallback--paused/)
  expect(await fallback.locator('.flame-fallback__wisp').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none')

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/flames/emperor?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 30_000 })
  await expect(fallback).toBeVisible()
  await expect(fallback).toHaveClass(/flame-fallback--paused/)
  expect(await fallback.locator('.flame-fallback__wisp').first().evaluate(element => getComputedStyle(element).animationPlayState)).toBe('paused')
})
