// Posters = the final hold frame per aspect, as the best-quality JPEG that fits ≤120 KB:
// node scripts/posters.mjs
// Also checks that the short cut ends on the same picture, so one poster serves both versions.
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import fs from 'node:fs'
import sharp from 'sharp'

const LIMIT = 120_000
const browserExecutable = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const chromiumOptions = { gl: 'angle' }
fs.mkdirSync('out/web', { recursive: true })
fs.mkdirSync('out/stills', { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })

async function lastFrame(id) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions })
  const output = path.resolve(`out/stills/final-${id}.png`)
  await renderStill({ serveUrl, composition, frame: composition.durationInFrames - 1, output, imageFormat: 'png', browserExecutable, chromiumOptions })
  return output
}

async function meanDiff(a, b) {
  const [x, y] = await Promise.all([a, b].map((f) => sharp(f).removeAlpha().raw().toBuffer()))
  let sum = 0
  for (let i = 0; i < x.length; i++) sum += Math.abs(x[i] - y[i])
  return sum / x.length
}

for (const aspect of ['16x9', '9x16', '4x3', '3x4']) {
  const full = await lastFrame(`intro-${aspect}`)
  const short = await lastFrame(`intro-short-${aspect}`)
  let lo = 40
  let hi = 95
  let best = null
  while (lo <= hi) {
    const q = (lo + hi) >> 1
    const buf = await sharp(full).removeAlpha().jpeg({ quality: q, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
    if (buf.length <= LIMIT) {
      best = { q, buf }
      lo = q + 1
    } else hi = q - 1
  }
  if (!best) throw new Error(`poster-${aspect} cannot fit ${LIMIT} bytes`)
  fs.writeFileSync(`out/web/poster-${aspect}.jpg`, best.buf)
  console.log(`poster-${aspect}.jpg  ${(best.buf.length / 1000).toFixed(1)} KB  q${best.q}  full-vs-short final frame mean |Δ| = ${(await meanDiff(full, short)).toFixed(2)}/255`)
}
