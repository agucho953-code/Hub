'use client'

import { ArrowUpRight } from 'lucide-react'
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
    <nav className="flex flex-1 flex-col gap-5 px-3 py-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
            {group.label}
          </div>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                <SidebarLink
                  item={item}
                  active={!item.newTab && isActive(pathname, item.href(tenantSlug), item.exact)}
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

  if (item.newTab) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-[--cream-tint] hover:text-foreground"
      >
        <Icon className="size-4 transition-colors group-hover:text-primary" />
        <span className="truncate">{item.label}</span>
        <ArrowUpRight
          className="ml-auto size-3.5 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium',
        'transition-[colors,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-[--cream-tint] hover:text-foreground',
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
