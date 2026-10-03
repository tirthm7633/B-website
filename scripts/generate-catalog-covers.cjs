// Generates simple SVG placeholder cover thumbnails for catalog entries in
// src/data/catalogs.ts — graphite/steel gradient cards with the catalog
// title and a document icon, matching the Obsidian Steel palette. Visual
// stand-ins only (a real first-page render can replace any of these
// later without any other code changing, as long as the path stays the
// same).
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'catalogs');

const PALETTE = {
  surface: '#0c0f13',
  bg: '#050607',
  line: '#2a313b',
  text: '#e8ecf1',
  muted: '#8a929c',
  accentBright: '#7fa3c7',
};

const DOC_ICON = 'M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4';

function coverSvg({ width, height, brand, title }) {
  const gradId = `cg-${Math.random().toString(36).slice(2, 8)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${PALETTE.surface}"/>
      <stop offset="100%" stop-color="${PALETTE.bg}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradId})"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${PALETTE.line}" stroke-width="2"/>
  <g transform="translate(${width / 2 - 18}, ${height / 2 - 80}) scale(1.5)" opacity="0.55">
    <path d="${DOC_ICON}" fill="none" stroke="${PALETTE.accentBright}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="${width / 2}" y="${height / 2 + 24}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="3" fill="${PALETTE.muted}">${brand.toUpperCase()}</text>
  <foreignObject x="${width * 0.1}" y="${height / 2 + 40}" width="${width * 0.8}" height="90">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: ${PALETTE.text}; text-align: center; line-height: 1.25;">${title}</div>
  </foreignObject>
</svg>`;
}

// Kept in sync by hand with src/data/catalogs.ts's coverImage paths.
const COVERS = [
  { out: 'qutone/gvt-wood-look-planks-200x1200mm.svg', brand: 'Qutone', title: 'GVT Wood-Look Planks 200x1200mm' },
  { out: 'qutone/imarble-2-iris-edition-2025-26.svg', brand: 'Qutone', title: 'iMarble 2.0 — Iris Edition' },
  { out: 'qutone/imarble-2-mansory-edition-2025-26.svg', brand: 'Qutone', title: 'iMarble 2.0 — Mansory Edition' },
  { out: 'qutone/progetto-collection-1200x1800mm.svg', brand: 'Qutone', title: 'Progetto Collection 1200x1800mm' },
  { out: 'qutone/qrock-collection.svg', brand: 'Qutone', title: 'Qrock Collection' },
  { out: 'qutone/texas-collection-triform-edition.svg', brand: 'Qutone', title: 'Texas Collection — Triform Edition' },
  { out: 'qutone/texas-collection-embark-edition.svg', brand: 'Qutone', title: 'Texas Collection — Embark Edition' },
  { out: 'hansgrohe/news-2019-smart-living-showers-kitchen.svg', brand: 'Hansgrohe', title: 'hansgrohe News 2019' },
  { out: 'verantes-living/ferro-nova-kitchens.svg', brand: 'Verantes Living', title: 'Ferro Nova Kitchens' },
  { out: 'dimore/marmo-collection.svg', brand: 'Dimore', title: 'Marmo Collection' },
  { out: 'nexion/general-catalogue.svg', brand: 'Nexion', title: 'General Catalogue' },
  { out: 'nexion/marble-gallery-2026.svg', brand: 'Nexion', title: 'Marble Gallery 2026' },
  { out: 'grohe/spa-lookbook-2026.svg', brand: 'Grohe', title: 'Grohe Spa Lookbook 2026' },
  { out: 'vitra/bathroom-collections-2025-india.svg', brand: 'Vitra', title: 'Bathroom Collections 2025 (India)' },
  { out: 'vitra/designer-collection-2021.svg', brand: 'Vitra', title: 'Designer Collection 2021' },
  { out: 'qutone/gvt-tiles-600x600mm.svg', brand: 'Qutone', title: 'GVT Tiles 600x600mm' },
  { out: 'qutone/marble-onyx-gvt-slabs-600x1200mm.svg', brand: 'Qutone', title: 'Marble/Onyx GVT Slabs 600x1200mm' },
  { out: 'qutone/large-format-slabs-800x1600mm.svg', brand: 'Qutone', title: 'Large-Format Slabs 800x1600mm' },
  { out: 'qutone/stoneware-slabs-1200x1800mm.svg', brand: 'Qutone', title: 'Stoneware Slabs 1200x1800mm' },
  { out: 'qutone/stoneware-slabs-1200x2400mm.svg', brand: 'Qutone', title: 'Stoneware Slabs 1200x2400mm' },
  { out: 'qutone/imarble-2-marmo-edition.svg', brand: 'Qutone', title: 'iMarble 2.0 — Marmo Edition' },
  { out: 'qutone/progetto-collection-600x600mm.svg', brand: 'Qutone', title: 'Progetto Collection 600x600mm' },
  { out: 'qutone/progetto-collection.svg', brand: 'Qutone', title: 'Progetto Collection' },
  { out: 'qutone/qgres-fastrack-collection.svg', brand: 'Qutone', title: 'QGres & Fastrack Collection' },
  { out: 'qutone/solid-plus-technical-homogeneous-tiles.svg', brand: 'Qutone', title: 'Solid+ Technical Homogeneous Tiles' },
  { out: 'qutone/stoneware-collection-800x2400mm.svg', brand: 'Qutone', title: 'Stoneware Collection 800x2400mm' },
  { out: 'qutone/texas-collection-mansory-oslo-dune.svg', brand: 'Qutone', title: 'Texas Collection — Mansory Oslo/Dune' },
  { out: 'hansgrohe/innovations-2021-journal.svg', brand: 'Hansgrohe', title: 'Innovations 2021 Journal' },
  { out: 'hansgrohe/bathroom-sales-manual-2019.svg', brand: 'Hansgrohe', title: 'Bathroom Sales Manual 2019' },
  { out: 'vitra/bathroom-collections-2023.svg', brand: 'Vitra', title: 'Bathroom Collections 2023' },
  { out: 'dimore/earth-to-essence-master-catalogue.svg', brand: 'Dimore', title: 'Earth To Essence Master Catalogue' },
  { out: 'dimore/midas-collection.svg', brand: 'Dimore', title: 'Midas Collection' },
  { out: 'dimore/neo-collection.svg', brand: 'Dimore', title: 'Neo Collection' },
  { out: 'dimore/omogenea-collection.svg', brand: 'Dimore', title: 'Omogenea Collection' },
  { out: 'dimore/roccia-collection.svg', brand: 'Dimore', title: 'Roccia Collection' },
  { out: 'oyster/bath-spa-collection-vol-1-8.svg', brand: 'Oyster', title: 'Bath Spa Collection Vol. 1.8' },
];

for (const cover of COVERS) {
  const outPath = path.join(OUT_DIR, cover.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, coverSvg({ width: 800, height: 600, brand: cover.brand, title: cover.title }));
  console.log(`wrote ${cover.out}`);
}
