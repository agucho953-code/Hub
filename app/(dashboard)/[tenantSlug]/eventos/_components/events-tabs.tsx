import Link from 'next/link'
import { cn } from '@/lib/utils'

const items: { key: 'upcoming' | 'past' | 'drafts'; label: string; ownerOnly?: boolean }[] = [
  { key: 'upcoming', label: 'Próximos' },
  { key: 'past', label: 'Pasados' },
  { key: 'drafts', label: 'Borradores', ownerOnly: true },
]

export function EventsTabs({
  tenantSlug,
  current,
  showDrafts,
}: {
  tenantSlug: string
  current: 'upcoming' | 'past' | 'drafts'
  showDrafts: boolean
}) {
  return (
    <nav className="mb-4 flex gap-2 border-b">
      {items
        .filter((it) => !it.ownerOnly || showDrafts)
        .map((it) => {
          const active = it.key === current
          return (
            <Link
              key={it.key}
              href={`/${tenantSlug}/eventos?tab=${it.key}`}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {it.label}
            </Link>
          )
        })}
    </nav>
  )
}
