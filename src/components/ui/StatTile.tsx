import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface StatTileProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'slate' | 'green' | 'red' | 'amber' | 'indigo'
  className?: string
}

const TONE_CLASSES: Record<NonNullable<StatTileProps['tone']>, string> = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
}

export function StatTile({ label, value, icon, tone = 'slate', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {icon && (
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">{value}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}
