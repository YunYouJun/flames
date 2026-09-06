import { expect, test } from '@playwright/test'

test('starts after hydration even when idle callbacks never run', async ({ page }) => {
  test.setTimeout(90_000)
  // A busy/background browser may never have an idle period. Critical startup
  // must not depend on that optional scheduling opportunity.
  await page.addInitScript(() => {
    window.requestIdleCallback = () => 0
    window.cancelIdleCallback = () => {}
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/flames/myriad-beasts?quality=lite')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByLabel('画质')).toHaveValue('lite')
  await expect(page.getByRole('button', { name: '唤醒' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('canvas[data-render-mode="planar"]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.runtime-notice')).toHaveCount(0)

  // Client-side navigation also starts exactly once, after canvas refs exist.
  await page.getByRole('link', { name: /21.*阴阳双炎/ }).click()
  await expect(page.getByRole('heading', { name: '阴阳双炎' })).toBeVisible()
  await expect(page.locator('canvas[data-programs]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.flame-fallback')).toHaveCount(0)
})
