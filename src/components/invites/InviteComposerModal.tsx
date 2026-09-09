import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

import { ContactFormModal } from '@/components/contacts/ContactFormModal'
import { ContactImportModal } from '@/components/contacts/ContactImportModal'
import { ContactPicker } from '@/components/contacts/ContactPicker'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { getTemplate } from '@/data/templates'
import { cn } from '@/lib/cn'
import { formatEventDate } from '@/lib/format'
import { createInviteToken } from '@/lib/id'
import { MESSAGE_PLACEHOLDERS, renderMessage } from '@/lib/messageRender'
import { buildRsvpUrl } from '@/lib/share'
import { useContactStore } from '@/store/useContactStore'
import { useInviteStore } from '@/store/useInviteStore'
import type { EventRecord } from '@/types'

import { InviteStatusBadge } from './InviteStatusBadge'
import { SendChannelMenu } from './SendChannelMenu'
import { TemplatePicker } from './TemplatePicker'

interface InviteComposerModalProps {
  open: boolean
  onClose: () => void
  event: EventRecord
}

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Choose a template',
  2: 'Choose guests',
  3: 'Write your message',
  4: 'Review & send',
}

export function InviteComposerModal({ open, onClose, event }: InviteComposerModalProps) {
  const contacts = useContactStore((s) => s.contacts)
  const addContact = useContactStore((s) => s.addContact)
  const allInvites = useInviteStore((s) => s.invites)
  const createInvites = useInviteStore((s) => s.createInvites)
  const recordSend = useInviteStore((s) => s.recordSend)
  const showToast = useToast()

  const [step, setStep] = useState<Step>(1)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [createdInviteIds, setCreatedInviteIds] = useState<string[]>([])
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setTemplateId(null)
    setSelectedContactIds([])
    setTokens({})
    setSubject('')
    setMessage('')
    setCreatedInviteIds([])
  }, [open])

  const alreadyInvitedIds = useMemo(
    () => new Set(allInvites.filter((i) => i.eventId === event.id).map((i) => i.contactId)),
    [allInvites, event.id],
  )

  const ensureToken = (contactId: string) => {
    setTokens((prev) => (prev[contactId] ? prev : { ...prev, [contactId]: createInviteToken() }))
  }

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) => {
      if (prev.includes(contactId)) return prev.filter((id) => id !== contactId)
      ensureToken(contactId)
      return [...prev, contactId]
    })
  }

  const contextFor = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId)
    return {
      guestName: contact?.name ?? 'Guest',
      hostName: event.hostName,
      eventTitle: event.title,
      eventDate: formatEventDate(event.startsAt),
      eventLocation: event.location || (event.isVirtual ? 'Online' : 'TBD'),
      rsvpLink: buildRsvpUrl(tokens[contactId] ?? ''),
    }
  }

  const previewContactId = selectedContactIds[0]

  const insertPlaceholder = (token: string) => {
    const el = messageRef.current
    if (!el) {
      setMessage((m) => `${m}${token}`)
      return
    }
    const start = el.selectionStart ?? message.length
    const end = el.selectionEnd ?? message.length
    const next = `${message.slice(0, start)}${token}${message.slice(end)}`
    setMessage(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    })
  }

  const handleSelectTemplate = (id: string) => {
    const template = getTemplate(id)
    if (!template) return
    setTemplateId(id)
    setSubject(template.subject)
    setMessage(template.message)
    setStep(2)
  }

  const handleReview = () => {
    const template = getTemplate(templateId ?? '')
    if (!template) return
    const inputs = selectedContactIds.map((contactId) => {
      const ctx = contextFor(contactId)
      return {
        token: tokens[contactId],
        eventId: event.id,
        contactId,
        templateId: template.id,
        subject: renderMessage(subject, ctx),
        message: renderMessage(message, ctx),
      }
    })
    const created = createInvites(inputs)
    setCreatedInviteIds(created.map((i) => i.id))
    setStep(4)
  }

  const reviewInvites = allInvites.filter((i) => createdInviteIds.includes(i.id))
  const sentCount = reviewInvites.filter((i) => i.status !== 'draft').length

  const handleClose = () => {
    if (createdInviteIds.length > 0) {
      showToast({
        title: `${createdInviteIds.length} invite${createdInviteIds.length === 1 ? '' : 's'} created`,
        description: sentCount > 0 ? `${sentCount} sent so far. Manage the rest from the guest list.` : 'None sent yet — send them anytime from the guest list.',
      })
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={`New invite · ${STEP_LABELS[step]}`} size="xl">
      <div className="mb-5 flex items-center gap-1.5">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className={cn('h-1.5 flex-1 rounded-full', s <= step ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800')} />
        ))}
      </div>

      {step === 1 && <TemplatePicker selectedId={templateId} onSelect={handleSelectTemplate} />}

      {step === 2 && (
        <ContactPicker
          contacts={contacts}
          selectedIds={selectedContactIds}
          onToggle={toggleContact}
          alreadyInvitedIds={alreadyInvitedIds}
          onAddNew={() => setContactFormOpen(true)}
          onImport={() => setImportOpen(true)}
        />
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Field label="Subject" hint="Used when sending by email">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message">
            <Textarea ref={messageRef} value={message} onChange={(e) => setMessage(e.target.value)} rows={8} />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {MESSAGE_PLACEHOLDERS.map((p) => (
              <button
                key={p.token}
                type="button"
                onClick={() => insertPlaceholder(p.token)}
                className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                + {p.label}
              </button>
            ))}
          </div>
          {previewContactId && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Preview for {contacts.find((c) => c.id === previewContactId)?.name}
                {selectedContactIds.length > 1 && ` (+${selectedContactIds.length - 1} more get their own link)`}
              </p>
              <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200">
                {renderMessage(message, contextFor(previewContactId))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-2">
          {reviewInvites.map((invite) => {
            const contact = contacts.find((c) => c.id === invite.contactId)
            return (
              <div
                key={invite.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <Avatar name={contact?.name ?? '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{contact?.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {contact?.email || contact?.phone || 'No contact info'}
                  </p>
                </div>
                <InviteStatusBadge invite={invite} />
                <SendChannelMenu
                  contact={contact}
                  subject={invite.subject}
                  message={invite.message}
                  rsvpUrl={buildRsvpUrl(invite.token)}
                  onSent={(channel) => recordSend(invite.id, channel)}
                  variant="outline"
                  label={invite.sends.length > 0 ? 'Resend' : 'Send'}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          {step > 1 && step < 4 && (
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => setStep((s) => (s - 1) as Step)}>
              Back
            </Button>
          )}
        </div>
        <div>
          {step === 2 && (
            <Button
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              disabled={selectedContactIds.length === 0}
              onClick={() => setStep(3)}
            >
              Next: write message
            </Button>
          )}
          {step === 3 && (
            <Button icon={<ArrowRight className="h-4 w-4" />} iconPosition="right" disabled={!message.trim()} onClick={handleReview}>
              Review & send
            </Button>
          )}
          {step === 4 && (
            <Button icon={<Check className="h-4 w-4" />} onClick={handleClose}>
              Done
            </Button>
          )}
        </div>
      </div>

      <ContactFormModal
        open={contactFormOpen}
        onClose={() => setContactFormOpen(false)}
        onSubmit={(input) => {
          const contact = addContact(input)
          ensureToken(contact.id)
          setSelectedContactIds((prev) => [...prev, contact.id])
          setContactFormOpen(false)
        }}
      />

      <ContactImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(created) => {
          setSelectedContactIds((prev) => [...prev, ...created.map((c) => c.id)])
          created.forEach((c) => ensureToken(c.id))
          setImportOpen(false)
          showToast({ title: `Imported ${created.length} contact${created.length === 1 ? '' : 's'}` })
        }}
      />
    </Modal>
  )
}
