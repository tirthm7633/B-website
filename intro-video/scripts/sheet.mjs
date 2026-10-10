// Contact sheet of stills: node scripts/sheet.mjs <prefix> <cols> <tileWidth>
import { readdirSync } from 'node:fs'
import sharp from 'sharp'
const [prefix, cols = '3', tw = '640'] = process.argv.slice(2)
const files = readdirSync('out/stills').filter((f) => f.startsWith(prefix) && f.endsWith('.jpg') && !f.includes('sheet')).sort()
const meta = await sharp('out/stills/' + files[0]).metadata()
const W = +tw, H = Math.round((W * meta.height) / meta.width), Cn = +cols
const comps = []
for (let i = 0; i < files.length; i++) {
  const label = Buffer.from(`<svg width="${W}" height="26"><rect width="100%" height="100%" fill="black" opacity="0.65"/><text x="8" y="19" font-size="16" fill="#fff" font-family="Arial">${files[i].replace('.jpg', '')}</text></svg>`)
  comps.push({ input: await sharp('out/stills/' + files[i]).resize(W, H).toBuffer(), left: (i % Cn) * W, top: Math.floor(i / Cn) * H })
  comps.push({ input: label, left: (i % Cn) * W, top: Math.floor(i / Cn) * H })
}
await sharp({ create: { width: W * Cn, height: H * Math.ceil(files.length / Cn), channels: 3, background: '#333' } }).composite(comps).jpeg({ quality: 86 }).toFile(`out/stills/${prefix}sheet.jpg`)
console.log('sheet', files.length)
