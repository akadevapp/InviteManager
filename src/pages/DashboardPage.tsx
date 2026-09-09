import { useMemo } from 'react'
import { CalendarDays, CalendarPlus, CheckCircle2, HelpCircle, PartyPopper, Send, Sparkles, XCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { EventCard } from '@/components/events/EventCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatTile } from '@/components/ui/StatTile'
import { useToast } from '@/components/ui/Toast'
import { loadSampleData } from '@/data/sampleData'
import { formatRelative } from '@/lib/format'
import { computeInviteStats } from '@/lib/inviteStats'
import { useContactStore } from '@/store/useContactStore'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function DashboardPage() {
  const events = useEventStore((s) => s.events)
  const invites = useInviteStore((s) => s.invites)
  const contacts = useContactStore((s) => s.contacts)
  const notifications = useNotificationStore((s) => s.notifications)
  const hostName = useSettingsStore((s) => s.hostName)
  const navigate = useNavigate()
  const showToast = useToast()

  const stats = useMemo(() => computeInviteStats(invites), [invites])

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.startsAt).getTime() >= Date.now())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        .slice(0, 3),
    [events],
  )

  const recentActivity = notifications.slice(0, 6)

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<PartyPopper className="h-6 w-6" />}
        title="Welcome to Invite Manager"
        description="Create an event, pull in contacts from your address book, and send bespoke RSVP links in a couple of clicks."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => navigate('/events', { state: { openCreate: true } })}>
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
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {hostName ? `Welcome back, ${hostName}` : 'Welcome back'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening across your events.
          </p>
        </div>
        <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={() => navigate('/events', { state: { openCreate: true } })}>
          New event
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Events" value={events.length} icon={<CalendarDays className="h-5 w-5" />} tone="indigo" />
        <StatTile label="Invites sent" value={stats.sent} icon={<Send className="h-5 w-5" />} tone="slate" />
        <StatTile label="Yes" value={stats.yes} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatTile label="Maybe" value={stats.maybe} icon={<HelpCircle className="h-5 w-5" />} tone="amber" />
        <StatTile label="No" value={stats.no} icon={<XCircle className="h-5 w-5" />} tone="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming events</h2>
            <Link to="/events" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No upcoming events. Time to plan something!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} invites={invites.filter((i) => i.eventId === event.id)} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {recentActivity.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                RSVP replies will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((n) => (
                  <li key={n.id}>
                    <Link
                      to={`/events/${n.eventId}`}
                      className="block px-4 py-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{formatRelative(n.createdAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {contacts.length} contact{contacts.length === 1 ? '' : 's'} in your address book.
          </p>
        </section>
      </div>
    </div>
  )
}
