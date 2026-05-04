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
          <Link
            href={`/${tenant.slug}/visitas/nueva`}
            className="text-muted-foreground hover:text-foreground"
          >
            Cerrar mesa
          </Link>
          <Link
            href={`/${tenant.slug}/clientes`}
            className="text-muted-foreground hover:text-foreground"
          >
            Clientes
          </Link>
          <Link
            href={`/${tenant.slug}/eventos`}
            className="text-muted-foreground hover:text-foreground"
          >
            Eventos
          </Link>
          <Link
            href={`/${tenant.slug}/bandeja`}
            className="text-muted-foreground hover:text-foreground"
          >
            Bandeja
          </Link>
          {role === 'owner' ? (
            <Link
              href={`/${tenant.slug}/estadisticas`}
              className="text-muted-foreground hover:text-foreground"
            >
              Estadísticas
            </Link>
          ) : null}
          {role === 'owner' ? (
            <>
              <Link
                href={`/${tenant.slug}/audiencias`}
                className="text-muted-foreground hover:text-foreground"
              >
                Audiencias
              </Link>
              <Link
                href={`/${tenant.slug}/difusiones`}
                className="text-muted-foreground hover:text-foreground"
              >
                Difusiones
              </Link>
              <Link
                href={`/${tenant.slug}/flows`}
                className="text-muted-foreground hover:text-foreground"
              >
                Flows
              </Link>
              <Link
                href={`/${tenant.slug}/menu`}
                className="text-muted-foreground hover:text-foreground"
              >
                Menú
              </Link>
              <Link
                href={`/${tenant.slug}/configuracion/puntos`}
                className="text-muted-foreground hover:text-foreground"
              >
                Puntos
              </Link>
              <Link
                href={`/${tenant.slug}/configuracion/captura`}
                className="text-muted-foreground hover:text-foreground"
              >
                Captura
              </Link>
              <Link
                href={`/${tenant.slug}/configuracion/canales`}
                className="text-muted-foreground hover:text-foreground"
              >
                Canales
              </Link>
              <Link
                href={`/${tenant.slug}/configuracion/equipo`}
                className="text-muted-foreground hover:text-foreground"
              >
                Equipo
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
