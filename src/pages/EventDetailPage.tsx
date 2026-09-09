import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  HelpCircle,
  Link as LinkIcon,
  MapPin,
  Pencil,
  Send,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { EventFormModal } from '@/components/events/EventFormModal'
import { RsvpBreakdownBar } from '@/components/events/RsvpBreakdownBar'
import { InviteComposerModal } from '@/components/invites/InviteComposerModal'
import { InviteTable } from '@/components/invites/InviteTable'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatTile } from '@/components/ui/StatTile'
import { useToast } from '@/components/ui/Toast'
import { getAccent } from '@/lib/accents'
import { cn } from '@/lib/cn'
import { formatEventDate } from '@/lib/format'
import { computeInviteStats } from '@/lib/inviteStats'
import type { RsvpStatus } from '@/types'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'

type FilterKey = 'all' | 'not_sent' | 'yes' | 'no' | 'maybe' | 'pending'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Awaiting reply' },
  { key: 'yes', label: 'Yes' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'no', label: 'No' },
  { key: 'not_sent', label: 'Not sent' },
]

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const showToast = useToast()

  const event = useEventStore((s) => s.events.find((e) => e.id === eventId))
  const updateEvent = useEventStore((s) => s.updateEvent)
  const deleteEvent = useEventStore((s) => s.deleteEvent)
  const allInvites = useInviteStore((s) => s.invites)
  const invites = useMemo(() => allInvites.filter((i) => i.eventId === eventId), [allInvites, eventId])

  const [composerOpen, setComposerOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [filter, setFilter] = useState<FilterKey>('all')

  const stats = useMemo(() => computeInviteStats(invites), [invites])

  const filteredInvites = useMemo(() => {
    switch (filter) {
      case 'not_sent':
        return invites.filter((i) => i.status === 'draft')
      case 'pending':
        return invites.filter((i) => i.response === 'pending' && i.status !== 'draft')
      case 'yes':
      case 'no':
      case 'maybe':
        return invites.filter((i) => i.response === (filter as RsvpStatus))
      default:
        return invites
    }
  }, [invites, filter])

  if (!eventId || !event) {
    return <Navigate to="/events" replace />
  }

  const accent = getAccent(event.accent)

  return (
    <div className="space-y-6">
      <Link to="/events" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        ← Back to events
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className={cn('flex flex-col gap-4 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between', accent.solid)}>
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none">{event.emoji}</span>
            <div>
              <h1 className="text-xl font-bold">{event.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {formatEventDate(event.startsAt)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="inverse" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="inverse" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        {event.description && (
          <div className="bg-white px-6 py-4 dark:bg-slate-900">
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Hosted by {event.hostName}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Invited" value={stats.total} icon={<Users className="h-5 w-5" />} tone="indigo" />
        <StatTile label="Sent" value={stats.sent} icon={<Send className="h-5 w-5" />} tone="slate" />
        <StatTile label="Yes" value={stats.yes} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatTile label="Maybe" value={stats.maybe} icon={<HelpCircle className="h-5 w-5" />} tone="amber" />
        <StatTile label="No" value={stats.no} icon={<XCircle className="h-5 w-5" />} tone="red" />
      </div>

      {stats.total > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Response rate</span>
            <span className="text-slate-500 dark:text-slate-400">
              {stats.responded} of {stats.sent} sent invites replied ({stats.responseRate}%)
            </span>
          </div>
          <RsvpBreakdownBar stats={stats} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Guests</h2>
        <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setComposerOpen(true)}>
          Invite guests
        </Button>
      </div>

      {invites.length === 0 ? (
        <EmptyState
          icon={<LinkIcon className="h-6 w-6" />}
          title="No invites yet"
          description="Pick a template, choose guests from your contact book, and send them a bespoke RSVP link."
          action={
            <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setComposerOpen(true)}>
              Invite guests
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === f.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filteredInvites.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No guests in this view.
            </p>
          ) : (
            <InviteTable invites={filteredInvites} />
          )}
        </div>
      )}

      <EventFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialEvent={event}
        onSubmit={(input) => {
          updateEvent(event.id, input)
          showToast({ title: 'Event updated' })
          setEditOpen(false)
        }}
      />

      <InviteComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} event={event} />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete "${event.title}"?`}
        description="All invites for this event will also be deleted. This can't be undone."
        confirmLabel="Delete event"
        onConfirm={() => {
          deleteEvent(event.id)
          showToast({ title: 'Event deleted', tone: 'info' })
          navigate('/events')
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
