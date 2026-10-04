/**
 * Switches for sections whose content is still placeholder. They stay OFF until real content
 * replaces the placeholders, so nothing invented is shown to visitors.
 *
 * Everything behind a switch is kept in the codebase untouched — flipping one to `true` brings
 * the section straight back; nothing needs to be rebuilt.
 */

/**
 * The Projects page, the project detail pages, the "Projects" menu link and the "Real Projects,
 * Proven Results" card in Why Us. Turn on once data/projects.ts holds real projects with real
 * photos (it currently holds 3 placeholders — see the note at the top of that file).
 */
export const SHOW_PROJECTS = false

/**
 * The Testimonials section on the homepage. Turn on once data/testimonials.ts holds real
 * client quotes (it currently holds four invented ones).
 */
export const SHOW_TESTIMONIALS = false
