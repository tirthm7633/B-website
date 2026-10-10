import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond'
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope'

// Brand tokens — see ../BRAND_NOTES.md. Nothing outside this palette is used.
export const C = {
  bg: '#050607', // = the website's --color-bg; every frame's edges dissolve to exactly this
  surface: '#0c0f13',
  line: '#2a313b',
  text: '#e8ecf1',
  muted: '#8a929c',
  accent: '#5f7d9c',
  accentBright: '#7fa3c7',
  logoBlue: '#5d9bcd',
}
export const BG_RGB = '5,6,7'

export const FPS = 60
export const FULL_DURATION = 510 // 8.5 s
export const SHORT_DURATION = 150 // 2.5 s

/** Beat boundaries (frames at 60 fps) for the full film. */
export const B = {
  doors: 0,
  spaces: 60,
  brands: 204,
  roof: 300,
  keystone: 378,
  hold: 462,
}

const cormorant = loadCormorant('normal', { weights: ['500', '600'], subsets: ['latin'] })
const cormorantItalic = loadCormorant('italic', { weights: ['500'], subsets: ['latin'] })
const manrope = loadManrope('normal', { weights: ['500', '600'], subsets: ['latin'] })

export const FONT = {
  display: cormorant.fontFamily,
  displayItalic: cormorantItalic.fontFamily,
  body: manrope.fontFamily,
}
