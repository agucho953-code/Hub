import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'positive' | 'negative' | 'muted'

const toneClass: Record<Tone, string> = {
  default: 'text-foreground',
  positive: 'text-success',
  negative: 'text-destructive',
  muted: 'text-muted-foreground',
}

export function StatCard({
  label,
  value,
  hint,
  delta,
  deltaTone = 'muted',
  icon: Icon,
  sparkline,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  delta?: ReactNode
  deltaTone?: Tone
  icon?: LucideIcon
  sparkline?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'card-hairline group relative overflow-hidden rounded-xl border bg-card/80 p-5 shadow-sm transition-colors hover:bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {Icon ? <Icon className="size-3.5" /> : null}
            {label}
          </div>
          <div className="font-display text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
        </div>
        {delta ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/60 px-2 py-1 text-[11px] font-medium tabular-nums',
              toneClass[deltaTone],
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
      {sparkline ? (
        <div className="pointer-events-none mt-4 h-12 w-full opacity-90">{sparkline}</div>
      ) : null}
    </div>
  )
}
