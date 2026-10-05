/**
 * Copies text to the clipboard. Uses the Clipboard API where it's available (HTTPS pages) and
 * falls back to a temporary text field + execCommand('copy') for older or restricted browsers.
 * Resolves to whether the copy worked.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the older method.
  }
  try {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    field.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(field)
    return ok
  } catch {
    return false
  }
}
