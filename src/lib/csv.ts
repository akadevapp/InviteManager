export interface ParsedContactRow {
  name: string
  email?: string
  phone?: string
  notes?: string
}

export interface ParseContactsResult {
  rows: ParsedContactRow[]
  skipped: number
}

/** Minimal RFC-4180-ish CSV tokenizer: handles quoted fields, escaped quotes, and quoted newlines. */
export function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = input.length

  while (i < len) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

const HEADER_HINTS: Record<string, keyof ParsedContactRow> = {
  name: 'name',
  fullname: 'name',
  'full name': 'name',
  email: 'email',
  'email address': 'email',
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  notes: 'notes',
  note: 'notes',
}

function looksLikeHeader(row: string[]): boolean {
  return row.some((cell) => HEADER_HINTS[cell.trim().toLowerCase()] !== undefined)
}

/**
 * Parses raw CSV (or pasted comma-separated text) into contact rows.
 * Accepts an optional header row (name/email/phone/notes, any order); falls
 * back to positional [name, email, phone] columns when no header is found.
 */
export function parseContactsCsv(raw: string): ParseContactsResult {
  const table = parseCsv(raw.trim())
  if (table.length === 0) return { rows: [], skipped: 0 }

  let columns: Array<keyof ParsedContactRow | null> = ['name', 'email', 'phone', 'notes']
  let dataRows = table

  if (looksLikeHeader(table[0])) {
    columns = table[0].map((cell) => HEADER_HINTS[cell.trim().toLowerCase()] ?? null)
    dataRows = table.slice(1)
  }

  const rows: ParsedContactRow[] = []
  let skipped = 0

  for (const raw of dataRows) {
    const entry: ParsedContactRow = { name: '' }
    columns.forEach((col, idx) => {
      if (!col) return
      const value = raw[idx]?.trim()
      if (value) entry[col] = value
    })

    if (!entry.name && entry.email) {
      entry.name = entry.email.split('@')[0]
    }

    if (!entry.name && !entry.email && !entry.phone) {
      skipped++
      continue
    }

    rows.push(entry)
  }

  return { rows, skipped }
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function contactsToCsv(contacts: ParsedContactRow[]): string {
  const header = ['name', 'email', 'phone', 'notes']
  const lines = [header.join(',')]
  for (const c of contacts) {
    lines.push(
      [c.name ?? '', c.email ?? '', c.phone ?? '', c.notes ?? '']
        .map(escapeCsvField)
        .join(','),
    )
  }
  return lines.join('\n')
}

export const SAMPLE_CONTACTS_CSV = contactsToCsv([
  { name: 'Ava Thompson', email: 'ava.thompson@example.com', phone: '+1 555-0101' },
  { name: 'Liam Chen', email: 'liam.chen@example.com', phone: '+1 555-0102' },
  { name: 'Sofia Ramirez', email: 'sofia.ramirez@example.com', phone: '+1 555-0103' },
])
