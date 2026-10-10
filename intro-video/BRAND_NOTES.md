# Buildcon House — brand notes for the intro video

Extracted from the website (`src/index.css`, `index.html`, `public/`). The video uses only these.

## Colours
| Token | Value | Use in the video |
|---|---|---|
| Background | `#050607` (site `--color-bg`; meta theme-color is `#0b0b0c`) | Base of every frame (matches the page it hands off to) |
| Surface | `#0c0f13` / `#12161c` | Card bodies, swatch bases |
| Hairline | `#2a313b` | Grid floor lines |
| Text | `#e8ecf1` | Headlines |
| Muted | `#8a929c` | Brand-name cards, secondary text |
| Accent | `#5f7d9c` | Glows, card borders (≈40% opacity) |
| Accent bright | `#7fa3c7` | Highlighted words, roofline stroke, nozzle light |
| Logo blue | `#5d9bcd` | The "O" of the logo (from `public/favicon.svg`) |

The site's stylesheet explicitly rules out gold, bronze, copper and saturated blue ("Obsidian
Steel" palette), so the accent is steel blue — not champagne. No magenta, purple or rainbow.

## Fonts
- **Cormorant Garamond** — headings (site loads 300/400/500 + italic). Kinetic headlines use it
  at a heavier weight with tight tracking, as the brief asks.
- **Manrope** — body/UI (300–700). Used for small card labels and brand wordmarks.
- **Sacramento** — the logo's script tagline ("Let you live better").

## Logo
- Only a PNG exists: `public/images/logo.png` (828×200, transparent): grey BUILDCON wordmark with
  a blue "O", HOUSE beneath it, and the script tagline beneath that.
- `public/favicon.svg` is the blue "O" ring alone (vector).
- Reveal = mask-wipe (PNG). The tagline is part of the PNG, so the reveal shows the real logo's
  BUILDCON HOUSE rows and types the tagline separately (otherwise it would appear twice).

## Photos and brands
See "Revision 2" below — the film now uses 20 photos and the 10 real brand logos (the v1 cut
used plain-type brand names and only the homepage photos).

## Revision 2 — photo sources

Priority order followed: (1) `intro-video/public/photos/` own photos — none supplied; (2) photos
already on the website; (3) brand marketing images in the project (logos only); (4) free stock
(Unsplash License — free for commercial use, no attribution required; credited here anyway).
All photos get the same grade in the film (slightly cool, deep blacks, gentle contrast).

### From the website (`public/photos/site/`, `public/photos/showroom/`)
- `site/category-sanitaryware.webp`, `site/category-wellness.webp`, `site/hero-living-room.webp`
  (brochure photos used on the homepage)
- `showroom/gallery-1.jpg` (kitchen display), `showroom/gallery-3.jpg` (black shower display),
  `showroom/gallery-08.jpg` (kitchen island display), `showroom/gallery-14.jpg` (AXOR mixer
  display) — real Buildcon House showroom photos from the Gallery page

### Stock — Unsplash (`public/photos/stock/`)
| File | Photo | Photographer |
|---|---|---|
| bath-rain-shower.jpg | https://unsplash.com/photos/white-round-light-on-black-surface-oAICAyOGjiY | Robert Guss |
| bath-dark-stone.jpg | https://unsplash.com/photos/modern-bathroom-with-dark-stone-tiles-CeQpzwT63pU | Franco Debartolo |
| bath-lit-mirror.jpg | https://unsplash.com/photos/modern-bathroom-design-with-elegant-lighting-lXHnEe5AGVo | Poojan Thanekar |
| kitchen-chandelier.jpg | https://unsplash.com/photos/a-kitchen-with-a-table-and-chairs-3-GXEUE_sCc | Kam Idris |
| kitchen-black.jpg | https://unsplash.com/photos/empty-sink-euBmypOZUZA | Christian Mackie |
| living-grey.jpg | https://unsplash.com/photos/white-and-brown-living-room-set-9M66C_w_ToM | Spacejoy (likely a photoreal render) |
| living-green.jpg | https://unsplash.com/photos/a-living-room-with-a-large-green-couch-VZ2z8ozzy10 | Prydumano Design (likely a photoreal render) |
| spa-slate-pool.jpg | https://unsplash.com/photos/lounge-chairs-beside-a-modern-indoor-swimming-pool-T4fuKGw1ijM | Antonio Araujo |
| spa-steam-room.jpg | https://unsplash.com/photos/a-modern-steam-room-with-a-candle-and-ambient-lighting-9qYFu1NzpS8 | Dominik Neuner |
| spa-wood-pool.jpg | https://unsplash.com/photos/indoor-swimming-pool-with-wooden-walls-and-lounge-chairs-uvX6pcfeRdQ | Antonio Araujo |
| bath-black-marble.jpg (the one tiled room) | https://unsplash.com/photos/a-black-and-white-bathroom-with-a-sink-and-mirror-H82rlPUmedw | Lisa Anna |
| kitchen-dining.jpg | https://unsplash.com/photos/a-dining-room-with-a-table-and-chairs-jqyXMfuCBqs | Darren Ahmed Arceo |
| spa-garden-pool.jpg | https://unsplash.com/photos/a-large-indoor-swimming-pool-with-a-view-of-the-trees-ls2i2Mh0M4Q | Patrick Robert Doyle |
| bath-travertine.jpg (spare) | https://unsplash.com/photos/modern-bathroom-with-stone-tile-and-recessed-lighting-MkOMgDhLpqU | Peter Muniz |
| marble-statuario.jpg (the doors) | https://unsplash.com/photos/white-and-black-abstract-painting-sUFVSodUHfo | Jocelyn Morales |

Originals are 3000–7700 px; the film uses 3600 px copies for the big corridor photos (≥ 2× their
largest on-screen size) and 1400 px for the small wall cards. The website/showroom photos are only
720–1296 px (that is all the site has), and `kitchen-dining.jpg` is 1400×571, so those wall cards
are below 2× when they drift closest to the camera — swap in larger originals if available.
Unused downloads kept as spares: `spa-garden-pool.jpg`, `bath-travertine.jpg`.

## Edge matte
Edges are a flat inset band (9 % of the short side) in `#050607`, then a gradient fade to 17 %.
- Flat, not a gradient stop: gradients are dithered by the browser and encoders turn that ±1 noise
  into ±4 blotches right at the edge.
- 9 %: VP9 codes in 64 px blocks; at LITE (720 px) 9 % ≈ 65 px keeps the whole outer block row
  free of picture, so compression can't leak colour into it (6 % passed at HD but not at LITE).
- Text, logo and the O are drawn above the matte (they live in the central safe zone anyway);
  only the full-frame flash sits under it.
Decoded in Chrome the band reads `rgb(4,6,8)` (±1 of `#050607`).

### Brand logos (`public/brands/`)
The 10 logo files from the website (`public/images/brands/`). There are 10 brands (Hansgrohe and
AXOR share one logo), so the wall is 10 logo cards + 10 photo cards = 20.
