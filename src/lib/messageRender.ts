export interface MessageContext {
  guestName: string
  hostName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  rsvpLink: string
}

const PLACEHOLDER_RE = /{{\s*(\w+)\s*}}/g

/** Substitutes `{{placeholder}}` tokens in a template string with context values. */
export function renderMessage(template: string, ctx: MessageContext): string {
  return template.replace(PLACEHOLDER_RE, (match, key: string) => {
    const value = (ctx as unknown as Record<string, string>)[key]
    return value !== undefined ? value : match
  })
}

export const MESSAGE_PLACEHOLDERS: Array<{ token: string; label: string }> = [
  { token: '{{guestName}}', label: 'Guest name' },
  { token: '{{hostName}}', label: 'Host name' },
  { token: '{{eventTitle}}', label: 'Event title' },
  { token: '{{eventDate}}', label: 'Event date & time' },
  { token: '{{eventLocation}}', label: 'Location' },
  { token: '{{rsvpLink}}', label: 'Bespoke RSVP link' },
]
