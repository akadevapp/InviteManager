import { formatEventDate } from '@/lib/format'
import { createInviteToken } from '@/lib/id'
import { renderMessage } from '@/lib/messageRender'
import { buildRsvpUrl } from '@/lib/share'
import { useContactStore } from '@/store/useContactStore'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { Contact, EventRecord } from '@/types'

import { getTemplate } from './templates'

function buildMessage(event: EventRecord, contact: Contact, hostName: string, template: ReturnType<typeof getTemplate>, token: string) {
  const ctx = {
    guestName: contact.name,
    hostName,
    eventTitle: event.title,
    eventDate: formatEventDate(event.startsAt),
    eventLocation: event.location,
    rsvpLink: buildRsvpUrl(token),
  }
  return {
    subject: renderMessage(template!.subject, ctx),
    message: renderMessage(template!.message, ctx),
  }
}

/** Seeds one sample event, three contacts, and a few invites in various states, for a quick first look at the app. */
export function loadSampleData(): string {
  const hostName = useSettingsStore.getState().hostName || 'You'

  const startsAt = new Date()
  startsAt.setDate(startsAt.getDate() + 14)
  startsAt.setHours(19, 0, 0, 0)

  const event = useEventStore.getState().addEvent({
    title: 'Rooftop Summer Party',
    description: 'An evening of music, food, and good company up on the rooftop. Bring your dancing shoes!',
    location: '221 Skyline Ave, Rooftop Lounge',
    isVirtual: false,
    startsAt: startsAt.toISOString(),
    hostName,
    emoji: '🎉',
    accent: 'fuchsia',
  })

  const [ava, liam, sofia] = useContactStore.getState().addContacts([
    { name: 'Ava Thompson', email: 'ava.thompson@example.com', phone: '+15550101' },
    { name: 'Liam Chen', email: 'liam.chen@example.com', phone: '+15550102' },
    { name: 'Sofia Ramirez', email: 'sofia.ramirez@example.com', phone: '+15550103' },
  ])

  const template = getTemplate('casual-hangout')
  const contacts = [ava, liam, sofia]
  const tokens = contacts.map(() => createInviteToken())

  const invites = useInviteStore.getState().createInvites(
    contacts.map((contact, idx) => {
      const { subject, message } = buildMessage(event, contact, hostName, template, tokens[idx])
      return {
        token: tokens[idx],
        eventId: event.id,
        contactId: contact.id,
        templateId: template!.id,
        subject,
        message,
      }
    }),
  )

  const { recordSend, markViewed, submitResponse } = useInviteStore.getState()
  recordSend(invites[0].id, 'email')
  submitResponse(invites[0].token, 'yes', { guestCount: 2, responseNote: "Wouldn't miss it!" })

  recordSend(invites[1].id, 'whatsapp')
  markViewed(invites[1].token)

  // invites[2] (Sofia) is left as a draft, never sent — demonstrates the "Not sent yet" state.

  return event.id
}
