import { type ChangeEvent, useRef, useState } from 'react'
import { Download, FileText, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { type ParsedContactRow, parseContactsCsv, SAMPLE_CONTACTS_CSV } from '@/lib/csv'
import type { Contact } from '@/types'
import { useContactStore } from '@/store/useContactStore'

interface ContactImportModalProps {
  open: boolean
  onClose: () => void
  onImported: (contacts: Contact[]) => void
}

type Mode = 'file' | 'paste'

export function ContactImportModal({ open, onClose, onImported }: ContactImportModalProps) {
  const addContacts = useContactStore((s) => s.addContacts)
  const [mode, setMode] = useState<Mode>('file')
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<ParsedContactRow[]>([])
  const [skipped, setSkipped] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setRaw('')
    setFileName('')
    setRows([])
    setSkipped(0)
    setMode('file')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const parse = (text: string) => {
    const result = parseContactsCsv(text)
    setRows(result.rows)
    setSkipped(result.skipped)
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setRaw(text)
      parse(text)
    }
    reader.readAsText(file)
  }

  const handlePasteChange = (text: string) => {
    setRaw(text)
    parse(text)
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CONTACTS_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-contacts.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (rows.length === 0) return
    const created = addContacts(rows.map((r) => ({ name: r.name, email: r.email, phone: r.phone, notes: r.notes })))
    onImported(created)
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import contacts"
      description="Upload a CSV, or paste rows as name, email, phone."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={rows.length === 0}>
            Import {rows.length > 0 ? rows.length : ''} contact{rows.length === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMode('file')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              Upload CSV
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'paste'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              Paste text
            </button>
          </div>
          <button
            type="button"
            onClick={downloadSample}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Download className="h-3.5 w-3.5" />
            Sample CSV
          </button>
        </div>

        {mode === 'file' ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:bg-indigo-500/5"
          >
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {fileName || 'Click to choose a .csv file'}
            </span>
            <span className="text-xs text-slate-400">Columns: name, email, phone, notes (header optional)</span>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </button>
        ) : (
          <Textarea
            value={raw}
            onChange={(e) => handlePasteChange(e.target.value)}
            rows={6}
            placeholder={'Ava Thompson, ava@example.com, +1 555-0101\nLiam Chen, liam@example.com'}
          />
        )}

        {raw.trim().length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              {rows.length} contact{rows.length === 1 ? '' : 's'} ready to import
              {skipped > 0 && <span> · {skipped} row{skipped === 1 ? '' : 's'} skipped (empty)</span>}
            </div>
            {rows.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-3 py-1.5 font-medium">Name</th>
                      <th className="px-3 py-1.5 font-medium">Email</th>
                      <th className="px-3 py-1.5 font-medium">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.slice(0, 50).map((r, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5 text-slate-700 dark:text-slate-200">{r.name || '—'}</td>
                        <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{r.email || '—'}</td>
                        <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{r.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <p className="px-3 py-1.5 text-[11px] text-slate-400">…and {rows.length - 50} more</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
