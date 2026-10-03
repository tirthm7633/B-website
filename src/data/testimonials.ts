/* ===========================================================================
 *  PLACEHOLDER TESTIMONIALS
 *
 *  Replace with real client quotes, names, and project types before the
 *  site goes fully public. Do not present these as real client feedback.
 *
 *  Every name, project type and quote below is invented. They only exist so
 *  the Testimonials section (components/sections/Testimonials.tsx) has
 *  something to lay out.
 * ===========================================================================
 */

export type Testimonial = {
  name: string
  /** e.g. "Villa, Rajkot" */
  projectType: string
  quote: string
  /** Optional, 1-5. When set, a small row of thin-line stars shows under the quote. */
  rating?: 1 | 2 | 3 | 4 | 5
}

export const testimonialsSection = {
  eyebrow: 'What Our Clients Say',
  heading: 'Homes that feel the way they were imagined.',
}

// PLACEHOLDER — see the warning at the top of this file.
export const testimonials: Testimonial[] = [
  {
    name: 'Meera Shah',
    projectType: 'Villa, Rajkot',
    quote:
      'We walked in with a vague idea and left with a bathroom we love. Seeing everything in person made every decision easier.',
  },
  {
    name: 'Rohan Kotecha',
    projectType: 'Apartment, Rajkot',
    quote:
      'Nobody pushed us towards the expensive option. They asked how we actually live, and recommended from there.',
  },
  {
    name: 'Anjali Mehta',
    projectType: 'Home Renovation, Rajkot',
    quote:
      'Genuine brands, honest advice, and a showroom where you can compare side by side. It saved us weeks of running around.',
  },
  {
    name: 'Vikram Joshi',
    projectType: 'Office, Rajkot',
    quote:
      'From tiles to taps to the kitchen, one team coordinated it all. The finish is exactly what we pictured.',
  },
]
