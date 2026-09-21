// One-off audit script — decodes each brand logo PNG (no external deps,
// pure zlib + manual scanline unfiltering) to report real dimensions,
// alpha-transparency, average luminance, and a content bounding box, then
// prints the data this task's audit table and plate-selection logic needs.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIR = path.join(__dirname, '..', 'public', 'images', 'brands');
const LIGHT_PLATE = hexToRgb('#EDEFF2');
const DARK_PLATE = hexToRgb('#0C0F13');

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relLuminance([r, g, b]) {
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let offset = 8;
  let width, height, bitDepth, colorType;
  const idatChunks = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data.readUInt8(8);
      colorType = data.readUInt8(9);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + len;
  }
  if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let rawOff = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOff];
    rawOff += 1;
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[rawOff + x];
      const a = x >= channels ? pixels[rowStart + x - channels] : 0;
      const b = y > 0 ? pixels[prevRowStart + x] : 0;
      const c = y > 0 && x >= channels ? pixels[prevRowStart + x - channels] : 0;
      let value;
      switch (filterType) {
        case 0: value = rawByte; break;
        case 1: value = rawByte + a; break;
        case 2: value = rawByte + b; break;
        case 3: value = rawByte + Math.floor((a + b) / 2); break;
        case 4: value = rawByte + paeth(a, b, c); break;
        default: throw new Error(`unsupported filter ${filterType}`);
      }
      pixels[rowStart + x] = value & 0xff;
    }
    rawOff += stride;
  }
  return { width, height, channels, colorType, pixels };
}

function analyze(file) {
  const buf = fs.readFileSync(path.join(DIR, file));
  const { width, height, channels, colorType, pixels } = decodePng(buf);
  const hasAlphaChannel = channels === 2 || channels === 4;

  let minX = width, minY = height, maxX = -1, maxY = -1;
  let sumLum = 0, count = 0;
  let anyTransparentPixel = false;

  // Reference "background" colour = average of the 4 corners, used to find
  // the content bounding box (for logos whose own canvas has padding).
  const at = (x, y) => {
    const i = (y * width + x) * channels;
    return [pixels[i], pixels[i + 1] ?? pixels[i], pixels[i + 2] ?? pixels[i], hasAlphaChannel ? pixels[i + channels - 1] : 255];
  };
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  const ref = [0, 1, 2].map((c) => corners.reduce((s, p) => s + p[c], 0) / 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = at(x, y);
      if (a < 250) anyTransparentPixel = true;
      if (a < 10) continue;
      sumLum += relLuminance([r, g, b]);
      count++;
      const dist = Math.sqrt((r - ref[0]) ** 2 + (g - ref[1]) ** 2 + (b - ref[2]) ** 2);
      if (dist > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const avgLum = count > 0 ? sumLum / count : 0;
  const hasContentBox = maxX >= 0;
  const bboxCoverage = hasContentBox
    ? ((maxX - minX + 1) * (maxY - minY + 1)) / (width * height)
    : 1;

  // Contrast ratio using the logo's own average relative luminance against
  // each candidate plate's relative luminance (WCAG formula).
  const contrastWith = (plateRgb) => {
    const plateLum = relLuminance(plateRgb);
    const lighter = Math.max(avgLum, plateLum);
    const darker = Math.min(avgLum, plateLum);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const contrastOnLight = Math.round(contrastWith(LIGHT_PLATE) * 100) / 100;
  const contrastOnDark = Math.round(contrastWith(DARK_PLATE) * 100) / 100;

  // Rule: light average logo -> dark plate (contrast), dark/coloured -> light plate.
  // Then verify >=4.5:1; if the preferred plate fails, try the other; if both
  // fail, the caller should use the text fallback instead of this file.
  const preferred = avgLum > 0.5 ? 'dark' : 'light';
  let chosenPlate = preferred;
  let chosenContrast = preferred === 'dark' ? contrastOnDark : contrastOnLight;
  if (chosenContrast < 4.5) {
    const other = preferred === 'dark' ? 'light' : 'dark';
    const otherContrast = other === 'dark' ? contrastOnDark : contrastOnLight;
    if (otherContrast >= 4.5) {
      chosenPlate = other;
      chosenContrast = otherContrast;
    } else {
      chosenPlate = 'FALLBACK (both plates fail 4.5:1)';
      chosenContrast = Math.max(contrastOnLight, contrastOnDark);
    }
  }

  return {
    file,
    width,
    height,
    colorType,
    hasAlphaChannel,
    anyTransparentPixel,
    avgLum: Math.round(avgLum * 1000) / 1000,
    bboxCoverage: Math.round(bboxCoverage * 100),
    bbox: hasContentBox ? { minX, minY, maxX, maxY } : null,
    contrastOnLight,
    contrastOnDark,
    chosenPlate,
    chosenContrast,
  };
}

const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.png'));
const results = files.map((f) => {
  try {
    return analyze(f);
  } catch (err) {
    return { file: f, error: err.message };
  }
});

console.log(JSON.stringify(results, null, 2));
