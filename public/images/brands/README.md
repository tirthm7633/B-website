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
| `hansgrohe.png` | ❌ No — the supplied file was cropped (only "nsgro" visible, missing both ends) | Text fallback |
| `axor.png` | ✅ Yes | Logo (light plate) |
| `gebrit.png` | ✅ Yes | Logo (dark plate) — displays as "Geberit", confirmed correct spelling from the logo itself |
| `vitra.png` | ✅ Yes | Logo (dark plate) |
| `oyster.png` | ✅ Yes | Logo (light plate) |
| `qutone.png` | ❌ No — the supplied file was cropped (only "UTO...INNOVATION" visible, missing the "Q" and "NE") | Text fallback |
| `nexion.png` | ✅ Yes | Logo (light plate) |
| `dimore.png` | ✅ Yes | Logo (light plate) |
| `mcm-ittim.png` | ❌ No — the original mixed the real "ittimi by MCM" mark with unrelated decorative pattern-swatch artwork | Text fallback |
| `verantes-living.png` | ✅ Yes | Logo (dark plate) |

**8 of 11 brands show a real logo.** Only Hansgrohe, Qutone and MCM Ittim
show the text fallback, because no usable file exists for them at all —
drop a clean, uncropped export at that exact filename to bring them in as
real logos too.
