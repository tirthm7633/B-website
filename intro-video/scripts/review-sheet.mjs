// Review contact sheets taken from the encoded HD MP4s (what visitors get):
// node scripts/review-sheet.mjs → out/review/review-full.jpg, out/review/review-short.jpg
// Rows = the four aspects; columns = first frame, mid logo-reveal, final frame.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const FFMPEG = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe')
const ASPECTS = ['16x9', '4x3', '3x4', '9x16']
const CUTS = { full: { prefix: 'intro-', frames: [0, 433, 509] }, short: { prefix: 'intro-short-', frames: [0, 73, 149] } }
const ROW_H = 360
const LABEL = 28
fs.mkdirSync('out/review/frames', { recursive: true })

for (const [cut, { prefix, frames }] of Object.entries(CUTS)) {
  const tiles = []
  let sheetW = 0
  let y = 0
  for (const a of ASPECTS) {
    let x = 0
    for (const f of frames) {
      const png = path.resolve(`out/review/frames/${cut}-${a}-f${f}.png`)
      // Remotion's ffmpeg build has no select filter — seek just before the frame's timestamp (frames
      // at or after the seek point are kept, so this lands exactly on frame f, including the last).
      execFileSync(FFMPEG, ['-v', 'error', '-y', '-ss', Math.max(0, (f - 0.25) / 60).toFixed(4), '-i', `out/web/${prefix}${a}-hd.mp4`, '-frames:v', '1', png])
      const img = await sharp(png).resize({ height: ROW_H }).toBuffer({ resolveWithObject: true })
      tiles.push({ input: img.data, left: x, top: y + LABEL })
      const label = `<svg width="${img.info.width}" height="${LABEL}"><text x="4" y="19" font-size="15" fill="#8a929c" font-family="Arial">${a} · f${f}${f === frames[1] ? ' (mid-reveal)' : f === frames[2] ? ' (final)' : ''}</text></svg>`
      tiles.push({ input: Buffer.from(label), left: x, top: y })
      x += img.info.width + 12
    }
    sheetW = Math.max(sheetW, x)
    y += ROW_H + LABEL + 12
  }
  await sharp({ create: { width: sheetW, height: y, channels: 3, background: '#1a1d22' } }).composite(tiles).jpeg({ quality: 86 }).toFile(`out/review/review-${cut}.jpg`)
  console.log(`review-${cut}.jpg`)
}
