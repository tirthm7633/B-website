import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { whyUs, type TrustPoint, type TrustPointIcon, type WhyUsStat } from '../../data/content'
import { ArrowRightIcon, BuildingIcon, CalendarIcon, HomeIcon, ShieldCheckIcon } from '../ActionIcons'
import ConsultationModal from '../ConsultationModal'
import CountUp from '../CountUp'
import Reveal from '../Reveal'

const ICONS: Record<TrustPointIcon, typeof ShieldCheckIcon> = {
  shield: ShieldCheckIcon,
  home: HomeIcon,
  calendar: CalendarIcon,
  building: BuildingIcon,
}

// Layout: no boxes. The first column lines up with the heading's left edge, and the columns are
// told apart only by a faint vertical hairline that fades out at both ends (like the About
// stats' left rule, but softer). Nothing runs along the bottom of the stats, so the numbers and
// the trust points below read as one composition. The classes below position those rules
// (a ::before on each cell) and the matching padding, per column and breakpoint.
const divider =
  'relative before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-line before:to-transparent'

// Stats: 2 columns on phones, 4 from md up.
const STAT_CELLS = [
  'pr-6 md:pr-8 xl:pr-10',
  `${divider} pl-6 md:px-8 xl:px-10`,
  `${divider} pr-6 before:hidden md:px-8 md:before:block xl:px-10`,
  `${divider} pl-6 md:px-8 xl:px-10`,
]

// Trust points: 1 column on phones (stacked, a hairline between); with four cards 2 columns from
// md and 4 from lg, with three cards (the Projects card is hidden, see data/visibility.ts) 3 columns
// from md.
const POINT_CELLS_4 = [
  'md:pr-8 xl:pr-10',
  `${divider} before:hidden md:pl-8 md:before:block lg:px-8 xl:px-10`,
  `${divider} before:hidden md:pr-8 lg:px-8 lg:before:block xl:px-10`,
  `${divider} before:hidden md:pl-8 md:before:block lg:px-8 xl:px-10`,
]
const POINT_CELLS_3 = [
  'md:pr-6 xl:pr-10',
  `${divider} before:hidden md:px-6 md:before:block xl:px-10`,
  `${divider} before:hidden md:px-6 md:before:block xl:px-10`,
]

const interactiveClass =
  'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-bright'

/**
 * The quiet "link" line of a clickable cell (e.g. "Our story →"). Steel blue with a hairline
 * underline at rest; when the cell is hovered or focused the text and rule brighten and the
 * arrow nudges right. Must sit inside an element with the `group` class.
 */
function ActionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 border-b border-accent/40 pb-1.5 text-[0.65rem] tracking-[0.2em] text-accent uppercase transition-colors duration-500 group-hover:border-accent-bright group-hover:text-accent-bright group-focus-visible:border-accent-bright group-focus-visible:text-accent-bright">
      {children}
      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" />
    </span>
  )
}

function StatBody({ stat }: { stat: WhyUsStat }) {
  return (
    <>
      {/* A short steel-blue rule above each number; on a linked stat it lengthens and brightens
          on hover. */}
      <span
        aria-hidden="true"
        className="h-px w-8 bg-accent transition-all duration-500 group-hover:w-16 group-hover:bg-accent-bright group-focus-visible:w-16 group-focus-visible:bg-accent-bright"
      />
      <div className="numerals font-display text-5xl leading-none font-light text-text transition-colors duration-500 group-hover:text-accent-bright group-focus-visible:text-accent-bright md:text-6xl lg:text-7xl xl:text-8xl">
        <CountUp value={stat.value} />
        {stat.suffix}
      </div>
      {/* Not the .eyebrow class: its (unlayered) colour would beat text-muted. Grey, so the
          steel-blue link below it is the only blue text in the cell. */}
      <p className="text-[0.7rem] leading-relaxed tracking-[0.2em] text-muted uppercase">{stat.label}</p>
      {stat.to && (
        <div className="mt-auto pt-3">
          <ActionLabel>{stat.linkLabel}</ActionLabel>
        </div>
      )}
    </>
  )
}

function TrustPointBody({ point }: { point: TrustPoint }) {
  const Icon = ICONS[point.icon]
  return (
    <>
      <Icon className="h-8 w-8 text-accent transition-colors duration-500 group-hover:text-accent-bright group-focus-visible:text-accent-bright" />
      {/* role=heading rather than <h3>: index.css has an unlayered h1-h4 rule (colour, weight,
          margin) that would beat the hover colour utility. */}
      <div
        role="heading"
        aria-level={3}
        className="font-display text-2xl leading-tight font-light text-text transition-colors duration-500 group-hover:text-accent-bright group-focus-visible:text-accent-bright md:text-[1.7rem]"
      >
        {point.title}
      </div>
      <p className="text-sm leading-relaxed text-muted">{point.desc}</p>
      {point.action && (
        <div className="mt-auto pt-3">
          <ActionLabel>{point.action.label}</ActionLabel>
        </div>
      )}
    </>
  )
}

const statCellBase = 'group flex flex-col items-start gap-5 py-10 text-left md:py-12 lg:py-14'
const pointCellBase =
  'group flex h-full flex-col items-start gap-5 border-t border-line py-10 text-left first:border-t-0 md:border-t-0 md:py-12'

export default function WhyUs() {
  const [consultationOpen, setConsultationOpen] = useState(false)
  const threePoints = whyUs.trustPoints.length === 3
  const pointCells = threePoints ? POINT_CELLS_3 : POINT_CELLS_4

  return (
    <section id="why-us" className="border-t border-line px-6 py-32 md:px-12">
      <Reveal className="mb-14 flex flex-col gap-6 md:mb-16">
        <div className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {whyUs.eyebrow}
        </div>
        <div role="heading" aria-level={2} className="max-w-3xl font-display text-3xl leading-[1.2] font-light md:text-5xl">
          {whyUs.heading}
        </div>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {whyUs.stats.map((stat, i) => {
            const className = `${statCellBase} ${STAT_CELLS[i]}`
            // A stat with a destination is a link (e.g. the years stat -> the Our Journey page);
            // the rest are plain cells.
            return stat.to ? (
              <Link key={stat.label} to={stat.to} className={`${className} ${interactiveClass}`}>
                <StatBody stat={stat} />
              </Link>
            ) : (
              <div key={stat.label} className={className}>
                <StatBody stat={stat} />
              </div>
            )
          })}
        </div>

        <div className={`grid grid-cols-1 ${threePoints ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {whyUs.trustPoints.map((point, i) => {
            const action = point.action
            const className = `${pointCellBase} ${pointCells[i]}`
            if (action?.kind === 'link') {
              return (
                <Link key={point.title} to={action.to} className={`${className} ${interactiveClass}`}>
                  <TrustPointBody point={point} />
                </Link>
              )
            }
            if (action?.kind === 'consultation') {
              return (
                <button
                  key={point.title}
                  type="button"
                  onClick={() => setConsultationOpen(true)}
                  className={`${className} ${interactiveClass}`}
                >
                  <TrustPointBody point={point} />
                </button>
              )
            }
            return (
              <div key={point.title} className={className}>
                <TrustPointBody point={point} />
              </div>
            )
          })}
        </div>
      </Reveal>

      {/* Outside the Reveal wrappers: a fixed overlay inside a transformed ancestor
          would be positioned relative to it instead of the viewport. */}
      {consultationOpen && (
        <ConsultationModal open onClose={() => setConsultationOpen(false)} context={{ source: 'enquire' }} />
      )}
    </section>
  )
}
