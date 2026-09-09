import { useMemo, useState } from 'react'
import { CalendarPlus, PartyPopper, Search, Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { EventCard } from '@/components/events/EventCard'
import { EventFormModal } from '@/components/events/EventFormModal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { loadSampleData } from '@/data/sampleData'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import type { EventRecord } from '@/types'

export default function EventsPage() {
  const events = useEventStore((s) => s.events)
  const addEvent = useEventStore((s) => s.addEvent)
  const updateEvent = useEventStore((s) => s.updateEvent)
  const deleteEvent = useEventStore((s) => s.deleteEvent)
  const invites = useInviteStore((s) => s.invites)
  const showToast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(Boolean((location.state as { openCreate?: boolean } | null)?.openCreate))
  const [editing, setEditing] = useState<EventRecord | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<EventRecord | null>(null)

  const { upcoming, past } = useMemo(() => {
    const filtered = events.filter((e) => e.title.toLowerCase().includes(query.trim().toLowerCase()))
    const now = Date.now()
    const upcoming = filtered
      .filter((e) => new Date(e.startsAt).getTime() >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    const past = filtered
      .filter((e) => new Date(e.startsAt).getTime() < now)
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
    return { upcoming, past }
  }, [events, query])

  const invitesFor = (eventId: string) => invites.filter((i) => i.eventId === eventId)

  const openCreate = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const handleSubmit = (input: Parameters<typeof addEvent>[0]) => {
    if (editing) {
      updateEvent(editing.id, input)
      showToast({ title: 'Event updated' })
    } else {
      const event = addEvent(input)
      showToast({ title: 'Event created', description: 'Now add guests and send invites.' })
      setFormOpen(false)
      navigate(`/events/${event.id}`)
      return
    }
    setFormOpen(false)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteEvent(pendingDelete.id)
    showToast({ title: 'Event deleted', tone: 'info' })
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Events</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {events.length === 0 ? 'Create your first event to get started.' : `${events.length} event${events.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={openCreate}>
          New event
        </Button>
      </div>

      {events.length > 0 && (
        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            className="pl-9"
          />
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={<PartyPopper className="h-6 w-6" />}
          title="No events yet"
          description="Create an event, then invite guests from your contact book using a ready-made template."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={openCreate}>
                Create your first event
              </Button>
              <Button
                variant="outline"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={() => {
                  const eventId = loadSampleData()
                  showToast({ title: 'Sample data loaded', description: 'Explore a demo event with invites already sent.' })
                  navigate(`/events/${eventId}`)
                }}
              >
                Try sample data
              </Button>
            </div>
          }
        />
      ) : (
        <div className="mt-6 space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    invites={invitesFor(event.id)}
                    onEdit={(e) => {
                      setEditing(e)
                      setFormOpen(true)
                    }}
                    onDelete={setPendingDelete}
                  />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Past</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    invites={invitesFor(event.id)}
                    onEdit={(e) => {
                      setEditing(e)
                      setFormOpen(true)
                    }}
                    onDelete={setPendingDelete}
                  />
                ))}
              </div>
            </section>
          )}
          {upcoming.length === 0 && past.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No events match &ldquo;{query}&rdquo;.
            </p>
          )}
        </div>
      )}

      <EventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialEvent={editing}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="All invites for this event will also be deleted."
        confirmLabel="Delete event"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
