import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { ContactInput } from '@/store/useContactStore'
import type { Contact } from '@/types'

interface ContactFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: ContactInput) => void
  initialContact?: Contact
}

export function ContactFormModal({ open, onClose, onSubmit, initialContact }: ContactFormModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(initialContact?.name ?? '')
    setEmail(initialContact?.email ?? '')
    setPhone(initialContact?.phone ?? '')
    setNotes(initialContact?.notes ?? '')
    setError('')
  }, [open, initialContact])

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Enter a name for this contact.')
      return
    }
    if (!email.trim() && !phone.trim()) {
      setError('Add an email or phone number so you can reach them.')
      return
    }
    onSubmit({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialContact ? 'Edit contact' : 'Add contact'}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{initialContact ? 'Save changes' : 'Add contact'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required error={error}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="Jordan Lee"
            autoFocus
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            placeholder="jordan@example.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (error) setError('')
            }}
            placeholder="+1 555-0100"
          />
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional" />
        </Field>
      </div>
    </Modal>
  )
}
