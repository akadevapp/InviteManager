import { type ChangeEvent, useRef, useState } from 'react'
import { AlertTriangle, Bell, BellOff, Download, Monitor, Moon, Sun, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { clearAllData, downloadJson, exportAllData, importAllData } from '@/lib/dataTransfer'
import { useEventStore } from '@/store/useEventStore'
import { useContactStore } from '@/store/useContactStore'
import { useInviteStore } from '@/store/useInviteStore'
import { useSettingsStore, type ThemePreference } from '@/store/useSettingsStore'

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function SettingsPage() {
  const { hostName, theme, desktopNotifications, updateSettings } = useSettingsStore()
  const eventCount = useEventStore((s) => s.events.length)
  const contactCount = useContactStore((s) => s.contacts.length)
  const inviteCount = useInviteStore((s) => s.invites.length)
  const showToast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window === 'undefined' || typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )
  const [importOpen, setImportOpen] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [clearOpen, setClearOpen] = useState(false)

  const handleToggleNotifications = async () => {
    if (permission === 'unsupported') return
    if (desktopNotifications) {
      updateSettings({ desktopNotifications: false })
      return
    }
    if (permission === 'granted') {
      updateSettings({ desktopNotifications: true })
      return
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      updateSettings({ desktopNotifications: true })
      showToast({ title: 'Desktop notifications enabled' })
    } else {
      showToast({ title: 'Notifications blocked', description: 'Enable them from your browser settings to turn this on.', tone: 'error' })
    }
  }

  const handleExport = () => {
    const bundle = exportAllData()
    downloadJson(`invite-manager-backup-${new Date().toISOString().slice(0, 10)}.json`, bundle)
    showToast({ title: 'Backup downloaded' })
  }

  const handleFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPendingImportFile(file)
    setImportOpen(true)
  }

  const confirmImport = async () => {
    if (!pendingImportFile) return
    const text = await pendingImportFile.text()
    const result = importAllData(text)
    setImportOpen(false)
    setPendingImportFile(null)
    if (result.ok) {
      showToast({
        title: 'Backup restored',
        description: `${result.counts?.events} events, ${result.counts?.contacts} contacts, ${result.counts?.invites} invites.`,
      })
    } else {
      showToast({ title: 'Import failed', description: result.error, tone: 'error' })
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Everything here is stored locally in this browser.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Host profile</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Used as the default host name for new events.</p>
        <Field label="Your name" className="mt-3 max-w-xs">
          <Input value={hostName} onChange={(e) => updateSettings({ hostName: e.target.value })} placeholder="Your name" />
        </Field>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose how Invite Manager looks on this device.</p>
        <div className="mt-3 inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateSettings({ theme: opt.value })}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                theme === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Get a desktop notification the moment a guest RSVPs, even in another tab.
        </p>
        {permission === 'unsupported' ? (
          <p className="mt-3 text-xs text-slate-400">Your browser doesn&apos;t support desktop notifications.</p>
        ) : permission === 'denied' ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Blocked in your browser. Allow notifications for this site to enable.
          </p>
        ) : (
          <Button
            variant="outline"
            className="mt-3"
            icon={desktopNotifications ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            onClick={() => void handleToggleNotifications()}
          >
            {desktopNotifications ? 'Disable desktop notifications' : 'Enable desktop notifications'}
          </Button>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your data</h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {eventCount} event{eventCount === 1 ? '' : 's'} · {contactCount} contact{contactCount === 1 ? '' : 's'} ·{' '}
          {inviteCount} invite{inviteCount === 1 ? '' : 's'}, all stored in this browser&apos;s local storage.
          Clearing your browser data will erase it — export a backup first.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={handleExport}>
            Export backup
          </Button>
          <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={() => fileInputRef.current?.click()}>
            Import backup
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChosen} />
          <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setClearOpen(true)}>
            Clear all data
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={importOpen}
        title="Replace all data with this backup?"
        description="Your current events, contacts, and invites will be overwritten. This can't be undone."
        confirmLabel="Replace data"
        onConfirm={() => void confirmImport()}
        onCancel={() => {
          setImportOpen(false)
          setPendingImportFile(null)
        }}
      />

      <ConfirmDialog
        open={clearOpen}
        title="Clear all data?"
        description="Every event, contact, and invite in this browser will be permanently deleted."
        confirmLabel="Clear everything"
        onConfirm={() => {
          clearAllData()
          setClearOpen(false)
          showToast({ title: 'All data cleared', tone: 'info' })
        }}
        onCancel={() => setClearOpen(false)}
      />
    </div>
  )
}
