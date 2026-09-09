import { CalendarDays, MapPin, MoreVertical, Pencil, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Menu, MenuItem } from '@/components/ui/Menu'
import { getAccent } from '@/lib/accents'
import { formatEventDate } from '@/lib/format'
import { computeInviteStats } from '@/lib/inviteStats'
import type { EventRecord, Invite } from '@/types'

import { RsvpBreakdownBar } from './RsvpBreakdownBar'

interface EventCardProps {
  event: EventRecord
  invites: Invite[]
  onEdit?: (event: EventRecord) => void
  onDelete?: (event: EventRecord) => void
}

export function EventCard({ event, invites, onEdit, onDelete }: EventCardProps) {
  const accent = getAccent(event.accent)
  const stats = computeInviteStats(invites)
  const isPast = new Date(event.startsAt).getTime() < Date.now()

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/events/${event.id}`} className="flex flex-1 flex-col">
        <div className={`flex h-20 items-center justify-between px-5 text-white ${accent.solid}`}>
          <span className="text-3xl leading-none">{event.emoji}</span>
          {isPast && (
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium text-white">Past</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {event.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{formatEventDate(event.startsAt)}</span>
            </div>
            {event.location && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {stats.total} invited
              </span>
              <span>{stats.responded} responded</span>
            </div>
            <RsvpBreakdownBar stats={stats} />
          </div>
        </div>
      </Link>
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3">
          <Menu
            width="w-40"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  toggle()
                }}
                aria-label="Event actions"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/30 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            )}
          >
            {({ close }) => (
              <>
                {onEdit && (
                  <MenuItem
                    icon={<Pencil className="h-4 w-4" />}
                    onClick={() => {
                      close()
                      onEdit(event)
                    }}
                  >
                    Edit event
                  </MenuItem>
                )}
                {onDelete && (
                  <MenuItem
                    icon={<Trash2 className="h-4 w-4" />}
                    danger
                    onClick={() => {
                      close()
                      onDelete(event)
                    }}
                  >
                    Delete event
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </div>
      )}
    </div>
  )
}
