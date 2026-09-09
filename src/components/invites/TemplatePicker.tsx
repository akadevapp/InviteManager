import { INVITE_TEMPLATES } from '@/data/templates'
import { getAccent } from '@/lib/accents'
import { cn } from '@/lib/cn'

interface TemplatePickerProps {
  selectedId: string | null
  onSelect: (templateId: string) => void
}

export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {INVITE_TEMPLATES.map((template) => {
        const accent = getAccent(template.accent)
        const selected = template.id === selectedId
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
              selected
                ? 'border-indigo-500 ring-1 ring-indigo-500'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
            )}
          >
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl', accent.soft)}>
              {template.emoji}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{template.name}</span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{template.tagline}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
