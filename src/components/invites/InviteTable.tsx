import { useState } from 'react'
import { MessageSquareText, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconButton } from '@/components/ui/IconButton'
import { formatDateTime, formatRelative } from '@/lib/format'
import { buildRsvpUrl } from '@/lib/share'
import { useContactStore } from '@/store/useContactStore'
import { useInviteStore } from '@/store/useInviteStore'
import type { Invite } from '@/types'

import { InviteStatusBadge } from './InviteStatusBadge'
import { SendChannelMenu } from './SendChannelMenu'

interface InviteTableProps {
  invites: Invite[]
}

export function InviteTable({ invites }: InviteTableProps) {
  const contacts = useContactStore((s) => s.contacts)
  const recordSend = useInviteStore((s) => s.recordSend)
  const deleteInvite = useInviteStore((s) => s.deleteInvite)
  const [pendingDelete, setPendingDelete] = useState<Invite | null>(null)

  const sorted = [...invites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Guest</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Sent</th>
              <th className="px-4 py-2.5">Last activity</th>
              <th className="px-4 py-2.5">Response</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {sorted.map((invite) => {
              const contact = contacts.find((c) => c.id === invite.contactId)
              const lastSend = invite.sends.at(-1)
              return (
                <tr key={invite.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={contact?.name ?? 'Deleted contact'} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900 dark:text-white">
                          {contact?.name ?? 'Deleted contact'}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {contact?.email || contact?.phone || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <InviteStatusBadge invite={invite} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {lastSend ? (
                      <span title={invite.sends.map((s) => `${s.channel} · ${formatDateTime(s.sentAt)}`).join('\n')}>
                        via {lastSend.channel} · {formatRelative(lastSend.sentAt)}
                        {invite.sends.length > 1 && ` (×${invite.sends.length})`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {invite.respondedAt
                      ? `Responded ${formatRelative(invite.respondedAt)}`
                      : invite.lastViewedAt
                        ? `Viewed ${formatRelative(invite.lastViewedAt)}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    {invite.response !== 'pending' ? (
                      <div className="flex items-center gap-1.5">
                        {invite.guestCount !== undefined && <span>Party of {invite.guestCount}</span>}
                        {invite.responseNote && (
                          <span title={invite.responseNote} className="flex items-center gap-1 text-slate-400">
                            <MessageSquareText className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <SendChannelMenu
                        contact={contact}
                        subject={invite.subject}
                        message={invite.message}
                        rsvpUrl={buildRsvpUrl(invite.token)}
                        onSent={(channel) => recordSend(invite.id, channel)}
                        variant="outline"
                        label={invite.sends.length > 0 ? 'Resend' : 'Send'}
                      />
                      <IconButton label="Delete invite" size="sm" onClick={() => setPendingDelete(invite)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this invite?"
        description="The RSVP link will stop working for this guest."
        confirmLabel="Delete invite"
        onConfirm={() => {
          if (pendingDelete) deleteInvite(pendingDelete.id)
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
