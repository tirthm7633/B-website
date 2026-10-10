// Web tiers from the masters: node scripts/encode.mjs [compositionIds]
// Each composition → HD (master size) and LITE (720 px on the short side), each as VP9 WebM and
// H.264 MP4 (yuv420p, +faststart, BT.709 tags). Quality-first (CRF / constrained quality) with the
// per-file budget from the brief as a hard ceiling: anything over it is re-done two-pass at 90 %.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BIN = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc')
const FFMPEG = path.join(BIN, 'ffmpeg.exe')
const FFPROBE = path.join(BIN, 'ffprobe.exe')
const MB = 1_000_000 // decimal MB — the stricter reading of the budgets
const BUDGET = { full: { hd: 4 * MB, lite: 1.8 * MB }, short: { hd: 1.5 * MB, lite: 0.7 * MB } }
const QUALITY = { hd: { x264: Number(process.env.HD_X264 ?? 20), vp9: 30 }, lite: { x264: 21, vp9: Number(process.env.LITE_VP9 ?? 31) } }
// ONLY=hd.mp4 (or lite.webm, …) re-encodes just that tier/format, e.g. to fix one file.
const ONLY = process.env.ONLY

const ALL = ['16x9', '9x16', '4x3', '3x4'].flatMap((a) => [`intro-${a}`, `intro-short-${a}`])
const ids = process.argv[2] ? process.argv[2].split(',') : ALL
fs.mkdirSync('out/web', { recursive: true })
fs.mkdirSync('out/logs', { recursive: true })

const ff = (args) => execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] })
const probe = (file) => JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]).toString())
const COLOR = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']

function x264(input, output, vf, tier, budget, seconds, log) {
  const common = ['-i', input, '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '120', '-x264-params', 'aq-mode=3', ...COLOR]
  const cap = Math.round((budget * 8) / seconds)
  ff([...common, '-crf', String(QUALITY[tier].x264), '-maxrate', String(cap), '-bufsize', String(cap), '-movflags', '+faststart', output])
  if (fs.statSync(output).size <= budget * 0.97) return 'crf'
  const target = Math.round((budget * 0.9 * 8) / seconds)
  ff([...common, '-b:v', String(target), '-pass', '1', '-passlogfile', log, '-f', 'null', '-'])
  ff([...common, '-b:v', String(target), '-pass', '2', '-passlogfile', log, '-movflags', '+faststart', output])
  return '2-pass'
}

function vp9(input, output, vf, tier, budget, seconds, log) {
  for (const share of [0.9, 0.8, 0.7]) {
    const ceiling = Math.round((budget * share * 8) / seconds)
    const common = ['-i', input, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', String(ceiling), '-crf', String(QUALITY[tier].vp9), '-g', '120', '-row-mt', '1', '-tile-columns', '2', '-auto-alt-ref', '1', '-lag-in-frames', '25', '-arnr-maxframes', process.env.ARNR ?? '7', '-deadline', 'good', ...COLOR]
    ff([...common, '-cpu-used', '4', '-pass', '1', '-passlogfile', log, '-f', 'null', '-'])
    ff([...common, '-cpu-used', '1', '-pass', '2', '-passlogfile', log, output])
    if (fs.statSync(output).size <= budget * 0.97) return `cq, cap ${Math.round(share * 100)}%`
  }
  throw new Error(`${output} still over budget`)
}

/** MP4 has its moov box before mdat (= +faststart) when the top-level box order says so. */
function moovFirst(file) {
  const buf = fs.readFileSync(file)
  let off = 0
  const order = []
  while (off + 8 <= buf.length) {
    let size = buf.readUInt32BE(off)
    const type = buf.toString('latin1', off + 4, off + 8)
    if (size === 1) size = Number(buf.readBigUInt64BE(off + 8))
    order.push(type)
    if (!size) break
    off += size
  }
  return order.indexOf('moov') < order.indexOf('mdat')
}

const rows = []
for (const id of ids) {
  const master = path.resolve(`out/master/${id}.mp4`)
  const m = probe(master).streams.find((s) => s.codec_type === 'video')
  const [num, den] = m.r_frame_rate.split('/').map(Number)
  const seconds = Number(m.nb_frames) / (num / den)
  const kind = id.includes('short') ? 'short' : 'full'
  const tall = m.height > m.width
  for (const tier of ['hd', 'lite']) {
    const vf = tier === 'hd' ? 'null' : tall ? 'scale=720:-2:flags=lanczos' : 'scale=-2:720:flags=lanczos'
    const budget = BUDGET[kind][tier]
    for (const ext of ['webm', 'mp4']) {
      if (ONLY && ONLY !== `${tier}.${ext}`) continue
      const out = path.resolve(`out/web/${id}-${tier}.${ext}`)
      const log = path.resolve(`out/logs/${id}-${tier}-${ext}`)
      const t0 = Date.now()
      const mode = ext === 'mp4' ? x264(master, out, vf, tier, budget, seconds, log) : vp9(master, out, vf, tier, budget, seconds, log)
      const s = probe(out)
      const v = s.streams.find((x) => x.codec_type === 'video')
      const size = fs.statSync(out).size
      const row = {
        file: path.basename(out),
        size,
        budget,
        ok: size <= budget,
        codec: v.codec_name,
        pix_fmt: v.pix_fmt,
        res: `${v.width}x${v.height}`,
        fps: v.r_frame_rate,
        seconds: Number(s.format.duration).toFixed(3),
        faststart: ext === 'mp4' ? moovFirst(out) : '-',
        mode,
      }
      rows.push(row)
      console.log(`${row.file}  ${(size / MB).toFixed(2)} MB / ${budget / MB} MB  ${row.codec} ${row.pix_fmt} ${row.res} ${row.fps} ${row.seconds}s faststart=${row.faststart} ${mode} ${Math.round((Date.now() - t0) / 1000)}s`)
    }
  }
}
const manifestPath = 'out/web/manifest.json'
const prev = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : []
const merged = [...prev.filter((r) => !rows.some((n) => n.file === r.file)), ...rows].sort((a, b) => a.file.localeCompare(b.file))
fs.writeFileSync(manifestPath, JSON.stringify(merged, null, 2))
// The preview page is opened from disk (file://), where fetch() of JSON is blocked — expose it as a script too.
fs.writeFileSync('out/web/manifest.js', `window.INTRO_MANIFEST = ${JSON.stringify(merged)};\n`)
