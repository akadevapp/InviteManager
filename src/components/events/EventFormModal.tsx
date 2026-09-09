import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ACCENT_KEYS, getAccent } from '@/lib/accents'
import { cn } from '@/lib/cn'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/format'
import { EVENT_EMOJIS } from '@/data/eventEmojis'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { EventInput } from '@/store/useEventStore'
import type { EventRecord } from '@/types'

interface EventFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: EventInput) => void
  initialEvent?: EventRecord
}

function defaultStart(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setHours(18, 0, 0, 0)
  return d.toISOString()
}

export function EventFormModal({ open, onClose, onSubmit, initialEvent }: EventFormModalProps) {
  const defaultHostName = useSettingsStore((s) => s.hostName)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [isVirtual, setIsVirtual] = useState(false)
  const [startsAt, setStartsAt] = useState(defaultStart())
  const [hostName, setHostName] = useState('')
  const [emoji, setEmoji] = useState(EVENT_EMOJIS[0])
  const [accent, setAccent] = useState(ACCENT_KEYS[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (initialEvent) {
      setTitle(initialEvent.title)
      setDescription(initialEvent.description)
      setLocation(initialEvent.location)
      setIsVirtual(initialEvent.isVirtual)
      setStartsAt(initialEvent.startsAt)
      setHostName(initialEvent.hostName)
      setEmoji(initialEvent.emoji)
      setAccent(initialEvent.accent)
    } else {
      setTitle('')
      setDescription('')
      setLocation('')
      setIsVirtual(false)
      setStartsAt(defaultStart())
      setHostName(defaultHostName)
      setEmoji(EVENT_EMOJIS[Math.floor(Math.random() * EVENT_EMOJIS.length)])
      setAccent(ACCENT_KEYS[Math.floor(Math.random() * ACCENT_KEYS.length)])
    }
    setError('')
  }, [open, initialEvent, defaultHostName])

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Give your event a title.')
      return
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      isVirtual,
      startsAt,
      hostName: hostName.trim() || 'Host',
      emoji,
      accent,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialEvent ? 'Edit event' : 'Create event'}
      description={initialEvent ? undefined : 'Set the details, then invite guests from the event page.'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{initialEvent ? 'Save changes' : 'Create event'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {EVENT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors',
                  emoji === e
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15'
                    : 'border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Color">
          <div className="flex flex-wrap gap-1.5">
            {ACCENT_KEYS.map((key) => {
              const swatch = getAccent(key)
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={swatch.label}
                  onClick={() => setAccent(key)}
                  className={cn(
                    'h-7 w-7 rounded-full ring-offset-2 ring-offset-white transition-shadow dark:ring-offset-slate-900',
                    swatch.dot,
                    accent === key && cn('ring-2', swatch.ring),
                  )}
                />
              )
            })}
          </div>
        </Field>

        <Field label="Event title" required error={error}>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="Ava's 30th Birthday Bash"
            autoFocus
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A few details guests should know…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date & time" required>
            <Input
              type="datetime-local"
              value={toDateTimeLocalValue(startsAt)}
              onChange={(e) => setStartsAt(fromDateTimeLocalValue(e.target.value))}
            />
          </Field>
          <Field label="Host name">
            <Input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Your name" />
          </Field>
        </div>

        <Field label={isVirtual ? 'Meeting link / platform' : 'Location'}>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={isVirtual ? 'Zoom link, Meet link…' : '123 Main St, City'}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isVirtual}
            onChange={(e) => setIsVirtual(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
          />
          This is a virtual / online event
        </label>
      </div>
    </Modal>
  )
}
