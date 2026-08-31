import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()
})

test('navigates between approved flames from the short roster', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '净莲妖火' })).toBeVisible()

  await page.getByRole('link', { name: /02.*虚无吞炎/ }).click()
  await expect(page).toHaveURL(/\/flames\/nihility$/)
  await expect(page.getByRole('heading', { name: '虚无吞炎' })).toBeVisible()

  await page.getByRole('button', { name: '展开全榜' }).click()
  const roster = page.getByRole('dialog', { name: '廿三席' })
  await expect(roster).toBeVisible()
  await expect(roster.getByRole('link')).toHaveCount(23)
  await expect(roster).toContainText('基础已现世 6 / 22 · 帝炎未启')

  await roster.getByRole('link', { name: /11.*骨灵冷火/ }).click()
  await expect(page).toHaveURL(/\/flames\/bone-chilling$/)
  await expect(page.getByRole('heading', { name: '骨灵冷火' })).toBeVisible()
})

test('renders reserved seats without initializing WebGL', async ({ page }) => {
  await page.goto('/flames/golden-emperor')

  await expect(page.getByRole('heading', { name: '金帝焚天炎' })).toBeVisible()
  await expect(page.getByRole('paragraph').filter({ hasText: '尚未凝聚' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.getByText('基础异火已现世 6 / 22')).toBeVisible()
  await expect(page.getByText('帝炎未启')).toBeVisible()
})

test('opens the independently written setting summary and source tier', async ({ page }) => {
  await page.getByRole('button', { name: /阅览设定/ }).click()
  const details = page.getByRole('dialog', { name: '净莲妖火' })

  await expect(details).toContainText('视觉演绎')
  await expect(details).toContainText('原著明确')
  await expect(details).toContainText('不替代原作')
})

test('labels extension-only identities and derived alternatives', async ({ page }) => {
  await page.goto('/flames/wind-fury-dragon')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()
  await page.getByRole('button', { name: /阅览设定/ }).click()
  const details = page.getByRole('dialog', { name: '风怒龙炎' })

  await expect(details).toContainText('授权扩展')
  await expect(details).toContainText('衍生版本')
  await expect(details).toContainText('风雷怒焱')
})

test('renders the approved red lotus with its karmic interaction contract', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  await page.goto('/flames/karmic-lotus?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

  const experience = page.locator('main[data-visual-state="approved"]')
  await expect(experience).toHaveAttribute('data-bloom-mode', 'karmic')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
  expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
  await page.getByRole('button', { name: /阅览设定/ }).click()
  await expect(page.getByRole('dialog', { name: '红莲业火' })).toContainText('业纹从莲座逐层向上点燃')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  expect(consoleErrors).toEqual([])
})

test('renders the approved green lotus with its earthcore interaction contract', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  await page.goto('/flames/green-lotus?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

  const experience = page.locator('main[data-visual-state="approved"]')
  await expect(experience).toHaveAttribute('data-bloom-mode', 'earthcore')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
  expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
  await page.getByRole('button', { name: /阅览设定/ }).click()
  await expect(page.getByRole('dialog', { name: '青莲地心火' })).toContainText('岩缝与莲脉同时亮起')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  expect(consoleErrors).toEqual([])
})

test('renders the approved sea heart with its tidal interaction contract', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  await page.goto('/flames/sea-heart?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

  const experience = page.locator('main[data-visual-state="approved"][data-kernel="fluid"]')
  await expect(experience).toHaveAttribute('data-flow-mode', 'tidal')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
  expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
  await page.getByRole('button', { name: /阅览设定/ }).click()
  await expect(page.getByRole('dialog', { name: '海心焰' })).toContainText('火体边缘像水波一样翻卷')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  expect(consoleErrors).toEqual([])
})

test('renders distinct fluid sibling prototypes inside renderer budgets', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error')
      consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  const prototypes = [
    ['life-spirit', 'verdant', '生灵之焱', '细长焰茎与双叶从潮面逐次萌发'],
    ['fire-cloud-water', 'cloudwater', '火云水炎', '上下两层薄焰云之间垂落水线般的火丝'],
    ['nether-poison', 'venom', '幽冥毒火', '毒泡在池面周期鼓起破裂'],
  ] as const

  for (const [slug, flowMode, name, interpretation] of prototypes) {
    await page.goto(`/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible()
    const experience = page.locator('main[data-visual-state="prototype"][data-kernel="fluid"]')
    await expect(experience).toHaveAttribute('data-flow-mode', flowMode)
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  }

  expect(consoleErrors).toEqual([])
})

test('returns a branded 404 for unknown flame slugs', async ({ page }) => {
  const response = await page.goto('/flames/not-a-flame')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '此席未录' })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await page.getByRole('button', { name: /返回廿三席/ }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { name: '净莲妖火' })).toBeVisible()
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

test('keeps approved kernels inside the foundation renderer budgets', async ({ page }) => {
  const representatives = [
    '/',
    '/flames/nihility',
    '/flames/bone-chilling',
  ]

  for (const path of representatives) {
    await page.goto(`${path}?benchmark=1&quality=balanced`)
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()

    const diagnostics = await canvas.evaluate((element) => {
      const { programs, calls } = (element as HTMLCanvasElement).dataset
      return {
        programs: Number(programs),
        calls: Number(calls),
      }
    })

    expect(diagnostics.programs).toBeLessThanOrEqual(16)
    expect(diagnostics.calls).toBeLessThanOrEqual(24)
  }
})
