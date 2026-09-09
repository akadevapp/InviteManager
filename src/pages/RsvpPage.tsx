import { useEffect, useRef, useState } from 'react'
import { CalendarDays, MapPin, PartyPopper, Pencil, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input, Textarea } from '@/components/ui/Input'
import { getAccent } from '@/lib/accents'
import { cn } from '@/lib/cn'
import { formatEventDate } from '@/lib/format'
import { useContactStore } from '@/store/useContactStore'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import type { RsvpStatus } from '@/types'

const RESPONSE_META: Record<Exclude<RsvpStatus, 'pending'>, { label: string; emoji: string; classes: string }> = {
  yes: { label: "You're going", emoji: '🎉', classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  maybe: { label: "You might go", emoji: '🤔', classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  no: { label: "You can't make it", emoji: '😢', classes: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
}

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>()
  const invite = useInviteStore((s) => s.invites.find((i) => i.token === token))
  const markViewed = useInviteStore((s) => s.markViewed)
  const submitResponse = useInviteStore((s) => s.submitResponse)
  const event = useEventStore((s) => s.events.find((e) => e.id === invite?.eventId))
  const contact = useContactStore((s) => s.contacts.find((c) => c.id === invite?.contactId))

  const [editing, setEditing] = useState(false)
  const [guestCount, setGuestCount] = useState(1)
  const [note, setNote] = useState('')
  const hasMarkedViewed = useRef(false)

  useEffect(() => {
    if (token && !hasMarkedViewed.current) {
      hasMarkedViewed.current = true
      markViewed(token)
    }
  }, [token, markViewed])

  useEffect(() => {
    if (invite?.response && invite.response !== 'pending') {
      setGuestCount(invite.guestCount ?? 1)
      setNote(invite.responseNote ?? '')
    }
  }, [invite?.response, invite?.guestCount, invite?.responseNote])

  if (!token || !invite || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <PartyPopper className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Invite not found</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This link doesn&apos;t match an invite in this browser. Invite Manager stores data locally, so a link
            only works on the same browser (and device) it was created on.
          </p>
          <Link to="/" className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Go to Invite Manager
          </Link>
        </div>
      </div>
    )
  }

  const accent = getAccent(event.accent)
  const hasResponded = invite.response !== 'pending'
  const showForm = !hasResponded || editing

  const handleRespond = (response: RsvpStatus) => {
    submitResponse(token, response, {
      guestCount: response === 'no' ? undefined : guestCount,
      responseNote: note.trim() || undefined,
    })
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className={cn('px-6 py-8 text-center text-white', accent.solid)}>
          <span className="text-5xl">{event.emoji}</span>
          <h1 className="mt-3 text-2xl font-bold">{event.title}</h1>
          <div className="mt-3 flex flex-col items-center gap-1 text-sm text-white/90">
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

        <div className="px-6 py-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hi {contact?.name ?? 'there'}, you&apos;re invited by <span className="font-medium text-slate-700 dark:text-slate-200">{event.hostName}</span>.
          </p>
          {event.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
          )}

          {hasResponded && !editing && (
            <div className={cn('mt-5 flex items-center justify-between rounded-xl px-4 py-3', RESPONSE_META[invite.response as Exclude<RsvpStatus, 'pending'>].classes)}>
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="text-lg">{RESPONSE_META[invite.response as Exclude<RsvpStatus, 'pending'>].emoji}</span>
                {RESPONSE_META[invite.response as Exclude<RsvpStatus, 'pending'>].label}
                {invite.guestCount !== undefined && invite.response !== 'no' && ` · Party of ${invite.guestCount}`}
              </span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs font-medium underline decoration-dotted underline-offset-2"
              >
                <Pencil className="h-3 w-3" />
                Change
              </button>
            </div>
          )}

          {showForm && (
            <div className="mt-5 space-y-4">
              <Field label="Number of guests (including you)">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                />
              </Field>

              <Field label="Note to host (optional)">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything the host should know?" />
              </Field>

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">Will you be there?</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    aria-label="Yes, I'll be there"
                    onClick={() => handleRespond('yes')}
                    className="flex flex-col items-center gap-1 rounded-xl border-2 border-emerald-500 bg-emerald-50 py-3 text-emerald-700 transition-transform hover:scale-[1.02] dark:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    <span className="text-xl">🎉</span>
                    <span className="text-xs font-semibold">Yes</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Maybe"
                    onClick={() => handleRespond('maybe')}
                    className="flex flex-col items-center gap-1 rounded-xl border-2 border-amber-400 bg-amber-50 py-3 text-amber-700 transition-transform hover:scale-[1.02] dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    <span className="text-xl">🤔</span>
                    <span className="text-xs font-semibold">Maybe</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Can't make it"
                    onClick={() => handleRespond('no')}
                    className="flex flex-col items-center gap-1 rounded-xl border-2 border-rose-400 bg-rose-50 py-3 text-rose-700 transition-transform hover:scale-[1.02] dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    <span className="text-xl">😢</span>
                    <span className="text-xs font-semibold">Can&apos;t go</span>
                  </button>
                </div>
              </div>

              {editing && (
                <Button variant="ghost" onClick={() => setEditing(false)} fullWidth>
                  Cancel
                </Button>
              )}
            </div>
          )}

          <div className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            {invite.message}
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-600">
        <Sparkles className="h-3.5 w-3.5" />
        <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-400">
          Made with Invite Manager
        </Link>
      </p>
    </div>
  )
}
