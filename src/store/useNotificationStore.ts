import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createId } from '@/lib/id'
import { STORAGE_KEYS } from '@/lib/storageKeys'
import type { AppNotification, NotificationType, RsvpStatus } from '@/types'

const MAX_NOTIFICATIONS = 200

export interface AddNotificationInput {
  type: NotificationType
  eventId: string
  inviteId: string
  contactId: string
  title: string
  body: string
  response?: RsvpStatus
}

interface NotificationState {
  notifications: AppNotification[]
  addNotification: (input: AddNotificationInput) => AppNotification
  markRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (input) => {
        const notification: AppNotification = {
          id: createId(),
          createdAt: new Date().toISOString(),
          read: false,
          ...input,
        }
        set({ notifications: [notification, ...get().notifications].slice(0, MAX_NOTIFICATIONS) })
        return notification
      },

      markRead: (id) => {
        set({
          notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })
      },

      markAllRead: () => {
        set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) })
      },

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: STORAGE_KEYS.notifications,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
