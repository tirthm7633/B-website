# Architect photos

Each entry in the `architects` array in `src/data/content.ts` has a `photo`
field pointing at a file in this folder. If a file is missing or fails to
load, the site automatically shows a clean placeholder circle (graphite +
steel-blue gradient with the person's initials) instead of a broken image —
see `src/components/ArchitectPhoto.tsx`.

**Important:** only add a real person's photo with their explicit
permission. All 16 current entries are placeholder names, not real people —
see the comment above the `architects` array in `content.ts`.

**Ideal photo spec:**
- Square aspect ratio, at least 600×600px
- Face centred in the frame (the image is cropped to a circle)
- JPG or PNG

## Expected filenames

| Filename | Person (placeholder — replace via content.ts) |
| --- | --- |
| `architect-01.jpg` | Aarav Mehta |
| `architect-02.jpg` | Riya Shah |
| `architect-03.jpg` | Kabir Desai |
| `architect-04.jpg` | Ishita Patel |
| `architect-05.jpg` | Vihaan Joshi |
| `architect-06.jpg` | Anaya Trivedi |
| `architect-07.jpg` | Rohan Vyas |
| `architect-08.jpg` | Diya Bhatt |
| `architect-09.jpg` | Arjun Pandya |
| `architect-10.jpg` | Meera Kotecha |
| `architect-11.jpg` | Yash Raval |
| `architect-12.jpg` | Nisha Parekh |
| `architect-13.jpg` | Dev Antani |
| `architect-14.jpg` | Sara Chauhan |
| `architect-15.jpg` | Om Gohil |
| `architect-16.jpg` | Tara Solanki |

To add more people beyond these 16, add a new object to the `architects`
array in `content.ts` (name, firm, photo path) — the homepage layout
automatically re-splits and re-flows for any number of entries, no code
changes needed.
