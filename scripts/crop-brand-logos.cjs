// Auto-crops every raster logo in /public/images/brands to its real content
// bounding box (trimming uniform background padding), backing up the
// original first. SVGs are left untouched (none currently exist, but this
// guards against breaking one if added later).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'images', 'brands');
const BACKUP_DIR = path.join(DIR, 'originals');
const PADDING_RATIO = 0.08; // 8% of the larger trimmed dimension, per side
// This script NEVER deletes or skips a file based on its resulting size —
// small logos are scaled up by CSS in the tile (object-fit: contain at a
// fixed 88%/72% box), not upscaled here. It only trims background padding.

async function samplePixel(sharpInstance, x, y) {
  const { data, info } = await sharpInstance
    .clone()
    .extract({ left: x, top: y, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { r: data[0], g: data[1], b: data[2], channels: info.channels };
}

async function processFile(file) {
  const fullPath = path.join(DIR, file);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') {
    return { file, skipped: 'svg (left as-is)' };
  }

  const backupPath = path.join(BACKUP_DIR, file);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
  }
  // Always trim from the pristine backup, not a previously-trimmed file,
  // so re-running this script is idempotent instead of compounding crops.
  const source = sharp(backupPath);
  const originalMeta = await source.metadata();

  const bg = await samplePixel(source, 0, 0);

  // Safety net: if trim() ever fails, or collapses the image to something
  // clearly degenerate, fall back to the untouched original rather than
  // risk cutting into the logo itself.
  let trimmedBuffer;
  let trimmedMeta;
  try {
    trimmedBuffer = await source.clone().trim({ threshold: 22 }).toBuffer();
    trimmedMeta = await sharp(trimmedBuffer).metadata();
    const tooSmall = trimmedMeta.width < originalMeta.width * 0.15 && trimmedMeta.height < originalMeta.height * 0.15;
    if (tooSmall) throw new Error('trim result implausibly small — likely misdetected background');
  } catch {
    trimmedBuffer = await source.clone().toBuffer();
    trimmedMeta = originalMeta;
  }

  const padPx = Math.round(Math.max(trimmedMeta.width, trimmedMeta.height) * PADDING_RATIO);
  const backgroundColor = originalMeta.hasAlpha
    ? { r: bg.r, g: bg.g, b: bg.b, alpha: 0 }
    : { r: bg.r, g: bg.g, b: bg.b };

  const final = await sharp(trimmedBuffer)
    .extend({
      top: padPx,
      bottom: padPx,
      left: padPx,
      right: padPx,
      background: backgroundColor,
    })
    .toBuffer();
  const finalMeta = await sharp(final).metadata();

  await sharp(final).toFile(fullPath);

  return {
    file,
    originalSize: `${originalMeta.width}x${originalMeta.height}`,
    trimmedContentSize: `${trimmedMeta.width}x${trimmedMeta.height}`,
    finalSize: `${finalMeta.width}x${finalMeta.height}`,
    finalWidth: finalMeta.width,
  };
}

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && fs.statSync(path.join(DIR, f)).isFile());

  const results = [];
  for (const file of files) {
    try {
      results.push(await processFile(file));
    } catch (err) {
      results.push({ file, error: err.message });
    }
  }

  console.table(results.map((r) => ({
    file: r.file,
    original: r.originalSize || '-',
    trimmedContent: r.trimmedContentSize || '-',
    finalWithPadding: r.finalSize || r.skipped || r.error || '-',
  })));

  return results;
}

main().then((results) => {
  fs.writeFileSync(path.join(__dirname, 'crop-results.json'), JSON.stringify(results, null, 2));
});
