import { initials } from '@/lib/format'
import { cn } from '@/lib/cn'

const PALETTE = [
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-orange-500',
]

function colorFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        colorFor(name || '?'),
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name || '?')}
    </span>
  )
}
