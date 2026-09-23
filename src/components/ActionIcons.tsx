/** Thin-stroke (1.5px) line icons — no fills, no brand colours. */

export function PhoneIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"
      />
    </svg>
  )
}

export function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.8a8.2 8.2 0 0 0-7 12.5L4 20.2l4.05-1a8.2 8.2 0 1 0 3.95-15.4Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.2 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.2-.2.3 0 .6a6 6 0 0 0 2.8 2.4c.3.1.4 0 .6-.1l.6-.7c.2-.2.3-.2.5-.1l1.5.8c.2.1.3.2.3.4a1.9 1.9 0 0 1-1.3 1.6 3 3 0 0 1-2-.1 10 10 0 0 1-4.6-4c-.4-.6-.7-1.3-.7-2a2.4 2.4 0 0 1 .5-1.4Z"
      />
    </svg>
  )
}

export function DirectionsIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  )
}

export function CalendarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="15" rx="1.5" />
      <path strokeLinecap="round" d="M8 3.5v4M16 3.5v4M4 10h16" />
      <path strokeLinecap="round" d="M9 14.2l1.8 1.8L15.2 12" />
    </svg>
  )
}
