/**
 * The app has no backend: every browser tab holds its own in-memory copy of
 * each zustand store, persisted to localStorage. When another tab (for
 * example a recipient's RSVP tab) writes to that same key, this tab only
 * finds out via the native `storage` event — so we listen for it and force
 * a rehydrate. This is what makes "open the invite link in a new tab" feel
 * live in the organizer's dashboard.
 */
export interface PersistCapableApi {
  persist: {
    rehydrate: () => Promise<void> | void
  }
}

export function syncStoreAcrossTabs(storageKey: string, store: PersistCapableApi): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: StorageEvent) => {
    if (event.key === storageKey) {
      void store.persist.rehydrate()
    }
  }

  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
