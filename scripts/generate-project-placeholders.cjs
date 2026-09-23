// Generates simple SVG placeholder "photos" for the sample projects in
// src/data/projects.ts — graphite/steel gradient cards with the project
// title and a small line-art icon, matching the Obsidian Steel palette.
// These are visual stand-ins only, not real project photos. Re-run after
// editing PROJECTS below (e.g. if a real project replaces a placeholder,
// just delete that project's folder under public/images/projects/ instead
// of regenerating it).
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'projects');

const PALETTE = {
  bg: '#050607',
  surface: '#0c0f13',
  surface2: '#12161c',
  line: '#2a313b',
  text: '#e8ecf1',
  muted: '#8a929c',
  accent: '#5f7d9c',
  accentBright: '#7fa3c7',
};

// Minimal line-art icon paths (24x24 viewBox), picked per image to vary
// the placeholders instead of repeating the same icon every time.
const ICONS = {
  drop: 'M12 3c3.5 4 6 7.2 6 10.5a6 6 0 1 1-12 0C6 10.2 8.5 7 12 3z',
  tile: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  sofa: 'M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M4 12h16v5a1 1 0 0 1-1 1h-1v2h-2v-2H8v2H6v-2H5a1 1 0 0 1-1-1z',
  home: 'M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9',
  spark: 'M12 3v4M12 17v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M3 12h4M17 12h4M4.2 19.8 7 17M17 7l2.8-2.8',
};

function svgIcon(name, x, y, size, color, opacity = 0.5) {
  const d = ICONS[name] || ICONS.home;
  return `<g transform="translate(${x - size / 2}, ${y - size / 2}) scale(${size / 24})" opacity="${opacity}">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  </g>`;
}

function placeholderSvg({ width, height, title, caption, icon, tone, angle }) {
  const isAfter = tone === 'after';
  const isBefore = tone === 'before';
  const gradId = `g-${Math.round(angle)}-${tone}-${Math.random().toString(36).slice(2, 7)}`;
  const c1 = isBefore ? PALETTE.surface2 : PALETTE.surface;
  const c2 = isBefore ? PALETTE.surface : PALETTE.bg;
  const accent = isBefore ? PALETTE.muted : isAfter ? PALETTE.accentBright : PALETTE.accent;
  const labelColor = isBefore ? PALETTE.muted : PALETTE.accentBright;
  const rad = (angle * Math.PI) / 180;
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);
  const x1 = 50 - 50 * Math.cos(rad);
  const y1 = 50 - 50 * Math.sin(rad);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="${gradId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="hairlines-${gradId}" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle / 4})">
      <line x1="0" y1="0" x2="0" y2="26" stroke="${PALETTE.line}" stroke-width="0.6" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradId})"/>
  <rect width="${width}" height="${height}" fill="url(#hairlines-${gradId})"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${PALETTE.line}" stroke-width="2"/>
  ${svgIcon(icon, width / 2, height / 2 - 26, Math.min(width, height) * 0.16, accent, isBefore ? 0.35 : 0.55)}
  <text x="${width / 2}" y="${height / 2 + 34}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(
    Math.min(width, height) * 0.052,
  )}" fill="${PALETTE.text}" opacity="${isBefore ? 0.75 : 0.95}">${title}</text>
  ${
    caption
      ? `<text x="${width / 2}" y="${height / 2 + 60}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(
          Math.min(width, height) * 0.024,
        )}" letter-spacing="3" fill="${PALETTE.muted}">${caption.toUpperCase()}</text>`
      : ''
  }
  ${
    isBefore || isAfter
      ? `<text x="20" y="${height - 20}" font-family="Arial, sans-serif" font-size="${Math.round(
          Math.min(width, height) * 0.03,
        )}" letter-spacing="4" font-weight="bold" fill="${labelColor}">${tone.toUpperCase()}</text>`
      : ''
  }
</svg>`;
}

// PROJECTS: id -> { count, iconsByIndex, hasBeforeAfter }. Kept separate
// from src/data/projects.ts so this script has no import-time dependency
// on TypeScript — the two are just kept in sync by hand for these three
// placeholder projects.
const JOBS = [
  { id: 'project-01', title: 'The Ashapura Villa', images: 5, icons: ['home', 'drop', 'tile', 'sofa', 'spark'], beforeAfter: true },
  { id: 'project-02', title: 'Riverfront Residency', images: 4, icons: ['tile', 'drop', 'home', 'spark'], beforeAfter: false },
  { id: 'project-03', title: 'Suryakiran Corporate Office', images: 5, icons: ['sofa', 'drop', 'home', 'tile', 'spark'], beforeAfter: true },
];

function main() {
  for (const job of JOBS) {
    const dir = path.join(OUT_DIR, job.id);
    fs.mkdirSync(dir, { recursive: true });

    for (let i = 0; i < job.images; i++) {
      const svg = placeholderSvg({
        width: 1200,
        height: 900,
        title: job.title,
        caption: `Photo ${i + 1} of ${job.images}`,
        icon: job.icons[i % job.icons.length],
        tone: 'gallery',
        angle: 20 + i * 35,
      });
      fs.writeFileSync(path.join(dir, `gallery-${i + 1}.svg`), svg);
    }

    if (job.beforeAfter) {
      const before = placeholderSvg({
        width: 1200,
        height: 900,
        title: job.title,
        caption: 'Before renovation',
        icon: 'home',
        tone: 'before',
        angle: 200,
      });
      const after = placeholderSvg({
        width: 1200,
        height: 900,
        title: job.title,
        caption: 'After Buildcon House',
        icon: 'spark',
        tone: 'after',
        angle: 20,
      });
      fs.writeFileSync(path.join(dir, 'before.svg'), before);
      fs.writeFileSync(path.join(dir, 'after.svg'), after);
    }

    console.log(`${job.id}: wrote ${job.images} gallery image(s)${job.beforeAfter ? ' + before/after pair' : ''}`);
  }
}

main();
