// Edge check: node scripts/verify.mjs [fileFilter]
// Decodes EVERY frame of every web file (and the posters) to RGB and measures the outer band —
// max(2 px, 1 % of the short side) on all four sides — against the site background #050607.
// Requirement: every sampled pixel within ±2 per channel. Writes out/web/edge-report.json.
// YUV→RGB uses swscale's accurate rounding, which matches what Chrome draws (checked with a
// canvas readback); the default fast path reads near-black about 2 levels too dark.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const BIN = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc')
const FFMPEG = path.join(BIN, 'ffmpeg.exe')
const BG = [5, 6, 7]
const TOL = 2
const filter = process.argv[2] ?? ''

function checkFrame(buf, w, h, band, state, index) {
  const test = (x, y) => {
    const i = (y * w + x) * 3
    const d = Math.max(Math.abs(buf[i] - BG[0]), Math.abs(buf[i + 1] - BG[1]), Math.abs(buf[i + 2] - BG[2]))
    state.pixels++
    if (d > TOL) state.bad++
    if (d > state.worst.dev) state.worst = { dev: d, frame: index, x, y, rgb: [buf[i], buf[i + 1], buf[i + 2]] }
  }
  for (let y = 0; y < h; y++) {
    if (y < band || y >= h - band) for (let x = 0; x < w; x++) test(x, y)
    else {
      for (let x = 0; x < band; x++) test(x, y)
      for (let x = w - band; x < w; x++) test(x, y)
    }
  }
}

const fresh = () => ({ frames: 0, pixels: 0, bad: 0, worst: { dev: 0, frame: -1 } })

// Remotion's bundled ffmpeg has no rawvideo muxer, so frames come out as a stream of
// uncompressed-ish PNGs, split on each IEND chunk and decoded with sharp.
async function scanVideo(file, w, h) {
  const band = Math.max(2, Math.floor(0.01 * Math.min(w, h)))
  const state = { ...fresh(), band }
  const p = spawn(FFMPEG, ['-v', 'error', '-i', file, '-sws_flags', 'accurate_rnd+full_chroma_int', '-pix_fmt', 'rgb24', '-c:v', 'png', '-compression_level', '0', '-f', 'image2pipe', '-'])
  p.stderr.on('data', (d) => process.stderr.write(d))
  const done = new Promise((resolve) => p.on('close', resolve))
  // Growable buffer: [head, used) holds bytes not yet consumed.
  let store = Buffer.alloc(w * h * 4)
  let head = 0
  let used = 0
  for await (const chunk of p.stdout) {
    if (used + chunk.length > store.length) {
      store.copy(store, 0, head, used)
      used -= head
      head = 0
      if (used + chunk.length > store.length) {
        const bigger = Buffer.alloc(Math.max(store.length * 2, used + chunk.length))
        store.copy(bigger, 0, 0, used)
        store = bigger
      }
    }
    chunk.copy(store, used)
    used += chunk.length
    for (;;) {
      // Walk chunks from the 8-byte signature to IEND to find where this PNG ends.
      let off = head + 8
      let end = -1
      while (off + 8 <= used) {
        const len = store.readUInt32BE(off)
        const type = store.toString('latin1', off + 4, off + 8)
        off += 12 + len
        if (type === 'IEND') {
          end = off
          break
        }
      }
      if (end < 0 || end > used) break
      const { data, info } = await sharp(store.subarray(head, end)).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      if (info.width !== w || info.height !== h) throw new Error(`${file}: decoded ${info.width}x${info.height}, expected ${w}x${h}`)
      checkFrame(data, w, h, band, state, state.frames++)
      head = end
    }
  }
  const code = await done
  if (code !== 0) throw new Error(`ffmpeg exit ${code} on ${file}`)
  return state
}

const dir = 'out/web'
const files = fs.readdirSync(dir).filter((f) => /\.(mp4|webm|jpg)$/.test(f) && f.includes(filter)).sort()
const manifest = fs.existsSync(`${dir}/manifest.json`) ? JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8')) : []
const report = []
for (const f of files) {
  const file = path.join(dir, f)
  let state
  if (f.endsWith('.jpg')) {
    const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const band = Math.max(2, Math.floor(0.01 * Math.min(info.width, info.height)))
    state = { ...fresh(), band }
    checkFrame(data, info.width, info.height, band, state, state.frames++)
  } else {
    const [w, h] = manifest.find((r) => r.file === f).res.split('x').map(Number)
    state = await scanVideo(file, w, h)
  }
  const row = { file: f, frames: state.frames, band: state.band, pixels: state.pixels, outOfTolerance: state.bad, maxDev: state.worst.dev, worst: state.worst, pass: state.bad === 0 }
  report.push(row)
  console.log(`${row.pass ? 'PASS' : 'FAIL'}  ${f.padEnd(32)} frames=${String(row.frames).padStart(3)} band=${row.band}px  max|Δ|=${row.maxDev}${row.maxDev ? ` (frame ${state.worst.frame} @${state.worst.x},${state.worst.y} rgb ${state.worst.rgb})` : ''}`)
}
const prev = fs.existsSync(`${dir}/edge-report.json`) ? JSON.parse(fs.readFileSync(`${dir}/edge-report.json`, 'utf8')) : []
const merged = [...prev.filter((r) => !report.some((n) => n.file === r.file)), ...report].sort((a, b) => a.file.localeCompare(b.file))
fs.writeFileSync(`${dir}/edge-report.json`, JSON.stringify(merged, null, 2))
