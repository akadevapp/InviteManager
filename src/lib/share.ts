/**
 * Builds the bespoke, per-invite RSVP URL. Uses a hash route (`#/rsvp/:token`)
 * rather than a browser-history path so the link keeps working no matter how
 * (or whether) the static build is deployed with server-side rewrites.
 */
export function buildRsvpUrl(token: string): string {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/rsvp/${token}`
}

export function buildMailtoLink(to: string | undefined, subject: string, body: string): string {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return `mailto:${to ? to.trim() : ''}?${query}`
}

const isApplePlatform = () =>
  typeof navigator !== 'undefined' && /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent)

export function buildSmsLink(phone: string | undefined, body: string): string {
  const separator = isApplePlatform() ? '&' : '?'
  return `sms:${phone ? phone.replace(/\s+/g, '') : ''}${separator}body=${encodeURIComponent(body)}`
}

export function buildWhatsAppLink(phone: string | undefined, text: string): string {
  const cleanPhone = phone ? phone.replace(/[^\d+]/g, '').replace(/^\+/, '') : ''
  const base = cleanPhone ? `https://wa.me/${cleanPhone}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

export function canWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function webShare(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
  if (!canWebShare()) return false
  try {
    await navigator.share(data)
    return true
  } catch {
    return false
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path below
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}
