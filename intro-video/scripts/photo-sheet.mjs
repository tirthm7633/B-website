// Contact sheet of every photo the film uses: node scripts/photo-sheet.mjs → out/review/photos-used.jpg
// Reads the photo paths straight from the source so the sheet can't drift from the film.
import fs from 'node:fs'
import sharp from 'sharp'

const src = fs.readFileSync('src/assets.ts', 'utf8')
const intro = fs.readFileSync('src/Intro.tsx', 'utf8')
const corridor = src.slice(src.indexOf('CORRIDOR'), src.indexOf('WORDS'))
const cards = src.slice(src.indexOf('PHOTO_CARDS'))
const paths = (text) => [...text.matchAll(/'(photos\/[^']+)'/g)].map((m) => m[1])
const used = new Map()
const add = (p, role) => used.set(p, used.has(p) ? `${used.get(p)} + ${role}` : role)
paths(intro).forEach((p) => add(p, 'doors'))
paths(corridor).forEach((p, i) => add(p, i === paths(corridor).length - 1 ? `corridor ${i + 1} (hero)` : `corridor ${i + 1}`))
paths(cards).forEach((p, i) => add(p, `wall card ${i + 1}`))

const TW = 420
const TH = 280
const LH = 44
const COLS = 5
const tiles = []
let i = 0
for (const [p, role] of used) {
  const file = `public/${p}`
  const meta = await sharp(file).metadata()
  const origin = p.split('/')[1] // site | showroom | stock
  const name = p.split('/').pop()
  const x = (i % COLS) * TW
  const y = Math.floor(i / COLS) * (TH + LH)
  tiles.push({ input: await sharp(file).resize(TW, TH, { fit: 'cover' }).toBuffer(), left: x, top: y })
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const label = `<svg width="${TW}" height="${LH}"><rect width="100%" height="100%" fill="#0c0f13"/><text x="8" y="18" font-size="14" fill="#e8ecf1" font-family="Arial">${esc(name)} · ${meta.width}×${meta.height}</text><text x="8" y="36" font-size="12" fill="#8a929c" font-family="Arial">${esc(origin)} · ${esc(role)}</text></svg>`
  tiles.push({ input: Buffer.from(label), left: x, top: y + TH })
  i++
}
fs.mkdirSync('out/review', { recursive: true })
await sharp({ create: { width: TW * COLS, height: (TH + LH) * Math.ceil(used.size / COLS), channels: 3, background: '#050607' } })
  .composite(tiles)
  .jpeg({ quality: 84 })
  .toFile('out/review/photos-used.jpg')
console.log(`photos-used.jpg — ${used.size} photos`)
for (const [p, role] of used) console.log(`  ${p}  ${role}`)
