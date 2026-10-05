import { useCallback, useEffect, useRef, useState } from 'react'

const CHECK_AFTER_MS = 1500
// Coming back to the page this soon after tapping usually means the hand-off failed (an empty
// tab or a dismissed app picker), not that a chat happened.
const QUICK_RETURN_MS = 5000

/**
 * Best-effort check that tapping a WhatsApp link actually took the visitor somewhere. Browsers
 * don't say whether an app opened, so this watches the page itself: if it is still visible and
 * focused 1.5s after the tap, or the visitor is back within a few seconds, `notOpened` turns on
 * so the caller can show a quiet "WhatsApp didn't open?" hint next to the number and copy button.
 * A successful hand-off hides or blurs the page, which cancels the check, so it never gets in
 * the way of the normal flow. Spread `onClick` onto the WhatsApp link (it doesn't prevent the
 * link from opening).
 */
export function useWhatsAppLaunch() {
  const [notOpened, setNotOpened] = useState(false)
  const stop = useRef<(() => void) | null>(null)

  const onClick = useCallback(() => {
    stop.current?.()
    setNotOpened(false)
    const tappedAt = Date.now()
    let left = false

    const onLeave = () => {
      left = true
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        left = true
      } else if (left && Date.now() - tappedAt < QUICK_RETURN_MS) {
        finish()
        setNotOpened(true)
      }
    }
    const timer = window.setTimeout(() => {
      if (!left && document.visibilityState === 'visible' && document.hasFocus()) {
        finish()
        setNotOpened(true)
      }
    }, CHECK_AFTER_MS)
    // Stop watching once the quick-return window has passed.
    const expiry = window.setTimeout(() => finish(), QUICK_RETURN_MS)

    function finish() {
      window.clearTimeout(timer)
      window.clearTimeout(expiry)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('pagehide', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      stop.current = null
    }

    window.addEventListener('blur', onLeave)
    window.addEventListener('pagehide', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    stop.current = finish
  }, [])

  useEffect(() => () => stop.current?.(), [])

  const dismiss = useCallback(() => setNotOpened(false), [])
  return { onClick, notOpened, dismiss }
}
