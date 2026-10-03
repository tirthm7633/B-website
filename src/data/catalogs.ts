import type { ProjectCategory } from './projects'

export interface Catalog {
  id: string
  /** Must match one of the 11 brand names in src/data/content.ts exactly
   * (see the `brands` array there) — the Catalog page groups entries by
   * this field. */
  brand: string
  title: string
  categories: ProjectCategory[]
  fileSize: string
  filePath: string
  coverImage: string
}

/** Same slug convention already used for the brand logo files under
 * public/images/brands/ (lowercase, spaces to hyphens) — e.g. "Verantes
 * Living" -> "verantes-living". Used for both the /catalog/[brand-slug]
 * route and public/catalogs/[brand-slug]/ folder names. */
export function brandSlug(brand: string) {
  return brand.toLowerCase().trim().replace(/\s+/g, '-')
}

/**
 * Every entry below was identified by actually opening and reading the
 * real PDF (cover + a few interior pages), not guessed from its export
 * filename — several of the source filenames were actively misleading
 * (e.g. "iMarble-Iris Edition.pdf", "Midas (25mb).pdf" and six different
 * "___mm Catalogue.pdf" files are all Qutone product LINES, not separate
 * brands or manufacturers; "TESAX" is a typo for Qutone's "Texas" line).
 *
 * The 21 catalogs that originally didn't fit the ~15MB guideline (source
 * PDFs ran 15-110MB) were compressed with Ghostscript (image downsampling
 * + recompression, run via a WASM build since no native install was
 * available) and are now included below at their compressed size. All of
 * them hold clearly legible text and images after compression — spot
 * checked by rendering sample pages — except one flagged exception:
 *
 *   hansgrohe-bathroom-sales-manual-2019 is 22.2MB, over the ~15MB
 *   guideline. Its bulk isn't from photos (which compress fine) but from
 *   ~3,700 tiny embedded icons (many as small as 9x9px, already near the
 *   resolution floor) spread across 280 pages — each one carries fixed
 *   per-image PDF overhead that downsampling can't reduce further without
 *   real quality loss. Left as-is rather than degraded further; could be
 *   split into per-category chapters or hosted externally if 22MB proves
 *   too heavy in practice.
 *
 * To add any NEW catalog (beyond what's below) later: open and read
 * the PDF to identify (1) which brand it belongs to — must match one of
 * the 11 brand names/slugs already used in src/data/content.ts for brand
 * logos: Grohe, Hansgrohe, Axor, Geberit, Vitra, Oyster, Qutone, Nexion,
 * Dimore, MCM Ittim, Verantes Living (Axor, Geberit and MCM Ittim
 * currently have zero catalogs at all); (2) a clear title based on its
 * actual content; (3) which categories it covers based on the products
 * actually shown inside — never guessed from the filename alone. Then
 * place the PDF at /public/catalogs/[brand-slug]/[filename].pdf (see
 * brandSlug() above and public/catalogs/README.md) and add one entry
 * here.
 */
export const catalogs: Catalog[] = [
  {
    id: 'qutone-gvt-wood-look-200x1200',
    brand: 'Qutone',
    title: 'GVT Wood-Look Planks 200x1200mm',
    categories: ['tiles'],
    fileSize: '7.2 MB',
    filePath: '/catalogs/qutone/gvt-wood-look-planks-200x1200mm.pdf',
    coverImage: '/images/catalogs/qutone/gvt-wood-look-planks-200x1200mm.svg',
  },
  {
    id: 'qutone-imarble-iris',
    brand: 'Qutone',
    title: 'iMarble 2.0 — Iris Edition Slabs 2025-26',
    categories: ['tiles'],
    fileSize: '12.6 MB',
    filePath: '/catalogs/qutone/imarble-2-iris-edition-2025-26.pdf',
    coverImage: '/images/catalogs/qutone/imarble-2-iris-edition-2025-26.svg',
  },
  {
    id: 'qutone-imarble-mansory',
    brand: 'Qutone',
    title: 'iMarble 2.0 — Mansory Edition 2025-26',
    categories: ['tiles'],
    fileSize: '12.9 MB',
    filePath: '/catalogs/qutone/imarble-2-mansory-edition-2025-26.pdf',
    coverImage: '/images/catalogs/qutone/imarble-2-mansory-edition-2025-26.svg',
  },
  {
    id: 'qutone-progetto-1200x1800',
    brand: 'Qutone',
    title: 'Progetto Collection — 1200x1800mm',
    categories: ['tiles'],
    fileSize: '6.5 MB',
    filePath: '/catalogs/qutone/progetto-collection-1200x1800mm.pdf',
    coverImage: '/images/catalogs/qutone/progetto-collection-1200x1800mm.svg',
  },
  {
    id: 'qutone-qrock',
    brand: 'Qutone',
    title: 'Qrock Collection',
    categories: ['tiles'],
    fileSize: '8 MB',
    filePath: '/catalogs/qutone/qrock-collection.pdf',
    coverImage: '/images/catalogs/qutone/qrock-collection.svg',
  },
  {
    id: 'qutone-texas-triform',
    brand: 'Qutone',
    title: 'Texas Collection — Triform Edition',
    categories: ['tiles'],
    fileSize: '12.7 MB',
    filePath: '/catalogs/qutone/texas-collection-triform-edition.pdf',
    coverImage: '/images/catalogs/qutone/texas-collection-triform-edition.svg',
  },
  {
    id: 'qutone-texas-embark',
    brand: 'Qutone',
    title: 'Texas Collection — Embark Edition',
    categories: ['tiles'],
    fileSize: '11.9 MB',
    filePath: '/catalogs/qutone/texas-collection-embark-edition.pdf',
    coverImage: '/images/catalogs/qutone/texas-collection-embark-edition.svg',
  },
  {
    id: 'hansgrohe-news-2019',
    brand: 'Hansgrohe',
    title: 'hansgrohe News 2019 — Smart Living, Showers & Kitchen',
    categories: ['sanitaryware', 'kitchen', 'wellness'],
    fileSize: '10 MB',
    filePath: '/catalogs/hansgrohe/news-2019-smart-living-showers-kitchen.pdf',
    coverImage: '/images/catalogs/hansgrohe/news-2019-smart-living-showers-kitchen.svg',
  },
  {
    id: 'verantes-living-ferro-nova-kitchens',
    brand: 'Verantes Living',
    title: 'Ferro Nova Kitchens by Verantes Living',
    categories: ['kitchen', 'furniture'],
    fileSize: '1.9 MB',
    filePath: '/catalogs/verantes-living/ferro-nova-kitchens.pdf',
    coverImage: '/images/catalogs/verantes-living/ferro-nova-kitchens.svg',
  },
  {
    id: 'dimore-marmo',
    brand: 'Dimore',
    title: 'Marmo Collection',
    categories: ['tiles'],
    fileSize: '10.6 MB',
    filePath: '/catalogs/dimore/marmo-collection.pdf',
    coverImage: '/images/catalogs/dimore/marmo-collection.svg',
  },
  {
    id: 'nexion-general-catalogue',
    brand: 'Nexion',
    title: 'Nexion General Catalogue',
    categories: ['tiles'],
    fileSize: '7.9 MB',
    filePath: '/catalogs/nexion/general-catalogue.pdf',
    coverImage: '/images/catalogs/nexion/general-catalogue.svg',
  },
  {
    id: 'nexion-marble-gallery-2026',
    brand: 'Nexion',
    title: 'Nexion Marble Gallery 2026',
    categories: ['tiles'],
    fileSize: '7.1 MB',
    filePath: '/catalogs/nexion/marble-gallery-2026.pdf',
    coverImage: '/images/catalogs/nexion/marble-gallery-2026.svg',
  },
  {
    id: 'grohe-spa-lookbook-2026',
    brand: 'Grohe',
    title: 'Grohe Spa Lookbook 2026',
    categories: ['wellness'],
    fileSize: '4.8 MB',
    filePath: '/catalogs/grohe/spa-lookbook-2026.pdf',
    coverImage: '/images/catalogs/grohe/spa-lookbook-2026.svg',
  },
  {
    id: 'vitra-bathroom-collections-2025-india',
    brand: 'Vitra',
    title: 'VitrA Bathroom Collections 2025 (India)',
    categories: ['sanitaryware', 'furniture'],
    fileSize: '7.4 MB',
    filePath: '/catalogs/vitra/bathroom-collections-2025-india.pdf',
    coverImage: '/images/catalogs/vitra/bathroom-collections-2025-india.svg',
  },
  {
    id: 'vitra-designer-collection-2021',
    brand: 'Vitra',
    title: 'VitrA Designer Collection 2021',
    categories: ['sanitaryware', 'furniture'],
    fileSize: '11.7 MB',
    filePath: '/catalogs/vitra/designer-collection-2021.pdf',
    coverImage: '/images/catalogs/vitra/designer-collection-2021.svg',
  },
  {
    id: 'qutone-gvt-tiles-600x600',
    brand: 'Qutone',
    title: 'GVT Tiles 600x600mm',
    categories: ['tiles'],
    fileSize: '10.3 MB',
    filePath: '/catalogs/qutone/gvt-tiles-600x600mm.pdf',
    coverImage: '/images/catalogs/qutone/gvt-tiles-600x600mm.svg',
  },
  {
    id: 'qutone-marble-onyx-gvt-slabs-600x1200',
    brand: 'Qutone',
    title: 'Marble/Onyx GVT Slabs 600x1200mm',
    categories: ['tiles'],
    fileSize: '14.0 MB',
    filePath: '/catalogs/qutone/marble-onyx-gvt-slabs-600x1200mm.pdf',
    coverImage: '/images/catalogs/qutone/marble-onyx-gvt-slabs-600x1200mm.svg',
  },
  {
    id: 'qutone-large-format-slabs-800x1600',
    brand: 'Qutone',
    title: 'Large-Format Slabs 800x1600mm',
    categories: ['tiles'],
    fileSize: '11.2 MB',
    filePath: '/catalogs/qutone/large-format-slabs-800x1600mm.pdf',
    coverImage: '/images/catalogs/qutone/large-format-slabs-800x1600mm.svg',
  },
  {
    id: 'qutone-stoneware-slabs-1200x1800',
    brand: 'Qutone',
    title: 'Stoneware Slabs 1200x1800mm',
    categories: ['tiles'],
    fileSize: '11.6 MB',
    filePath: '/catalogs/qutone/stoneware-slabs-1200x1800mm.pdf',
    coverImage: '/images/catalogs/qutone/stoneware-slabs-1200x1800mm.svg',
  },
  {
    id: 'qutone-stoneware-slabs-1200x2400',
    brand: 'Qutone',
    title: 'Stoneware Slabs 1200x2400mm',
    categories: ['tiles'],
    fileSize: '11.0 MB',
    filePath: '/catalogs/qutone/stoneware-slabs-1200x2400mm.pdf',
    coverImage: '/images/catalogs/qutone/stoneware-slabs-1200x2400mm.svg',
  },
  {
    id: 'qutone-imarble-marmo',
    brand: 'Qutone',
    title: 'iMarble 2.0 — Marmo Edition',
    categories: ['tiles'],
    fileSize: '5.6 MB',
    filePath: '/catalogs/qutone/imarble-2-marmo-edition.pdf',
    coverImage: '/images/catalogs/qutone/imarble-2-marmo-edition.svg',
  },
  {
    id: 'qutone-progetto-600x600',
    brand: 'Qutone',
    title: 'Progetto Collection 600x600mm',
    categories: ['tiles'],
    fileSize: '11.1 MB',
    filePath: '/catalogs/qutone/progetto-collection-600x600mm.pdf',
    coverImage: '/images/catalogs/qutone/progetto-collection-600x600mm.svg',
  },
  {
    id: 'qutone-progetto-collection',
    brand: 'Qutone',
    title: 'Progetto Collection',
    categories: ['tiles'],
    fileSize: '11.3 MB',
    filePath: '/catalogs/qutone/progetto-collection.pdf',
    coverImage: '/images/catalogs/qutone/progetto-collection.svg',
  },
  {
    id: 'qutone-qgres-fastrack',
    brand: 'Qutone',
    title: 'QGres & Fastrack Collection',
    categories: ['tiles'],
    fileSize: '14.4 MB',
    filePath: '/catalogs/qutone/qgres-fastrack-collection.pdf',
    coverImage: '/images/catalogs/qutone/qgres-fastrack-collection.svg',
  },
  {
    id: 'qutone-solid-plus',
    brand: 'Qutone',
    title: 'Solid+ Technical Homogeneous Tiles',
    categories: ['tiles'],
    fileSize: '4.6 MB',
    filePath: '/catalogs/qutone/solid-plus-technical-homogeneous-tiles.pdf',
    coverImage: '/images/catalogs/qutone/solid-plus-technical-homogeneous-tiles.svg',
  },
  {
    id: 'qutone-stoneware-800x2400',
    brand: 'Qutone',
    title: 'Stoneware Collection 800x2400mm',
    categories: ['tiles'],
    fileSize: '10.7 MB',
    filePath: '/catalogs/qutone/stoneware-collection-800x2400mm.pdf',
    coverImage: '/images/catalogs/qutone/stoneware-collection-800x2400mm.svg',
  },
  {
    id: 'qutone-texas-mansory-oslo-dune',
    brand: 'Qutone',
    title: 'Texas Collection — Mansory Oslo/Dune',
    categories: ['tiles'],
    fileSize: '12.2 MB',
    filePath: '/catalogs/qutone/texas-collection-mansory-oslo-dune.pdf',
    coverImage: '/images/catalogs/qutone/texas-collection-mansory-oslo-dune.svg',
  },
  {
    id: 'hansgrohe-innovations-2021',
    brand: 'Hansgrohe',
    title: 'hansgrohe Innovations 2021 Journal',
    categories: ['sanitaryware', 'kitchen', 'wellness'],
    fileSize: '4.9 MB',
    filePath: '/catalogs/hansgrohe/innovations-2021-journal.pdf',
    coverImage: '/images/catalogs/hansgrohe/innovations-2021-journal.svg',
  },
  {
    id: 'hansgrohe-bathroom-sales-manual-2019',
    brand: 'Hansgrohe',
    title: 'hansgrohe Bathroom Sales Manual 2019',
    categories: ['sanitaryware', 'kitchen', 'wellness'],
    fileSize: '22.2 MB',
    filePath: '/catalogs/hansgrohe/bathroom-sales-manual-2019.pdf',
    coverImage: '/images/catalogs/hansgrohe/bathroom-sales-manual-2019.svg',
  },
  {
    id: 'vitra-bathroom-collections-2023',
    brand: 'Vitra',
    title: 'VitrA Bathroom Collections 2023',
    categories: ['sanitaryware', 'furniture'],
    fileSize: '7.4 MB',
    filePath: '/catalogs/vitra/bathroom-collections-2023.pdf',
    coverImage: '/images/catalogs/vitra/bathroom-collections-2023.svg',
  },
  {
    id: 'dimore-earth-to-essence-master-catalogue',
    brand: 'Dimore',
    title: 'Earth To Essence Master Catalogue',
    categories: ['tiles'],
    fileSize: '7.1 MB',
    filePath: '/catalogs/dimore/earth-to-essence-master-catalogue.pdf',
    coverImage: '/images/catalogs/dimore/earth-to-essence-master-catalogue.svg',
  },
  {
    id: 'dimore-midas',
    brand: 'Dimore',
    title: 'Midas Collection',
    categories: ['tiles'],
    fileSize: '1.4 MB',
    filePath: '/catalogs/dimore/midas-collection.pdf',
    coverImage: '/images/catalogs/dimore/midas-collection.svg',
  },
  {
    id: 'dimore-neo',
    brand: 'Dimore',
    title: 'Neo Collection',
    categories: ['tiles'],
    fileSize: '1.4 MB',
    filePath: '/catalogs/dimore/neo-collection.pdf',
    coverImage: '/images/catalogs/dimore/neo-collection.svg',
  },
  {
    id: 'dimore-omogenea',
    brand: 'Dimore',
    title: 'Omogenea Collection',
    categories: ['tiles'],
    fileSize: '1.6 MB',
    filePath: '/catalogs/dimore/omogenea-collection.pdf',
    coverImage: '/images/catalogs/dimore/omogenea-collection.svg',
  },
  {
    id: 'dimore-roccia',
    brand: 'Dimore',
    title: 'Roccia Collection',
    categories: ['tiles'],
    fileSize: '1.4 MB',
    filePath: '/catalogs/dimore/roccia-collection.pdf',
    coverImage: '/images/catalogs/dimore/roccia-collection.svg',
  },
  {
    id: 'oyster-bath-spa-collection-vol-1-8',
    brand: 'Oyster',
    title: 'Bath Spa Collection Vol. 1.8',
    categories: ['wellness', 'sanitaryware'],
    fileSize: '5.1 MB',
    filePath: '/catalogs/oyster/bath-spa-collection-vol-1-8.pdf',
    coverImage: '/images/catalogs/oyster/bath-spa-collection-vol-1-8.svg',
  },
]
