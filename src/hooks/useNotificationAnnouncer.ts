import { useEffect, useRef } from 'react'

import { useNotificationStore } from '@/store/useNotificationStore'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Fires a native browser notification when a new AppNotification lands in
 * the store — including ones that arrive via cross-tab sync, which is how an
 * organizer's tab finds out a guest just RSVP'd in another tab.
 */
export function useNotificationAnnouncer() {
  const seenIds = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      seenIds.current = new Set(useNotificationStore.getState().notifications.map((n) => n.id))
      initialized.current = true
    }

    return useNotificationStore.subscribe((state) => {
      const seen = seenIds.current
      const fresh = state.notifications.filter((n) => !seen.has(n.id))
      state.notifications.forEach((n) => seen.add(n.id))
      if (fresh.length === 0) return

      if (!useSettingsStore.getState().desktopNotifications) return
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

      for (const notification of fresh) {
        try {
          new Notification(notification.title, { body: notification.body, tag: notification.id })
        } catch {
          // Construction can throw in restricted contexts (e.g. some mobile browsers); ignore.
        }
      }
    })
  }, [])
}
