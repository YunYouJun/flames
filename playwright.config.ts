import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const staticPreview = !!process.env.CI || process.env.FLAMES_E2E_STATIC === '1'
const port = staticPreview ? 3100 : 3000

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    launchOptions: process.env.FLAMES_E2E_SOFTWARE === '1'
      ? { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
      : {},
  },
  webServer: {
    command: staticPreview ? 'node scripts/preview-web.mjs' : 'pnpm --filter @yunyoujun/flames-web dev --host 127.0.0.1 --port 3000',
    port,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
})
