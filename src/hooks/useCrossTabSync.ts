import { useEffect } from 'react'

import { syncStoreAcrossTabs } from '@/lib/crossTabSync'
import { STORAGE_KEYS } from '@/lib/storageKeys'
import { useContactStore } from '@/store/useContactStore'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useSettingsStore } from '@/store/useSettingsStore'

/**
 * Keeps every tab's in-memory stores honest with localStorage. This is what
 * lets an organizer's dashboard update the moment a guest submits an RSVP in
 * another tab, without a backend in between.
 */
export function useCrossTabSync() {
  useEffect(() => {
    const unsubscribers = [
      syncStoreAcrossTabs(STORAGE_KEYS.events, useEventStore),
      syncStoreAcrossTabs(STORAGE_KEYS.contacts, useContactStore),
      syncStoreAcrossTabs(STORAGE_KEYS.invites, useInviteStore),
      syncStoreAcrossTabs(STORAGE_KEYS.notifications, useNotificationStore),
      syncStoreAcrossTabs(STORAGE_KEYS.settings, useSettingsStore),
    ]
    return () => unsubscribers.forEach((unsub) => unsub())
  }, [])
}
