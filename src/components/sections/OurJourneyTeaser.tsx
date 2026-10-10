import { Link } from 'react-router-dom'
import { journeyTeaser } from '../../data/content'
import Reveal from '../Reveal'

/**
 * Short "Our Journey" teaser for the homepage (content.ts `journeyTeaser`); the full timeline
 * lives on /our-journey (pages/OurJourneyPage.tsx), which the button links to.
 *
 * A quiet, centred editorial column — a deliberate pause between the About section (two
 * columns) and the Categories grid. Four paragraphs: a serif lead, two lighter body
 * paragraphs, and a last line set as a pull-quote for a strong closing beat. No photo: the
 * words carry it, and the homepage's photos are all spoken for.
 */
export default function OurJourneyTeaser() {
  const { eyebrow, heading, paragraphs, cta } = journeyTeaser
  const lead = paragraphs[0]
  const closingLine = paragraphs[paragraphs.length - 1]
  const middle = paragraphs.slice(1, -1)

  return (
    <section id="journey" className="story-line px-6 py-32 md:px-12 md:py-40">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <div className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {eyebrow}
        </div>
        {/* role=heading rather than <h2>: index.css has an unlayered h1-h4 rule that would
            override these utilities. */}
        <div role="heading" aria-level={2} data-rise className="font-display text-5xl leading-none font-light text-text md:text-7xl">
          {heading}
        </div>
        <span aria-hidden="true" className="h-px w-16 bg-accent" />

        <p className="max-w-2xl font-display text-xl leading-relaxed font-light text-text/85 md:text-2xl">{lead}</p>
        {middle.map((text) => (
          <p key={text} className="max-w-2xl text-base leading-relaxed font-light text-muted md:text-lg">
            {text}
          </p>
        ))}

        <div className="mt-2 flex w-full flex-col items-center gap-10 border-t border-line pt-10">
          <p className="max-w-2xl font-display text-2xl leading-snug font-light text-accent-bright italic md:text-3xl">
            {closingLine}
          </p>
          <Link
            to={cta.to}
            data-magnetic
            className="rounded-full border border-accent px-8 py-4 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg!"
          >
            {cta.label}
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
