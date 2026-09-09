import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Menu } from '@/components/ui/Menu'
import { formatRelative } from '@/lib/format'
import { useNotificationStore } from '@/store/useNotificationStore'
import type { AppNotification } from '@/types'
import { cn } from '@/lib/cn'

const RESPONSE_DOT: Record<string, string> = {
  yes: 'bg-emerald-500',
  no: 'bg-rose-500',
  maybe: 'bg-amber-500',
}

export function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const navigate = useNavigate()
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSelect = (n: AppNotification, close: () => void) => {
    markRead(n.id)
    close()
    navigate(`/events/${n.eventId}`)
  }

  return (
    <Menu
      align="right"
      width="w-80"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Notifications"
          className={cn(
            'relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
            open && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white',
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div className="max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Inbox className="h-6 w-6 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                RSVP replies will show up here as guests respond.
              </p>
            </div>
          ) : (
            <ul className="mt-1 flex flex-col gap-0.5">
              {notifications.slice(0, 20).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(n, close)}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800',
                      !n.read && 'bg-indigo-50/60 dark:bg-indigo-500/10',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        n.response ? RESPONSE_DOT[n.response] : 'bg-slate-400',
                        n.read && 'opacity-40',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900 dark:text-white">{n.title}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{n.body}</span>
                      <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                        {formatRelative(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Menu>
  )
}
