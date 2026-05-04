'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavGroup, NavItem } from './nav-config'

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  if (href === pathname) return true
  return pathname.startsWith(`${href}/`)
}

export function SidebarNav({
  groups,
  tenantSlug,
  onNavigate,
}: {
  groups: NavGroup[]
  tenantSlug: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                <SidebarLink
                  item={item}
                  active={isActive(pathname, item.href(tenantSlug), item.exact)}
                  href={item.href(tenantSlug)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarLink({
  item,
  href,
  active,
  onNavigate,
}: {
  item: NavItem
  href: string
  active: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  if (item.emphasis) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          'group flex h-10 items-center gap-2.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90',
          active && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        )}
      >
        <Icon className="size-4" />
        <span className="flex-1">{item.label}</span>
        <kbd className="rounded bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] tracking-wide opacity-80">
          ⏎
        </kbd>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {active ? (
        <span aria-hidden className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
      ) : null}
      <Icon
        className={cn(
          'size-4 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}
