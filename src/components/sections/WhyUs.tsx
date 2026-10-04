import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { whyUs, type TrustPoint, type TrustPointIcon } from '../../data/content'
import { useCountUp } from '../../lib/useCountUp'
import { ArrowRightIcon, BuildingIcon, CalendarIcon, HomeIcon, ShieldCheckIcon } from '../ActionIcons'
import ConsultationModal from '../ConsultationModal'
import Reveal from '../Reveal'

const ICONS: Record<TrustPointIcon, typeof ShieldCheckIcon> = {
  shield: ShieldCheckIcon,
  home: HomeIcon,
  calendar: CalendarIcon,
  building: BuildingIcon,
}

// Cells are separated by hairlines (a 1px gap over a line-coloured background, same
// trick as the Categories grid), so every divider is exactly one pixel at any size.
const cellClass = 'group flex h-full flex-col gap-4 bg-bg p-6 text-left md:p-8 lg:p-10'
const interactiveClass =
  'cursor-pointer transition-colors duration-500 hover:bg-surface focus-visible:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-bright'

function TrustPointBody({ point }: { point: TrustPoint }) {
  const Icon = ICONS[point.icon]
  return (
    <>
      <Icon className="h-8 w-8 text-accent transition-colors duration-500 group-hover:text-accent-bright" />
      {/* role=heading rather than <h3>: index.css has an unlayered h1-h4 rule (colour, weight,
          margin) that would beat the hover colour utility. */}
      <div
        role="heading"
        aria-level={3}
        className="font-display text-2xl leading-tight font-light text-text transition-colors duration-500 group-hover:text-accent-bright"
      >
        {point.title}
      </div>
      <p className="text-sm leading-relaxed text-muted">{point.desc}</p>
      {point.action && (
        <span className="mt-auto flex items-center gap-2 pt-4 text-[0.65rem] tracking-[0.15em] text-accent-bright uppercase">
          {point.action.label}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      )}
    </>
  )
}

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null)
  const [consultationOpen, setConsultationOpen] = useState(false)

  useCountUp(sectionRef)

  return (
    <section id="why-us" ref={sectionRef} className="border-t border-line px-6 py-32 md:px-12">
      <Reveal className="mb-14 flex flex-col gap-6 md:mb-16">
        <div className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {whyUs.eyebrow}
        </div>
        <div role="heading" aria-level={2} className="max-w-3xl font-display text-3xl leading-[1.2] font-light md:text-5xl">
          {whyUs.heading}
        </div>
      </Reveal>

      <Reveal className="grid gap-px overflow-hidden border border-line bg-line">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4">
          {whyUs.stats.map((stat) => {
            const body = (
              <>
                <div
                  className={`numerals font-display text-5xl leading-none font-light text-text md:text-6xl lg:text-7xl ${
                    stat.to ? 'transition-colors duration-500 group-hover:text-accent-bright' : ''
                  }`}
                >
                  <span className="stat-value" data-value={stat.value}>
                    0
                  </span>
                  {stat.suffix}
                </div>
                <p className="eyebrow" style={{ letterSpacing: '0.2em' }}>
                  {stat.label}
                </p>
                {stat.to && (
                  <span className="mt-auto flex items-center gap-2 pt-2 text-[0.65rem] tracking-[0.15em] text-accent-bright uppercase">
                    {stat.linkLabel}
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                  </span>
                )}
              </>
            )
            // A stat with a destination is a link (hover state and arrow like the trust-point
            // cards, e.g. the years stat -> the Our Journey page); the rest are plain cells.
            return stat.to ? (
              <Link
                key={stat.label}
                to={stat.to}
                className={`group flex flex-col gap-3 bg-bg p-6 md:p-8 lg:p-10 ${interactiveClass}`}
              >
                {body}
              </Link>
            ) : (
              <div key={stat.label} className="flex flex-col gap-3 bg-bg p-6 md:p-8 lg:p-10">
                {body}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-4">
          {whyUs.trustPoints.map((point) => {
            const action = point.action
            if (action?.kind === 'link') {
              return (
                <Link key={point.title} to={action.to} className={`${cellClass} ${interactiveClass}`}>
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
                  className={`${cellClass} ${interactiveClass}`}
                >
                  <TrustPointBody point={point} />
                </button>
              )
            }
            return (
              <div key={point.title} className={cellClass}>
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
