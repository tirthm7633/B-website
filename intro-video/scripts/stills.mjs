// Review stills: node scripts/stills.mjs <frames> <compositionIds> [prefix]
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import path from 'node:path'
import fs from 'node:fs'

const frames = (process.argv[2] ?? '0,30,90,170,220,260,311').split(',').map(Number)
const comps = (process.argv[3] ?? 'intro-16x9').split(',')
const prefix = process.argv[4] ?? ''
const browserExecutable = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const chromiumOptions = { gl: 'angle' }
fs.mkdirSync('out/stills', { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') })
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions })
  for (const frame of frames) {
    if (frame >= composition.durationInFrames) continue
    const output = path.resolve(`out/stills/${prefix}${id.replace('intro-', '')}-f${String(frame).padStart(3, '0')}.jpg`)
    const t0 = Date.now()
    await renderStill({ serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 88, browserExecutable, chromiumOptions })
    console.log(id, frame, `${Date.now() - t0}ms`)
  }
}
