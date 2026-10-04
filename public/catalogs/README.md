# Catalog PDF files

Each entry in `src/data/catalogs.ts` has a `filePath` pointing at a file in
this folder, and a `coverImage` pointing at a thumbnail under
`public/images/catalog-covers/` (a render of the PDF's own cover page — see
"Cover thumbnails" below). The Catalog page (`/catalog`) groups entries by
brand and only shows a brand as clickable once it has at least one entry
here — brands with none show a dimmed "Coming soon" card instead.

## Folder structure

One subfolder per brand, using the **same slug convention** already used
for logo files in `public/images/brands/` (lowercase, spaces replaced with
hyphens — see `brandSlug()` in `src/data/catalogs.ts`):

```
public/catalogs/
  grohe/
    faucets-shower-systems-2026.pdf
    kitchen-taps-sinks.pdf
  hansgrohe-x-axor/
    ...
  vitra/
    ...
```

The 10 brand slugs in use elsewhere on the site: `grohe`,
`hansgrohe-x-axor` (Hansgrohe and Axor are one merged brand — put Axor
catalogs here too), `geberit`, `vitra`, `oyster`, `qutone`, `nexion`,
`dimore`, `mcm-ittim`, `verantes-living`.

## File naming

Lowercase, hyphenated, descriptive of the actual product line — not the
brand's own often-cryptic export filename. E.g. rename
`hg_salesbook_bath_2019_en (1).pdf` to something like
`bathroom-sales-manual-2019.pdf` before placing it here.

## Size

**Keep each PDF under ~15MB where possible.** Large export PDFs from
brands are frequently 50–100MB+ (mostly from uncompressed embedded
images), which is too large to serve well from a static site and bloats
the git repo. Before adding a large file:

- Re-export it from the source design tool at a lower image DPI /
  compression setting if you have access to the original, or
- Compress it with a PDF tool (e.g. Adobe Acrobat's "Reduce File Size",
  or a free tool like Ghostscript / ilovepdf.com) targeting web/screen
  quality rather than print quality, or
- If it genuinely can't be brought under a reasonable size, host it
  externally (e.g. a cloud storage bucket) and point `filePath` at that
  URL instead of a local path — `filePath` just needs to resolve to a
  working PDF, it doesn't have to be same-origin.

## Adding a new catalog

1. Read the PDF to confirm which brand and product line it actually is —
   see the detailed comment above the `catalogs` array in
   `src/data/catalogs.ts` for the full process.
2. Place the (ideally already-compressed) file here following the
   structure above.
3. Add a matching entry to `src/data/catalogs.ts`, with
   `coverImage: '/images/catalog-covers/<brand-slug>/<catalog-id>.jpg'`.
4. Generate its cover: `node scripts/generate-catalog-covers.cjs <catalog-id>`.

## Cover thumbnails

Every catalog card shows a real thumbnail rendered from that catalog's own
PDF by `scripts/generate-catalog-covers.cjs` (needs Poppler's `pdftoppm` on
the PATH: `winget install oschwartz10612.Poppler`, `brew install poppler`,
or `apt install poppler-utils`). Output is `public/images/catalog-covers/
<brand-slug>/<catalog-id>.jpg`: 800x600 (the card's 4:3 frame, cropped from
the top of the page), under 150KB. Run it with no argument to redo every
catalog, or pass part of an id to redo just those.

It uses page 1, or page 2 if page 1 is blank. Some catalogs open with an
index, a logo page or a generic brand page, so those have a hand-picked page
(and, for two-page spreads, which half) listed in `PAGE_OVERRIDES` at the top
of the script. If a cover looks weak, add or change its entry there and re-run
the script for that id.
