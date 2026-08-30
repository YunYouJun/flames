import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()
})

test('switches between the three MVP flames', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '净莲妖火' })).toBeVisible()

  await page.getByRole('button', { name: /02.*虚无吞炎/ }).click()
  await expect(page).toHaveURL(/\/flames\/nihility$/)
  await expect(page.getByRole('heading', { name: '虚无吞炎' })).toBeVisible()

  await page.getByRole('button', { name: /11.*骨灵冷火/ }).click()
  await expect(page).toHaveURL(/\/flames\/bone-chilling$/)
  await expect(page.getByRole('heading', { name: '骨灵冷火' })).toBeVisible()
})

test('opens the independently written setting summary', async ({ page }) => {
  await page.getByRole('button', { name: /阅览设定/ }).click()
  await expect(page.getByRole('dialog')).toContainText('视觉演绎')
  await expect(page.getByRole('dialog')).toContainText('不替代原作')
})

test('initializes WebGL or presents an explicit fallback', async ({ page }) => {
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  const fallback = page.locator('.flame-fallback')
  await page.waitForFunction(() => {
    const fallbackElement = document.querySelector('.flame-fallback')
    const notice = document.querySelector('.runtime-notice')?.textContent ?? ''
    return !fallbackElement || notice.includes('WebGL')
  })
  const initialized = await fallback.count() === 0

  if (initialized) {
    const bitmapWidth = await canvas.evaluate(element => (element as HTMLCanvasElement).width)
    expect(bitmapWidth).toBeGreaterThan(0)
  }
  else {
    await expect(page.getByText('当前环境未启用 WebGL')).toBeVisible()
  }
})
