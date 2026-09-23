# Catalog PDF files

Each entry in `src/data/catalogs.ts` has a `filePath` pointing at a file in
this folder, and a `coverImage` pointing at a thumbnail under
`public/images/catalogs/`. The Catalog page (`/catalog`) groups entries by
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
  hansgrohe/
    ...
  vitra/
    ...
```

The 11 brand slugs in use elsewhere on the site: `grohe`, `hansgrohe`,
`axor`, `geberit`, `vitra`, `oyster`, `qutone`, `nexion`, `dimore`,
`mcm-ittim`, `verantes-living`.

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
3. Add a matching entry to `src/data/catalogs.ts`.
4. Generate or add a cover thumbnail under `public/images/catalogs/` (a
   themed placeholder is fine — see
   `scripts/generate-catalog-covers.cjs` — until a real first-page render
   is available).
