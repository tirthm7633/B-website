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
 * A number of real catalogs the client supplied are NOT in this array
 * yet because the source PDF is too large to add to the repo as-is (see
 * public/catalogs/README.md's size guidance — several are 20-110MB).
 * Their brand/title/category have already been identified; once each is
 * compressed (or moved to external hosting), add an entry here pointing
 * at the new file and generate a cover with
 * scripts/generate-catalog-covers.cjs. The known list, as of now:
 *
 *   Qutone:    600x600mm GVT Tiles (18.7MB), 600x1200mm Marble/Onyx GVT
 *              Slabs (47.1MB), 800x1600mm Large-Format Slabs (19.4MB),
 *              1200x1800mm Stoneware Slabs (16.4MB), 1200x2400mm
 *              Stoneware Slabs (15.3MB), iMarble 2.0 Marmo Edition
 *              (39.3MB), Progetto Collection 600x600mm (62.4MB),
 *              Progetto Collection general (19.5MB), QGres & Fastrack
 *              Collection (36MB), Solid+ Technical Homogeneous Tiles
 *              (110.4MB — well over GitHub's 100MB per-file limit, MUST
 *              be compressed or externally hosted), Stoneware Collection
 *              800x2400mm (58.6MB), Texas Collection Mansory Oslo/Dune
 *              (17.8MB)
 *   Hansgrohe: Innovations 2021 journal (15.3MB), Bathroom Sales Manual
 *              2019 (25.1MB)
 *   Vitra:     Bathroom Collections 2023 (25.8MB)
 *   Dimore:    Earth To Essence Master Catalogue (17.1MB), Midas
 *              Collection (33.9MB), Neo Collection (22.9MB), Omogenea
 *              Collection (23.8MB), Roccia Collection (18.3MB)
 *   Oyster:    Bath Spa Collection Vol. 1.8 (52.6MB) — Oyster's only
 *              identified catalog; the brand shows "Coming soon" on the
 *              Catalog page until this is added
 *
 * To add any NEW catalog (beyond the list above) later: open and read
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
]
