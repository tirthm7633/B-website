// Renders a real cover thumbnail for every catalog in src/data/catalogs.ts, straight from
// the catalog's own PDF, and writes it to
//   public/images/catalog-covers/<brand-slug>/<catalog-id>.jpg
//
//   node scripts/generate-catalog-covers.cjs            # every catalog
//   node scripts/generate-catalog-covers.cjs geberit    # only ids containing "geberit"
//
// Needs Poppler's `pdftoppm` on the PATH (Windows: `winget install oschwartz10612.Poppler`;
// macOS: `brew install poppler`; Linux: `apt install poppler-utils`) and the project's `sharp`.
//
// Page 1 is rendered first. If it is mostly blank (near-white / near-black) or flat, page 2
// is rendered too and the better-looking of the two is used. Each page is cropped to the
// 4:3 frame of the catalog card (anchored to the TOP, where covers keep their title) and
// saved as a ~800x600 JPEG, kept under MAX_BYTES. A summary table is printed at the end,
// flagging any catalog whose chosen page still looks weak so it can get a hand-picked cover.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const CATALOGS_TS = path.join(ROOT, 'src', 'data', 'catalogs.ts');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'catalog-covers');

const WIDTH = 800;
const HEIGHT = 600; // 4:3, matches the card's aspect-[4/3] cover frame
const RENDER_LONG_EDGE = 1600; // render big, then downscale: crisper than rendering at 800
const MAX_BYTES = 150 * 1024;
const QUALITIES = [78, 70, 62, 54];

// Hand-picked covers. The automatic choice (page 1, else page 2) is right for most catalogs,
// but these were checked by eye and a different page reads better. Where a page is a wide
// two-page spread, `extract` crops to one half first (fractions of the rendered page), and
// `position` is where the 4:3 crop sits inside that area (default 'north' = keep the top).
//   - Qutone product catalogs: page 2 is the same generic "Why Qutone?" page in all of them,
//     and page 3-4 shows that catalog's actual product, so use that.
//   - iMarble Iris / Marmo: page 1 (thin-stripe cover) is fine; it just scored as "flat".
//   - Nexion / MCM Ittim / Verantes Living / Grohe Spa: page 1-2 are index, text or logo-only
//     pages, so pick the first strong image page.
const LEFT_HALF = { left: 0, top: 0, width: 0.5, height: 1 };
const RIGHT_HALF = { left: 0.5, top: 0, width: 0.5, height: 1 };
const PAGE_OVERRIDES = {
  'qutone-gvt-wood-look-200x1200': { page: 3 },
  'qutone-gvt-tiles-600x600': { page: 3 },
  'qutone-marble-onyx-gvt-slabs-600x1200': { page: 3 },
  'qutone-large-format-slabs-800x1600': { page: 3 },
  'qutone-stoneware-slabs-1200x1800': { page: 4 },
  'qutone-stoneware-slabs-1200x2400': { page: 4 },
  'qutone-imarble-iris': { page: 1 },
  'qutone-imarble-marmo': { page: 1 },
  'nexion-general-catalogue': { page: 9, extract: RIGHT_HALF, position: 'center' }, // stone-sample mood board
  'nexion-marble-gallery-2026': { page: 7, extract: LEFT_HALF, position: 'center' }, // black marble cylinder
  'mcm-ittim-mcm-flexi-cladding-2026': { page: 2, extract: LEFT_HALF, position: 'south' }, // "Natural Clay" art
  // kitchen photo (p1 is a logo-only title page); trim the logo footer strip below the photo
  'verantes-living-ferro-nova-kitchens': { page: 5, extract: { left: 0, top: 0.03, width: 1, height: 0.86 }, position: 'center' },
  'grohe-spa-lookbook-2026': { page: 5 }, // faucet close-ups (p1-3 are near-black title pages)
};

// Same slug rule as brandSlug() in src/data/catalogs.ts.
const brandSlug = (brand) => brand.toLowerCase().trim().replace(/\s+/g, '-');

function readCatalogs() {
  const src = fs.readFileSync(CATALOGS_TS, 'utf8');
  const start = src.indexOf('export const catalogs');
  const body = src.slice(start);
  const entries = [];
  const re = /\{\s*id:\s*'([^']+)',\s*brand:\s*'([^']+)',[\s\S]*?filePath:\s*'([^']+)',/g;
  let m;
  while ((m = re.exec(body))) entries.push({ id: m[1], brand: m[2], filePath: m[3] });
  return entries;
}

function renderPage(pdf, page, tmp, tag) {
  const prefix = path.join(tmp, tag);
  execFileSync('pdftoppm', ['-f', String(page), '-l', String(page), '-scale-to', String(RENDER_LONG_EDGE), '-singlefile', '-png', pdf, prefix], { stdio: 'pipe' });
  return prefix + '.png';
}

// How "cover-like" a rendered page is: luminance spread plus how much of it is plain white/black.
async function assess(png) {
  const data = await sharp(png).flatten({ background: '#ffffff' }).resize(160, 160, { fit: 'inside' }).greyscale().raw().toBuffer();
  let sum = 0, white = 0, black = 0;
  for (const v of data) { sum += v; if (v > 245) white++; if (v < 10) black++; }
  const n = data.length, mean = sum / n;
  let varSum = 0;
  for (const v of data) varSum += (v - mean) * (v - mean);
  const stdev = Math.sqrt(varSum / n);
  const blank = Math.max(white, black) / n;
  return { stdev: +stdev.toFixed(1), mean: +mean.toFixed(0), blankShare: +blank.toFixed(2), weak: stdev < 22 || blank > 0.9 };
}

async function writeThumb(png, outFile, { extract, position = 'north' } = {}) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  let source = sharp(png).flatten({ background: '#ffffff' });
  if (extract) {
    const meta = await sharp(png).metadata();
    source = sharp(await source.extract({
      left: Math.round(meta.width * extract.left), top: Math.round(meta.height * extract.top),
      width: Math.round(meta.width * extract.width), height: Math.round(meta.height * extract.height),
    }).png().toBuffer());
  }
  const base = await source.png().toBuffer();
  let buf, used;
  for (const q of QUALITIES) {
    buf = await sharp(base)
      .resize(WIDTH, HEIGHT, { fit: 'cover', position, kernel: 'lanczos3' })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
    used = q;
    if (buf.length <= MAX_BYTES) break;
  }
  fs.writeFileSync(outFile, buf);
  return { bytes: buf.length, quality: used };
}

(async () => {
  const filter = process.argv[2];
  const catalogs = readCatalogs().filter((c) => !filter || c.id.includes(filter));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-covers-'));
  const rows = [], failed = [];

  for (const c of catalogs) {
    const pdf = path.join(ROOT, 'public', c.filePath.replace(/^\//, ''));
    try {
      if (!fs.existsSync(pdf)) throw new Error('PDF not found: ' + c.filePath);
      const override = PAGE_OVERRIDES[c.id];
      let page = override ? override.page : 1;
      let png = renderPage(pdf, page, tmp, 'p' + page);
      let stats = await assess(png);
      if (!override && stats.weak) {
        try {
          const png2 = renderPage(pdf, 2, tmp, 'p2');
          const stats2 = await assess(png2);
          if (stats2.stdev > stats.stdev || (stats.weak && !stats2.weak)) { page = 2; png = png2; stats = stats2; }
        } catch { /* single-page PDF: keep page 1 */ }
      }
      const out = path.join(OUT_DIR, brandSlug(c.brand), c.id + '.jpg');
      const w = await writeThumb(png, out, override);
      rows.push({ id: c.id, brand: c.brand, page, how: override ? 'manual' : 'auto', kb: Math.round(w.bytes / 1024), q: w.quality, stdev: stats.stdev, blank: stats.blankShare, flag: !override && stats.weak ? 'WEAK' : '' });
    } catch (err) {
      failed.push({ id: c.id, brand: c.brand, error: String(err.message || err).split('\n')[0] });
    }
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  console.table(rows);
  const second = rows.filter((r) => r.how === 'auto' && r.page === 2).length, manual = rows.filter((r) => r.how === 'manual').length;
  console.log(`generated ${rows.length}/${catalogs.length}  (page 2 auto-picked for ${second}, ${manual} hand-picked)  largest ${Math.max(...rows.map((r) => r.kb))} KB  total ${Math.round(rows.reduce((a, r) => a + r.kb, 0))} KB`);
  const weak = rows.filter((r) => r.flag);
  if (weak.length) console.log('looks weak (check by eye):', weak.map((r) => r.id).join(', '));
  if (failed.length) { console.log('FAILED:'); console.table(failed); process.exitCode = 1; }
})();
