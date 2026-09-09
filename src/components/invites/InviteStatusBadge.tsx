import type { ReactNode } from 'react'

import { CheckCircle2, Clock, Eye, HelpCircle, Send, XCircle } from 'lucide-react'

import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { Invite } from '@/types'

export function inviteStatusMeta(invite: Invite): { label: string; tone: BadgeTone; icon: ReactNode } {
  if (invite.response === 'yes') return { label: 'Yes', tone: 'green', icon: <CheckCircle2 className="h-3 w-3" /> }
  if (invite.response === 'no') return { label: 'No', tone: 'red', icon: <XCircle className="h-3 w-3" /> }
  if (invite.response === 'maybe') return { label: 'Maybe', tone: 'amber', icon: <HelpCircle className="h-3 w-3" /> }
  if (invite.status === 'viewed') return { label: 'Viewed', tone: 'blue', icon: <Eye className="h-3 w-3" /> }
  if (invite.status === 'sent') return { label: 'Sent', tone: 'indigo', icon: <Send className="h-3 w-3" /> }
  return { label: 'Not sent', tone: 'slate', icon: <Clock className="h-3 w-3" /> }
}

export function InviteStatusBadge({ invite }: { invite: Invite }) {
  const meta = inviteStatusMeta(invite)
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  )
}
