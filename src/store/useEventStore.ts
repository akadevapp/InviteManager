import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createId } from '@/lib/id'
import { STORAGE_KEYS } from '@/lib/storageKeys'
import type { EventRecord } from '@/types'

import { useInviteStore } from './useInviteStore'

export type EventInput = Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>

interface EventState {
  events: EventRecord[]
  addEvent: (input: EventInput) => EventRecord
  updateEvent: (id: string, patch: Partial<EventInput>) => void
  deleteEvent: (id: string) => void
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (input) => {
        const now = new Date().toISOString()
        const event: EventRecord = { id: createId(), createdAt: now, updatedAt: now, ...input }
        set({ events: [event, ...get().events] })
        return event
      },

      updateEvent: (id, patch) => {
        set({
          events: get().events.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
          ),
        })
      },

      deleteEvent: (id) => {
        set({ events: get().events.filter((e) => e.id !== id) })
        // Cascade: an event's invites make no sense without their event.
        useInviteStore.getState().deleteInvitesForEvent(id)
      },
    }),
    {
      name: STORAGE_KEYS.events,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
