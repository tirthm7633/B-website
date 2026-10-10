// Every picture in the film (sources in ../BRAND_NOTES.md).

export type Photo = { src: string; position?: string }

/** Beat 2 corridor, in flight order. `group` = which kinetic word it belongs to. */
export const CORRIDOR: (Photo & { group: number })[] = [
  { src: 'photos/stock/bath-rain-shower.jpg', position: 'center 38%', group: 0 },
  { src: 'photos/stock/bath-dark-stone.jpg', position: 'center 45%', group: 0 },
  { src: 'photos/stock/bath-lit-mirror.jpg', position: 'center 50%', group: 0 },
  { src: 'photos/stock/kitchen-chandelier.jpg', position: 'center 55%', group: 1 },
  { src: 'photos/stock/kitchen-black.jpg', position: 'center 45%', group: 1 },
  { src: 'photos/stock/living-grey.jpg', position: 'center 60%', group: 2 },
  { src: 'photos/stock/living-green.jpg', position: 'center 62%', group: 2 },
  { src: 'photos/stock/spa-steam-room.jpg', position: 'center 55%', group: 3 },
  { src: 'photos/stock/spa-wood-pool.jpg', position: 'center 60%', group: 3 },
  // The last one is the "best photo" micro-hold and becomes the centre card of the brand wall.
  { src: 'photos/stock/spa-slate-pool.jpg', position: '35% 55%', group: 3 },
]
export const WORDS = ['Sanitaryware', 'Kitchens', 'Furniture', 'Wellness']

/** Beat 3 photo cards (the corridor's last photo is the 10th, centre card). */
export const PHOTO_CARDS: Photo[] = [
  { src: 'photos/showroom/gallery-1.jpg', position: 'center 40%' },
  { src: 'photos/site/category-sanitaryware.webp', position: '38% center' },
  { src: 'photos/showroom/gallery-3.jpg', position: 'center 45%' },
  { src: 'photos/stock/kitchen-dining.jpg', position: 'center 55%' },
  { src: 'photos/site/hero-living-room.webp', position: 'center 55%' },
  { src: 'photos/showroom/gallery-14.jpg', position: 'center 55%' },
  { src: 'photos/stock/bath-black-marble.jpg', position: 'center 50%' }, // the one tiled room
  { src: 'photos/site/category-wellness.webp', position: 'center 62%' },
  { src: 'photos/showroom/gallery-08.jpg', position: 'center 50%' },
]

/** Brand logos on the website's own plates (light #EDEFF2 / dark #0C0F13 + hairline). */
export const BRANDS: { name: string; src: string; plate: 'light' | 'dark' }[] = [
  { name: 'Grohe', src: 'brands/grohe.png', plate: 'dark' },
  { name: 'Hansgrohe x Axor', src: 'brands/hansgrohe-x-axor.png', plate: 'dark' },
  { name: 'Geberit', src: 'brands/gebrit.png', plate: 'dark' },
  { name: 'Vitra', src: 'brands/vitra.png', plate: 'dark' },
  { name: 'Qutone', src: 'brands/qutone.png', plate: 'dark' },
  { name: 'Nexion', src: 'brands/nexion.png', plate: 'light' },
  { name: 'Oyster', src: 'brands/oyster.png', plate: 'light' },
  { name: 'Dimore', src: 'brands/dimore.png', plate: 'light' },
  { name: 'MCM Ittim', src: 'brands/mcm-ittim.png', plate: 'dark' },
  { name: 'Verantes Living', src: 'brands/verantes-living.png', plate: 'dark' },
]

export type CardDef = { kind: 'photo'; photo: Photo; hero?: boolean } | { kind: 'brand'; brand: (typeof BRANDS)[number] }

/** The 20 wall cards: the hero photo first, then brands and photos alternating. */
export const CARDS: CardDef[] = [
  { kind: 'photo', photo: CORRIDOR[CORRIDOR.length - 1], hero: true },
  ...BRANDS.flatMap((brand, i) => {
    const out: CardDef[] = [{ kind: 'brand', brand }]
    if (PHOTO_CARDS[i]) out.push({ kind: 'photo', photo: PHOTO_CARDS[i] })
    return out
  }),
]
