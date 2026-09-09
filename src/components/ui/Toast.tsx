import { type ReactNode, createContext, use, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { createId } from '@/lib/id'

export type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

type ShowToast = (input: { title: string; description?: string; tone?: ToastTone }) => void

const ToastContext = createContext<ShowToast | null>(null)

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <TriangleAlert className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-indigo-500" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback<ShowToast>(
    ({ title, description, tone = 'success' }) => {
      const id = createId()
      setToasts((prev) => [...prev, { id, title, description, tone }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  return (
    <ToastContext value={showToast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900',
              )}
              role="status"
            >
              <div className="mt-0.5 shrink-0">{TONE_ICON[t.tone]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext>
  )
}

export function useToast(): ShowToast {
  const ctx = use(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
