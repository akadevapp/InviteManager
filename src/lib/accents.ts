export interface AccentSwatch {
  key: string
  label: string
  /** Solid background + white text, used for event cover headers. */
  solid: string
  /** Soft tinted background, used for badges/cards. */
  soft: string
  /** Text color paired with `soft`. */
  softText: string
  /** Small solid dot/indicator color. */
  dot: string
  /** Ring color for selection states. */
  ring: string
}

// NOTE: Tailwind's scanner needs literal class strings in source, so every
// class below is spelled out in full rather than built with template
// interpolation (`bg-${color}-500` would not be detected).
export const ACCENTS: Record<string, AccentSwatch> = {
  indigo: {
    key: 'indigo',
    label: 'Indigo',
    solid: 'bg-indigo-600',
    soft: 'bg-indigo-100 dark:bg-indigo-500/15',
    softText: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500',
  },
  violet: {
    key: 'violet',
    label: 'Violet',
    solid: 'bg-violet-600',
    soft: 'bg-violet-100 dark:bg-violet-500/15',
    softText: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500',
  },
  rose: {
    key: 'rose',
    label: 'Rose',
    solid: 'bg-rose-600',
    soft: 'bg-rose-100 dark:bg-rose-500/15',
    softText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500',
  },
  amber: {
    key: 'amber',
    label: 'Amber',
    solid: 'bg-amber-500',
    soft: 'bg-amber-100 dark:bg-amber-500/15',
    softText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500',
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald',
    solid: 'bg-emerald-600',
    soft: 'bg-emerald-100 dark:bg-emerald-500/15',
    softText: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500',
  },
  sky: {
    key: 'sky',
    label: 'Sky',
    solid: 'bg-sky-600',
    soft: 'bg-sky-100 dark:bg-sky-500/15',
    softText: 'text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
    ring: 'ring-sky-500',
  },
  fuchsia: {
    key: 'fuchsia',
    label: 'Fuchsia',
    solid: 'bg-fuchsia-600',
    soft: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',
    softText: 'text-fuchsia-700 dark:text-fuchsia-300',
    dot: 'bg-fuchsia-500',
    ring: 'ring-fuchsia-500',
  },
  orange: {
    key: 'orange',
    label: 'Orange',
    solid: 'bg-orange-600',
    soft: 'bg-orange-100 dark:bg-orange-500/15',
    softText: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500',
  },
}

export const ACCENT_KEYS = Object.keys(ACCENTS)

export function getAccent(key: string): AccentSwatch {
  return ACCENTS[key] ?? ACCENTS.indigo
}
