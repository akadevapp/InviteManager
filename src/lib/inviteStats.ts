import type { Invite } from '@/types'

export interface InviteStats {
  total: number
  notSent: number
  sent: number
  viewed: number
  yes: number
  no: number
  maybe: number
  responded: number
  pending: number
  responseRate: number
}

export function computeInviteStats(invites: Invite[]): InviteStats {
  const total = invites.length
  const notSent = invites.filter((i) => i.status === 'draft').length
  const sent = total - notSent
  const viewed = invites.filter((i) => i.status === 'viewed' || i.status === 'responded').length
  const yes = invites.filter((i) => i.response === 'yes').length
  const no = invites.filter((i) => i.response === 'no').length
  const maybe = invites.filter((i) => i.response === 'maybe').length
  const responded = yes + no + maybe
  const pending = total - responded
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0

  return { total, notSent, sent, viewed, yes, no, maybe, responded, pending, responseRate }
}
