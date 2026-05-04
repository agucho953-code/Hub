'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { MembershipWithTenant, Tenant, TenantRole } from '@/lib/tenant/types'
import { BrandMark, BrandWordmark } from './brand-mark'
import { visibleGroups } from './nav-config'
import { SidebarNav } from './sidebar-nav'
import { TenantSwitcher } from './tenant-switcher'

export function SidebarContent({
  tenant,
  role,
  memberships,
  onNavigate,
}: {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'logo_url'>
  role: TenantRole
  memberships: MembershipWithTenant[]
  onNavigate?: () => void
}) {
  const groups = visibleGroups(role)

  return (
    <>
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Link
          href={`/${tenant.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 outline-none"
        >
          <BrandMark />
          <BrandWordmark />
        </Link>
        <Badge variant="outline" className="ml-auto text-[10px] uppercase tracking-wider">
          {role}
        </Badge>
      </div>

      <div className="px-3 pb-3">
        <TenantSwitcher current={tenant} memberships={memberships} />
      </div>

      <div className="mx-3 h-px bg-border/60" />

      <div className="flex-1 overflow-y-auto">
        <SidebarNav groups={groups} tenantSlug={tenant.slug} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-[11px] text-muted-foreground/80">{tenant.name}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/60">
          /{tenant.slug}
        </p>
      </div>
    </>
  )
}
