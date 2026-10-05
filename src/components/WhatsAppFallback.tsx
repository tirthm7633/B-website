import { useEffect, useRef, useState } from 'react'
import { contact } from '../data/content'
import { copyText } from '../lib/copyText'
import { CheckIcon, CopyIcon } from './ActionIcons'

// What gets copied: the number in the form people paste into WhatsApp, WhatsApp Business or
// their contacts (+919909906652). The visible label stays the readable "+91 99099 06652".
const COPY_VALUE = contact.phoneHref.replace('tel:', '')

type CopyState = 'idle' | 'copied' | 'failed'

/**
 * "Copy number" button. `variant="icon"` is the compact version for the mobile dock (the dock
 * shows its own "Copied!" toast via `onResult`); the default shows its state in its label.
 */
export function CopyNumberButton({
  variant = 'pill',
  className = '',
  onResult,
}: {
  variant?: 'pill' | 'icon'
  className?: string
  onResult?: (ok: boolean) => void
}) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    const ok = await copyText(COPY_VALUE)
    setState(ok ? 'copied' : 'failed')
    onResult?.(ok)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 2000)
  }

  const label = state === 'copied' ? 'Copied!' : state === 'failed' ? 'Copy failed' : 'Copy number'
  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy WhatsApp number ${contact.phoneDisplay}`}
        className={
          variant === 'icon'
            ? `flex items-center justify-center text-text transition-colors duration-300 active:bg-accent/20 ${className}`
            : `inline-flex min-w-[8.5rem] items-center justify-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.65rem] tracking-[0.12em] text-accent-bright uppercase transition-colors duration-300 hover:border-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright ${className}`
        }
      >
        {state === 'copied' ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
        {variant === 'pill' && <span>{label}</span>}
      </button>
      {variant === 'pill' && (
        <span className="sr-only" aria-live="polite">
          {state === 'copied' ? 'WhatsApp number copied' : state === 'failed' ? 'Could not copy the number' : ''}
        </span>
      )}
    </>
  )
}

/**
 * Shown next to every WhatsApp button: the number in plain sight plus a copy button, so anyone
 * whose phone opens the "wrong" WhatsApp app (or none) can paste the number into the one they
 * use. `notOpened` (from useWhatsAppLaunch) adds a quiet hint when the link didn't seem to open
 * anything.
 */
export default function WhatsAppFallback({
  notOpened = false,
  align = 'start',
  className = '',
}: {
  notOpened?: boolean
  align?: 'start' | 'center'
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'center' ? 'items-center text-center' : 'items-start'} ${className}`}>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="text-[0.75rem] text-text/80">
          WhatsApp <span className="numerals text-text">{contact.phoneDisplay}</span>
        </span>
        <CopyNumberButton />
      </div>
      {notOpened && (
        <p role="status" className="max-w-xs text-[0.75rem] leading-snug text-accent-bright">
          WhatsApp didn&rsquo;t open? Copy the number above and message us directly.
        </p>
      )}
    </div>
  )
}
