import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/lib/cn'

import { IconButton } from './IconButton'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

// Modals can nest (e.g. "add contact" opened from inside the invite
// composer). This tracks which instance is topmost so Escape only closes
// that one instead of the whole stack at once.
let nextModalId = 0
const openModalStack: number[] = []

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const idRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    if (idRef.current === null) idRef.current = nextModalId++
    const id = idRef.current
    openModalStack.push(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModalStack.at(-1) === id) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      const idx = openModalStack.indexOf(id)
      if (idx !== -1) openModalStack.splice(idx, 1)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'animate-pop-in relative flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900',
          SIZE_CLASSES[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
            </div>
            <IconButton label="Close" size="sm" onClick={onClose} className="-mr-1 -mt-1 shrink-0">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
