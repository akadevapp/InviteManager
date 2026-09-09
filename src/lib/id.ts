/** Generates a random UUID, falling back for non-secure contexts without crypto.randomUUID. */
export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Generates a bespoke, unguessable token used in an invite's public RSVP URL. */
export function createInviteToken(): string {
  return createId().replace(/-/g, '')
}
