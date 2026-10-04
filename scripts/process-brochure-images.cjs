// Turns the photos extracted from "Buildcone House Product Brochure.pdf" into
// web-ready assets and regenerates src/data/brandGallery.ts.
//
//   mutool extract "<brochure>.pdf"          (in an empty folder)
//   node scripts/process-brochure-images.cjs --extracted <that folder>
//
// For every photo it writes two WebP files: a small `-preview` (grid tiles,
// lazy-loaded) and a larger full version (zoom / lightbox / big slots).
// Brand photos go to public/images/brands-gallery/<brand-slug>/ using the
// same slug convention as the logos (see brandSlug() in src/data/catalogs.ts);
// non-brand photos go to public/images/homepage/.
//
// Which extracted image is which (object number -> brand / homepage slot, and
// what is deliberately left out) is decided by hand in PHOTOS / EXCLUDED
// below, from each page's printed section label ("06 / VITRA / EXPLORE" etc.)
// and the brand logo overlaid on every intro page.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const argIdx = process.argv.indexOf('--extracted');
if (argIdx < 0 || !process.argv[argIdx + 1]) {
  console.error('usage: node scripts/process-brochure-images.cjs --extracted <folder from mutool extract>');
  process.exit(1);
}
const EXTRACTED = path.resolve(process.argv[argIdx + 1]);

const PREVIEW_LONG_EDGE = 720; // grid tiles (shown ~300-400 CSS px wide, 2x for retina)
const FULL_LONG_EDGE = 1600; // sources are all <=1920px, so this only guards against upscaling
const PREVIEW_QUALITY = 72;
const FULL_QUALITY = 86;

function brandSlug(brand) {
  return brand.toLowerCase().trim().replace(/\s+/g, '-');
}

// ---- brand photos: [PDF image object number, file slug, alt text] ----------
const BRAND_PHOTOS = {
  'Verantes Living': [
    [426, 'timber-kitchen-island', 'Modular kitchen with timber-toned shutters, a long island and dining area'],
    [434, 'kitchen-island-top-view', 'Top-down view of a kitchen island with dining counter and hob'],
    [440, 'copper-finish-details', 'Copper-finish stainless steel drawers, shelving and sink area'],
  ],
  Grohe: [
    [72, 'shower-and-basin-set', 'Grey-tiled bathroom with wall-mounted shower set, hand shower and basin mixer'],
    [450, 'wall-mounted-basin-mixer', 'Wall-mounted basin mixer with water running into a white basin'],
    [453, 'ceiling-rain-shower', 'Ceiling-mounted rain shower in a dark stone shower room'],
    [456, 'gold-basin-mixer', 'Brushed-gold basin mixer and accessories beside a freestanding washbasin'],
  ],
  Oyster: [
    [83, 'whirlpool-bath', 'Whirlpool bath with lit hydro-massage jets on a timber deck'],
    [466, 'shower-panel', 'Black shower panel with body jets, rain head and hand shower'],
    [469, 'steam-and-sauna', 'Steam and sauna room in glass and timber'],
    [472, 'freestanding-air-bath', 'Freestanding air-bath tub in a dark stone bathroom'],
  ],
  // Hansgrohe and Axor are one merged brand on the site — both brochure
  // sections (pages 12-13 and 14-15) land in the same gallery.
  'Hansgrohe x Axor': [
    [94, 'hansgrohe-blue-rain-shower', 'Hansgrohe rain shower lit in blue in a tiled shower room'],
    [482, 'hansgrohe-rain-shower-head', 'Close-up of a Hansgrohe rain shower head in use'],
    [485, 'hansgrohe-shower-system', 'Hansgrohe shower system with shelf and thermostatic controls'],
    [488, 'hansgrohe-basin-mixer', 'Hand under water running from a Hansgrohe basin mixer'],
    [105, 'axor-mixer-at-dusk', 'Axor basin mixer standing in water at dusk'],
    [498, 'axor-rose-gold-mixer', 'Axor rose-gold basin mixer with cross handles'],
    [501, 'axor-luxury-rain-shower', 'Axor rain shower in a dark, blue-lit shower room'],
    [504, 'axor-shower-panel', 'Axor shower panel in a bathroom with floor-to-ceiling windows'],
  ],
  Vitra: [
    [116, 'bathroom-setting', 'Bathroom with freestanding washbasin, wall shelf and rose-gold shower'],
    [514, 'smart-toilet', 'Smart wall-hung toilet in a warm-toned bathroom'],
    [517, 'yellow-tile-shower', 'Shower area with yellow wall tiles and wall-mounted controls'],
    [520, 'countertop-basin', 'Countertop basin with tall mixer on a stone shelf'],
  ],
  Dimore: [
    [530, 'lounge-and-staircase', 'Large-format tiles in a stairwell and lounge interior'],
    [533, 'terrace-and-staircase', 'Concrete-look tiles on a modern terrace and staircase'],
    [536, 'patterned-dining-floor', 'Green and white patterned floor tiles in a dining room'],
  ],
  Qutone: [
    [138, 'surface-cube', 'Qutone surface cube resting on clouds at sunrise'],
    [546, 'botanical-lounge-wall', 'Botanical-pattern wall surface behind a lounge sofa'],
    [549, 'black-floor-dining-hall', 'Glossy black floor tiles in an arched dining hall'],
    [552, 'shower-and-basin-tiles', 'Tiled shower and basin area with warm brown walls'],
  ],
  Nexion: [
    [149, 'stone-look-floor', 'Stone-look floor tiles seen from above with chairs'],
    [562, 'marble-material-board', 'Marble and stone tiles on a material mood board'],
    [565, 'wood-look-flooring', 'Wood-look flooring in a bright room with a teal bench'],
    [568, 'terracotta-cladding', 'Terracotta-toned exterior cladding on a modern building'],
  ],
};

// ---- homepage photos -> /public/images/homepage/ ----------------------------
// [PDF image object number, output name]
// Slots are matched by the slide's own caption plus what the photo shows.
// The four category-card photos come from the brochure's section-intro slides,
// which are captioned by category ("01 / KITCHENS", "02 / BATHROOM PRODUCTS",
// "09 / TILES AND SURFACES"). Each of those slides also carries a brand's logo,
// so the same pixels are ALSO in that brand's gallery above (Verantes Living,
// Grohe, Oyster, Nexion) — a copy lives here so the homepage doesn't depend on
// the gallery folder.
const HOMEPAGE_PHOTOS = [
  [160, 'hero-living-room'], // p24 "10 / IMPORTED FURNITURE" — Hero background (4:3, 1285x992)
  [414, 'category-furniture'], // p3 "02 / ABOUT BUILDCON HOUSE" — Imported Furniture card (wide, cropped to 3:4)
  [426, 'category-kitchen'], // p6 "01 / KITCHENS" — Modular Kitchen card
  [72, 'category-sanitaryware'], // p8 "02 / BATHROOM PRODUCTS" — Sanitaryware & Bath Fittings card
  [149, 'category-tiles'], // p22 "09 / TILES AND SURFACES" — Tiles & Surfaces card
  [83, 'category-wellness'], // p10 — Wellness card: slide is captioned "BATHROOM PRODUCTS" but the photo is a whirlpool/spa bath
  [167, 'visit-storefront-night'], // p26 "11 / VISIT BUILDCON HOUSE" — Visit Us exterior (looks like a render, not a photograph)
  [453, 'about-rain-shower'], // Grohe section — About image (portrait 3:4 frame). Native 561x701; same pixels as the Grohe gallery copy
];

// Deliberately NOT shipped (decoration, marketing artwork or logos):
//   #43  p1   dark-blue particle background behind the cover text (699x556, abstract)
//   #437 p7   Verantes "ONE MATERIAL. 5000+ POSSIBILITIES" poster — baked-in text and phone numbers
//   #127 p18  Dimore intro: white dust wave on black (abstract, shows no product)
//   logos / masks: #405 #62 #73 #84 #95 #106 #117 #128 #139 #150 and every grayscale soft-mask

function findSource(obj) {
  const n = String(obj).padStart(4, '0');
  for (const ext of ['png', 'jpg', 'jpeg']) {
    const f = path.join(EXTRACTED, `image-${n}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  throw new Error(`extracted image for object ${obj} not found in ${EXTRACTED}`);
}

async function writeVariants(srcFile, outDirAbs, baseName) {
  fs.mkdirSync(outDirAbs, { recursive: true });
  const meta = await sharp(srcFile).metadata();
  const full = await sharp(srcFile)
    .resize({ width: FULL_LONG_EDGE, height: FULL_LONG_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: FULL_QUALITY })
    .toFile(path.join(outDirAbs, `${baseName}.webp`));
  const preview = await sharp(srcFile)
    .resize({ width: PREVIEW_LONG_EDGE, height: PREVIEW_LONG_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: PREVIEW_QUALITY })
    .toFile(path.join(outDirAbs, `${baseName}-preview.webp`));
  return { srcW: meta.width, srcH: meta.height, full, preview };
}

(async () => {
  const report = [];
  const gallery = {};

  for (const [brand, photos] of Object.entries(BRAND_PHOTOS)) {
    const slug = brandSlug(brand);
    gallery[brand] = [];
    let i = 0;
    for (const [obj, name, alt] of photos) {
      i += 1;
      const base = `${String(i).padStart(2, '0')}-${name}`;
      const res = await writeVariants(findSource(obj), path.join(ROOT, 'public', 'images', 'brands-gallery', slug), base);
      gallery[brand].push({
        preview: `/images/brands-gallery/${slug}/${base}-preview.webp`,
        full: `/images/brands-gallery/${slug}/${base}.webp`,
        width: res.full.width,
        height: res.full.height,
        alt,
      });
      report.push({ group: brand, file: base, src: `${res.srcW}x${res.srcH}`, full: `${res.full.width}x${res.full.height} ${Math.round(res.full.size / 1024)}KB`, preview: `${res.preview.width}x${res.preview.height} ${Math.round(res.preview.size / 1024)}KB` });
    }
  }

  for (const [obj, name] of HOMEPAGE_PHOTOS) {
    const res = await writeVariants(findSource(obj), path.join(ROOT, 'public', 'images', 'homepage'), name);
    report.push({ group: 'homepage', file: name, src: `${res.srcW}x${res.srcH}`, full: `${res.full.width}x${res.full.height} ${Math.round(res.full.size / 1024)}KB`, preview: `${res.preview.width}x${res.preview.height} ${Math.round(res.preview.size / 1024)}KB` });
  }

  // ---- src/data/brandGallery.ts ---------------------------------------------
  const lines = [];
  lines.push('// GENERATED by scripts/process-brochure-images.cjs from the 2026 product brochure — re-run that');
  lines.push('// script (or edit by hand) rather than renaming files in public/images/brands-gallery/.');
  lines.push('//');
  lines.push('// Keyed by the brand `name` in content.ts. A brand with no entry here (currently Geberit and MCM');
  lines.push('// Ittim — the brochure has no section for them) shows "Photos coming soon" in the brand detail');
  lines.push('// view. `preview` is the small lazy-loaded grid image, `full` the one the zoom viewer opens;');
  lines.push('// width/height are the full image\'s size so tiles reserve their space and never shift layout.');
  lines.push('');
  lines.push('export interface GalleryPhoto {');
  lines.push('  preview: string');
  lines.push('  full: string');
  lines.push('  width: number');
  lines.push('  height: number');
  lines.push('  alt: string');
  lines.push('}');
  lines.push('');
  lines.push('export const brandGallery: Record<string, GalleryPhoto[]> = {');
  for (const [brand, photos] of Object.entries(gallery)) {
    lines.push(`  ${JSON.stringify(brand)}: [`);
    for (const p of photos) {
      lines.push(`    { preview: ${JSON.stringify(p.preview)}, full: ${JSON.stringify(p.full)}, width: ${p.width}, height: ${p.height}, alt: ${JSON.stringify(p.alt)} },`);
    }
    lines.push('  ],');
  }
  lines.push('}');
  lines.push('');
  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'brandGallery.ts'), lines.join('\n'));

  console.table(report);
  const totals = {};
  for (const r of report) totals[r.group] = (totals[r.group] || 0) + 1;
  console.log('photos per group:', totals);
})();
