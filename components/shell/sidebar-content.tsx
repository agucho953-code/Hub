import Link from 'next/link'
import type { Tenant, TenantRole } from '@/lib/tenant/types'
import { BrandMark, BrandWordmark } from './brand-mark'
import { visibleGroups } from './nav-config'
import { SidebarNav } from './sidebar-nav'

export function SidebarContent({
  tenant,
  role,
  onNavigate,
}: {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'logo_url'>
  role: TenantRole
  onNavigate?: () => void
}) {
  const groups = visibleGroups(role)

  return (
    <>
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <Link
          href={`/${tenant.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md outline-none transition-opacity hover:opacity-80"
        >
          <BrandMark size={32} />
          <BrandWordmark className="text-base" />
        </Link>
      </div>

      <div className="mx-3 h-px bg-border/60" />

      <div className="flex-1 overflow-y-auto">
        <SidebarNav groups={groups} tenantSlug={tenant.slug} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-border/60 px-4 py-3">
        <p className="text-[11px] font-medium text-muted-foreground/90">{tenant.name}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/60">
          /{tenant.slug}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          {role}
        </p>
      </div>
    </>
  )
}
