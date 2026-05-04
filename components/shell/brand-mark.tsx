import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.78_0.21_5)] to-[oklch(0.55_0.21_330)] text-primary-foreground shadow-sm',
        className,
      )}
      aria-hidden
    >
      <svg
        role="img"
        aria-label="HUB"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <title>HUB</title>
        <path d="M5 4v16" />
        <path d="M19 4v16" />
        <path d="M5 12h14" />
      </svg>
    </span>
  )
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-[15px] font-semibold tracking-tight', className)}>
      HUB
    </span>
  )
}
