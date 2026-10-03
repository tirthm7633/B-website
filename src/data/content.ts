/**
 * SINGLE SOURCE OF TRUTH for all editable content on the Buildcon House site.
 * Edit text, links, phone numbers, brand names, category data and image
 * paths here — components read from this file instead of hard-coding copy.
 *
 * ============================== IMAGE SLOTS ==============================
 * Every image on the site is referenced from this file only. Drop a file
 * at the path shown and it appears automatically; if a file is missing,
 * components fall back to a dark textured gradient (see SmartImage.tsx).
 *
 *   /public/images/homepage/hero-living-room.webp
 *                                           Hero, full-bleed background.
 *                                            Currently: bright living room with
 *                                            a curved sofa (from the 2026
 *                                            product brochure).
 *   (About image — no file yet)             About section, portrait 3:4 frame.
 *                                            Currently: dark placeholder; set
 *                                            `about.image.src` when a non-
 *                                            showroom photo is available.
 *   /public/images/homepage/category-sanitaryware.webp
 *   /public/images/homepage/category-tiles.webp
 *   /public/images/homepage/category-kitchen.webp
 *   /public/images/homepage/category-wellness.webp
 *   /public/images/homepage/category-furniture.webp
 *                                           Categories — one photo per card
 *                                            (all from the 2026 product
 *                                            brochure; see the comment above
 *                                            `hero` below).
 *   /public/images/gallery-1.jpg .. -4.jpg  Gallery editorial grid (files are
 *                                            numbered by copy order; display
 *                                            order is set in `gallery.images`
 *                                            below to match portrait/landscape
 *                                            photos to the right grid slots).
 *                                            Currently: Vitra ceramics wall,
 *                                            black shower/toilet display,
 *                                            Dimore tile wall, navy modular
 *                                            kitchen. Add more by extending
 *                                            the `gallery.images` array.
 *   /public/images/homepage/visit-storefront-night.webp
 *                                           Visit Us section, beside the
 *                                            address. Currently: the brochure's
 *                                            night view of the storefront.
 *   /public/images/logo.png                 Navbar / preloader / footer
 *                                            logo — see `site.logo` below.
 *   /public/favicon.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png
 *                                            Tab / home-screen icons: the logo's
 *                                            blue "O" (a ring with a real hole;
 *                                            the touch icon sits on a dark square).
 * ===========================================================================
 */

export type ImageSlot = {
  src: string
  alt: string
  /** CSS object-position, e.g. "center 60%" — tune per photo's focal point. */
  objectPosition?: string
}

export const site = {
  name: 'Buildcon House',
  legalName: 'Buildcon House',
  tagline: 'Let you live better',
  shortDescription:
    "Rajkot's destination for premium sanitaryware, tiles, kitchens, wellness and imported furniture.",
  url: 'https://www.buildconhouse.com', // TODO: replace with the live domain once deployed
  logo: {
    // Transparent PNG made from the client's dark-background logo (the grey
    // wordmark and blue "O" are built for the dark theme, so it is meant for
    // dark surfaces only). The two files the client sent — on black and on
    // white — are kept untouched in public/images/logo-originals/. If the
    // logo is ever swapped, update width/height to the new file's pixel
    // size: they let the browser reserve the space before it loads.
    src: '/images/logo.png',
    width: 828,
    height: 200,
    alt: 'Buildcon House logo',
  },
}

export const seo = {
  title: 'Buildcon House | Premium Sanitaryware, Tiles, Kitchen & Furniture in Rajkot',
  description:
    "Buildcon House is Rajkot's premium showroom for sanitaryware, tiles & surfaces, modular kitchens, wellness and imported furniture — bringing world-class global brands under one roof.",
  ogImage: '/images/og-cover.jpg', // TODO: add a 1200x630 social preview image at this path
}

export const contact = {
  phoneDisplay: '+91 99099 06652',
  phoneHref: 'tel:+919909906652',
  whatsappNumber: '919909906652',
  whatsappMessage: 'Hi Buildcon House, I would like to know more about your products.',
  get whatsappHref() {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`
  },
  address: {
    line1: 'Before Gujarat Housing Board, Nr. Katariya Motors,',
    line2: 'New 2nd 150 Feet Ring Road, Rajkot, Gujarat 360005',
    full: 'Before Gujarat Housing Board, Nr. Katariya Motors, New 2nd 150 Feet Ring Road, Rajkot, Gujarat 360005',
  },
  directionsHref: 'https://maps.app.goo.gl/TZmzmMfWWEKdhH8J6?g_st=iwb',
  mapEmbedSrc:
    'https://www.google.com/maps?q=' +
    encodeURIComponent('Buildcon House, Before Gujarat Housing Board, Nr. Katariya Motors, New 2nd 150 Feet Ring Road, Rajkot, Gujarat 360005') +
    '&output=embed',
  instagramHandle: '@buildcon__house',
  instagramHref: 'https://www.instagram.com/buildcon__house',
  // TODO: add the studio's email once provided — the contact section hides
  // the email row automatically while this stays empty.
  email: '',
  // TODO: confirm real opening hours with the showroom team.
  hours: [
    { days: 'Monday – Saturday', time: '10:00 AM – 8:00 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],
  // TODO: add real latitude/longitude for more precise JSON-LD geo data.
  geo: { lat: 22.2841, lng: 70.7476 },
  exteriorImage: {
    src: '/images/homepage/visit-storefront-night.webp',
    // Native 1427x1102 (~4:3) — the Contact section frames it at 4:3, so it
    // is barely cropped; centering is just a safe default.
    alt: 'Night view of the Buildcon House storefront with its brand signage',
    objectPosition: 'center',
  } as ImageSlot,
}

// "Brands" is intentionally not a plain anchor link here — it opens the
// BrandsPanel overlay instead (see components/Nav.tsx and BrandsPanel.tsx),
// so it's wired up separately from this scroll-to-section list.
// An entry with `href` scrolls to a section of the homepage; one with `to` is a
// separate page. Gallery is the full /gallery page — the homepage section is
// just a preview of it.
export const nav: { label: string; href?: string; to?: string }[] = [
  { label: 'Categories', href: '#categories' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Visit Us', href: '#contact' },
]

// HOMEPAGE PHOTOS FROM THE 2026 PRODUCT BROCHURE (/public/images/homepage/).
// No real showroom photo is used anywhere on the homepage except the Gallery
// section, which is intentionally untouched (showroom photos go there later).
//   Hero ............... p24 living room ("10 / IMPORTED FURNITURE" slide)
//   Imported Furniture . p3 living room (the brochure's About slide photo)
//   Modular Kitchen .... p6 kitchen ("01 / KITCHENS")
//   Sanitaryware ....... p8 bathroom ("02 / BATHROOM PRODUCTS")
//   Tiles & Surfaces ... p22 stone-look floor ("09 / TILES AND SURFACES")
//   Wellness ........... p10 whirlpool spa bath
//   Visit Us ........... p26 night view of the storefront (looks like a render)
//   About .............. EMPTY (dark placeholder) — every non-brand photo is used.
// The kitchen, bathroom, tiles and wellness photos come from slides that also
// carry a brand logo (Verantes Living, Grohe, Nexion, Oyster), so the same
// pictures are in those brands' galleries too. Each photo also has a
// `-preview.webp` (small, for light placements).
export const hero = {
  eyebrow: 'Premium Living Showroom · Rajkot',
  headline: 'Let you live better',
  subtext:
    "Rajkot's destination for premium sanitaryware, tiles, kitchens, wellness and imported furniture.",
  primaryCta: { label: 'Visit Showroom', href: '#contact' },
  secondaryCta: { label: 'WhatsApp Us', href: contact.whatsappHref },
  image: {
    src: '/images/homepage/hero-living-room.webp',
    alt: 'Bright living room with a curved sofa, armchairs and a round coffee table beside a large window',
    objectPosition: 'center 55%',
  } as ImageSlot,
}

// Years in business (confirmed). This one number drives both the About stats
// ("Years of Trust") and the Why Us stats ("Years of Experience").
const YEARS_IN_BUSINESS = 18

export const about = {
  eyebrow: 'About Buildcon House',
  heading:
    'A premium showroom bringing world-class international brands together, under one roof, in Rajkot.',
  body:
    'Buildcon House was built for people who care about how their home feels, not just how it looks. We curate the finest global names in sanitaryware, tiles, kitchens, wellness and furniture, and bring them to Rajkot with the guidance and service a considered home deserves.',
  // TODO: update these figures with real numbers whenever convenient.
  // NOTE: "Global Brands" is a plain number (not derived from brands.length)
  // because this object is declared before the `brands` array below —
  // update it manually whenever a brand is added or removed.
  stats: [
    { value: 10, suffix: '+', label: 'Global Brands' },
    { value: 5, suffix: '', label: 'Categories' },
    { value: 1, suffix: '', label: 'Showroom in Rajkot' },
    { value: YEARS_IN_BUSINESS, suffix: '+', label: 'Years of Trust' },
  ],
  image: {
    // No non-showroom photo left for this slot (the brochure's three
    // non-brand photos went to the Hero, Imported Furniture card and Visit
    // Us). An empty src renders SmartImage's dark placeholder.
    src: '',
    alt: 'Buildcon House showroom',
    objectPosition: 'center 30%',
  } as ImageSlot,
}

// PLACEHOLDER STORY — replace with real founding details, year, and family history
// before going fully public. The wording below is invented to set the tone (warm,
// confident, premium) and deliberately avoids any specific year, name or claim.
export const ourStory = {
  eyebrow: 'Our Story',
  // Large pull-quote style line.
  heading: 'Built by a family that believes Rajkot deserves the world’s finest.',
  // Opening line, set in the serif.
  lead:
    'Buildcon House began as a family business with one conviction: the homes of Rajkot deserve the same quality you’d find in the world’s great design cities.',
  // Supporting text, set in the body face.
  body:
    'So we set out to bring the finest global brands to our hometown, and to stand behind every one of them ourselves. Each product on our floor is chosen with care, and every project is handled with the pride of people who put their name on the work. That care, and the family behind it, is still what you’ll find when you walk in.',
  image: {
    // Reuses the Visit Us storefront photo (no new photo — per the homepage photo
    // rules). Swap this path whenever there is a story-specific image.
    src: '/images/homepage/visit-storefront-night.webp',
    alt: 'Night view of the Buildcon House storefront with its brand signage',
    objectPosition: 'center',
  } as ImageSlot,
}

export type CategoryName =
  | 'Sanitaryware & Bath Fittings'
  | 'Tiles & Surfaces'
  | 'Modular Kitchen'
  | 'Wellness'
  | 'Imported Furniture'

export type Category = {
  slug: string
  name: CategoryName
  description: string
  image: ImageSlot
}

export const categories: Category[] = [
  {
    slug: 'sanitaryware',
    name: 'Sanitaryware & Bath Fittings',
    description: 'Faucets, showers, basins, toilets and bathroom accessories from the world’s finest names.',
    image: {
      // Brochure slide "02 / BATHROOM PRODUCTS" (1296x972, landscape cropped to the 3:4 card).
      src: '/images/homepage/category-sanitaryware.webp',
      alt: 'Grey-tiled bathroom with a wall-mounted shower set, hand shower and basin mixer',
      objectPosition: '38% center',
    },
  },
  {
    slug: 'tiles-surfaces',
    name: 'Tiles & Surfaces',
    description: 'Floor, wall and premium designer tiles for every space and style.',
    image: {
      // Brochure slide "09 / TILES AND SURFACES" (830x1126, already near 3:4).
      src: '/images/homepage/category-tiles.webp',
      alt: 'Stone-look floor tiles seen from above with two chairs',
      objectPosition: 'center',
    },
  },
  {
    slug: 'modular-kitchen',
    name: 'Modular Kitchen',
    description: 'Custom cabinetry, premium finishes and fittings built around how you live.',
    image: {
      // Brochure slide "01 / KITCHENS" (1280x1600 after processing).
      src: '/images/homepage/category-kitchen.webp',
      alt: 'Modular kitchen with timber-toned shutters, a long island and dining area',
      objectPosition: 'center 55%',
    },
  },
  {
    slug: 'wellness',
    name: 'Wellness',
    description: 'Steam, spa and premium bathing experiences for everyday renewal.',
    image: {
      // Brochure slide "03 / BATHROOM PRODUCTS", but the photo is a whirlpool
      // spa bath, so it sits on the Wellness card (1200x1200, square cropped to 3:4).
      src: '/images/homepage/category-wellness.webp',
      alt: 'Whirlpool bath with lit hydro-massage jets on a timber deck',
      objectPosition: 'center 60%',
    },
  },
  {
    slug: 'imported-furniture',
    name: 'Imported Furniture',
    description: 'Luxury living and lifestyle pieces, imported and curated for discerning homes.',
    image: {
      // Wide (1260x560) source cropped to the 3:4 card, centred on the sofa.
      src: '/images/homepage/category-furniture.webp',
      alt: 'Living space with a curved sofa, lounge chair and round coffee table by a large window',
      objectPosition: 'center',
    },
  },
]

export type Brand = {
  name: string
  // Path under /public/images/brands. If the file is missing or fails to
  // load, BrandLogo automatically falls back to a bold uppercase text label
  // — see components/BrandLogo.tsx.
  logo: string
  // Plate the logo sits on. "light" (#EDEFF2) works for most logos — dark
  // boxes, colour blocks, black text all read fine on it. Use "dark"
  // (#0C0F13 + steel-blue hairline) for logos whose own mark is light/grey
  // on a white or transparent background (low contrast on a light plate).
  // "steel" (#1B222B) is available for a busy multi-colour logo that needs
  // a neutral, less stark surface. Defaults to "light" when omitted.
  plate?: 'light' | 'dark' | 'steel'
  // The one category this brand is listed under in the grouped Brands panel
  // and Catalog page (see lib/brandGroups.ts). Must be a CategoryName.
  category: CategoryName
  verified: boolean
  note?: string
}

// Each brand's `category` is the client-provided grouping used by the Brands
// panel and the Catalog page: Sanitaryware & Bath Fittings (Grohe, Hansgrohe
// x Axor, Geberit, Vitra), Tiles & Surfaces (Qutone, Nexion, Dimore, MCM
// Ittim), Wellness (Oyster), Modular Kitchen (Verantes Living). Imported
// Furniture currently has no brands and shows a "coming soon" line. Brands
// within a category follow this array's order. Entries marked verified:
// false still need confirming against the actual brand agreements
// Buildcon House holds.
//
// LOGO AUDIT, round 3 (scripts/crop-brand-logos.cjs + audit-brand-logos.cjs):
// every raster file is gently auto-trimmed to its real content bounding box
// (8% padding re-added), with the pristine original always kept in
// public/images/brands/originals/ so the crop is non-destructive and
// re-running the script is safe. A real logo file ALWAYS shows as an
// image — there is no minimum-resolution rule. A small cropped file is
// scaled up by plain CSS in the tile (object-fit: contain at a fixed
// 88%/72% box — see components/BrandLogo.tsx) rather than left tiny. The
// bold text fallback is reserved strictly for brands with no file at all:
// currently only mcm-ittim.png (the supplied file mixed the real mark with
// unrelated pattern-swatch artwork) — see the README for details.
//
// Each `plate` below is the higher-contrast choice between the two plate
// colours for that specific file's measured average luminance (recomputed
// after every crop, since trimming changes the ratio of logo to
// background pixels).
export const brands: Brand[] = [
  {
    name: 'Grohe',
    logo: '/images/brands/grohe.png',
    // Avg luminance 0.38 (navy box majority) — contrast is 7.8:1 on the
    // dark plate vs 2.1:1 on light.
    plate: 'dark',
    category: 'Sanitaryware & Bath Fittings',
    verified: true,
    note: 'German premium faucets, showers and bath fittings brand.',
  },
  {
    // Hansgrohe and Axor are one brand group (Axor is Hansgrohe's designer
    // fittings label), shown as a single brand. The name uses a plain
    // lowercase "x" on purpose: brandSlug() turns it into the ASCII slug
    // "hansgrohe-x-axor" used for the catalog route and folders.
    name: 'Hansgrohe x Axor',
    logo: '/images/brands/hansgrohe-x-axor.png',
    // Avg luminance 0.80 (white background) — contrast is 15.5:1 on the
    // dark plate vs 1.1:1 on light.
    plate: 'dark',
    category: 'Sanitaryware & Bath Fittings',
    verified: true,
    note: 'German premium showers and faucets (Hansgrohe) together with its designer fittings label, Axor.',
  },
  {
    // Confirmed by the client's own logo file: the brand is "Geberit"
    // (Swiss sanitary systems — concealed cisterns & flush plates). The
    // asset is kept at logo path "gebrit.png" to match the filename the
    // client's README convention specifies; only the display name here
    // was corrected.
    name: 'Geberit',
    logo: '/images/brands/gebrit.png',
    // Avg luminance 0.77 (white background) — contrast is 15.1:1 on the
    // dark plate vs 1.1:1 on light.
    plate: 'dark',
    category: 'Sanitaryware & Bath Fittings',
    verified: true,
    note: 'Swiss sanitary systems brand (concealed cisterns & flush plates).',
  },
  {
    name: 'Vitra',
    logo: '/images/brands/vitra.png',
    // Avg luminance 0.92 (thin grey wordmark on near-white) — contrast is
    // 17.8:1 on the dark plate vs 1.1:1 on light.
    plate: 'dark',
    category: 'Sanitaryware & Bath Fittings',
    verified: false,
    // TODO: confirm this refers to Vitra Bathrooms (Eczacıbaşı, Turkey) and
    // not the unrelated Swiss furniture brand "Vitra" — names collide.
    note: 'TODO: confirm this is Vitra Bathrooms (Turkey), not the Swiss furniture brand of the same name.',
  },
  {
    name: 'Qutone',
    logo: '/images/brands/qutone.png',
    // Avg luminance 0.41 (solid teal block, white wordmark) — contrast is
    // 8.4:1 on the dark plate vs 2.0:1 on light.
    plate: 'dark',
    category: 'Tiles & Surfaces',
    verified: true,
    note: 'Indian designer tiles brand.',
  },
  {
    name: 'Nexion',
    logo: '/images/brands/nexion.png',
    // Avg luminance 0.12 (black block, white wordmark) — contrast is 5.3:1
    // on the light plate vs 3.1:1 on dark.
    plate: 'light',
    category: 'Tiles & Surfaces',
    verified: false,
    note: 'TODO: verify brand details and category fit.',
  },
  {
    name: 'Oyster',
    logo: '/images/brands/oyster.png',
    // Avg luminance 0.10 (black box) — contrast is 6.1:1 on the light plate.
    category: 'Wellness',
    verified: false,
    note: 'TODO: verify — likely Oyster shower enclosures / steam & wellness range.',
  },
  {
    name: 'Dimore',
    logo: '/images/brands/dimore.png',
    // Avg luminance 0.11 (maroon box) — contrast is 5.6:1 on the light plate.
    category: 'Tiles & Surfaces',
    verified: false,
    note: 'TODO: verify brand details and category fit.',
  },
  {
    name: 'MCM Ittim',
    logo: '/images/brands/mcm-ittim.png',
    // TODO: file removed — it mixed the real "ittimi by MCM" mark with a
    // large block of unrelated decorative pattern swatches, and its tall
    // (399x501) aspect made it render tiny inside the wide tile.
    // Text fallback shows until a clean, logo-only export is supplied.
    category: 'Tiles & Surfaces',
    verified: false,
    note: 'TODO: verify exact brand name, spelling and category fit. Needs a clean logo-only file (see README).',
  },
  {
    name: 'Verantes Living',
    logo: '/images/brands/verantes-living.png',
    // Avg luminance 0.90 (white background, gold mark) — contrast is
    // 17.4:1 on the dark plate vs 1.1:1 on light.
    plate: 'dark',
    category: 'Modular Kitchen',
    verified: false,
    note: 'Listed under Modular Kitchen per the client\'s category mapping.',
  },
]

export const trustedByFinest = {
  label: 'Our Partners',
  headline: 'Brands we bring together',
}

export type WhyUsStat = {
  value: number
  suffix: string
  label: string
  /** True while the number is a stand-in that hasn't been confirmed with the client. */
  placeholder?: boolean
}

export type TrustPointIcon = 'shield' | 'home' | 'calendar' | 'building'

export type TrustPoint = {
  icon: TrustPointIcon
  title: string
  desc: string
  /**
   * Makes the whole card clickable. `consultation` opens the "Book a Design
   * Consultation" popup (source "enquire"); `link` navigates to a page.
   */
  action?: { label: string } & ({ kind: 'consultation' } | { kind: 'link'; to: string })
}

// PLACEHOLDER — TODO: confirm real project count.
// NOTE: the Projects page currently lists only 3 placeholder projects (see
// data/projects.ts), so this figure does NOT match what that page shows.
const PROJECTS_COMPLETED = 25

// The "Why Us" section: stat counters on top, trust points below. All copy lives here.
export const whyUs = {
  eyebrow: 'Why Buildcon House',
  heading: 'Genuine brands, real projects, one showroom in Rajkot.',
  stats: [
    // Derived, so it stays accurate: add an 11th brand and this reads "11+".
    { value: brands.length, suffix: '+', label: 'Brands' },
    { value: YEARS_IN_BUSINESS, suffix: '+', label: 'Years of Experience' },
    // PLACEHOLDER — TODO: confirm real project count (see PROJECTS_COMPLETED).
    { value: PROJECTS_COMPLETED, suffix: '+', label: 'Projects Completed', placeholder: true },
    // Derived from the Categories section: Sanitaryware, Tiles, Kitchen, Wellness, Furniture.
    { value: categories.length, suffix: '', label: 'Categories Under One Roof' },
  ] as WhyUsStat[],
  trustPoints: [
    {
      icon: 'shield',
      title: 'Authorized Dealer',
      desc: 'Official partner for Grohe, Vitra, Geberit and other globally renowned brands — premium fittings and craftsmanship, brought to Rajkot under one roof.',
    },
    {
      icon: 'home',
      title: 'Every Category, One Roof',
      desc: 'Sanitaryware, tiles, modular kitchens, wellness and furniture — no running between shops.',
    },
    {
      icon: 'calendar',
      title: 'Free Design Consultation',
      desc: 'Our team helps you choose the right products for your space.',
      action: { kind: 'consultation', label: 'Book a consultation' },
    },
    {
      icon: 'building',
      title: 'Real Projects, Proven Results',
      desc: 'See our completed work across villas, apartments and offices.',
      action: { kind: 'link', to: '/projects', label: 'View our projects' },
    },
  ] as TrustPoint[],
}

export type GalleryPhoto = ImageSlot & {
  /** Smaller (<=960px) copy for grid tiles; `src` is the full photo the viewer opens. */
  preview: string
  /** Real pixel size of `src` — tiles reserve their space from this, so nothing shifts as images load. */
  width: number
  height: number
  /** Shown in the homepage preview row (see components/sections/Gallery.tsx). */
  featured?: boolean
}

export const gallery = {
  // Homepage preview section
  eyebrow: 'Showroom',
  heading: 'Step inside Buildcon House',
  body: 'A look at our Rajkot showroom floor.',
  cta: { label: 'View Full Gallery', to: '/gallery' },
  // Full /gallery page
  page: {
    eyebrow: 'Showroom',
    heading: 'Our Showroom',
    body: 'Walk through our Rajkot showroom floor — displays for bathrooms, kitchens, tiles and surfaces.',
  },
  // Every photo, in the order the /gallery page and its viewer show them. That order was
  // searched for so the page's masonry columns end up as even as these photo shapes allow
  // (2 columns: within ~0.03 column-widths; 3 columns: within one landscape photo, the best
  // possible with 11 portrait + 5 landscape) — re-balance it if photos are added. The four marked
  // `featured` (all portrait, picked for composition, lighting and a different subject each:
  // showroom floor, bathroom, tile wall, basin-mixer display) are the homepage preview, in
  // this order. Their objectPosition steers the 2:3 centre-crop of the 9:16 originals.
  // The full page shows every photo uncropped at its own aspect ratio. Note gallery-2 / gallery-16
  // (same Vitra display) and gallery-4 / gallery-10 (same corridor) are near-duplicates.
  images: [
    { src: '/images/gallery-4.jpg', preview: '/images/gallery-4-preview.jpg', width: 900, height: 1600, alt: 'Dimore tile wall with curated art at Buildcon House', objectPosition: 'center 50%', featured: true },
    { src: '/images/gallery-1.jpg', preview: '/images/gallery-1-preview.jpg', width: 1280, height: 720, alt: 'Navy-finish modular kitchen display at Buildcon House' },
    { src: '/images/gallery/gallery-07.jpg', preview: '/images/gallery/gallery-07-preview.jpg', width: 720, height: 1280, alt: 'Tile sample racks and sliding display panels beneath a Dimore sign' },
    { src: '/images/gallery/gallery-15.jpg', preview: '/images/gallery/gallery-15-preview.jpg', width: 720, height: 1280, alt: 'Axor shower display with a rain shower and thermostatic controls in a dark enclosure' },
    { src: '/images/gallery/gallery-08.jpg', preview: '/images/gallery/gallery-08-preview.jpg', width: 1280, height: 720, alt: 'Dark modular kitchen display with a marble island and pendant lights' },
    { src: '/images/gallery-3.jpg', preview: '/images/gallery-3-preview.jpg', width: 720, height: 1280, alt: 'Matte black shower and wall-hung toilet display', objectPosition: 'center 25%', featured: true },
    { src: '/images/gallery/gallery-11.jpg', preview: '/images/gallery/gallery-11-preview.jpg', width: 720, height: 1280, alt: 'Rows of large-format tile slabs on display racks under a Dimore sign' },
    { src: '/images/gallery/gallery-10.jpg', preview: '/images/gallery/gallery-10-preview.jpg', width: 900, height: 1600, alt: 'Showroom floor with tile display boards, wall art and a meeting table' },
    { src: '/images/gallery/gallery-09.jpg', preview: '/images/gallery/gallery-09-preview.jpg', width: 720, height: 1280, alt: 'Marble and stone slab display behind black pillar handles with a yellow vase of flowers' },
    { src: '/images/gallery/gallery-06.jpg', preview: '/images/gallery/gallery-06-preview.jpg', width: 720, height: 1280, alt: 'Dimore display wall with round material swatches on hanging rails', objectPosition: 'center 40%', featured: true },
    { src: '/images/gallery/gallery-13.jpg', preview: '/images/gallery/gallery-13-preview.jpg', width: 720, height: 1280, alt: 'Vitra bathroom display with a smart toilet graphic and basin shelves' },
    { src: '/images/gallery-2.jpg', preview: '/images/gallery-2-preview.jpg', width: 1280, height: 720, alt: 'Vitra ceramics wall — Equal and Metropole collections' },
    { src: '/images/gallery/gallery-05.jpg', preview: '/images/gallery/gallery-05-preview.jpg', width: 720, height: 1280, alt: 'Large-format tile display board beside a tall potted plant' },
    { src: '/images/gallery/gallery-14.jpg', preview: '/images/gallery/gallery-14-preview.jpg', width: 720, height: 1280, alt: 'Axor basin mixer display with hand showers on a black stand', objectPosition: 'center 70%', featured: true },
    { src: '/images/gallery/gallery-12.jpg', preview: '/images/gallery/gallery-12-preview.jpg', width: 1280, height: 720, alt: 'Bathroom display with a rain shower, hand shower and a bright partition, with plants overhead' },
    { src: '/images/gallery/gallery-16.jpg', preview: '/images/gallery/gallery-16-preview.jpg', width: 1280, height: 720, alt: 'Vitra Equal and Metropole bathroom display with wall-hung toilets and washbasins' },
  ] as GalleryPhoto[],
}

export const footer = {
  quickLinks: nav,
}
