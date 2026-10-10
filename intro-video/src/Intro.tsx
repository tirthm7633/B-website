import { CameraMotionBlur } from '@remotion/motion-blur'
import { useMemo, type CSSProperties, type ReactElement } from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { CARDS, CORRIDOR, WORDS, type CardDef } from './assets'
import { Kinetic } from './Kinetic'
import { hash, makeLayout, type Layout } from './layout'
import { B, BG_RGB, C, FONT } from './theme'

export type Variant = 'full' | 'short'
export type IntroProps = { variant: Variant }

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const LOGO_W = 828
const LOGO_H = 200
const LOGO_CROP = 131 // rows of the logo PNG with BUILDCON + HOUSE; the tagline is typed separately
const O_X = 0.7883 // centre of the logo's blue O, as fractions of the full PNG
const O_Y = 0.272
const O_D = 0.1147 // the O's outer diameter as a fraction of the logo width
const GRADE = 'saturate(0.72) contrast(1.06) brightness(0.86)' // one cool, deep-black grade for every photo
const O_PATH = 'M32 3a29 29 0 1 0 0 58 29 29 0 0 0 0-58Zm0 22.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z' // public/favicon.svg

// ─────────────────────────────── camera ───────────────────────────────

function heroRel(L: Layout) {
  // Distance at which the hero photo fills ~72% (wide) / ~86% (tall) of the frame width.
  const s = ((L.tall ? 0.86 : 0.72) * L.W) / L.corridor.pw
  return L.P * (1 - 1 / s)
}

// Corridor pacing: photo i passes the lens at PASS0 + i * PASS_EVERY, then the camera eases into
// the hero photo (matching speed, so there is no jolt) and holds.
const PASS0 = 74
const PASS_EVERY = 12.5
export const passFrame = (i: number) => PASS0 + i * PASS_EVERY
function corridorZ(L: Layout, f: number, camEnd: number) {
  const { Z0, D } = L.corridor
  const lastPass = passFrame(8)
  if (f <= PASS0) return interpolate(f, [B.spaces, PASS0], [L.P + 200, Z0], { ...clamp, easing: Easing.in(Easing.quad) })
  if (f <= lastPass) return Z0 + ((f - PASS0) / PASS_EVERY) * D
  // Cubic Hermite from the last pass (speed D / PASS_EVERY) to a stop on the hero at frame 196.
  const T = 196 - lastPass
  const t = Math.min(1, (f - lastPass) / T)
  const p0 = Z0 + 8 * D
  const v0 = (D / PASS_EVERY) * T
  return (2 * t ** 3 - 3 * t ** 2 + 1) * p0 + (t ** 3 - 2 * t ** 2 + t) * v0 + (-2 * t ** 3 + 3 * t ** 2) * camEnd
}

/** Camera as a world transform: z (dolly), plus a small arc around the brand wall's centre. */
function camera(L: Layout, variant: Variant, f: number, fps: number) {
  const zA = -(L.corridor.Z0 + 9 * L.corridor.D) // the hero photo / wall plane
  if (variant === 'short') {
    const z = f < 8 ? interpolate(f, [0, 8], [0, 30], clamp) : interpolate(f, [8, 44], [30, L.P * 0.82], { ...clamp, easing: Easing.bezier(0.55, 0, 0.35, 1) })
    return { z, zA, ry: 0, rx: 0, roll: 0 }
  }
  const hero = heroRel(L)
  const camEnd = hero - zA
  let z: number
  if (f < B.spaces) {
    z = f < 20 ? interpolate(f, [0, 20], [0, 40], clamp) : interpolate(f, [20, B.spaces], [40, L.P + 200], { ...clamp, easing: Easing.bezier(0.6, 0, 0.7, 0.75) })
  } else if (f < 196) {
    z = corridorZ(L, f, camEnd)
  } else {
    // Micro-hold on the hero photo, then pull back (beat 3) and settle at the house plane (beat 4).
    const hold = interpolate(f, [196, B.brands], [0, 10], clamp)
    const pull = spring({ frame: f - B.brands, fps, config: { damping: 19, stiffness: 62, mass: 0.9 } })
    const drift = interpolate(f, [B.brands + 40, B.roof], [0, 1], clamp)
    const settle = spring({ frame: f - B.roof, fps, config: { damping: 18, stiffness: 70 } })
    const rel = mix(mix(hero + hold, L.wall.farRel - 60 * drift, pull), 0, settle)
    z = rel - zA
  }
  const settle = spring({ frame: f - B.roof, fps, config: { damping: 18, stiffness: 70 } })
  const arc = interpolate(f, [B.brands, 250, B.roof], [0, -6, 5], { ...clamp, easing: Easing.inOut(Easing.sin) }) * (1 - settle)
  const tilt = interpolate(f, [B.brands, 260, B.roof], [0, 2, 1], clamp) * (1 - settle)
  const roll = f > 20 && f < 200 ? Math.sin((f - 20) / 34) * 0.8 : 0
  return { z, zA, ry: arc, rx: tilt, roll }
}

// ─────────────────────────────── pieces ───────────────────────────────

const glassFrame = (k = 1): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  borderRadius: 14,
  border: `1px solid rgba(127,163,199,${0.4 * k})`,
  background: `linear-gradient(150deg, rgba(255,255,255,${0.07 * k}), rgba(255,255,255,${0.012 * k}) 55%), rgba(12,15,19,${0.8 * k})`,
  boxShadow: `0 0 34px rgba(95,125,156,${0.18 * k}), 0 24px 60px rgba(${BG_RGB},${0.6 * k}), inset 0 1px 0 rgba(255,255,255,${0.08 * k})`,
  overflow: 'hidden',
})

function PhotoFill({ src, position, zoom = 1, sheen = -1 }: { src: string; position?: string; zoom?: number; sheen?: number }) {
  return (
    <div style={{ position: 'absolute', inset: 8, borderRadius: 9, overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position ?? 'center', filter: GRADE, transform: `scale(${zoom})` }} />
      {/* cool cast + deeper blacks so every photo reads as one set */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(43,63,87,0.2)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(${BG_RGB},0.45), rgba(${BG_RGB},0) 45%)` }} />
      {/* the blue key light raking across the glass */}
      {sheen > -1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(110deg, transparent ${(sheen - 0.14) * 100}%, rgba(93,155,205,0.22) ${(sheen - 0.03) * 100}%, rgba(214,230,246,0.28) ${sheen * 100}%, transparent ${(sheen + 0.12) * 100}%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  )
}

function CardFace({ card }: { card: CardDef }) {
  if (card.kind === 'photo') return <PhotoFill src={card.photo.src} position={card.photo.position} />
  const light = card.brand.plate === 'light'
  return (
    <div
      style={{
        position: 'absolute',
        inset: 10,
        borderRadius: 9,
        background: light ? '#EDEFF2' : '#0C0F13',
        border: light ? 'none' : '1px solid rgba(127,163,199,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Img src={staticFile(card.brand.src)} style={{ maxWidth: '72%', maxHeight: '52%', objectFit: 'contain' }} />
    </div>
  )
}

function Doors({ L, f, variant }: { L: Layout; f: number; variant: Variant }) {
  const { fps } = useVideoConfig()
  const { w, h } = L.door
  const open = spring({ frame: f - (variant === 'short' ? 2 : 14), fps, config: variant === 'short' ? { damping: 18, stiffness: 120 } : { damping: 17, stiffness: 62, mass: 1 } })
  const angle = 104 * open
  const crack = interpolate(f, [0, variant === 'short' ? 3 : 14], [2, 7], clamp)
  const spill = interpolate(open, [0, 0.6], [0.35, 1], clamp)
  const door = (side: -1 | 1): CSSProperties => ({
    position: 'absolute',
    top: -h / 2,
    left: side < 0 ? -w - crack / 2 : crack / 2,
    width: w,
    height: h,
    transformOrigin: side < 0 ? '0% 50%' : '100% 50%',
    transform: `rotateY(${-side * angle}deg)`,
    borderRadius: 6,
    overflow: 'hidden',
    boxShadow: `0 30px 80px rgba(${BG_RGB},0.8)`,
    backfaceVisibility: 'visible',
  })
  const face = (side: -1 | 1) => (
    <>
      {/* book-matched statuario: the right leaf is the mirror image of the left */}
      <Img
        src={staticFile('photos/stock/marble-statuario.jpg')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: side < 0 ? '70% 50%' : '70% 50%', transform: side > 0 ? 'scaleX(-1)' : 'none', filter: 'grayscale(0.4) brightness(0.5) contrast(1.15)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(43,63,87,0.35), rgba(5,6,7,0.55))', mixBlendMode: 'multiply' }} />
      {/* blue light from the seam washing over the inner edge, stronger as the leaves part */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${side < 0 ? 270 : 90}deg, rgba(93,155,205,${0.55 * spill}) 0%, rgba(93,155,205,${0.12 * spill}) 22%, transparent 55%)`, mixBlendMode: 'screen' }} />
      {/* polished edge + slim chrome pull */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, [side < 0 ? 'right' : 'left']: 0, width: 3, background: 'linear-gradient(180deg, #9aa3ad, #e8ecf1 50%, #9aa3ad)' } as CSSProperties} />
      <div style={{ position: 'absolute', top: '38%', height: '24%', [side < 0 ? 'right' : 'left']: 28, width: 6, borderRadius: 3, background: 'linear-gradient(90deg, #6f7680, #e9edf2 50%, #6f7680)', boxShadow: '0 0 10px rgba(127,163,199,0.4)' } as CSSProperties} />
    </>
  )
  const seamGlow = interpolate(f, [0, 6, 18], [0.85, 1, 1], clamp) * (1 - interpolate(open, [0.35, 0.8], [0, 1], clamp))
  return (
    <div style={{ position: 'absolute', transformStyle: 'preserve-3d' }}>
      {/* stone portal around the doorway */}
      <div style={{ position: 'absolute', left: -w - 26, top: -h / 2 - 26, width: 2 * w + 52, height: h + 52, borderRadius: 10, border: '2px solid rgba(154,163,173,0.45)', boxShadow: `0 0 60px rgba(93,155,205,${0.18 * spill}), inset 0 0 40px rgba(${BG_RGB},0.9)` }} />
      <div style={door(-1)}>{face(-1)}</div>
      <div style={door(1)}>{face(1)}</div>
      {/* the seam of blue light between the closed leaves (frame 0) */}
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: -h / 2,
          width: 4,
          height: h,
          background: 'linear-gradient(180deg, rgba(214,230,246,0), #ffffff 18%, #ffffff 82%, rgba(214,230,246,0))',
          boxShadow: `0 0 26px 6px rgba(93,155,205,${0.9 * seamGlow}), 0 0 90px 24px rgba(93,155,205,${0.45 * seamGlow})`,
          opacity: seamGlow,
        }}
      />
    </div>
  )
}

/** The 3D world: doors, corridor photos, and the 20 wall cards that form the house. */
function Stage({ L, variant }: { L: Layout; variant: Variant }) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const cam = camera(L, variant, f, fps)
  const full = variant === 'full'
  const { pw, D, Z0, slots } = L.corridor
  const ph = pw / 1.5

  const wall = useMemo(
    () =>
      CARDS.map((card, i) => {
        if (i === 0) return { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, drift: 0 }
        const a = i * 2.39996 + 0.6
        const rf = 0.42 + 0.58 * Math.sqrt(i / 19)
        const near = card.kind === 'brand' && i % 4 === 1
        const x = Math.cos(a) * rf * (L.wall.RX / 2)
        const y = Math.sin(a) * rf * (L.wall.RY / 2)
        return {
          x,
          y,
          z: near ? 180 + hash(i, 2) * 200 : -120 - hash(i, 1) * 820,
          s: 0.85 + hash(i, 3) * 0.35,
          rx: (-y / (L.wall.RY / 2)) * 9,
          ry: (x / (L.wall.RX / 2)) * 14,
          drift: near ? (x < 0 ? 1 : -1) * L.W * 0.45 : 0,
        }
      }),
    [L],
  )
  const collapseRank = useMemo(() => {
    const [kx, ky] = L.house.keystone
    const order = L.house.cells.map((c, i) => ({ i, d: Math.hypot(c[0] - kx, c[1] - ky) })).sort((a, b) => b.d - a.d)
    const rank: number[] = []
    order.forEach((o, r) => (rank[o.i] = r))
    return rank
  }, [L])

  const items: ReactElement[] = []
  // Doors (world z = 0) until the camera has flown through them.
  if (cam.z < L.P - 30) items.push(<Doors key="doors" L={L} f={f} variant={variant} />)

  if (full) {
    // Corridor photos 0–8 (the 10th is wall card 0).
    for (let i = 0; i < 9; i++) {
      const s = slots[i]
      const z = -(Z0 + i * D)
      const eff = z + cam.z
      if (eff > L.P - 40 || eff < -7200) continue
      const fade = interpolate(eff, [-7000, -4800], [0, 1], clamp) * interpolate(f, [B.brands - 10, B.brands + 6], [1, 0], clamp)
      const zoom = interpolate(eff, [-3200, L.P * 0.7], [1, 1.06], clamp)
      const sheen = interpolate(eff, [-1600, L.P * 0.6], [-0.2, 1.25], clamp)
      items.push(
        <div
          key={`c${i}`}
          style={{
            position: 'absolute',
            left: -pw / 2,
            top: -ph / 2,
            width: pw,
            height: ph,
            opacity: fade,
            transform: `translate3d(${s.x}px, ${s.y}px, ${z}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`,
          }}
        >
          <div style={glassFrame()}>
            <PhotoFill src={CORRIDOR[i].src} position={CORRIDOR[i].position} zoom={zoom} sheen={sheen} />
          </div>
        </div>,
      )
    }
  }

  // Wall cards → house → collapse into the keystone O.
  const cardsVisible = full || false
  if (cardsVisible) {
    CARDS.forEach((card, i) => {
      const W0 = wall[i]
      const [hx, hy] = L.house.cells[i]
      const appear = i === 0 ? 1 : interpolate(f, [198, 216], [0, 1], clamp)
      const drift = W0.drift * interpolate(f, [B.brands, B.roof + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) })
      const q = spring({ frame: f - (B.roof + 2 + i * 1.9), fps, config: { damping: 15, stiffness: 115, mass: 0.85 } })
      const k = spring({ frame: f - (B.keystone + collapseRank[i] * 0.9), fps, config: { damping: 22, stiffness: 150 } })
      const [kx, ky] = L.house.keystone
      const x = mix(mix(W0.x + drift, hx, q), kx, k)
      const y = mix(mix(W0.y, hy, q), ky, k)
      const zRel = mix(W0.z, 0, q)
      const eff = cam.z + cam.zA + zRel
      if (eff > L.P - 40) return
      const depthFade = i === 0 ? interpolate(eff, [-7000, -4800], [0, 1], clamp) : 1
      const opacity = appear * depthFade * interpolate(k, [0.55, 0.92], [1, 0], clamp)
      if (opacity <= 0.002) return
      const isHero = i === 0
      const w = isHero ? mix(pw, L.house.tile, q) : L.card
      const h = isHero ? mix(ph, L.house.tile, q) : L.card
      const s = (isHero ? 1 : mix(W0.s, L.house.tile / L.card, q)) * (1 - k)
      const blur = i === 0 ? 0 : Math.max(0, Math.min(2.4, (-(eff) - 520) / 260)) * (1 - q)
      const heroZoom = isHero ? interpolate(f, [150, 204], [1, 1.06], clamp) : 1
      items.push(
        <div
          key={`k${i}`}
          style={{
            position: 'absolute',
            left: -w / 2,
            top: -h / 2,
            width: w,
            height: h,
            opacity,
            filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
            transform: `translate3d(${x}px, ${y}px, ${cam.zA + zRel}px) rotateX(${mix(W0.rx, 0, q)}deg) rotateY(${mix(W0.ry, 0, q)}deg) scale(${s})`,
          }}
        >
          <div style={glassFrame()}>{card.kind === 'photo' && isHero ? <PhotoFill src={card.photo.src} position={card.photo.position} zoom={heroZoom} /> : <CardFace card={card} />}</div>
        </div>,
      )
    })
  }

  return (
    <AbsoluteFill style={{ perspective: L.P, perspectiveOrigin: '50% 50%' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transformStyle: 'preserve-3d',
          transform: `rotateZ(${cam.roll}deg) translateZ(${cam.z}px) translateZ(${cam.zA}px) rotateY(${cam.ry}deg) rotateX(${cam.rx}deg) translateZ(${-cam.zA}px)`,
        }}
      >
        {items}
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────────── 2D layers ───────────────────────────────

function Backdrop({ L, variant }: { L: Layout; variant: Variant }) {
  const f = useCurrentFrame()
  const full = variant === 'full'
  // Blue key light from the doorway (beats 1–2), then the brand accent glow behind the focal point.
  const blue = full ? interpolate(f, [0, 30, 70, 200, 230], [0.28, 0.55, 0.42, 0.34, 0], clamp) : interpolate(f, [0, 24, 50], [0.3, 0.55, 0], clamp)
  const accent = full ? interpolate(f, [200, 240, 340, 362, 420, 510], [0, 0.32, 0.36, 0.6, 0.5, 0.46], clamp) : interpolate(f, [30, 70, 150], [0, 0.5, 0.46], clamp)
  const focusY = full ? interpolate(f, [B.roof, 340, B.keystone, 420], [0, L.house.keystone[1], L.house.keystone[1], L.logo.y], clamp) : L.logo.y
  const focusX = full ? interpolate(f, [B.roof, 340, B.keystone + 30, 420], [0, L.house.center[0], L.house.center[0], 0], clamp) : 0
  const r1 = L.tall ? 24 : 20
  const r2 = L.tall ? 50 : 44
  return (
    <>
      <AbsoluteFill style={{ background: C.bg }} />
      <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: '50% 35%', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-12%',
            width: '320%',
            height: '90%',
            transform: `translateX(-50%) rotateX(77deg) translateY(${interpolate(f, [0, 510], [0, -120])}px)`,
            transformOrigin: '50% 100%',
            backgroundImage: `repeating-linear-gradient(90deg, ${C.muted} 0 1px, transparent 1px 96px), repeating-linear-gradient(0deg, ${C.muted} 0 1px, transparent 1px 96px)`,
            opacity: 0.032,
            maskImage: 'linear-gradient(to top, black 30%, transparent 92%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 92%)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(93,155,205,${blue}) 0%, rgba(93,155,205,${blue * 0.35}) ${r1}%, rgba(93,155,205,0) ${r2}%)` }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at calc(50% + ${focusX}px) calc(50% + ${focusY}px), rgba(95,125,156,${accent}) 0%, rgba(95,125,156,${accent * 0.38}) ${r1 - 4}%, rgba(95,125,156,0) ${r2 - 4}%)`,
        }}
      />
    </>
  )
}

function Overlays({ L, variant, flashOnly = false }: { L: Layout; variant: Variant; flashOnly?: boolean }) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { W, H } = L
  const full = variant === 'full'

  // Timings: the short cut runs the same keystone choreography, compressed and earlier.
  const T = full
    ? { oAppear: 384, flatten: [392, 410], fly: [400, 420], reveal: [421, 445], oFade: [442, 454], sweep: [436, 460], tagline: 444, push: [404, 476], roofDraw: [338, 362], flash: 358 }
    : { oAppear: 22, flatten: [0, 0], fly: [40, 60], reveal: [61, 85], oFade: [82, 94], sweep: [78, 102], tagline: 84, push: [58, 130], roofDraw: [0, 0], flash: -99 }

  const logoH = (L.logo.w * LOGO_CROP) / LOGO_W
  const logoFullH = (L.logo.w * LOGO_H) / LOGO_W
  const logoTop = L.logo.y - logoH / 2
  const slot: [number, number] = [-L.logo.w / 2 + O_X * L.logo.w, logoTop + O_Y * logoFullH]
  const slotD = O_D * L.logo.w
  const start: [number, number] = full ? L.house.keystone : [0, 0]
  const startD = full ? L.house.tile * 0.95 : 0.26 * L.minDim

  // Roofline (beat 4) → flattens onto the logo's centre line (beat 5).
  const draw = full ? interpolate(f, T.roofDraw, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0
  const flat = full ? interpolate(f, T.flatten, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0
  const R = L.house.roof
  const pts = [
    [mix(R.left[0], -L.logo.w / 2, flat), mix(R.left[1], L.logo.y, flat)],
    [mix(R.peak[0], 0, flat), mix(R.peak[1], L.logo.y, flat)],
    [mix(R.right[0], L.logo.w / 2, flat), mix(R.right[1], L.logo.y, flat)],
  ]
  const len = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) + Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1])
  const strokeOpacity = interpolate(f, [T.reveal[0], T.reveal[1]], [1, 0], clamp)

  // Keystone O: grows at the keystone (or from the door light), flies to its slot, drops in.
  const grow = spring({ frame: f - T.oAppear, fps, config: { damping: 14, stiffness: 120 } })
  // No positional overshoot (it would misalign with the logo's own O); the landing is sold by a
  // short scale pulse instead — the keystone dropping into place.
  const fly = interpolate(f, T.fly, [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.25, 1) })
  const drop = interpolate(f, [T.fly[1] - 2, T.fly[1] + 2, T.fly[1] + 9], [1, 1.14, 1], clamp)
  const ox = mix(start[0], slot[0], fly)
  const oy = mix(start[1], slot[1], fly) - Math.sin(Math.min(1, fly) * Math.PI) * 0.06 * L.minDim
  const od = mix(startD, slotD, fly) * grow * drop
  const oOpacity = interpolate(f, T.oFade, [1, 0], clamp)
  const oSpin = (1 - grow) * -140 + (1 - fly) * 30

  const reveal = interpolate(f, T.reveal, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  const sweep = interpolate(f, T.sweep, [-0.4, 1.4], { ...clamp, easing: Easing.inOut(Easing.quad) })
  const push = 1 + 0.04 * interpolate(f, T.push, [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  const flash = interpolate(f, [T.flash, T.flash + 1, T.flash + 3, T.flash + 5], [0, 0.12, 0.05, 0], clamp) + interpolate(f, [T.fly[1] - 1, T.fly[1], T.fly[1] + 3], [0, 0.07, 0], clamp)

  // Beat 2 words: each category's word while its photos pass the lens.
  const wordWindows = useMemo(() => (full ? computeWordWindows() : []), [full])

  const at = (x: number, y: number, extra: CSSProperties = {}): CSSProperties => ({ position: 'absolute', left: W / 2 + x, top: H / 2 + y, ...extra })

  // The full-frame flash stays under the edge matte; everything else (text, logo, O) sits above it —
  // it is all inside the safe zone, so the matte would only dim it.
  if (flashOnly) return <AbsoluteFill style={{ background: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
  return (
    <>
      {full &&
        wordWindows.map((win, i) => (
          <div key={i} style={at(-W / 2, L.word.y - L.word.size / 2, { width: W })}>
            <Scrim f={f} from={win[0]} to={win[1]} width={L.word.size * 7.2} height={L.word.size * 2.4} />
            <Kinetic words={[{ text: WORDS[i], color: C.logoBlue }]} start={win[0]} end={win[1]} fontFamily={FONT.display} fontSize={L.word.size} />
          </div>
        ))}

      {full && (
        <>
          <div style={at(L.brandsHeadline.x - W / 2, L.brandsHeadline.y - L.brandsHeadline.size / 2, { width: W })}>
            <Scrim f={f} from={226} to={B.roof} width={L.brandsHeadline.size * 10} height={L.brandsHeadline.size * 2.6} />
            <Kinetic words={[{ text: 'World-class' }, { text: 'brands', accent: true }]} start={226} end={B.roof} fontFamily={FONT.display} fontSize={L.brandsHeadline.size} />
          </div>
          <div style={at(L.roofHeadline.x - W / 2, L.roofHeadline.y - L.roofHeadline.size / 2, { width: W })}>
            <Scrim f={f} from={318} to={B.keystone} width={L.roofHeadline.size * 8} height={L.roofHeadline.size * 2.6} />
            <Kinetic words={[{ text: 'Under' }, { text: 'one', accent: true }, { text: 'roof', accent: true }]} start={318} end={B.keystone} fontFamily={FONT.display} fontSize={L.roofHeadline.size} />
          </div>
        </>
      )}

      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {full && (
          <svg width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <path
              d={`M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]}`}
              fill="none"
              stroke={C.accentBright}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - draw)}
              opacity={draw > 0 ? strokeOpacity : 0}
              style={{ filter: 'drop-shadow(0 0 10px rgba(127,163,199,0.85))' }}
            />
          </svg>
        )}

        {/* The real logo (PNG, BUILDCON + HOUSE rows), revealed outward from the O. */}
        <div
          style={at(-L.logo.w / 2, logoTop, {
            width: L.logo.w,
            height: logoH,
            overflow: 'hidden',
            clipPath: `circle(${reveal * 115}% at ${O_X * 100}% ${((O_Y * logoFullH) / logoH) * 100}%)`,
          })}
        >
          <Img src={staticFile('logo.png')} style={{ width: L.logo.w, height: logoFullH, display: 'block' }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: L.logo.w,
              height: logoFullH,
              background: `linear-gradient(105deg, transparent ${(sweep - 0.12) * 100}%, rgba(255,255,255,0.9) ${sweep * 100}%, transparent ${(sweep + 0.12) * 100}%)`,
              maskImage: `url(${staticFile('logo.png')})`,
              WebkitMaskImage: `url(${staticFile('logo.png')})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              opacity: 0.75,
            }}
          />
        </div>

        {od > 0.5 && oOpacity > 0.01 && (
          <svg
            viewBox="0 0 64 64"
            width={(od * 64) / 58}
            height={(od * 64) / 58}
            style={{
              position: 'absolute',
              left: W / 2 + ox - (od * 64) / 58 / 2,
              top: H / 2 + oy - (od * 64) / 58 / 2,
              opacity: oOpacity,
              transform: `rotate(${oSpin}deg)`,
              filter: `drop-shadow(0 0 ${0.02 * L.minDim}px rgba(93,155,205,0.75))`,
            }}
          >
            <path fill={C.logoBlue} fillRule="evenodd" d={O_PATH} />
          </svg>
        )}

        <div style={at(-W / 2, L.tagline.y - L.tagline.size / 2, { width: W })}>
          <Kinetic
            words={[{ text: 'Let' }, { text: 'you' }, { text: 'live' }, { text: 'better', accent: true }]}
            start={T.tagline}
            stagger={full ? 6 : 5}
            fontFamily={FONT.displayItalic}
            fontSize={L.tagline.size}
            fontWeight={500}
            tracking="0.01em"
            italic
          />
        </div>
      </AbsoluteFill>

    </>
  )
}

/** A soft dark backing behind a line of text, so it stays crisp over moving pictures. */
function Scrim({ f, from, to, width, height }: { f: number; from: number; to: number; width: number; height: number }) {
  const o = interpolate(f, [from - 6, from + 6, to - 2, to + 8], [0, 1, 1, 0], clamp)
  if (o <= 0) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width,
        height,
        transform: 'translate(-50%, -38%)',
        background: `radial-gradient(closest-side, rgba(${BG_RGB},0.78), rgba(${BG_RGB},0.5) 55%, rgba(${BG_RGB},0))`,
        opacity: o,
      }}
    />
  )
}

/** Each category's word: from just before its first photo passes the lens until its last one has. */
function computeWordWindows(): [number, number][] {
  const wins: [number, number][] = []
  WORDS.forEach((_, g) => {
    const idx = CORRIDOR.map((c, i) => (c.group === g ? i : -1)).filter((i) => i >= 0)
    let a = Math.round(passFrame(idx[0]) - 12)
    const b = g === WORDS.length - 1 ? 198 : Math.round(passFrame(idx[idx.length - 1]) + 1)
    if (wins.length) a = Math.max(a, wins[wins.length - 1][1] + 3)
    wins.push([Math.max(a, 64), b])
  })
  return wins
}

/** Every frame's border dissolves to exactly the site background, so the site can show the video
 * with object-fit: contain on the same colour and the edges are invisible. */
function EdgeMatte({ L }: { L: Layout }) {
  // The outer band is a flat inset shadow, not the gradients' solid stop: gradients are dithered
  // (±1 noise), and encoders turn that noise into ±4 blotches right where the edge must be exact.
  const solid = Math.round(0.09 * L.minDim)
  const fade = Math.round(0.17 * L.minDim)
  const bg = `rgb(${BG_RGB})`
  const t = `rgba(${BG_RGB},0)`
  return (
    <AbsoluteFill
      style={{
        boxShadow: `inset 0 0 0 ${solid}px ${bg}`,
        background: [
          `linear-gradient(to right, ${bg} ${solid}px, ${t} ${fade}px)`,
          `linear-gradient(to left, ${bg} ${solid}px, ${t} ${fade}px)`,
          `linear-gradient(to bottom, ${bg} ${solid}px, ${t} ${fade}px)`,
          `linear-gradient(to top, ${bg} ${solid}px, ${t} ${fade}px)`,
          `radial-gradient(ellipse at 50% 50%, ${t} 55%, rgba(${BG_RGB},0.55) 85%, ${bg} 100%)`,
        ].join(', '),
      }}
    />
  )
}

const FAST: Record<Variant, [number, number][]> = {
  full: [
    [16, 200],
    [204, 250],
    [300, 346],
    [378, 412],
  ],
  short: [[2, 64]],
}

export function Intro({ variant }: IntroProps) {
  const f = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const L = useMemo(() => makeLayout(width, height), [width, height])
  const fast = FAST[variant].some(([a, b]) => f >= a && f <= b)
  // In the short cut the doorway world dims away as the O takes over.
  const worldOpacity = variant === 'short' ? interpolate(f, [26, 46], [1, 0], clamp) : 1
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <Backdrop L={L} variant={variant} />
      <AbsoluteFill style={{ opacity: worldOpacity }}>
        {worldOpacity > 0.001 &&
          (fast ? (
            <CameraMotionBlur shutterAngle={180} samples={6}>
              <Stage L={L} variant={variant} />
            </CameraMotionBlur>
          ) : (
            <Stage L={L} variant={variant} />
          ))}
      </AbsoluteFill>
      <Overlays L={L} variant={variant} flashOnly />
      <EdgeMatte L={L} />
      <Overlays L={L} variant={variant} />
    </AbsoluteFill>
  )
}
