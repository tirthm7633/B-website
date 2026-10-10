import { spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from './theme'

export type Word = { text: string; accent?: boolean; color?: string }

/**
 * Kinetic typography: words arrive one at a time, each from blur(12px), 0 opacity and 18px lower
 * to sharp and in place over ~10 frames on a spring. They leave the same way, faster.
 */
export function Kinetic({
  words,
  start,
  end,
  stagger = 7,
  fontFamily,
  fontSize,
  fontWeight = 600,
  tracking = '-0.012em',
  italic = false,
}: {
  words: Word[]
  start: number
  end?: number
  stagger?: number
  fontFamily: string
  fontSize: number
  fontWeight?: number
  tracking?: string
  italic?: boolean
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: fontSize * 0.26, fontFamily, fontSize, fontWeight, letterSpacing: tracking, fontStyle: italic ? 'italic' : 'normal', lineHeight: 1, whiteSpace: 'nowrap' }}>
      {words.map((w, i) => {
        const inP = spring({ frame: frame - start - i * stagger, fps, config: { damping: 16, stiffness: 190, mass: 0.6 }, durationInFrames: 12 })
        const outP = end === undefined ? 0 : spring({ frame: frame - end - i * 2, fps, config: { damping: 20, stiffness: 260 }, durationInFrames: 8 })
        const p = Math.max(0, inP - outP)
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: w.color ?? (w.accent ? C.accentBright : C.text),
              opacity: p,
              filter: `blur(${(1 - p) * 12}px)`,
              transform: `translateY(${(1 - inP) * 18 - outP * 10}px)`,
              textShadow: w.accent || w.color ? '0 0 28px rgba(127,163,199,0.35)' : '0 2px 24px rgba(5,6,7,0.6)',
            }}
          >
            {w.text}
          </span>
        )
      })}
    </div>
  )
}
