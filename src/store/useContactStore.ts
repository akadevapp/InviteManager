import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { createId } from '@/lib/id'
import { STORAGE_KEYS } from '@/lib/storageKeys'
import type { Contact, ContactSource } from '@/types'

import { useInviteStore } from './useInviteStore'

export interface ContactInput {
  name: string
  email?: string
  phone?: string
  notes?: string
  source?: ContactSource
}

interface ContactState {
  contacts: Contact[]
  addContact: (input: ContactInput) => Contact
  addContacts: (inputs: ContactInput[]) => Contact[]
  updateContact: (id: string, patch: Partial<ContactInput>) => void
  deleteContact: (id: string) => void
}

function toContact(input: ContactInput, createdAt: string): Contact {
  return {
    id: createId(),
    createdAt,
    source: input.source ?? 'manual',
    name: input.name,
    email: input.email,
    phone: input.phone,
    notes: input.notes,
  }
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],

      addContact: (input) => {
        const contact = toContact(input, new Date().toISOString())
        set({ contacts: [contact, ...get().contacts] })
        return contact
      },

      addContacts: (inputs) => {
        const now = new Date().toISOString()
        const created = inputs.map((input) => toContact({ source: 'import', ...input }, now))
        set({ contacts: [...created, ...get().contacts] })
        return created
      },

      updateContact: (id, patch) => {
        set({ contacts: get().contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
      },

      deleteContact: (id) => {
        set({ contacts: get().contacts.filter((c) => c.id !== id) })
        // Cascade: drop invites addressed to a contact that no longer exists.
        useInviteStore.getState().deleteInvitesForContact(id)
      },
    }),
    {
      name: STORAGE_KEYS.contacts,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
