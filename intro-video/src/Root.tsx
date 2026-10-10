import { Composition } from 'remotion'
import { Intro, type IntroProps } from './Intro'
import { FPS, FULL_DURATION, SHORT_DURATION } from './theme'

// Four re-composed aspects × two cuts. The site picks the variant by window shape.
const SIZES = [
  ['16x9', 1920, 1080],
  ['4x3', 1440, 1080],
  ['3x4', 1080, 1440],
  ['9x16', 1080, 1920],
] as const

export function RemotionRoot() {
  return (
    <>
      {SIZES.map(([id, width, height]) => (
        <Composition key={id} id={`intro-${id}`} component={Intro} durationInFrames={FULL_DURATION} fps={FPS} width={width} height={height} defaultProps={{ variant: 'full' } satisfies IntroProps} />
      ))}
      {SIZES.map(([id, width, height]) => (
        <Composition key={`s${id}`} id={`intro-short-${id}`} component={Intro} durationInFrames={SHORT_DURATION} fps={FPS} width={width} height={height} defaultProps={{ variant: 'short' } satisfies IntroProps} />
      ))}
    </>
  )
}
