import { expect, test } from '@playwright/test'
import { expectFrame, fireSnapshot } from './helpers/capture'
import { advanceFlame, openFlame } from './helpers/scene'

test.beforeEach(() => {
  // Cold shader compilation on software WebGL is not an FPS gate.
  test.setTimeout(90_000)
})

test('navigates between approved flames from the short roster', async ({ page }) => {
  // Route assertions do not need a continuously animating software GPU.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFlame(page, '/')
  await expect(page.getByRole('heading', { name: '净莲妖火' })).toBeVisible()

  await page.getByRole('link', { name: /02.*虚无吞炎/ }).click()
  await expect(page).toHaveURL(/\/flames\/nihility$/)
  await expect(page.getByRole('heading', { name: '虚无吞炎' })).toBeVisible()

  await page.getByRole('button', { name: '展开全榜' }).click()
  const roster = page.getByRole('dialog', { name: '廿三席' })
  await expect(roster).toBeVisible()
  await expect(roster.getByRole('link')).toHaveCount(23)
  await expect(roster).toContainText('基础已现世 22 / 22 · 帝炎已现世')

  await roster.getByRole('link', { name: /11.*骨灵冷火/ }).click()
  await expect(page).toHaveURL(/\/flames\/bone-chilling$/)
  await expect(page.getByRole('heading', { name: '骨灵冷火' })).toBeVisible()
})

test('publishes reviewed flames for search indexing', async ({ page }) => {
  await openFlame(page, '/flames/golden-emperor?benchmark=1&quality=balanced')

  await expect(page.locator('main[data-visual-state="approved"][data-kernel="crown"]')).toBeVisible()
  await expect(page.locator('canvas[data-benchmark-ready="true"]')).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
  await expect(page.getByText('基础异火已现世 22 / 22')).toBeVisible()
  await expect(page.getByText('帝炎已现世')).toBeVisible()
})

// Each cold route owns its timeout and can be balanced independently across CI shards.
for (const slug of ['nihility', 'purifying-lotus', 'golden-emperor', 'life-spirit', 'three-thousand', 'wind-fury-dragon', 'bone-chilling', 'yin-yang', 'volcanic-stone']) {
  test(`renders the ${slug} lit altar and resets the inspection view`, async ({ page }) => {
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    await expect(page.locator('.flame-altar')).toHaveCount(0)
    await expect(canvas).toHaveAttribute('data-render-mode', 'volume')
    expect(Number(await canvas.getAttribute('data-calls'))).toBeGreaterThanOrEqual(5)
    const angle = page.getByRole('slider', { name: '左右环绕角度' })
    await expect(angle).toHaveAttribute('max', '180')
    await angle.fill('12')
    await expect(angle).toHaveValue('12')
    await page.getByRole('button', { name: '复位' }).click()
    await expect(angle).toHaveValue('0')
    await expect(page.getByRole('button', { name: '复位' })).toBeDisabled()
  })
}

test('opens the independently written setting summary and source tier', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFlame(page, '/')
  await page.getByRole('button', { name: /阅览设定/ }).click()
  const details = page.getByRole('dialog', { name: '净莲妖火' })

  await expect(details).toContainText('视觉演绎')
  await expect(details).toContainText('原著明确')
  await expect(details).toContainText('不替代原作')
})

test('keeps orbit controls clear of the flame viewing area', async ({ page }) => {
  await openFlame(page, '/flames/wind-fury-dragon?benchmark=1&quality=balanced')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  const controls = (await page.getByRole('group', { name: '环绕查看' }).boundingBox())!
  const surface = (await canvas.boundingBox())!
  if (page.viewportSize()!.width <= 960)
    expect(controls.y + controls.height).toBeLessThanOrEqual(surface.y)
  else
    expect(controls.x).toBeGreaterThan(surface.x + surface.width * 0.7)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
})

test('labels extension-only identities and derived alternatives', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openFlame(page, '/flames/wind-fury-dragon')
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

  await openFlame(page, '/flames/karmic-lotus?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

  const experience = page.locator('main[data-visual-state="approved"]')
  await expect(experience).toHaveAttribute('data-bloom-mode', 'karmic')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(17)
  expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(25)
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

  await openFlame(page, '/flames/green-lotus?benchmark=1&quality=balanced')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible()

  const experience = page.locator('main[data-visual-state="approved"]')
  await expect(experience).toHaveAttribute('data-bloom-mode', 'earthcore')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
  expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(25)
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

  await openFlame(page, '/flames/sea-heart?benchmark=1&quality=balanced')
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

for (const [slug, flowMode, name, interpretation] of [
  ['life-spirit', 'verdant', '生灵之焱', '五枚火种错峰萌发'],
  ['fire-cloud-water', 'cloudwater', '火云水炎', '上下两层薄焰云之间垂落水线般的火丝'],
  ['nether-poison', 'venom', '幽冥毒火', '毒泡在池面周期鼓起破裂'],
] as const) {
  test(`renders distinct fluid sibling ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible()
    const experience = page.locator('main[data-visual-state="approved"][data-kernel="fluid"]')
    await expect(experience).toHaveAttribute('data-flow-mode', flowMode)
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

for (const slug of ['life-spirit', 'fire-cloud-water', 'wind-fury-dragon', 'three-thousand', 'nine-dragon-thunder']) {
  test(`changes the ${slug} volume on hold at a fixed animation time`, async ({ page }) => {
    await page.clock.install()
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    const angle = page.getByRole('slider', { name: '左右环绕角度' })
    await angle.fill('90')
    await page.getByRole('button', { name: '拖拽旋转' }).click()
    const rect = (await canvas.boundingBox())!
    await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5)
    // Settle pointer interpolation before comparing a fixed-time flame crop.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000))
    await advanceFlame(page, 1500)
    const isDragon = ['wind-fury-dragon', 'three-thousand', 'nine-dragon-thunder'].includes(slug)
    const clip = { x: rect.x + rect.width * 0.32, y: rect.y + rect.height * (isDragon ? 0.1 : 0.3), width: rect.width * 0.36, height: rect.height * (isDragon ? 0.5 : 0.32) }
    const resting = await fireSnapshot(page, clip)
    expect((await fireSnapshot(page, clip)).equals(resting), 'The baseline must be stable').toBe(true)
    await page.mouse.down()
    await expect(canvas).toHaveAttribute('data-gesture', 'pending')
    await advanceFlame(page, 800)
    await expect(canvas).toHaveAttribute('data-gesture', 'holding')
    await expectFrame.poll(async () => (await fireSnapshot(page, clip)).equals(resting)).toBe(false)
    await page.mouse.up()
    await advanceFlame(page, 2000)
    await expectFrame.poll(async () => (await fireSnapshot(page, clip)).equals(resting), { message: 'Released hold must decay to the baseline' }).toBe(true)
    await expect(angle).toHaveValue('90')
  })
}

for (const [slug, name, interpretation] of [
  ['nether-gale', '九幽风炎', '横向淡黑风带穿过中央暗眼'],
  ['wind-fury-dragon', '风怒龙炎', '两股青灰风焰彼此缠绕成上升龙卷'],
] as const) {
  test(`renders distinct gale family ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('main[data-visual-state="approved"][data-kernel="gale"]')).toBeVisible()
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

for (const [slug, name, interpretation] of [
  ['three-thousand', '三千焱炎火', '紫黑焰身拉成长距离星轨火龙'],
  ['nine-dragon-thunder', '九龙雷罡火', '九枚龙首沿三层轨道巡游'],
  ['turtle-spirit', '龟灵地火', '厚重龟甲作为主体'],
  ['myriad-beasts', '万兽灵火', '七枚抽象兽面在红色主焰外围交替浮现'],
] as const) {
  test(`renders distinct spirit family ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('main[data-visual-state="approved"][data-kernel="spirit"]')).toBeVisible()
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

for (const [slug, name, interpretation] of [
  ['fallen-heart', '陨落心炎', '透明火蟒环绕心火脉冲'],
  ['yin-yang', '阴阳双炎', '一黑一白两道小焰围绕阴阳火印互相追逐'],
] as const) {
  test(`renders distinct soul family ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('main[data-visual-state="approved"][data-kernel="soul"]')).toBeVisible()
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

for (const [slug, name, interpretation] of [
  ['emperor', '帝炎', '四层同心万火冠环汇聚到无色焰核'],
  ['golden-emperor', '金帝焚天炎', '三维涡流卷起断续火舌'],
  ['eight-desolation', '八荒破灭焱', '左右展开的淡黑宽翼占据画面'],
  ['nether-golden', '九幽金祖火', '暗金祖焰受断续祖纹环约束成碑形'],
] as const) {
  test(`renders distinct crown family ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('main[data-visual-state="approved"][data-kernel="crown"]')).toBeVisible()
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    // Golden volume adds one reduced-resolution composite program.
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(slug === 'golden-emperor' ? 17 : 16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

test('drags the volume view and preserves a separate fire interaction mode', async ({ page }) => {
  await openFlame(page, '/flames/karmic-lotus?benchmark=1&quality=balanced')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toBeVisible()
  const angle = page.getByRole('slider')
  const mode = page.getByRole('button', { name: '拖拽旋转' })
  await expect(mode).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '自动环绕' }).click()
  const rect = (await canvas.boundingBox())!
  const x = rect.x + rect.width * 0.45
  const y = rect.y + rect.height * 0.5
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(page.getByRole('button', { name: '自动环绕' })).toHaveAttribute('aria-pressed', 'false')
  const beforeDrag = Number(await angle.inputValue())
  await page.mouse.move(x + 90, y, { steps: 5 })
  await page.mouse.up()
  await expect(page.getByRole('button', { name: '自动环绕' })).toHaveAttribute('aria-pressed', 'false')
  expect(Number(await angle.inputValue())).toBeLessThan(beforeDrag - 15)
  await page.mouse.move(x + 90, y)
  await page.mouse.down()
  const beforeReturn = Number(await angle.inputValue())
  await page.mouse.move(x, y, { steps: 5 })
  await page.mouse.up()
  expect(Number(await angle.inputValue())).toBeGreaterThan(beforeReturn + 15)
  await mode.click()
  const settledAngle = await angle.inputValue()
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 60, y, { steps: 5 })
  await page.mouse.up()
  await expect(angle).toHaveValue(settledAngle)
  await mode.focus()
  await page.keyboard.press('Space')
  await expect(mode).toHaveAttribute('aria-pressed', 'true')
  await angle.focus()
  await page.keyboard.press('Home')
  await expect(angle).toHaveValue('-180')
  await page.keyboard.press('ArrowRight')
  await expect(angle).toHaveValue('-179')
})

test('stops automatic orbit on manual input, reset and pause', async ({ page }) => {
  await page.clock.install()
  await openFlame(page, '/flames/golden-emperor')
  // Exercise the real animation loop in bounded frames, rather than rendering
  // continuously while slow software-GPU locator checks cross the process boundary.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000))
  const automatic = page.getByRole('button', { name: '自动环绕' })
  const angle = page.getByRole('slider', { name: '左右环绕角度' })
  await expect(automatic).toHaveAttribute('aria-pressed', 'false')
  await automatic.click()
  await expect(automatic).toHaveAttribute('aria-pressed', 'true')
  // Orbit integrates animation-frame deltas. Tick every frame here: fastForward
  // skips overdue callbacks, and polling a paused clock cannot advance the angle.
  await page.clock.runFor(300)
  await expect.poll(async () => Number(await angle.inputValue())).toBeGreaterThan(1)
  await angle.fill('45')
  await expect(automatic).toHaveAttribute('aria-pressed', 'false')
  await automatic.click()
  await page.getByRole('button', { name: '复位' }).click()
  await expect(angle).toHaveValue('0')
  await expect(automatic).toHaveAttribute('aria-pressed', 'false')
  await automatic.click()
  await page.getByRole('button', { name: /静止/ }).click()
  await expect(automatic).toBeDisabled()
  await expect(automatic).toHaveAttribute('aria-pressed', 'false')
})

for (const slug of ['purifying-lotus', 'karmic-lotus']) {
  test(`orbits the ${slug} volume and keeps lite mode available`, async ({ page }) => {
    await page.clock.install()
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000))
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toHaveAttribute('data-render-mode', 'volume')
    const front = await canvas.screenshot()
    await page.getByRole('slider').fill('90')
    await advanceFlame(page, 100)
    const side = await canvas.screenshot()
    expect(front.equals(side)).toBe(false)
    const automatic = page.getByRole('button', { name: '自动环绕' })
    await automatic.click()
    await expect(automatic).toHaveAttribute('aria-pressed', 'true')
    await advanceFlame(page, 300)
    await expect.poll(async () => Number(await page.getByRole('slider').inputValue())).toBeGreaterThan(91)
    // A fresh page needs its startup animation frame before diagnostics exist.
    await page.clock.resume()
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=lite`)
    await expect(canvas).toHaveAttribute('data-render-mode', 'planar')
    await expect(page.getByRole('button', { name: '自动环绕' })).toHaveCount(0)
  })
}

test('inspects golden volume from the side and falls back in lite quality', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openFlame(page, '/flames/golden-emperor?benchmark=1&quality=balanced')
  const canvas = page.locator('canvas[data-benchmark-ready="true"]')
  await expect(canvas).toHaveAttribute('data-render-mode', 'volume')
  const angle = page.getByRole('slider', { name: '左右环绕角度' })
  await expect(angle).toHaveAttribute('max', '180')
  const front = await canvas.screenshot()
  await angle.fill('90')
  const side = await canvas.screenshot()
  expect(front.equals(side)).toBe(false)
  await angle.fill('180')
  await expect(angle).toHaveValue('180')
  await page.getByRole('button', { name: '复位' }).click()
  await expect(angle).toHaveValue('0')
  await openFlame(page, '/flames/golden-emperor?benchmark=1&quality=lite')
  await expect(canvas).toHaveAttribute('data-render-mode', 'planar')
  await expect(angle).toHaveAttribute('max', '12')
  expect(errors).toEqual([])
})

for (const [slug, name, interpretation] of [
  ['volcanic-stone', '火山石焰', '破裂玄武岩丘包住岩浆焰口'],
  ['dark-yellow', '玄黄炎', '一枚深黄种核贴近地面'],
] as const) {
  test(`renders distinct geofire family ${slug} inside renderer budgets`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text())
    })
    page.on('pageerror', error => consoleErrors.push(error.message))
    await openFlame(page, `/flames/${slug}?benchmark=1&quality=balanced`)
    await expect(page.locator('main[data-visual-state="approved"][data-kernel="geofire"]')).toBeVisible()
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()
    expect(Number(await canvas.getAttribute('data-programs'))).toBeLessThanOrEqual(16)
    expect(Number(await canvas.getAttribute('data-calls'))).toBeLessThanOrEqual(24)
    await page.getByRole('button', { name: /阅览设定/ }).click()
    await expect(page.getByRole('dialog', { name })).toContainText(interpretation)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')
    expect(consoleErrors).toEqual([])
  })
}

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
  await page.goto('/')
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible({ timeout: 30_000 })
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  const fallback = page.locator('.flame-fallback')
  await page.waitForFunction(() => {
    const fallbackElement = document.querySelector('.flame-fallback')
    const notice = document.querySelector('.runtime-notice')?.textContent ?? ''
    return !fallbackElement || notice.includes('实时火焰暂不可用')
  })
  const initialized = await fallback.count() === 0

  if (initialized) {
    const bitmapWidth = await canvas.evaluate(element => (element as HTMLCanvasElement).width)
    expect(bitmapWidth).toBeGreaterThan(0)
  }
  else {
    await expect(page.getByRole('status', { name: '轻量火焰意象' })).toBeVisible()
    await expect(page.getByText('实时火焰暂不可用，已呈现轻量意象，可刷新重试')).toBeVisible()
  }
})

for (const path of ['/', '/flames/nihility', '/flames/bone-chilling']) {
  test(`keeps ${path} inside the foundation renderer budgets`, async ({ page }) => {
    await openFlame(page, `${path}?benchmark=1&quality=balanced`)
    const canvas = page.locator('canvas[data-benchmark-ready="true"]')
    await expect(canvas).toBeVisible()

    const diagnostics = await canvas.evaluate((element) => {
      const { programs, calls, renderMode } = (element as HTMLCanvasElement).dataset
      return {
        programs: Number(programs),
        calls: Number(calls),
        volume: renderMode === 'volume',
      }
    })

    // The volume's offscreen composite adds one draw and one shader program.
    expect(diagnostics.programs).toBeLessThanOrEqual(diagnostics.volume ? 17 : 16)
    expect(diagnostics.calls).toBeLessThanOrEqual(diagnostics.volume ? 25 : 24)
  })
}
