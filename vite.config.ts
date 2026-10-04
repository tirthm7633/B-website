import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { buildSitemapXml } from './src/lib/sitemap.ts'

// Writes sitemap.xml from the site's data on every build, so it can't drift from the real pages
// (see src/lib/sitemap.ts). The dev server serves the same file at /sitemap.xml; it reflects the
// data as it was when the dev server started.
function sitemap(): Plugin {
  return {
    name: 'buildcon-sitemap',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml() })
    },
    configureServer(server) {
      server.middlewares.use('/sitemap.xml', (_req, res) => {
        res.setHeader('Content-Type', 'application/xml')
        res.end(buildSitemapXml())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap()],
})
