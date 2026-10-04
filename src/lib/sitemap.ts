// Builds sitemap.xml from the site's own data, so it always matches the pages that really exist.
// It is generated on every build (every publish to Vercel) by the plugin in vite.config.ts, and
// served at /sitemap.xml by the dev server too. Imports use explicit .ts extensions because
// vite.config.ts (a Node-side file) imports this module as well as the browser app.
import { brandSlug, catalogs } from '../data/catalogs.ts'
import { brands, site } from '../data/content.ts'
import { projects } from '../data/projects.ts'
import { SHOW_PROJECTS } from '../data/visibility.ts'

/**
 * Every page a visitor can open, mirroring the routes in App.tsx and the rules the pages use:
 * a brand's catalog page exists only if that brand has at least one catalog (CatalogBrandPage
 * redirects otherwise), and the Projects pages only while SHOW_PROJECTS is on. Add any new page
 * here as well as in App.tsx.
 */
export function sitemapPaths(): string[] {
  const brandPages = brands
    .filter((brand) => catalogs.some((catalog) => catalog.brand === brand.name))
    .map((brand) => `/catalog/${brandSlug(brand.name)}`)
  const projectPages = SHOW_PROJECTS ? ['/projects', ...projects.map((project) => `/projects/${project.id}`)] : []
  return ['/', '/catalog', ...brandPages, '/gallery', '/our-journey', ...projectPages]
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The sitemap.xml document: one <url> per page, as full addresses on `site.url`. */
export function buildSitemapXml(): string {
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${escapeXml(`${site.url}${path}`)}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
