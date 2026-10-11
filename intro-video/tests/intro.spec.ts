import { chromium, expect, test, type Page } from '@playwright/test'

const DAY = 24 * 60 * 60 * 1000

/** What the overlay is doing right now. */
async function overlay(page: Page) {
  return page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-intro]')
    const video = el?.querySelector('video')
    const skip = el?.querySelector('button')?.getBoundingClientRect()
    return {
      present: !!el,
      data: el?.dataset.intro ?? null,
      src: video?.currentSrc.split('/').pop() ?? null,
      time: video?.currentTime ?? 0,
      paused: video?.paused ?? true,
      poster: video?.getAttribute('poster') ?? null,
      skip: skip ? { w: skip.width, h: skip.height } : null,
      scrollLock: document.documentElement.style.overflow,
    }
  })
}
const playing = (page: Page) => expect.poll(async () => (await overlay(page)).time, { timeout: 5000 }).toBeGreaterThan(0.3)
const gone = (page: Page, timeout: number) => expect.poll(async () => (await overlay(page)).present, { timeout }).toBe(false)
const lastPlayed = (page: Page, msAgo: number) =>
  page.addInitScript((t) => {
    if (!sessionStorage.getItem('__seeded')) {
      localStorage.setItem('bh-intro-last', String(t))
      sessionStorage.setItem('__seeded', '1')
    }
  }, Date.now() - msAgo)

test('first visit (1440×900): full 16:9 HD, Skip from frame 0, plays to the end and hands over', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setViewportSize({ width: 1440, height: 900 })
  const t0 = Date.now()
  await page.goto('/')
  const first = await overlay(page)
  expect(first.data).toBe('full 16x9 hd')
  expect(first.skip!.w).toBeGreaterThanOrEqual(44)
  expect(first.skip!.h).toBeGreaterThanOrEqual(44)
  await expect(page.locator('h1')).toHaveCount(1) // homepage already rendered underneath
  await playing(page)
  const during = await overlay(page)
  expect(during.src).toBe('intro-16x9-hd.webm')
  expect(during.scrollLock).toBe('hidden')
  await page.mouse.move(700, 450)
  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(400)
  expect(await page.evaluate(() => window.scrollY)).toBe(0) // page underneath doesn't move
  expect(await page.locator('.hero-fade').first().evaluate((e) => getComputedStyle(e).opacity)).toBe('0')
  await gone(page, 15_000)
  const took = (Date.now() - t0) / 1000
  expect(took).toBeGreaterThan(8.5)
  expect(await page.evaluate(() => [sessionStorage.getItem('bh-intro-seen'), !!localStorage.getItem('bh-intro-last'), document.documentElement.style.overflow])).toEqual(['1', true, ''])
  await expect.poll(() => page.locator('.hero-fade').first().evaluate((e) => getComputedStyle(e).opacity), { timeout: 4000 }).toBe('1')
  expect(errors).toEqual([])
})

test('same session: reload shows no intro', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip intro' }).click()
  await gone(page, 2000)
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  expect((await overlay(page)).present).toBe(false)
})

test('return within 7 days: short cut', async ({ page }) => {
  await lastPlayed(page, 2 * DAY)
  await page.setViewportSize({ width: 1440, height: 900 })
  const t0 = Date.now()
  await page.goto('/')
  expect((await overlay(page)).data).toBe('short 16x9 hd')
  await playing(page)
  expect((await overlay(page)).src).toBe('intro-short-16x9-hd.webm')
  await gone(page, 8000)
  expect((Date.now() - t0) / 1000).toBeLessThan(6)
})

test('return after 8 days: full cut again', async ({ page }) => {
  await lastPlayed(page, 8 * DAY)
  await page.goto('/')
  expect((await overlay(page)).data?.startsWith('full ')).toBe(true)
})

const SCREENS: [string, number, number, boolean, string][] = [
  ['desktop 1920×1080', 1920, 1080, false, '16x9 hd'],
  ['laptop 1440×900', 1440, 900, false, '16x9 hd'],
  ['laptop 1280×720', 1280, 720, false, '16x9 hd'],
  ['tablet landscape 1024×768', 1024, 768, false, '4x3 hd'],
  ['tablet portrait 768×1024', 768, 1024, true, '3x4 hd'],
  ['iPad Air portrait 820×1180', 820, 1180, true, '3x4 hd'],
  ['phone 390×844', 390, 844, true, '9x16 lite'],
  ['phone 412×915', 412, 915, true, '9x16 lite'],
  ['small phone 360×640', 360, 640, true, '9x16 lite'],
  ['phone landscape 844×390', 844, 390, true, '16x9 lite'],
]
for (const [name, width, height, mobile, expected] of SCREENS) {
  test(`screen ${name} → ${expected}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile })
    const page = await context.newPage()
    await page.goto('/')
    const o = await overlay(page)
    expect(o.data).toBe(`full ${expected}`)
    expect(o.skip!.w).toBeGreaterThanOrEqual(44)
    expect(o.skip!.h).toBeGreaterThanOrEqual(44)
    await playing(page)
    expect((await overlay(page)).src).toBe(`intro-${expected.replace(' ', '-')}.webm`)
    await context.close()
  })
}

for (const [name, connection] of [
  ['Save-Data on', { saveData: true, effectiveType: '4g' }],
  ['3g connection', { saveData: false, effectiveType: '3g' }],
] as const) {
  test(`${name} → LITE on a big screen`, async ({ page }) => {
    await page.addInitScript((c) => Object.defineProperty(navigator, 'connection', { get: () => c }), connection)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    expect((await overlay(page)).data).toBe('full 16x9 lite')
  })
}

test('reduced motion: no intro, page shown straight away', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')
  await page.waitForLoadState('load')
  expect((await overlay(page)).present).toBe(false)
  await expect(page.locator('h1')).toBeVisible()
  await context.close()
})

test('Skip button: fades out to the page and starts the hero', async ({ page }) => {
  await page.goto('/')
  await playing(page)
  const t0 = Date.now()
  await page.getByRole('button', { name: 'Skip intro' }).click()
  await gone(page, 2000)
  expect(Date.now() - t0).toBeLessThan(1500)
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
  await page.mouse.move(700, 400)
  await page.mouse.wheel(0, 900)
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(100) // scrolling works again
  await expect.poll(() => page.locator('.hero-fade').first().evaluate((e) => getComputedStyle(e).opacity), { timeout: 4000 }).toBe('1')
})

test('Esc key skips', async ({ page }) => {
  await page.goto('/')
  await playing(page)
  await page.keyboard.press('Escape')
  await gone(page, 2000)
})

test('autoplay blocked: poster (final frame) shows ~0.8 s, then fades to the page', async ({ baseURL }) => {
    // Its own Edge, with autoplay refused even when muted (like iOS Low Power Mode).
    const browser = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=user-gesture-required'] })
    const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 900 } })
    // Timed in the page, from the moment the intro appears to the moment it is removed.
    await page.addInitScript(() => {
      const log = ((window as any).__intro = { mount: 0, gone: 0 })
      new MutationObserver(() => {
        const el = document.querySelector('[data-intro]')
        if (el && !log.mount) log.mount = performance.now()
        if (!el && log.mount && !log.gone) log.gone = performance.now()
      }).observe(document, { childList: true, subtree: true })
    })
    await page.goto('/')
    const o = await overlay(page)
    expect(o.present).toBe(true)
    expect(o.poster).toBe('/intro/poster-16x9.jpg')
    await page.waitForTimeout(500)
    const mid = await overlay(page)
    expect(mid.present).toBe(true)
    expect(mid.paused).toBe(true)
    await gone(page, 4000)
    const took = await page.evaluate(() => (window as any).__intro.gone - (window as any).__intro.mount)
    expect(took).toBeGreaterThan(800 + 600 - 100) // poster hold + fade
    expect(took).toBeLessThan(2500)
    await browser.close()
})

test('video never starts (stalled network): page shown after ~1.5 s', async ({ page }) => {
  await page.route(/\/intro\/.*\.(webm|mp4)$/, () => {}) // never answers
  const t0 = Date.now()
  await page.goto('/')
  expect((await overlay(page)).present).toBe(true)
  await gone(page, 5000)
  const took = Date.now() - t0
  expect(took).toBeGreaterThan(1400)
  expect(took).toBeLessThan(3500)
})

test('video files missing (404): page shown straight away', async ({ page }) => {
  await page.route(/\/intro\/.*\.(webm|mp4)$/, (route) => route.fulfill({ status: 404, body: '' }))
  const t0 = Date.now()
  await page.goto('/')
  await gone(page, 5000)
  expect(Date.now() - t0).toBeLessThan(3000)
})

test('no variant swap on rotate', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await page.goto('/')
  await playing(page)
  const before = await overlay(page)
  await page.setViewportSize({ width: 844, height: 390 })
  await page.waitForTimeout(600)
  const after = await overlay(page)
  expect(after.data).toBe(before.data)
  expect(after.src).toBe(before.src)
  expect(after.time).toBeGreaterThan(before.time) // still playing, not reloaded
  await context.close()
})

test('MP4 fallback when WebM is unavailable', async ({ page }) => {
  await page.route(/\/intro\/.*\.webm$/, (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto('/')
  await playing(page)
  expect((await overlay(page)).src).toBe('intro-16x9-hd.mp4')
})

// ---- Slow connections. The page loads at full speed; the film's own request is throttled. ----
async function throttledFilm(page: Page, kbps: number) {
  await page.addInitScript(() => {
    const log = ((window as any).__intro = { mount: 0, playing: 0, gone: 0, maxT: 0 })
    new MutationObserver(() => {
      const el = document.querySelector('[data-intro]')
      if (el && !log.mount) {
        log.mount = performance.now()
        const v = el.querySelector('video')!
        v.addEventListener('playing', () => (log.playing ||= performance.now()))
        v.addEventListener('timeupdate', () => (log.maxT = Math.max(log.maxT, v.currentTime)))
      }
      if (!el && log.mount && !log.gone) log.gone = performance.now()
    }).observe(document, { childList: true, subtree: true })
  })
  const cdp = await page.context().newCDPSession(page)
  let throttled = false
  await page.route(/\/intro\/.*\.(webm|mp4)$/, async (route) => {
    if (!throttled) {
      throttled = true
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (kbps * 1000) / 8, uploadThroughput: 50_000 })
    }
    await route.continue()
  })
  return async () => {
    await page.waitForFunction(() => (window as any).__intro.gone, null, { timeout: 20_000 })
    const r = await page.evaluate(() => (window as any).__intro)
    return { playingAt: r.playing ? (r.playing - r.mount) / 1000 : null, goneAt: (r.gone - r.mount) / 1000, played: r.maxT }
  }
}

test('slow phone: film data arriving → waits past 1.5 s (up to 3 s) instead of skipping', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const result = await throttledFilm(page, 120)
  await page.goto('/')
  await page.waitForFunction(() => (window as any).__intro.mount)
  await page.waitForTimeout(1900)
  expect((await overlay(page)).present).toBe(true) // the old rule would have skipped at 1.5 s
  const r = await result()
  expect(r.playingAt === null || r.playingAt <= 3.1).toBe(true) // plays only if it can start by 3 s
  expect(r.goneAt).toBeLessThan(8) // and never holds the site for long
  await context.close()
})

test('connection too slow to keep up: film that falls 3 s behind hands over to the site', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const result = await throttledFilm(page, 500)
  await page.goto('/')
  const r = await result()
  expect(r.playingAt).not.toBeNull()
  expect(r.played).toBeLessThan(8.5) // it did not limp on to the end (34 s before this rule)
  expect(r.goneAt).toBeLessThan(8)
  await context.close()
})
