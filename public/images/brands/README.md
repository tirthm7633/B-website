# Brand logo files

Each brand in `src/data/content.ts` has a `logo` field pointing at a file in
this folder. If — and only if — that file is missing or fails to load, the
site shows a clean bold text fallback (brand name, uppercase) instead of a
broken image — see `src/components/BrandLogo.tsx`. **A real logo file
always shows as an image, regardless of its resolution, sharpness or
contrast** — there is no minimum-size rule. Small files are scaled up by
plain CSS to fill the tile (`object-fit: contain` at a fixed 88%/72% box).

**Preferred format:** SVG, or a transparent/flat PNG at least 600px wide,
cropped close to the logo mark. Source from each brand's official
press/media page when possible — but any real file is used as-is.

## Auto-crop script

`scripts/crop-brand-logos.cjs` gently trims uniform background padding from
every file here (sharp.trim, then 8% padding re-added) so the logo fills
more of its tile. It is **non-destructive**: the pristine original is
always copied to `originals/` before the first crop, and every re-run
starts fresh from that backup rather than compounding crops. If trim ever
produces an implausible result, it falls back to the untouched original.

To re-run it after adding new files:

```bash
node scripts/crop-brand-logos.cjs
node scripts/audit-brand-logos.cjs   # prints luminance/contrast/plate data
```

## Current status

| Filename | Real file? | Showing as |
| --- | --- | --- |
| `grohe.png` | ✅ Yes | Logo (dark plate) |
| `hansgrohe-x-axor.png` | ✅ Yes — combined Hansgrohe x Axor logo (Axor is Hansgrohe's designer label, merged into one brand) | Logo (dark plate) |
| `gebrit.png` | ✅ Yes | Logo (dark plate) — displays as "Geberit", confirmed correct spelling from the logo itself |
| `vitra.png` | ✅ Yes | Logo (dark plate) |
| `oyster.png` | ✅ Yes | Logo (light plate) |
| `qutone.png` | ✅ Yes — full logo, teal block with white wordmark | Logo (dark plate) |
| `nexion.png` | ✅ Yes — white wordmark on black (supplied as a JPG, converted to PNG losslessly) | Logo (light plate) |
| `dimore.png` | ✅ Yes — HD logo from the brand's vector PDF (DIMORE · Surfaces and Beyond), transparent, 1600 px; untrimmed 3652 px master in `originals/` | Logo (light plate) |
| `mcm-ittim.png` | ✅ Yes — "ittimi by MCM" mark cut out of the supplied image (pattern swatches and grey background removed; 2x resized). Supplied original: `originals/mcm-ittim-as-supplied.png`. Low-resolution source — replace with a vector/hi-res export if available | Logo (dark plate) |
| `verantes-living.png` | ✅ Yes | Logo (dark plate) |

**All 10 brands show a real logo.** MCM Ittim's source image is small (about 180 px of
logo), so it is the softest of the set; a clean vector or hi-res export dropped in at the same
filename would sharpen it.
