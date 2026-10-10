// Downloads the licensed Unsplash photos used in the film (sources recorded in BRAND_NOTES.md).
import fs from 'node:fs'
const list = [
  ['bath-rain-shower', 'photo-1621713692973-785cad67e86d', 3600],
  ['bath-dark-stone', 'photo-1787539386512-e7d727dc5c1a', 3600],
  ['bath-lit-mirror', 'photo-1742134131017-44d377a611b1', 3600],
  ['kitchen-chandelier', 'photo-1656402887556-e727ffe1f6d7', 3400],
  ['kitchen-black', 'photo-1564540586988-aa4e53c3d799', 3600],
  ['living-grey', 'photo-1618221195710-dd6b41faaea6', 3600],
  ['living-green', 'photo-1738168246881-40f35f8aba0a', 3600],
  ['spa-slate-pool', 'photo-1776763018829-ad685e621871', 3600],
  ['spa-steam-room', 'photo-1761470575018-135c213340eb', 3600],
  ['spa-wood-pool', 'photo-1776763255459-99ddd8eebbfc', 3600],
  ['bath-black-marble', 'photo-1722942115699-b328f460613f', 1400],
  ['kitchen-dining', 'photo-1635321350281-e2a91ecffd00', 1400],
  ['spa-garden-pool', 'photo-1676302144341-10563603f99a', 1400],
  ['bath-travertine', 'photo-1763485956292-6fb531f01b0c', 1400],
  ['marble-statuario', 'photo-1599600540907-62e9b06e6597', 3200],
]
for (const [name, id, w] of list) {
  const r = await fetch(`https://images.unsplash.com/${id}?w=${w}&fit=max&q=86&fm=jpg`)
  if (!r.ok) { console.log('FAIL', name, r.status); continue }
  const buf = Buffer.from(await r.arrayBuffer())
  fs.writeFileSync(`public/photos/stock/${name}.jpg`, buf)
  console.log(name.padEnd(20), (buf.length / 1024 / 1024).toFixed(2), 'MB')
}
