import { Copy, Mail, MessageCircle, MessageSquare, Send, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Menu, MenuItem } from '@/components/ui/Menu'
import { useToast } from '@/components/ui/Toast'
import {
  buildMailtoLink,
  buildSmsLink,
  buildWhatsAppLink,
  canWebShare,
  copyToClipboard,
  webShare,
} from '@/lib/share'
import type { Contact, InviteChannel } from '@/types'

interface SendChannelMenuProps {
  contact: Contact | undefined
  subject: string
  message: string
  rsvpUrl: string
  onSent: (channel: InviteChannel) => void
  label?: string
  variant?: 'primary' | 'outline'
}

export function SendChannelMenu({ contact, subject, message, rsvpUrl, onSent, label = 'Send', variant = 'primary' }: SendChannelMenuProps) {
  const showToast = useToast()

  const handleCopy = async () => {
    const ok = await copyToClipboard(rsvpUrl)
    if (ok) {
      showToast({ title: 'Link copied', description: rsvpUrl })
      onSent('link')
    } else {
      showToast({ title: 'Could not copy link', tone: 'error' })
    }
  }

  const handleEmail = () => {
    window.location.href = buildMailtoLink(contact?.email, subject, message)
    onSent('email')
  }

  const handleSms = () => {
    window.location.href = buildSmsLink(contact?.phone, message)
    onSent('sms')
  }

  const handleWhatsApp = () => {
    window.open(buildWhatsAppLink(contact?.phone, message), '_blank', 'noopener,noreferrer')
    onSent('whatsapp')
  }

  const handleShare = async () => {
    const ok = await webShare({ title: subject, text: message })
    if (ok) onSent('share')
  }

  return (
    <Menu
      align="right"
      width="w-52"
      trigger={({ toggle }) => (
        <Button
          type="button"
          variant={variant}
          size="sm"
          icon={<Send className="h-3.5 w-3.5" />}
          onClick={toggle}
        >
          {label}
        </Button>
      )}
    >
      {({ close }) => (
        <>
          <MenuItem
            icon={<Copy className="h-4 w-4" />}
            onClick={() => {
              close()
              void handleCopy()
            }}
          >
            Copy RSVP link
          </MenuItem>
          <MenuItem
            icon={<Mail className="h-4 w-4" />}
            onClick={() => {
              close()
              handleEmail()
            }}
          >
            Email{!contact?.email ? ' (no address)' : ''}
          </MenuItem>
          <MenuItem
            icon={<MessageCircle className="h-4 w-4" />}
            onClick={() => {
              close()
              handleWhatsApp()
            }}
          >
            WhatsApp
          </MenuItem>
          <MenuItem
            icon={<MessageSquare className="h-4 w-4" />}
            onClick={() => {
              close()
              handleSms()
            }}
          >
            Text message{!contact?.phone ? ' (no number)' : ''}
          </MenuItem>
          {canWebShare() && (
            <MenuItem
              icon={<Share2 className="h-4 w-4" />}
              onClick={() => {
                close()
                void handleShare()
              }}
            >
              More options…
            </MenuItem>
          )}
        </>
      )}
    </Menu>
  )
}
