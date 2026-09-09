import type { InviteTemplate } from '@/types'

/**
 * Ready-made invite templates. `subject` and `message` may use the
 * placeholders documented in lib/messageRender.ts; they're rendered per
 * contact when an invite is created and remain editable afterwards.
 */
export const INVITE_TEMPLATES: InviteTemplate[] = [
  {
    id: 'birthday',
    name: 'Birthday Party',
    emoji: '🎂',
    accent: 'fuchsia',
    tagline: 'Fun and festive, for turning another year older',
    subject: "You're invited: {{eventTitle}}!",
    message:
      "Hi {{guestName}}! 🎉\n\n{{hostName}} is throwing a birthday bash — {{eventTitle}} — and you're on the list!\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nTap the link below and let us know if you can make it:\n{{rsvpLink}}\n\nCan't wait to celebrate with you!",
  },
  {
    id: 'wedding',
    name: 'Wedding',
    emoji: '💍',
    accent: 'rose',
    tagline: 'Elegant wording for the big day',
    subject: 'You are cordially invited to {{eventTitle}}',
    message:
      'Dear {{guestName}},\n\nWith great joy, {{hostName}} invites you to share in the celebration of {{eventTitle}}.\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nPlease let us know if you\'ll be able to join us by responding here:\n{{rsvpLink}}\n\nWe would be honored to have you there.',
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    emoji: '💼',
    accent: 'sky',
    tagline: 'Polished tone for business gatherings',
    subject: 'Invitation: {{eventTitle}}',
    message:
      'Hello {{guestName}},\n\nYou are invited to {{eventTitle}}, hosted by {{hostName}}.\n\nDate: {{eventDate}}\nLocation: {{eventLocation}}\n\nKindly confirm your attendance at your earliest convenience:\n{{rsvpLink}}\n\nWe look forward to your participation.',
  },
  {
    id: 'baby-shower',
    name: 'Baby Shower',
    emoji: '🍼',
    accent: 'sky',
    tagline: 'Warm and welcoming for growing families',
    subject: "You're invited to a baby shower for {{hostName}}!",
    message:
      "Hi {{guestName}}!\n\nJoin us as we shower {{hostName}} with love ahead of their new arrival — {{eventTitle}}.\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nPlease RSVP so we can plan accordingly:\n{{rsvpLink}}\n\nSee you there!",
  },
  {
    id: 'holiday',
    name: 'Holiday Party',
    emoji: '🎄',
    accent: 'emerald',
    tagline: 'Festive and cheerful for seasonal get-togethers',
    subject: "Let's celebrate: {{eventTitle}}",
    message:
      "Hi {{guestName}}! ❄️\n\n{{hostName}} is hosting {{eventTitle}} and would love for you to be there.\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nRSVP here so we know to save you a seat (and a treat):\n{{rsvpLink}}\n\nHappy holidays!",
  },
  {
    id: 'casual-hangout',
    name: 'Casual Hangout',
    emoji: '🍔',
    accent: 'orange',
    tagline: 'Relaxed and friendly, for a backyard BBQ or game night',
    subject: "You're invited: {{eventTitle}}",
    message:
      "Hey {{guestName}}!\n\n{{hostName}} is getting people together for {{eventTitle}} — figured you'd be up for it.\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nLet me know if you're in:\n{{rsvpLink}}",
  },
  {
    id: 'webinar',
    name: 'Webinar / Virtual Event',
    emoji: '💻',
    accent: 'violet',
    tagline: 'Clear and informative for online sessions',
    subject: "You're invited: {{eventTitle}} (Online)",
    message:
      'Hi {{guestName}},\n\n{{hostName}} would like to invite you to an online session: {{eventTitle}}.\n\n🗓️ {{eventDate}}\n💻 {{eventLocation}}\n\nPlease confirm your attendance so we can send you the joining details:\n{{rsvpLink}}\n\nHope to see you there!',
  },
  {
    id: 'graduation',
    name: 'Graduation / Farewell',
    emoji: '🎓',
    accent: 'amber',
    tagline: 'Celebratory tone for milestones and send-offs',
    subject: "You're invited: {{eventTitle}}",
    message:
      "Hi {{guestName}},\n\nIt's time to celebrate! {{hostName}} is hosting {{eventTitle}} and would love to have you there.\n\n📅 {{eventDate}}\n📍 {{eventLocation}}\n\nPlease RSVP below:\n{{rsvpLink}}\n\nThank you for being part of this journey!",
  },
]

export function getTemplate(id: string): InviteTemplate | undefined {
  return INVITE_TEMPLATES.find((t) => t.id === id)
}
