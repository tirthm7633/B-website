import type { ReactNode } from 'react'

interface MarqueeProps {
  items: ReactNode[]
  className?: string
  itemClassName?: string
  /** Tailwind gap utility applied both between plates and around each dot. */
  gapClassName?: string
  speed?: number
  reverse?: boolean
}

export default function Marquee({
  items,
  className = '',
  itemClassName = '',
  gapClassName = 'gap-8',
  speed = 42,
  reverse = false,
}: MarqueeProps) {
  return (
    <div className={`marquee-pause-on-hover relative flex overflow-hidden ${className}`} aria-hidden="true">
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className={`marquee-track flex shrink-0 items-center pr-6 md:pr-8 ${gapClassName}`}
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          }}
        >
          {items.map((item, i) => (
            <span key={i} className={`flex shrink-0 items-center ${gapClassName} ${itemClassName}`}>
              {item}
              <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
