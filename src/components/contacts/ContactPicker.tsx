import { useMemo, useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { Contact } from '@/types'

interface ContactPickerProps {
  contacts: Contact[]
  selectedIds: string[]
  onToggle: (contactId: string) => void
  alreadyInvitedIds?: Set<string>
  onAddNew?: () => void
  onImport?: () => void
}

export function ContactPicker({
  contacts,
  selectedIds,
  onToggle,
  alreadyInvitedIds,
  onAddNew,
  onImport,
}: ContactPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q),
    )
  }, [contacts, query])

  const selectedSet = new Set(selectedIds)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts…" className="pl-9" />
        </div>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
        {onImport && (
          <button
            type="button"
            onClick={onImport}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Users className="h-3.5 w-3.5" />
            Import
          </button>
        )}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{selectedIds.length} selected</p>
      )}

      <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {contacts.length === 0 ? 'No contacts yet — add or import some first.' : 'No contacts match your search.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((contact) => {
              const invited = alreadyInvitedIds?.has(contact.id)
              const checked = selectedSet.has(contact.id)
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    disabled={invited}
                    onClick={() => onToggle(contact.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      invited ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={invited}
                      readOnly
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                    />
                    <Avatar name={contact.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                        {contact.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {contact.email || contact.phone || 'No contact info'}
                      </span>
                    </span>
                    {invited && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        Already invited
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
