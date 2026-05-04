import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getMembershipsForUser } from '@/lib/tenant'
import type { Tenant, TenantRole } from '@/lib/tenant/types'
import { TenantSwitcher } from './tenant-switcher'

export async function DashboardHeader({
  tenant,
  role,
}: {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'logo_url'>
  role: TenantRole
}) {
  const memberships = await getMembershipsForUser()

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
        <Link href={`/${tenant.slug}`} className="flex items-center gap-2 font-semibold">
          <Avatar className="size-7">
            {tenant.logo_url ? <AvatarImage src={tenant.logo_url} alt={tenant.name} /> : null}
            <AvatarFallback>{tenant.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{tenant.name}</span>
        </Link>
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
        {memberships.length > 1 ? (
          <>
            <Separator orientation="vertical" className="h-6" />
            <TenantSwitcher current={tenant} memberships={memberships} />
          </>
        ) : null}
        <nav className="ml-auto flex items-center gap-4 text-sm">
          {role === 'owner' ? (
            <Link
              href={`/${tenant.slug}/configuracion/equipo`}
              className="text-muted-foreground hover:text-foreground"
            >
              Equipo
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
