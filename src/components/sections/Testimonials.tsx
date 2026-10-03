import { testimonials, testimonialsSection, type Testimonial } from '../../data/testimonials'
import Reveal from '../Reveal'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-accent" role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="h-3 w-3" fill={n <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinejoin="round" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />
        </svg>
      ))}
    </div>
  )
}

// No card, just a hairline above: the quote, then who said it, in small steel-grey capitals.
function TestimonialEntry({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex flex-1 flex-col gap-6 border-t border-line pt-8">
      <span aria-hidden="true" className="-mb-4 font-display text-5xl leading-none font-light text-accent/70">
        &ldquo;
      </span>
      {testimonial.rating && <Stars rating={testimonial.rating} />}
      <blockquote className="font-display text-[1.35rem] leading-snug font-light text-text md:text-2xl">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-auto flex flex-col gap-1.5 pt-2">
        <span className="text-[0.7rem] tracking-[0.22em] text-muted uppercase">{testimonial.name}</span>
        <span className="text-[0.65rem] tracking-[0.18em] text-accent uppercase">{testimonial.projectType}</span>
      </figcaption>
    </figure>
  )
}

/**
 * PLACEHOLDER CONTENT — the quotes come from data/testimonials.ts, which is entirely
 * invented until real client feedback replaces it.
 *
 * Phones: one card at a time in a swipeable, scroll-snapping strip (the next card peeks
 * in as a cue). Tablet: 2x2. Desktop: a single row of four.
 */
export default function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-line px-6 py-32 md:px-12">
      <Reveal className="mb-14 flex flex-col gap-6 md:mb-16">
        <div className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {testimonialsSection.eyebrow}
        </div>
        <div role="heading" aria-level={2} className="max-w-3xl font-display text-3xl leading-[1.2] font-light md:text-5xl">
          {testimonialsSection.heading}
        </div>
      </Reveal>

      <Reveal>
        <div
          className="-mx-6 flex scroll-pl-6 snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-14 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
          aria-label="Client testimonials"
          role="region"
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="flex w-[82%] shrink-0 snap-start md:w-auto">
              <TestimonialEntry testimonial={testimonial} />
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
