import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Loading includes cold module/shader compilation on CI's software renderer.
 * Keep that allowance separate from the default five-second interaction checks.
 */
export async function openFlame(page: Page, url: string) {
  await page.goto(url)
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('canvas[data-programs]')).toBeVisible({ timeout: 30_000 })
}

/**
 * Sample input time in bounded frames without rendering 120 software-GPU
 * frames merely to observe a two-second decay. The engine caps each delta at 100 ms.
 */
export async function advanceFlame(page: Page, milliseconds: number) {
  for (let remaining = milliseconds; remaining > 0; remaining -= 100)
    await page.clock.fastForward(Math.min(100, remaining))
}
