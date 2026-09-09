import { type ReactNode, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

interface MenuProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (props: { close: () => void }) => ReactNode
  align?: 'left' | 'right'
  width?: string
}

export function Menu({ trigger, children, align = 'right', width = 'w-64' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            'animate-pop-in absolute z-40 mt-2 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900',
            align === 'right' ? 'right-0' : 'left-0',
            width,
          )}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
        danger
          ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
