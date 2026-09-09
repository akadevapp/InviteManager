import type { InviteStats } from '@/lib/inviteStats'

interface RsvpBreakdownBarProps {
  stats: InviteStats
}

/** Stacked bar: yes (green) / maybe (amber) / no (red) / pending (gray), proportional to total invites. */
export function RsvpBreakdownBar({ stats }: RsvpBreakdownBarProps) {
  const { total, yes, maybe, no, pending } = stats

  if (total === 0) {
    return <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
  }

  const pct = (n: number) => `${(n / total) * 100}%`

  return (
    <div
      className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
      role="img"
      aria-label={`${yes} yes, ${maybe} maybe, ${no} no, ${pending} pending out of ${total} invited`}
    >
      {yes > 0 && <div className="h-full bg-emerald-500" style={{ width: pct(yes) }} />}
      {maybe > 0 && <div className="h-full bg-amber-400" style={{ width: pct(maybe) }} />}
      {no > 0 && <div className="h-full bg-rose-500" style={{ width: pct(no) }} />}
    </div>
  )
}
