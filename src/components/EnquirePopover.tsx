import { useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import { DirectionsIcon, PhoneIcon, WhatsAppIcon } from './ActionIcons'

/** Tablet/desktop replacement for a floating button: a discreet navbar pill. */
export default function EnquirePopover() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickAway = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickAway)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const rowClass =
    'flex items-center gap-3 px-5 py-3 text-[0.65rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:bg-surface-2 hover:text-accent-bright'

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full border border-line px-5 py-2 text-[0.65rem] tracking-[0.2em] text-text uppercase transition-colors duration-500 hover:border-accent hover:text-accent-bright"
      >
        Enquire
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-sm border border-line shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(12,15,19,0.94)' }}
        >
          <a href={contact.phoneHref} role="menuitem" className={rowClass}>
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
          <span className="block h-px bg-line" aria-hidden="true" />
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={rowClass}
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <span className="block h-px bg-line" aria-hidden="true" />
          <a
            href={contact.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={rowClass}
          >
            <DirectionsIcon className="h-4 w-4" />
            Directions
          </a>
        </div>
      )}
    </div>
  )
}
