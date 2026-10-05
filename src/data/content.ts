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
 *   /public/images/homepage/about-rain-shower.webp
 *                                           About section, portrait 3:4 frame.
 *                                            Currently: the brochure's Grohe
 *                                            ceiling rain shower (a copy of the
 *                                            Grohe gallery photo; native 561x701).
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

import { SHOW_PROJECTS } from './visibility.ts'

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
  // The live address, with no trailing slash. Used for the share preview, canonical links, the
  // sitemap's URLs and the structured data. www is the main address: in Vercel (Settings -> Domains)
  // buildconhouse.com redirects to www.buildconhouse.com, so keep this, index.html's og tags and
  // public/sitemap.xml + robots.txt in step with that choice.
  url: 'https://www.buildconhouse.com',
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
  // 1200x630 social-share preview (public/images/og-cover.jpg); also referenced as an absolute
  // URL in index.html, because link-preview crawlers (WhatsApp, Facebook) don't run JavaScript.
  ogImage: '/images/og-cover.jpg',
}

export const contact = {
  phoneDisplay: '+91 99099 06652',
  phoneHref: 'tel:+919909906652',
  whatsappNumber: '919909906652',
  whatsappMessage: 'Hi Buildcon House, I would like to know more about your products.',
  /**
   * A WhatsApp chat link with a pre-filled message. Uses api.whatsapp.com/send rather than wa.me:
   * it hands off more reliably on phones with both WhatsApp and WhatsApp Business installed
   * (the phone's own app picker offers either) and opens WhatsApp Web on a computer. Every
   * WhatsApp link on the site goes through here.
   */
  whatsappLink(message: string) {
    return `https://api.whatsapp.com/send?phone=${this.whatsappNumber}&text=${encodeURIComponent(message)}`
  },
  get whatsappHref() {
    return this.whatsappLink(this.whatsappMessage)
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
  // The showroom's public email, shown (as a mailto link) under "Connect" in the Contact
  // section — that row hides automatically if this is empty. NOTE: this is only the address
  // shown to visitors; where consultation requests are delivered is a separate setting
  // (CONSULTATION_EMAIL in consultation-config.ts).
  email: 'buildconhouse10@gmail.com',
  // Opening hours confirmed by the owner (2026-10-04): 9:30 AM – 7:30 PM, Monday – Saturday,
  // closed on Sunday. `schema` is the same opening time in the form search engines read (24-hour
  // times); SEO.tsx puts it in the structured data — keep it in step with `time`.
  hours: [
    {
      days: 'Monday – Saturday',
      time: '9:30 AM – 7:30 PM',
      schema: { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:30', closes: '19:30' },
    },
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
//   About .............. Grohe ceiling rain shower (brochure image #453, from the Grohe section — a
//                        brand photo, the strongest unused one; also in the Grohe gallery).
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
  // The hero's photo carousel (one slide per category) is `heroSlides`, declared after
  // `categories` below. This living-room photo is its Imported Furniture slide.
  image: {
    src: '/images/homepage/hero-living-room.webp',
    alt: 'Bright living room with a curved sofa, armchairs and a round coffee table beside a large window',
    objectPosition: 'center 55%',
  } as ImageSlot,
}

// Years in business (confirmed by the owner as "18+"). This one number drives the About stats
// ("Years of Trust"), the Why Us stats ("Years of Experience") and the "18+" wording in the
// Our Journey copy below, so they can't drift apart.
const YEARS_IN_BUSINESS = 18

// Year Buildcon Gallery opened (the first Our Journey milestone).
// NOTE: 2026 - 2009 = 17, while the owner confirmed "18+ years" (2026-10-04) — so
// YEARS_IN_BUSINESS is a stated figure and is deliberately NOT computed from this. Both are kept
// as the owner gave them; if the founding year turns out to be 2008, change only this constant.
const FOUNDING_YEAR = 2009

export const about = {
  eyebrow: 'About Buildcon House',
  heading:
    'A premium showroom bringing world-class international brands together, under one roof, in Rajkot.',
  /** Words of `heading` set in the serif italic accent (must appear in `heading` as written). */
  headingAccent: 'under one roof,',
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
    // The brochure's non-brand photos are all used elsewhere (Hero, Imported Furniture
    // card, Visit Us), so this is the strongest unused *brand* photo: a Grohe ceiling rain
    // shower in dark stone — cool and neutral, so it sits inside the Obsidian Steel palette
    // (SmartImage adds the usual desaturated grade + overlay). It is a brochure picture, not
    // a showroom photo, and only 561x701 natively, so it is a little soft on large screens;
    // swap in a real Buildcon House photo when one is available. (An empty src renders
    // SmartImage's dark placeholder.)
    src: '/images/homepage/about-rain-shower.webp',
    alt: 'Ceiling-mounted rain shower falling over a dark stone shower room',
    objectPosition: 'center',
  } as ImageSlot,
}

export type JourneyMilestone = {
  /** Shown large on the timeline (a year, or "Today"). Omit for the standalone callout. */
  year?: string
  title: string
  body: string[]
  /** A short list after `body`: pills for a `feature` callout, a plain list otherwise. */
  items?: string[]
  /** Paragraphs after the list. */
  afterItems?: string[]
  /** Render as the boxed, year-less callout (no year) instead of a regular milestone. */
  feature?: boolean
}

// The "Our Journey" timeline on its own page (pages/OurJourneyPage.tsx) — real copy from the owner.
// The "18+" and founding-year figures come from YEARS_IN_BUSINESS / FOUNDING_YEAR above.
export const ourJourney: JourneyMilestone[] = [
  {
    year: String(FOUNDING_YEAR),
    title: 'The Beginning',
    body: [
      `Our journey began in ${FOUNDING_YEAR} with Buildcon Gallery, located at 25/37, New Jagnath Plot, near Astron Chowk, Rajkot, Gujarat. We started with imported tiles, with a vision to bring premium products to our customers. In the same year, we became dealers for two reputed brands, Qutone Tiles and GROHE, marking the beginning of long-term relationships with leading brands in the industry.`,
    ],
  },
  {
    year: '2016',
    title: 'Expanding Our Portfolio',
    body: [
      'As Buildcon Gallery continued to grow, we expanded our portfolio by becoming a dealer for Nexion in 2016. This was another important step in our journey, strengthening our presence in the premium tile segment.',
    ],
  },
  {
    year: '2020',
    title: 'The Beginning of Buildcon House',
    body: [
      'In 2020, we entered a new chapter with the launch of Buildcon House. The vision was simple: to provide a one-stop premium solution under one roof. With a new space, a new address, new brands and a 15,000+ sq. ft. showroom, Buildcon House was created to offer customers a more complete experience.',
    ],
  },
  {
    feature: true,
    title: 'One Roof. Complete Solutions.',
    body: ['Buildcon House brought together a wider range of products and solutions, including:'],
    items: [
      'Interior & exterior tiles',
      'Pipe fittings',
      'Faucets & sanitaryware',
      'Wellness solutions',
      'Windows',
      'Modular kitchens',
      'Wardrobes',
      'Modular & imported furniture',
    ],
    afterItems: [
      'Our goal was to make the process of creating premium spaces more convenient by bringing multiple solutions together under one roof.',
    ],
  },
  {
    year: 'Today',
    title: `${YEARS_IN_BUSINESS}+ Years of Experience`,
    body: [
      `Today, Buildcon carries ${YEARS_IN_BUSINESS}+ years of experience in the industry. Our journey has been built on more than products and showrooms. It has been shaped by:`,
    ],
    items: [
      'Long-term customer relationships',
      'Trusted brand partnerships',
      'Premium quality and products',
      'A complete one-stop solution',
      "Understanding our customers' needs",
    ],
    afterItems: [
      'Many of our brand partnerships have grown into relationships spanning 10-18 years, reflecting the trust and continuity we value in our business.',
      "Over the years, we have also had the opportunity to contribute to some of Saurashtra's top premium projects, further strengthening our experience in the premium segment.",
    ],
  },
]

// Header and closing pull-quote of the /our-journey page.
export const journeyPage = {
  eyebrow: `Since ${FOUNDING_YEAR}`,
  heading: 'Our Journey',
  intro: `From Buildcon Gallery in ${FOUNDING_YEAR} to Buildcon House today, our journey spans ${YEARS_IN_BUSINESS}+ years of experience, trusted brand partnerships, and lasting customer relationships.`,
  closing: {
    heading: 'Built on Trust. Growing Through Relationships.',
    body: `From Buildcon Gallery in ${FOUNDING_YEAR} to Buildcon House today, our journey has always been driven by the same foundation: quality, trust, relationships and a commitment to understanding what our customers need.`,
    tagline: `${YEARS_IN_BUSINESS}+ years of experience, built on trust and lasting relationships.`,
  },
}

// The short "Our Journey" teaser on the homepage (components/sections/OurJourneyTeaser.tsx),
// which links to the full timeline page. Four paragraphs; the last is set as a closing pull-quote.
export const journeyTeaser = {
  eyebrow: `Since ${FOUNDING_YEAR}`,
  heading: 'Our Journey',
  paragraphs: [
    `From Buildcon Gallery in ${FOUNDING_YEAR} to Buildcon House today, our journey spans ${YEARS_IN_BUSINESS}+ years of experience, trusted brand partnerships, and lasting customer relationships.`,
    'What began with imported tiles has evolved into a 15,000+ sq. ft. premium destination, bringing tiles, sanitaryware, wellness, windows, modular kitchens, furniture and more together in one place.',
    'Today, Buildcon continues to grow with one simple vision: to provide a complete premium solution for every space.',
    `${YEARS_IN_BUSINESS}+ years of experience. Built on trust. Driven by quality. Creating spaces that last.`,
  ],
  cta: { label: 'Read Our Full Story', to: '/our-journey' },
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
// bold text fallback is reserved strictly for brands with no file at all
// (currently none: all ten brands have a real logo file — see the README).
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
    // Cut out of the supplied 399x501 image ("ittimi by MCM — Ecoriclay Cladding" on a flat
    // grey, with a band of pattern swatches underneath): only the logo rows were kept, the
    // grey background was made transparent, and it was resized 2x (Lanczos) for smoother
    // scaling. The supplied image is kept untouched in originals/mcm-ittim-as-supplied.png.
    // The mark is white, so it needs the dark plate. A higher-resolution or vector (SVG)
    // export, if the brand has one, would look sharper — just replace the file.
    plate: 'dark',
    category: 'Tiles & Surfaces',
    verified: false,
    note: 'TODO: verify exact brand name, spelling and category fit.',
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
  /** The word of `headline` set in the serif italic accent. */
  headlineAccent: 'together',
}

// Hero background carousel: one slide per category, in `categories` order (numbered 01–05 like
// the Categories cards). Every slide reuses an existing homepage photo. Imported Furniture uses
// the hero living room (`hero.image`): its own card photo is a 1260x560 strip, too small to fill
// a screen. objectPosition keeps each photo's subject in frame for both a wide desktop crop and
// a tall phone crop.
const HERO_SLIDE_POSITIONS: Record<string, string> = {
  sanitaryware: '38% center',
  'tiles-surfaces': '30% 55%',
  'modular-kitchen': 'center 58%',
  wellness: 'center 62%',
}

export const heroSlides: { category: Category; image: ImageSlot }[] = categories.map((category) => ({
  category,
  image:
    category.slug === 'imported-furniture'
      ? hero.image
      : { ...category.image, objectPosition: HERO_SLIDE_POSITIONS[category.slug] ?? category.image.objectPosition },
}))


export type WhyUsStat = {
  value: number
  suffix: string
  label: string
  /** True while the number is a stand-in that hasn't been confirmed with the client. */
  placeholder?: boolean
  /** Makes the whole stat a link to this page, with `linkLabel` as its arrow label. */
  to?: string
  linkLabel?: string
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

// Projects completed — "25+" confirmed by the owner (2026-10-04). The Projects page itself is
// switched off while its sample projects are placeholders (data/visibility.ts), so this figure is
// not backed by anything visitors can browse yet.
const PROJECTS_COMPLETED = 25

// The "Why Us" section: stat counters on top, trust points below. All copy lives here.
export const whyUs = {
  eyebrow: 'Why Buildcon House',
  heading: 'Genuine brands, real projects, one showroom in Rajkot.',
  stats: [
    // Derived, so it stays accurate: add an 11th brand and this reads "11+".
    { value: brands.length, suffix: '+', label: 'Brands' },
    // Links to the full story: the Our Journey timeline page.
    { value: YEARS_IN_BUSINESS, suffix: '+', label: 'Years of Experience', to: '/our-journey', linkLabel: 'Our story' },
    { value: PROJECTS_COMPLETED, suffix: '+', label: 'Projects Completed' },
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
      title: 'Our Product Suggestion Experience',
      desc: "Share your space with us, and we'll suggest the products that truly fit.",
      action: { kind: 'consultation', label: 'Book a consultation' },
    },
    // This card links to the Projects page, so it goes away with the page (data/visibility.ts).
    ...(SHOW_PROJECTS
      ? [
          {
            icon: 'building',
            title: 'Real Projects, Proven Results',
            desc: 'See our completed work across villas, apartments and offices.',
            action: { kind: 'link', to: '/projects', label: 'View our projects' },
          },
        ]
      : []),
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
