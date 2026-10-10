/**
 * Per-aspect composition. Every shape is re-composed, not cropped: wide frames spread the corridor
 * and card wall sideways (and put the "Under one roof" headline beside the house on 16:9); tall
 * frames stack vertically with the headline above. All positions are px offsets from the frame
 * centre, derived from the frame size; text and logo stay inside the central safe zone (outer 10%
 * of each side kept clear).
 */
import { CARDS } from './assets'

export type Aspect = '16x9' | '4x3' | '3x4' | '9x16'

export function aspectOf(width: number, height: number): Aspect {
  const r = width / height
  if (r >= 1.55) return '16x9'
  if (r >= 1.1) return '4x3'
  if (r >= 0.68) return '3x4'
  return '9x16'
}

type Pt = [number, number]
export type CorridorSlot = { x: number; y: number; rx: number; ry: number }

export type Layout = {
  aspect: Aspect
  W: number
  H: number
  minDim: number
  tall: boolean
  P: number // CSS perspective
  door: { w: number; h: number }
  corridor: { pw: number; D: number; Z0: number; slots: CorridorSlot[] }
  word: { y: number; size: number }
  wall: { RX: number; RY: number; farRel: number }
  card: number // wall card size (square)
  house: { cells: Pt[]; tile: number; roof: { left: Pt; peak: Pt; right: Pt }; keystone: Pt; center: Pt }
  brandsHeadline: { x: number; y: number; size: number }
  roofHeadline: { x: number; y: number; size: number }
  logo: { w: number; y: number }
  tagline: { y: number; size: number }
}

/** 4 columns × 5 rows of tiles (20 = one per card) with a gabled roofline over them. */
function makeHouse(tile: number, gap: number, cx: number, cy: number) {
  const pitch = tile + gap
  const bodyW = 4 * pitch - gap
  const bodyH = 5 * pitch - gap
  const top = cy - bodyH / 2
  const grid: { r: number; c: number; p: Pt }[] = []
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) grid.push({ r, c, p: [cx - bodyW / 2 + tile / 2 + c * pitch, top + tile / 2 + r * pitch] })
  // Checkerboard of photos and logos; the hero photo (card 0) takes the bottom row, like a door.
  const photoCells = grid.filter((g) => (g.r + g.c) % 2 === 0 && !(g.r === 4 && g.c === 2))
  const logoCells = grid.filter((g) => (g.r + g.c) % 2 === 1)
  const door = grid.find((g) => g.r === 4 && g.c === 2)!
  let pi = 0
  let li = 0
  const cells: Pt[] = CARDS.map((card, i) => (i === 0 ? door.p : card.kind === 'photo' ? photoCells[pi++].p : logoCells[li++].p))
  const overhang = pitch * 0.42
  const half = bodyW / 2 + overhang
  const rise = 0.62 * half
  const eaveY = top - gap * 0.5
  const peak: Pt = [cx, eaveY - rise]
  return {
    cells,
    tile,
    roof: { left: [cx - half, eaveY] as Pt, peak, right: [cx + half, eaveY] as Pt },
    keystone: [cx, peak[1] + rise * 0.42] as Pt,
    center: [cx, cy] as Pt,
  }
}

function corridorSlots(tall: boolean, offset: number, jitter: number, tilt: number): CorridorSlot[] {
  return Array.from({ length: 10 }, (_, i) => {
    if (i === 9) return { x: 0, y: 0, rx: 0, ry: 0 } // the hero photo, dead ahead
    const side = i % 2 === 0 ? -1 : 1
    const j = ((i % 3) - 1) * jitter
    return tall ? { x: j, y: side * offset, rx: -side * tilt, ry: 0 } : { x: side * offset, y: j, rx: 0, ry: -side * tilt }
  })
}

export function makeLayout(W: number, H: number): Layout {
  const aspect = aspectOf(W, H)
  const minDim = Math.min(W, H)
  const tall = H > W
  const base = { aspect, W, H, minDim, tall }
  const P = Math.round(0.62 * Math.hypot(W, H))
  switch (aspect) {
    case '16x9':
      return {
        ...base,
        P,
        door: { w: 410, h: 860 },
        corridor: { pw: 880, D: 520, Z0: P + 600, slots: corridorSlots(false, 560, 28, 20) },
        word: { y: 0.3 * H, size: 118 },
        wall: { RX: 2800, RY: 1250, farRel: -240 },
        card: 300,
        house: makeHouse(108, 10, -320, 70),
        brandsHeadline: { x: 0, y: 0.33 * H, size: 96 },
        roofHeadline: { x: 380, y: 0, size: 96 },
        logo: { w: 900, y: -40 },
        tagline: { y: 92, size: 56 },
      }
    case '4x3':
      return {
        ...base,
        P,
        door: { w: 400, h: 860 },
        corridor: { pw: 760, D: 500, Z0: P + 600, slots: corridorSlots(false, 410, 26, 20) },
        word: { y: 0.3 * H, size: 112 },
        wall: { RX: 2150, RY: 1250, farRel: -220 },
        card: 280,
        house: makeHouse(88, 8, 0, 0),
        brandsHeadline: { x: 0, y: 0.33 * H, size: 88 },
        roofHeadline: { x: 0, y: 330, size: 86 },
        logo: { w: 880, y: -40 },
        tagline: { y: 88, size: 54 },
      }
    case '3x4':
      return {
        ...base,
        P,
        door: { w: 420, h: 1000 },
        corridor: { pw: 720, D: 520, Z0: P + 600, slots: corridorSlots(true, 300, 30, 16) },
        word: { y: 0, size: 112 },
        wall: { RX: 1500, RY: 1750, farRel: -260 },
        card: 280,
        house: makeHouse(132, 12, 0, 150),
        brandsHeadline: { x: 0, y: -0.36 * H, size: 92 },
        roofHeadline: { x: 0, y: -525, size: 90 },
        logo: { w: 860, y: -0.12 * H },
        tagline: { y: -0.12 * H + 126, size: 58 },
      }
    case '9x16':
      return {
        ...base,
        P,
        door: { w: 470, h: 1180 },
        corridor: { pw: 820, D: 540, Z0: P + 600, slots: corridorSlots(true, 420, 36, 16) },
        word: { y: 0, size: 120 },
        wall: { RX: 1450, RY: 2300, farRel: -300 },
        card: 300,
        house: makeHouse(176, 14, 0, 190),
        brandsHeadline: { x: 0, y: -0.36 * H, size: 100 },
        roofHeadline: { x: 0, y: -700, size: 98 },
        logo: { w: 860, y: -0.14 * H },
        tagline: { y: -0.14 * H + 128, size: 56 },
      }
  }
}

/** Deterministic pseudo-random in [0,1) for wall placement. */
export function hash(i: number, salt = 0) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
