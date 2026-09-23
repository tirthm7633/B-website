import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import { type ProjectCategory } from '../data/projects'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

export type ConsultationContext =
  | { source: 'catalog'; catalogId: string; catalogTitle: string; brand: string; filePath: string; primaryCategory?: ProjectCategory }
  | { source: 'enquire' }
  | { source: 'project'; projectId: string; projectTitle: string }

interface ConsultationModalProps {
  open: boolean
  onClose: () => void
  context: ConsultationContext
}

type Interest = ProjectCategory | 'unsure'

const INTEREST_OPTIONS: { value: Interest; label: string }[] = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'tiles', label: 'Tiles' },
  { value: 'sanitaryware', label: 'Sanitaryware' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'unsure', label: 'Not sure yet' },
]

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function sourceLabel(context: ConsultationContext) {
  if (context.source === 'catalog') return `Catalog — ${context.brand} · ${context.catalogTitle}`
  if (context.source === 'project') return `Project — ${context.projectTitle}`
  return 'General enquiry'
}

/**
 * Shared "Book a Design Consultation" popup — opened from the catalog
 * download flow, the nav's Enquire menu, and project detail pages, each
 * passing their own `context` so the request (and the pre-filled
 * WhatsApp message) carries where it came from. Sending the email
 * notification is best-effort: a missing API key or a network error is
 * logged and otherwise ignored, never blocking the success state, the
 * WhatsApp confirmation, or (for a catalog) the PDF download — see
 * api/consultation.ts for why.
 */
export default function ConsultationModal({ open, onClose, context }: ConsultationModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null)

  const defaultInterest: Interest = context.source === 'catalog' && context.primaryCategory ? context.primaryCategory : 'unsure'

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState<Interest>(defaultInterest)
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset the form fresh every time it's opened (including re-defaulting
  // the interest dropdown to whichever catalog/category triggered it).
  useEffect(() => {
    if (!open) return
    setName('')
    setPhone('')
    setInterest(defaultInterest)
    setNameError('')
    setPhoneError('')
    setSubmitting(false)
    setSubmitted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  const interestLabel = INTEREST_OPTIONS.find((o) => o.value === interest)?.label ?? 'Not sure yet'

  const whatsappHref = () => {
    const lines = [
      `Hi Buildcon House, I'd like to book a design consultation.`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Interested in: ${interestLabel}`,
      `Regarding: ${sourceLabel(context)}`,
    ]
    return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const validate = () => {
    let ok = true
    if (!name.trim()) {
      setNameError('Please enter your name.')
      ok = false
    } else {
      setNameError('')
    }
    const digits = digitsOnly(phone)
    if (digits.length < 10) {
      setPhoneError('Please enter a valid phone number.')
      ok = false
    } else {
      setPhoneError('')
    }
    return ok
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      interest: interestLabel,
      source: context.source,
      brand: context.source === 'catalog' ? context.brand : undefined,
      catalogTitle: context.source === 'catalog' ? context.catalogTitle : undefined,
      projectTitle: context.source === 'project' ? context.projectTitle : undefined,
      timestamp: new Date().toISOString(),
    }

    // Best-effort: the request notification email must never block the
    // visitor's success state, WhatsApp confirmation or catalog download
    // below — a missing API key or a network hiccup just gets logged.
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        console.warn('[ConsultationModal] Email notification request failed:', res.status)
      } else {
        const body = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
        if (body && body.ok === false) {
          console.warn('[ConsultationModal] Email notification was not sent:', body.reason)
        }
      }
    } catch (err) {
      console.warn('[ConsultationModal] Could not reach the email notification endpoint:', err)
    }

    if (context.source === 'catalog') {
      downloadAnchorRef.current?.click()
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  const submitLabel = context.source === 'catalog' ? 'Request Consultation & Download' : 'Request Consultation'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Book a design consultation"
      className="fixed inset-0 z-[70] hidden items-center justify-center bg-bg/85 px-6 backdrop-blur-sm"
      style={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md overflow-hidden rounded-sm border border-line shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
        style={{ backgroundColor: 'rgba(12,15,19,0.96)' }}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <span className="eyebrow">Book a Design Consultation</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close consultation form"
            className="flex h-9 w-9 items-center justify-center text-text transition-colors duration-300 hover:text-accent-bright"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {context.source === 'catalog' && (
          <a ref={downloadAnchorRef} href={context.filePath} download className="hidden" aria-hidden="true" tabIndex={-1} />
        )}

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 pb-8 pt-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-bright">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent-bright" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-light text-text">Request received.</h3>
            <p className="text-sm text-muted">
              {context.source === 'catalog'
                ? 'Your download has started. Our team will reach out shortly to help plan your project.'
                : "Our team will reach out shortly. In the meantime, feel free to send us the details directly on WhatsApp."}
            </p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-accent px-6 py-3 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
            >
              Send Confirmation on WhatsApp
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="mt-1 text-[0.65rem] tracking-[0.15em] text-muted uppercase transition-colors duration-300 hover:text-text"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 px-6 pb-8 pt-4">
            {(context.source === 'catalog' || context.source === 'project') && (
              <p className="text-[0.65rem] tracking-[0.15em] text-accent-bright uppercase">{sourceLabel(context)}</p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.65rem] tracking-[0.15em] text-muted uppercase">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-sm border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition-colors duration-300 focus:border-accent-bright"
                autoComplete="name"
              />
              {nameError && <span className="text-[0.65rem] text-red-400">{nameError}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.65rem] tracking-[0.15em] text-muted uppercase">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-sm border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition-colors duration-300 focus:border-accent-bright"
                autoComplete="tel"
              />
              {phoneError && <span className="text-[0.65rem] text-red-400">{phoneError}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.65rem] tracking-[0.15em] text-muted uppercase">What are you interested in?</span>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value as Interest)}
                className="rounded-sm border border-line bg-surface-2 px-4 py-2.5 text-sm text-text outline-none transition-colors duration-300 focus:border-accent-bright"
              >
                {INTEREST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full border border-accent px-6 py-3 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
            >
              {submitting ? 'Sending…' : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
