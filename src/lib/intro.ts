import { useEffect, useState } from 'react'
import { prefersReducedMotion } from './usePrefersReducedMotion'

/**
 * The intro film (components/IntroVideo.tsx). It plays once per browser tab session: the full
 * cut on a first visit, the 2.5 s short cut for anyone back within 7 days, nothing on later page
 * loads in the same tab or with reduced motion. Anything that should start as the page is
 * revealed (the hero headline) waits for `onIntroDone` instead of guessing the intro's length.
 */
const SEEN_KEY = 'bh-intro-seen' // sessionStorage: already played in this tab
const LAST_KEY = 'bh-intro-last' // localStorage: when an intro last played (ms)
const RETURN_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
let done = false
const listeners = new Set<() => void>()

export type IntroCut = 'full' | 'short'

/** Which cut to play on this page load, or null for none. */
export function introCut(): IntroCut | null {
  if (prefersReducedMotion()) return null
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return null
  } catch {
    // Storage blocked: fall through and play.
  }
  try {
    const last = Number(localStorage.getItem(LAST_KEY))
    if (last && Date.now() - last < RETURN_WINDOW_MS) return 'short'
  } catch {
    // Storage blocked: treat as a first visit.
  }
  return 'full'
}

export type IntroAspect = '16x9' | '4x3' | '3x4' | '9x16'
export type IntroTier = 'hd' | 'lite'

/**
 * The film is rendered in four shapes (re-composed, not cropped) and two sizes. The shape follows
 * the window's ratio; LITE (720 px on the short side) is for Save-Data, 2g/3g, or small screens.
 */
export function pickIntroVariant(width = window.innerWidth, height = window.innerHeight): { aspect: IntroAspect; tier: IntroTier } {
  const r = width / height
  const aspect: IntroAspect = r >= 1.55 ? '16x9' : r >= 1.1 ? '4x3' : r >= 0.68 ? '3x4' : '9x16'
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  const slow = !!connection?.saveData || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? '')
  const tier: IntroTier = slow || Math.min(width, height) <= 480 ? 'lite' : 'hd'
  return { aspect, tier }
}

export type IntroFormat = 'webm' | 'mp4'

const CODECS: Record<IntroFormat, string> = {
  webm: 'video/webm; codecs="vp09.00.40.08"',
  mp4: 'video/mp4; codecs="avc1.640028"',
}
const HD_SIZE: Record<IntroAspect, [number, number]> = { '16x9': [1920, 1080], '4x3': [1440, 1080], '3x4': [1080, 1440], '9x16': [1080, 1920] }

/**
 * Asks the browser which of the film's two formats it plays best. The one it decodes smoothly and
 * power-efficiently (in hardware) goes first — WebM on a tie, as it is smaller. That matters on
 * laptops that decode H.264 in hardware but VP9 only in software, where a 1080p60 WebM stutters
 * and drains the battery. If neither HD file would play smoothly, the LITE size is used. Falls
 * back to WebM-then-MP4 if the browser can't say within 300 ms.
 */
export function pickIntroFormats(aspect: IntroAspect, tier: IntroTier): Promise<{ tier: IntroTier; order: IntroFormat[] }> {
  const fallback = { tier, order: ['webm', 'mp4'] as IntroFormat[] }
  const mc = navigator.mediaCapabilities
  if (!mc?.decodingInfo) return Promise.resolve(fallback)
  const ask = (format: IntroFormat, t: IntroTier) => {
    const [w, h] = HD_SIZE[aspect]
    const scale = t === 'hd' ? 1 : 720 / Math.min(w, h)
    return mc
      .decodingInfo({
        type: 'file',
        video: { contentType: CODECS[format], width: Math.round(w * scale), height: Math.round(h * scale), bitrate: t === 'hd' ? 3_200_000 : 1_400_000, framerate: 60 },
      })
      .catch(() => null)
  }
  const score = (r: MediaCapabilitiesDecodingInfo | null) => (r?.supported ? 1 : 0) + (r?.smooth ? 2 : 0) + (r?.powerEfficient ? 4 : 0)
  const answer = (async () => {
    let t = tier
    let [webm, mp4] = await Promise.all([ask('webm', t), ask('mp4', t)])
    if (t === 'hd' && webm && mp4 && !webm.smooth && !mp4.smooth) {
      t = 'lite'
      ;[webm, mp4] = await Promise.all([ask('webm', t), ask('mp4', t)])
    }
    return { tier: t, order: (score(mp4) > score(webm) ? ['mp4', 'webm'] : ['webm', 'mp4']) as IntroFormat[] }
  })()
  return Promise.race([answer, new Promise<typeof fallback>((resolve) => setTimeout(() => resolve(fallback), 300))])
}

export function markIntroDone() {
  if (done) return
  done = true
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode etc.: the intro simply plays again next time.
  }
  listeners.forEach((listener) => listener())
  listeners.clear()
}

/** Remembers that an intro played, so a return visit within 7 days gets the short cut. */
export function markIntroPlayed() {
  try {
    localStorage.setItem(LAST_KEY, String(Date.now()))
  } catch {
    // Storage blocked: the next visit counts as a first visit.
  }
}

/** True once the intro has revealed the page (or straight away when none plays). Components hold
 * their looping animations until then: behind the film they'd only compete with it for frames. */
export function useIntroDone() {
  const [isDone, setIsDone] = useState(done)
  useEffect(() => onIntroDone(() => setIsDone(true)), [])
  return isDone
}

/** Runs `callback` once the intro has revealed the page (straight away if it already has). */
export function onIntroDone(callback: () => void) {
  if (done) {
    callback()
    return () => {}
  }
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}
