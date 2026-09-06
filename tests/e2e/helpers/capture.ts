import type { CDPSession, Page } from '@playwright/test'
import { Buffer } from 'node:buffer'
import { expect } from '@playwright/test'
import { FireFrame } from './fire-frame'

interface FlameClip {
  x: number
  y: number
  width: number
  height: number
}

const sessions = new WeakMap<Page, CDPSession>()

// CI traces measured 15 s for a single software-GPU capture. This is a
// readback allowance, not extra animation time or a relaxed pixel threshold.
export const expectFrame = expect.configure({ timeout: 30_000 })

export async function fireSnapshot(page: Page, clip: FlameClip): Promise<FireFrame> {
  let session = sessions.get(page)
  if (!session) {
    session = await page.context().newCDPSession(page)
    sessions.set(page, session)
  }
  // Avoid screenshot preparation consuming a transient pulse; callers control
  // the animation clock and compare decoded pixels, not PNG encoding bytes.
  const result = await session.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } })
  return new FireFrame(Buffer.from(result.data, 'base64'))
}
