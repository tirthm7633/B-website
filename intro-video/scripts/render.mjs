// Full-quality master MP4s (also the review copies): node scripts/render.mjs [compositionIds]
// Same bundle/renderer path as stills.mjs (the CLI's own server is unreliable here).
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import fs from 'node:fs'

const ALL = ['16x9', '9x16', '4x3', '3x4'].flatMap((a) => [`intro-${a}`, `intro-short-${a}`])
const comps = process.argv[2] ? process.argv[2].split(',') : ALL
const browserExecutable = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const chromiumOptions = { gl: 'angle' }
fs.mkdirSync('out/master', { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions })
  const t0 = Date.now()
  let last = -1
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    crf: 12,
    x264Preset: 'slow',
    pixelFormat: 'yuv420p',
    colorSpace: 'bt709',
    imageFormat: 'jpeg',
    jpegQuality: 95,
    concurrency: Number(process.env.CONC ?? 4),
    timeoutInMilliseconds: 120000,
    browserExecutable,
    chromiumOptions,
    outputLocation: path.resolve(`out/master/${id}.mp4`),
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10)
      if (pct !== last) {
        last = pct
        console.log(`${id} ${pct * 10}%`)
      }
    },
  })
  console.log(`${id} done in ${Math.round((Date.now() - t0) / 1000)}s`)
}
