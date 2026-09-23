import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { contact } from '../data/content'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'
import { DirectionsIcon, PhoneIcon, WhatsAppIcon } from './ActionIcons'

interface EnquirePopoverProps {
  open: boolean
  onClose: () => void
}

/**
 * A small centred panel of contact options (Call / WhatsApp / Directions),
 * opened from the nav's shared menu — same open/close contract as
 * BrandsPanel (controlled by the parent, own escape/focus-trap/scroll-lock)
 * rather than a self-contained pill+dropdown, since there's no anchor
 * button left in the navbar row to hang a dropdown off since the menu
 * became the only way to reach it.
 */
export default function EnquirePopover({ open, onClose }: EnquirePopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const panel = panelRef.current
    const content = contentRef.current
    if (!panel || !content) return

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      gsap.set(panel, { display: 'flex' })
      if (prefersReducedMotion()) {
        gsap.set([panel, content], { opacity: 1, y: 0 })
      } else {
        gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
        gsap.fromTo(content, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 })
      }
      closeBtnRef.current?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleClose = () => {
    const panel = panelRef.current
    if (!panel) return
    if (prefersReducedMotion()) {
      gsap.set(panel, { display: 'none' })
      onClose()
      return
    }
    gsap.to(panel, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(panel, { display: 'none' })
        onClose()
      },
    })
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const rowClass =
    'flex items-center gap-3 px-5 py-4 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:bg-surface-2 hover:text-accent-bright'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Enquire"
      className="fixed inset-0 z-[60] hidden items-center justify-center bg-bg/80 backdrop-blur-sm"
      style={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        ref={contentRef}
        className="relative w-72 overflow-hidden rounded-sm border border-line shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        style={{ backgroundColor: 'rgba(12,15,19,0.96)' }}
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="eyebrow">Enquire</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close enquire panel"
            className="flex h-9 w-9 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex flex-col">
          <a href={contact.phoneHref} className={rowClass}>
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
          <span className="block h-px bg-line" aria-hidden="true" />
          <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <span className="block h-px bg-line" aria-hidden="true" />
          <a href={contact.directionsHref} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <DirectionsIcon className="h-4 w-4" />
            Directions
          </a>
        </div>
      </div>
    </div>
  )
}
