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

export function ShieldCheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 2.5v5.5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V5.5L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.8 12l2.4 2.4 4.2-4.6" />
    </svg>
  )
}

export function HomeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 11.5L12 4l8.5 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v10h12V10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-5.5h4V20" />
    </svg>
  )
}

export function BuildingIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20.5h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.5V4.5h8v16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9.5h4v11" />
      <path strokeLinecap="round" d="M9 8h2M9 11.5h2M9 15h2M16 13h.01M16 16.5h.01" />
    </svg>
  )
}

export function ArrowRightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function CopyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}
