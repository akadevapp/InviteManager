/** RSVP response a guest can leave on an invite. */
export type RsvpStatus = 'pending' | 'yes' | 'no' | 'maybe'

/** Lifecycle status of an individual invite. */
export type InviteStatus = 'draft' | 'sent' | 'viewed' | 'responded'

/** Channel used to deliver an invite's bespoke link. */
export type InviteChannel = 'link' | 'email' | 'sms' | 'whatsapp' | 'share'

export interface EventRecord {
  id: string
  title: string
  description: string
  location: string
  isVirtual: boolean
  /** ISO 8601 datetime string. */
  startsAt: string
  hostName: string
  emoji: string
  /** Key into the ACCENTS palette (see lib/accents.ts). */
  accent: string
  createdAt: string
  updatedAt: string
}

export type ContactSource = 'manual' | 'import'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  createdAt: string
  source: ContactSource
}

export interface InviteTemplate {
  id: string
  name: string
  emoji: string
  accent: string
  tagline: string
  subject: string
  /** Message body with {{placeholder}} tokens, see lib/templates.ts. */
  message: string
}

export interface InviteSendRecord {
  channel: InviteChannel
  sentAt: string
}

export interface Invite {
  id: string
  token: string
  eventId: string
  contactId: string
  templateId: string
  subject: string
  message: string
  status: InviteStatus
  sends: InviteSendRecord[]
  viewCount: number
  firstViewedAt?: string
  lastViewedAt?: string
  response: RsvpStatus
  respondedAt?: string
  guestCount?: number
  responseNote?: string
  createdAt: string
  updatedAt: string
}

export type NotificationType = 'invite_viewed' | 'rsvp_response'

export interface AppNotification {
  id: string
  type: NotificationType
  eventId: string
  inviteId: string
  contactId: string
  title: string
  body: string
  response?: RsvpStatus
  createdAt: string
  read: boolean
}
