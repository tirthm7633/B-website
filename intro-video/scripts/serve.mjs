// Tiny static server for preview.html (videos need HTTP Range support to seek): node scripts/serve.mjs [port]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('.')
const port = Number(process.argv[2] ?? 4321)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.png': 'image/png' }

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const file = path.join(root, url === '/' ? 'preview.html' : url)
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found')
      return
    }
    const size = fs.statSync(file).size
    const headers = { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' }
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '')
    if (m) {
      const start = m[1] ? Number(m[1]) : size - Number(m[2])
      const end = m[1] && m[2] ? Number(m[2]) : size - 1
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 })
      fs.createReadStream(file, { start, end }).pipe(res)
    } else {
      res.writeHead(200, { ...headers, 'Content-Length': size })
      fs.createReadStream(file).pipe(res)
    }
  })
  .listen(port, () => console.log(`http://localhost:${port}/preview.html`))
