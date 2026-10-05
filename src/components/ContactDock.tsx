import { useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import { useWhatsAppLaunch } from '../lib/useWhatsAppLaunch'
import { PhoneIcon, WhatsAppIcon } from './ActionIcons'
import { CopyNumberButton } from './WhatsAppFallback'

/**
 * Mobile-only floating dock (below 768px). Replaces the old full-width
 * sticky bar and the separate floating WhatsApp bubble with a single slim
 * pill. Hides on scroll down, returns on scroll up.
 */
export default function ContactDock() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const whatsapp = useWhatsAppLaunch()
  const { notOpened, dismiss } = whatsapp
  const [copyResult, setCopyResult] = useState<'copied' | 'failed' | null>(null)
  const copyTimer = useRef<number | undefined>(undefined)

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

  // The "didn't open?" hint is a toast here (there's no room for it in the pill), so let it go
  // on its own after a while.
  useEffect(() => {
    if (!notOpened) return
    const t = window.setTimeout(dismiss, 8000)
    return () => window.clearTimeout(t)
  }, [notOpened, dismiss])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const onCopyResult = (ok: boolean) => {
    setCopyResult(ok ? 'copied' : 'failed')
    if (ok) dismiss()
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopyResult(null), 2000)
  }

  const toast =
    copyResult === 'copied'
      ? `Copied! ${contact.phoneDisplay}`
      : copyResult === 'failed'
        ? `Couldn't copy. The number is ${contact.phoneDisplay}`
        : notOpened
          ? 'WhatsApp didn’t open? Copy the number below and message us directly.'
          : null

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-transform duration-500 ease-out motion-reduce:transition-none md:hidden ${
        hidden ? 'translate-y-[140%]' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-none absolute inset-x-4 bottom-full flex justify-center pb-2" aria-live="polite">
        {toast && (
          <p
            className="max-w-[19rem] rounded-2xl border border-line px-4 py-2 text-center text-[0.75rem] leading-snug text-text shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            style={{ backgroundColor: 'rgba(12,15,19,0.88)' }}
          >
            {toast}
          </p>
        )}
      </div>

      <nav
        aria-label="Quick contact"
        className="flex items-stretch overflow-hidden rounded-full border border-line shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        style={{ backgroundColor: 'rgba(12,15,19,0.72)' }}
      >
        <a
          href={contact.phoneHref}
          className="flex items-center gap-2 py-3 pr-5 pl-6 text-[0.65rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 active:bg-accent/20"
        >
          <PhoneIcon className="h-4 w-4" />
          Call
        </a>
        <span className="my-2 w-px bg-line" aria-hidden="true" />
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={whatsapp.onClick}
          className="flex items-center gap-2.5 px-4 py-2 text-text transition-colors duration-300 active:bg-accent/20"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-[0.65rem] tracking-[0.2em] uppercase">WhatsApp</span>
            <span className="numerals text-[0.7rem] whitespace-nowrap text-text/75">{contact.phoneDisplay}</span>
          </span>
        </a>
        <span className="my-2 w-px bg-line" aria-hidden="true" />
        <CopyNumberButton variant="icon" onResult={onCopyResult} className="pr-5 pl-4" />
      </nav>
    </div>
  )
}
