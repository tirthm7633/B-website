import Reveal from '../components/Reveal'
import { journeyPage, ourJourney, type JourneyMilestone } from '../data/content'

// Same pill as the catalog cards' category tags.
const pillClass =
  'rounded-full border border-line px-3 py-1.5 text-[0.6rem] tracking-[0.15em] text-muted uppercase'

// Where the timeline dot (and the line that starts at it) sits, so it lines up with the middle
// of the first line of the year (or, for the year-less callout, of its title).
const OFFSETS = {
  year: { dot: 'mt-[13px] md:mt-[25px]', line: 'top-[18px] md:top-[30px]' },
  feature: { dot: 'mt-9 md:mt-[45px]', line: 'top-[41px] md:top-[50px]' },
}

function Items({ items, feature }: { items: string[]; feature?: boolean }) {
  if (feature) {
    return (
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className={pillClass}>
            {item}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="flex flex-col gap-3 border-l border-line pl-5">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-sm text-text/85">
          <span aria-hidden="true" className="h-px w-3 shrink-0 bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function MilestoneBody({ milestone }: { milestone: JourneyMilestone }) {
  const { title, body, items, afterItems, feature } = milestone
  const textClass = feature
    ? 'text-base leading-relaxed font-light text-muted'
    : 'max-w-2xl text-base leading-relaxed font-light text-muted'
  return (
    <>
      {/* role=heading rather than <h3>: index.css has an unlayered h1-h4 rule that would
          override these utilities. */}
      <div role="heading" aria-level={2} className="font-display text-2xl leading-tight font-light text-text md:text-3xl">
        {title}
      </div>
      {body.map((text) => (
        <p key={text} className={textClass}>
          {text}
        </p>
      ))}
      {items && <Items items={items} feature={feature} />}
      {afterItems?.map((text) => (
        <p key={text} className={textClass}>
          {text}
        </p>
      ))}
    </>
  )
}

function Milestone({ milestone, last }: { milestone: JourneyMilestone; last: boolean }) {
  const { year, feature } = milestone
  const offset = feature ? OFFSETS.feature : OFFSETS.year
  return (
    <li>
      {/* Phones: [dot | year, then text]. From tablet up: [year | dot | text] on one row. The
          dot column's hairline is drawn per row and runs the full height of the row, including
          the spacing below the text (that spacing is padding on the text cell, not on this grid,
          so the dot column stretches over it), so the line stays continuous without offset maths. */}
      <Reveal className="grid grid-cols-[1.25rem_1fr] gap-x-5 md:grid-cols-[8rem_1.25rem_1fr] md:gap-x-8 lg:grid-cols-[11rem_1.25rem_1fr] lg:gap-x-10">
        <div
          aria-hidden="true"
          className={`relative col-start-1 row-start-1 flex justify-center md:col-start-2 ${year ? 'row-span-2 md:row-span-1' : ''}`}
        >
          <span
            className={`absolute left-1/2 w-px -translate-x-1/2 ${offset.line} ${
              last ? 'h-24 bg-gradient-to-b from-line to-transparent' : 'bottom-0 bg-line'
            }`}
          />
          <span
            className={`relative z-10 h-2.5 w-2.5 rounded-full ring-[5px] ring-bg ${offset.dot} ${
              feature ? 'border border-accent-bright bg-bg' : 'bg-accent-bright'
            }`}
          />
        </div>

        {year && (
          <div className="numerals col-start-2 row-start-1 font-display text-4xl leading-none font-light text-text md:col-start-1 md:text-right md:text-6xl">
            {year}
          </div>
        )}

        <div
          className={`col-start-2 pb-14 md:col-start-3 md:row-start-1 md:pb-20 ${year ? 'row-start-2' : 'row-start-1'} ${
            feature ? '' : 'pt-5 md:pt-3'
          }`}
        >
          {feature ? (
            <div className="flex flex-col gap-5 border border-line bg-surface p-6 md:p-8">
              <MilestoneBody milestone={milestone} />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <MilestoneBody milestone={milestone} />
            </div>
          )}
        </div>
      </Reveal>
    </li>
  )
}

/**
 * /our-journey — the full Buildcon story as a vertical timeline (content.ts `ourJourney`).
 * A steel-blue dot on a hairline marks each milestone, with the year in large light serif
 * numerals; the year-less product callout is a boxed panel with pills; the page ends on a
 * centred pull-quote. Each milestone fades up as it scrolls into view. The homepage carries
 * only a short teaser (components/sections/OurJourneyTeaser.tsx) that links here.
 */
export default function OurJourneyPage() {
  const { closing } = journeyPage
  return (
    <div className="min-h-screen bg-bg">
      <div className="px-6 pt-32 pb-10 text-center md:px-12 md:pt-40 md:pb-14">
        <span className="eyebrow">{journeyPage.eyebrow}</span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light text-text md:text-5xl lg:text-6xl">
          {journeyPage.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">{journeyPage.intro}</p>
      </div>

      <div className="px-6 pt-12 pb-24 md:px-12 md:pt-16 md:pb-32">
        <ol className="mx-auto max-w-5xl">
          {ourJourney.map((milestone, i) => (
            <Milestone key={milestone.title} milestone={milestone} last={i === ourJourney.length - 1} />
          ))}
        </ol>

        <Reveal className="mx-auto mt-16 flex max-w-3xl flex-col items-center gap-8 text-center md:mt-24">
          <span aria-hidden="true" className="h-px w-16 bg-accent" />
          <div role="heading" aria-level={2} className="font-display text-3xl leading-[1.15] font-light text-text md:text-5xl">
            {closing.heading}
          </div>
          <p className="max-w-2xl text-base leading-relaxed font-light text-muted md:text-lg">{closing.body}</p>
          <p className="font-display text-xl font-light text-accent-bright italic md:text-2xl">{closing.tagline}</p>
        </Reveal>
      </div>
    </div>
  )
}
