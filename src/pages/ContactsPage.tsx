import { useMemo, useState } from 'react'
import { Mail, Pencil, Phone, Search, Trash2, UserPlus, Users } from 'lucide-react'

import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { ContactImportModal } from '@/components/contacts/ContactImportModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useContactStore } from '@/store/useContactStore'
import type { Contact } from '@/types'

export default function ContactsPage() {
  const contacts = useContactStore((s) => s.contacts)
  const addContact = useContactStore((s) => s.addContact)
  const updateContact = useContactStore((s) => s.updateContact)
  const deleteContact = useContactStore((s) => s.deleteContact)
  const showToast = useToast()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q),
    )
  }, [contacts, query])

  const handleSubmit = (input: Parameters<typeof addContact>[0]) => {
    if (editing) {
      updateContact(editing.id, input)
      showToast({ title: 'Contact updated' })
    } else {
      addContact(input)
      showToast({ title: 'Contact added' })
    }
    setFormOpen(false)
    setEditing(undefined)
  }

  const handleDelete = () => {
    if (!pendingDelete) return
    deleteContact(pendingDelete.id)
    showToast({ title: 'Contact deleted', tone: 'info' })
    setPendingDelete(null)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Contacts</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {contacts.length === 0 ? 'Your address book is empty.' : `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Users className="h-4 w-4" />} onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            Add contact
          </Button>
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="relative mt-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts…" className="pl-9" />
        </div>
      )}

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No contacts yet"
          description="Add people one at a time, or import your whole address book from a CSV file."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button icon={<UserPlus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                Add a contact
              </Button>
              <Button variant="outline" icon={<Users className="h-4 w-4" />} onClick={() => setImportOpen(true)}>
                Import contacts
              </Button>
            </div>
          }
        />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <ul className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {filtered.map((contact) => (
              <li key={contact.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <Avatar name={contact.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{contact.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                {contact.source === 'import' && (
                  <Badge tone="slate" className="hidden sm:inline-flex">
                    Imported
                  </Badge>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label="Edit contact"
                    size="sm"
                    onClick={() => {
                      setEditing(contact)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Delete contact" size="sm" onClick={() => setPendingDelete(contact)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No contacts match &ldquo;{query}&rdquo;.
              </li>
            )}
          </ul>
        </div>
      )}

      <ContactFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(undefined)
        }}
        onSubmit={handleSubmit}
        initialContact={editing}
      />

      <ContactImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(created) => {
          setImportOpen(false)
          showToast({ title: `Imported ${created.length} contact${created.length === 1 ? '' : 's'}` })
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name}?`}
        description="Any invites already sent to this contact will also be removed."
        confirmLabel="Delete contact"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
