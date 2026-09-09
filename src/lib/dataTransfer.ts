import { useContactStore } from '@/store/useContactStore'
import { useEventStore } from '@/store/useEventStore'
import { useInviteStore } from '@/store/useInviteStore'
import { useNotificationStore } from '@/store/useNotificationStore'
import { useSettingsStore, type ThemePreference } from '@/store/useSettingsStore'
import type { AppNotification, Contact, EventRecord, Invite } from '@/types'

const EXPORT_VERSION = 1
const THEME_VALUES: ThemePreference[] = ['system', 'light', 'dark']

export interface ExportBundle {
  version: number
  exportedAt: string
  events: EventRecord[]
  contacts: Contact[]
  invites: Invite[]
  notifications: AppNotification[]
  settings: {
    hostName: string
    theme: ThemePreference
    desktopNotifications: boolean
  }
}

export function exportAllData(): ExportBundle {
  const { hostName, theme, desktopNotifications } = useSettingsStore.getState()
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    events: useEventStore.getState().events,
    contacts: useContactStore.getState().contacts,
    invites: useInviteStore.getState().invites,
    notifications: useNotificationStore.getState().notifications,
    settings: { hostName, theme, desktopNotifications },
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  ok: boolean
  error?: string
  counts?: { events: number; contacts: number; invites: number }
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/** Replaces all local data with the contents of a previously exported bundle. */
export function importAllData(raw: string): ImportResult {
  let parsed: Partial<ExportBundle>
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Unrecognized backup format.' }
  }

  const events = isArray(parsed.events) ? (parsed.events as EventRecord[]) : []
  const contacts = isArray(parsed.contacts) ? (parsed.contacts as Contact[]) : []
  const invites = isArray(parsed.invites) ? (parsed.invites as Invite[]) : []
  const notifications = isArray(parsed.notifications) ? (parsed.notifications as AppNotification[]) : []

  if (events.length === 0 && contacts.length === 0 && invites.length === 0) {
    return { ok: false, error: 'This file has no events, contacts, or invites to import.' }
  }

  useEventStore.setState({ events })
  useContactStore.setState({ contacts })
  useInviteStore.setState({ invites })
  useNotificationStore.setState({ notifications })
  if (parsed.settings && typeof parsed.settings === 'object') {
    const { hostName, theme, desktopNotifications } = parsed.settings
    useSettingsStore.setState({
      ...(typeof hostName === 'string' ? { hostName } : {}),
      ...(THEME_VALUES.includes(theme as ThemePreference) ? { theme } : {}),
      ...(typeof desktopNotifications === 'boolean' ? { desktopNotifications } : {}),
    })
  }

  return { ok: true, counts: { events: events.length, contacts: contacts.length, invites: invites.length } }
}

/** Wipes events, contacts, invites, and notifications. Leaves settings (theme, host name) alone. */
export function clearAllData() {
  useEventStore.setState({ events: [] })
  useContactStore.setState({ contacts: [] })
  useInviteStore.setState({ invites: [] })
  useNotificationStore.setState({ notifications: [] })
}
