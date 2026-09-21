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
 *   /public/images/hero-showroom.jpg        Hero, full-bleed background.
 *                                            Currently: the Grohe "Colours —
 *                                            Shades of Luxury" shower display
 *                                            (navy + gold, editorial).
 *   /public/images/about-showroom.jpg       About section, portrait frame.
 *                                            Currently: gold-fitting bath with
 *                                            floral tile floor (portrait).
 *   /public/images/category-sanitaryware.jpg  Categories — Sanitaryware & Bath
 *                                            Fittings card. Currently: Axor
 *                                            basin mixer display.
 *   /public/images/category-tiles.jpg       Categories — Tiles & Surfaces
 *                                            card. Currently: Nexion tile wall.
 *   /public/images/category-kitchen.jpg     Categories — Modular Kitchen card.
 *                                            Currently: walnut-tone kitchen
 *                                            ("5000+ Shades of Stainless
 *                                            Sophistication").
 *   /public/images/category-wellness.jpg    Categories — Wellness card.
 *                                            Currently: Oyster spa tub display.
 *   /public/images/category-furniture.jpg   Categories — Imported Furniture
 *                                            card. TODO: no furniture photo
 *                                            supplied yet — renders a dark
 *                                            textured placeholder until added.
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
 *   /public/images/visit-exterior.jpg       Visit Us section, beside the
 *                                            address. Currently: the real
 *                                            Buildcon House storefront.
 *   /public/images/logo.png                 Navbar / preloader / footer
 *                                            logo. Missing on purpose — see
 *                                            `site.logo` below.
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
    // Drop the final logo file at public/images/logo.png (any raster or
    // .svg extension works, just update this path to match). Until then
    // this 404s on purpose and <Logo /> automatically falls back to a
    // crisp text wordmark — see components/Logo.tsx. Two reference files
    // the client sent are saved at public/images/logo-on-light.png
    // (full-colour, on white) and public/images/logo-reference-faint.webp
    // (a very low-opacity export unsuitable for direct UI use). Export a
    // full-opacity, transparent PNG/SVG from the source file to go live.
    src: '/images/logo.png',
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
    src: '/images/visit-exterior.jpg',
    // Photo is a native 4:3 (1600x1200) — the Contact section frames it at
    // the same ratio, so it renders uncropped; centering is just a safe default.
    alt: 'Buildcon House storefront on 150 Feet Ring Road, Rajkot',
    objectPosition: 'center',
  } as ImageSlot,
}

// "Brands" is intentionally not a plain anchor link here — it opens the
// BrandsPanel overlay instead (see components/Nav.tsx and BrandsPanel.tsx),
// so it's wired up separately from this scroll-to-section list.
export const nav = [
  { label: 'Categories', href: '#categories' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Visit Us', href: '#contact' },
]

export const hero = {
  eyebrow: 'Premium Living Showroom · Rajkot',
  headline: 'Let you live better',
  subtext:
    "Rajkot's destination for premium sanitaryware, tiles, kitchens, wellness and imported furniture.",
  primaryCta: { label: 'Visit Showroom', href: '#contact' },
  secondaryCta: { label: 'WhatsApp Us', href: contact.whatsappHref },
  image: {
    src: '/images/hero-showroom.jpg',
    alt: 'Grohe Colours shower display at Buildcon House, shades of luxury in navy and gold',
    objectPosition: 'center 60%',
  } as ImageSlot,
}

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
    { value: 11, suffix: '+', label: 'Global Brands' },
    { value: 5, suffix: '', label: 'Categories' },
    { value: 1, suffix: '', label: 'Showroom in Rajkot' },
    { value: 15, suffix: '+', label: 'Years of Trust' }, // TODO: verify years in business
  ],
  image: {
    src: '/images/about-showroom.jpg',
    alt: 'Gold bath fittings with a hand-painted floral tile floor at Buildcon House',
    objectPosition: 'center 30%',
  } as ImageSlot,
}

export type Category = {
  slug: string
  name: string
  description: string
  image: ImageSlot
}

export const categories: Category[] = [
  {
    slug: 'sanitaryware',
    name: 'Sanitaryware & Bath Fittings',
    description: 'Faucets, showers, basins, toilets and bathroom accessories from the world’s finest names.',
    image: {
      src: '/images/category-sanitaryware.jpg',
      alt: 'Axor basin mixer display at Buildcon House',
      objectPosition: 'center 35%',
    },
  },
  {
    slug: 'tiles-surfaces',
    name: 'Tiles & Surfaces',
    description: 'Floor, wall and premium designer tiles for every space and style.',
    image: {
      src: '/images/category-tiles.jpg',
      alt: 'Nexion designer tile wall display at Buildcon House',
      objectPosition: 'center 40%',
    },
  },
  {
    slug: 'modular-kitchen',
    name: 'Modular Kitchen',
    description: 'Custom cabinetry, premium finishes and fittings built around how you live.',
    image: {
      src: '/images/category-kitchen.jpg',
      alt: 'Walnut-finish modular kitchen display at Buildcon House',
      objectPosition: 'center 45%',
    },
  },
  {
    slug: 'wellness',
    name: 'Wellness',
    description: 'Steam, spa and premium bathing experiences for everyday renewal.',
    image: {
      src: '/images/category-wellness.jpg',
      alt: 'Oyster spa bathing display at Buildcon House',
      objectPosition: 'center 30%',
    },
  },
  {
    slug: 'imported-furniture',
    name: 'Imported Furniture',
    description: 'Luxury living and lifestyle pieces, imported and curated for discerning homes.',
    image: {
      // TODO: no furniture photo supplied yet — replace once available.
      src: '/images/category-furniture.jpg',
      alt: 'Imported furniture at Buildcon House',
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
  categories: string[]
  verified: boolean
  note?: string
}

// Categories researched to the best of available knowledge. Entries marked
// verified: false are best-effort guesses — please confirm with the actual
// brand agreements Buildcon House holds.
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
// hansgrohe.png and qutone.png (both were unusable crops missing letters)
// and mcm-ittim.png (mixed the real mark with unrelated pattern-swatch
// artwork) — see the README for details.
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
    categories: ['Sanitaryware & Bath Fittings'],
    verified: true,
    note: 'German premium faucets, showers and bath fittings brand.',
  },
  {
    name: 'Hansgrohe',
    logo: '/images/brands/hansgrohe.png',
    categories: ['Sanitaryware & Bath Fittings'],
    verified: true,
    note: 'German premium showers and faucets brand.',
  },
  {
    name: 'Axor',
    logo: '/images/brands/axor.png',
    // Avg luminance 0.04 (black box) — contrast is 10.4:1 on the light plate.
    categories: ['Sanitaryware & Bath Fittings'],
    verified: true,
    note: "Hansgrohe's designer fittings label.",
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
    categories: ['Sanitaryware & Bath Fittings'],
    verified: true,
    note: 'Swiss sanitary systems brand (concealed cisterns & flush plates).',
  },
  {
    name: 'Vitra',
    logo: '/images/brands/vitra.png',
    // Avg luminance 0.92 (thin grey wordmark on near-white) — contrast is
    // 17.8:1 on the dark plate vs 1.1:1 on light.
    plate: 'dark',
    categories: ['Sanitaryware & Bath Fittings'],
    verified: false,
    // TODO: confirm this refers to Vitra Bathrooms (Eczacıbaşı, Turkey) and
    // not the unrelated Swiss furniture brand "Vitra" — names collide.
    note: 'TODO: confirm this is Vitra Bathrooms (Turkey), not the Swiss furniture brand of the same name.',
  },
  {
    name: 'Qutone',
    logo: '/images/brands/qutone.png',
    categories: ['Tiles & Surfaces'],
    verified: true,
    // TODO: the supplied qutone.png crop clips the "Q" and "NE" — swap in
    // an uncropped export when available.
    note: 'Indian designer tiles brand. TODO: source logo file is cropped — replace with a full export.',
  },
  {
    name: 'Nexion',
    logo: '/images/brands/nexion.png',
    // Avg luminance 0.11 (black box) — contrast is 5.8:1 on the light plate.
    categories: ['Tiles & Surfaces'],
    verified: false,
    note: 'TODO: verify brand details and category fit.',
  },
  {
    name: 'Oyster',
    logo: '/images/brands/oyster.png',
    // Avg luminance 0.10 (black box) — contrast is 6.1:1 on the light plate.
    categories: ['Wellness', 'Sanitaryware & Bath Fittings'],
    verified: false,
    note: 'TODO: verify — likely Oyster shower enclosures / steam & wellness range.',
  },
  {
    name: 'Dimore',
    logo: '/images/brands/dimore.png',
    // Avg luminance 0.11 (maroon box) — contrast is 5.6:1 on the light plate.
    categories: ['Imported Furniture'],
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
    categories: ['Imported Furniture'],
    verified: false,
    note: 'TODO: verify exact brand name, spelling and category fit. Needs a clean logo-only file (see README).',
  },
  {
    name: 'Verantes Living',
    logo: '/images/brands/verantes-living.png',
    // Avg luminance 0.90 (white background, gold mark) — contrast is
    // 17.4:1 on the dark plate vs 1.1:1 on light.
    plate: 'dark',
    // TODO: client to confirm which categories Verantes Living belongs to.
    // Showing a placeholder label until then, per client instruction.
    categories: ['Living'],
    verified: false,
    note: 'TODO: confirm category fit — placeholder label "Living" shown until client confirms.',
  },
]

export const trustedByFinest = {
  label: 'Our Partners',
  headline: 'Brands we bring together, architects we build with',
}

export type Architect = {
  name: string
  firm: string
  // Path under /public/images/architects. If missing or unreadable, a
  // placeholder circle (initials monogram on a steel-blue gradient) renders
  // instead automatically — see components/ArchitectPhoto.tsx.
  photo: string
  quote?: string
}

/**
 * PLACEHOLDER DATA — every name and firm below is a fake placeholder, not a
 * real person. Replace them with real architects/designers Buildcon House
 * partners with before this goes live.
 *
 * To add a person: add one object to this array — { name, firm, photo }.
 * No other code changes are needed; the two-row layout in TrustedByFinest
 * automatically re-splits and re-flows for any number of entries (tested
 * with 30+).
 *
 * To add a real photo: drop a square image (at least 600px, face centred)
 * at the exact path named in `photo` below — see
 * public/images/architects/README.md for the full naming list. Only add a
 * real person's photo with their explicit permission.
 */
export const architects: Architect[] = [
  { name: 'Aarav Mehta', firm: 'Mehta Design Studio, Rajkot', photo: '/images/architects/architect-01.jpg' },
  { name: 'Riya Shah', firm: 'Shah & Associates, Rajkot', photo: '/images/architects/architect-02.jpg' },
  { name: 'Kabir Desai', firm: 'Desai Architects, Ahmedabad', photo: '/images/architects/architect-03.jpg' },
  { name: 'Ishita Patel', firm: 'Studio Patel, Surat', photo: '/images/architects/architect-04.jpg' },
  { name: 'Vihaan Joshi', firm: 'Joshi Design Co., Rajkot', photo: '/images/architects/architect-05.jpg' },
  { name: 'Anaya Trivedi', firm: 'Trivedi Atelier, Vadodara', photo: '/images/architects/architect-06.jpg' },
  { name: 'Rohan Vyas', firm: 'Vyas Interiors, Rajkot', photo: '/images/architects/architect-07.jpg' },
  { name: 'Diya Bhatt', firm: 'Bhatt Studio, Gandhinagar', photo: '/images/architects/architect-08.jpg' },
  { name: 'Arjun Pandya', firm: 'Pandya Associates, Rajkot', photo: '/images/architects/architect-09.jpg' },
  { name: 'Meera Kotecha', firm: 'Kotecha Design, Jamnagar', photo: '/images/architects/architect-10.jpg' },
  { name: 'Yash Raval', firm: 'Raval Architects, Rajkot', photo: '/images/architects/architect-11.jpg' },
  { name: 'Nisha Parekh', firm: 'Parekh Studio, Rajkot', photo: '/images/architects/architect-12.jpg' },
  { name: 'Dev Antani', firm: 'Antani & Co., Junagadh', photo: '/images/architects/architect-13.jpg' },
  { name: 'Sara Chauhan', firm: 'Chauhan Design House, Bhavnagar', photo: '/images/architects/architect-14.jpg' },
  { name: 'Om Gohil', firm: 'Gohil Architects, Rajkot', photo: '/images/architects/architect-15.jpg' },
  { name: 'Tara Solanki', firm: 'Solanki Studio, Ahmedabad', photo: '/images/architects/architect-16.jpg' },
]

export type ProcessStep = {
  num: string
  title: string
  desc: string
}

export const whyUs = {
  eyebrow: 'Why Buildcon House',
  steps: [
    { num: '01', title: 'Discover', desc: 'Explore our full range of sanitaryware, tiles, kitchens, wellness and furniture under one roof.' },
    { num: '02', title: 'Design', desc: 'Plan your space with our in-showroom team, from single rooms to full-home projects.' },
    { num: '03', title: 'Select', desc: 'Choose confidently from curated global brands, matched to your style and budget.' },
    { num: '04', title: 'Live', desc: 'Enjoy a finished space built to let you live better, every single day.' },
  ] as ProcessStep[],
}

export const gallery = {
  eyebrow: 'Showroom',
  heading: 'Step inside Buildcon House',
  body: 'A look at our Rajkot showroom floor.',
  // Order matters here: Gallery.tsx cycles a 4-slot pattern of portrait,
  // portrait, portrait, landscape frames, so portrait-shot photos are
  // listed first and the one landscape photo (gallery-1, native 16:9) is
  // listed last to land in the landscape slot without a heavy crop.
  images: [
    { src: '/images/gallery-2.jpg', alt: 'Vitra ceramics wall — Equal and Metropole collections' },
    { src: '/images/gallery-3.jpg', alt: 'Matte black shower and wall-hung toilet display' },
    { src: '/images/gallery-4.jpg', alt: 'Dimore tile wall with curated art at Buildcon House' },
    { src: '/images/gallery-1.jpg', alt: 'Navy-finish modular kitchen display at Buildcon House' },
  ] as ImageSlot[],
}

export const footer = {
  quickLinks: nav,
}
