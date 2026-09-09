import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function formatEventDate(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return 'Unknown date'
  return format(d, "EEEE, MMM d, yyyy 'at' h:mm a")
}

export function formatShortDate(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return '—'
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return '—'
  return format(d, 'MMM d, h:mm a')
}

export function formatRelative(iso: string | undefined): string {
  if (!iso) return '—'
  const d = parseISO(iso)
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true })
}

/** Converts an ISO datetime to the value format expected by <input type="datetime-local">. */
export function toDateTimeLocalValue(iso: string): string {
  const d = parseISO(iso)
  if (!isValid(d)) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Converts an <input type="datetime-local"> value back to an ISO datetime string. */
export function fromDateTimeLocalValue(value: string): string {
  const d = new Date(value)
  if (!isValid(d)) return new Date().toISOString()
  return d.toISOString()
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
