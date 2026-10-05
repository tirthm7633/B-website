import { useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import { PhoneIcon, WhatsAppIcon } from './ActionIcons'

/**
 * Mobile-only floating dock (below 768px). Replaces the old full-width
 * sticky bar and the separate floating WhatsApp bubble with a single slim
 * pill. Hides on scroll down, returns on scroll up.
 */
export default function ContactDock() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        // Ignore tiny jitter, and never hide near the very top.
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 120)
          lastY.current = y
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-transform duration-500 ease-out motion-reduce:transition-none md:hidden ${
        hidden ? 'translate-y-[140%]' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <nav
        aria-label="Quick contact"
        className="flex items-stretch overflow-hidden rounded-full border border-line shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(12,15,19,0.72)' }}
      >
        <a
          href={contact.phoneHref}
          className="flex items-center gap-2 px-7 py-3.5 text-[0.65rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 active:bg-accent/20"
        >
          <PhoneIcon className="h-4 w-4" />
          Call
        </a>
        <span className="my-2 w-px bg-line" aria-hidden="true" />
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-7 py-3.5 text-[0.65rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 active:bg-accent/20"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </nav>
    </div>
  )
}
