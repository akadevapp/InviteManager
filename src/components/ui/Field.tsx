import { type ReactElement, type ReactNode, cloneElement, isValidElement, useId } from 'react'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, error, required, htmlFor, children, className }: FieldProps) {
  const generatedId = useId()
  const inputId = htmlFor ?? generatedId

  // Auto-wires the label to its control via id/htmlFor so screen readers (and
  // testing tools using accessible-name lookups) can associate them, without
  // every call site having to pass matching ids by hand.
  const control =
    label && isValidElement(children)
      ? cloneElement(children as ReactElement<{ id?: string }>, {
          id: (children as ReactElement<{ id?: string }>).props.id ?? inputId,
        })
      : children

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {control}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}
