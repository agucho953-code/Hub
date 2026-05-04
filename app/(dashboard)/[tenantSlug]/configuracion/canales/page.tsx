import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getChannelsForTenant } from '@/lib/meta/channels'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { ChannelCardActions } from './_channel-actions'
import { ConnectButton } from './_connect-button'

export const metadata = { title: 'Canales — HUB' }
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ meta_ok?: string; meta_error?: string }>

export default async function CanalesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>
  searchParams: SearchParams
}) {
  const { tenantSlug } = await params
  const { meta_ok, meta_error } = await searchParams

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const channels = await getChannelsForTenant(access.tenant.id)
  const wa = channels.find((c) => c.type === 'whatsapp')
  const ig = channels.find((c) => c.type === 'instagram')

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Canales</h1>
        <p className="text-sm text-muted-foreground">
          Conectá WhatsApp Business e Instagram para recibir y enviar mensajes desde la bandeja.
        </p>
      </header>

      {meta_ok ? (
        <div className="rounded border bg-emerald-50 p-3 text-sm text-emerald-900">
          {meta_ok === 'whatsapp' ? 'WhatsApp conectado correctamente.' : null}
          {meta_ok === 'instagram' ? 'Instagram conectado correctamente.' : null}
        </div>
      ) : null}
      {meta_error ? (
        <div className="rounded border bg-red-50 p-3 text-sm text-red-900">
          Error de conexión: {meta_error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>WhatsApp Business</CardTitle>
            <CardDescription>
              Conexión vía Embedded Signup. Mensajes y templates aprobados por Meta.
            </CardDescription>
          </div>
          {wa ? <StatusBadge status={wa.status} /> : <Badge variant="outline">No conectado</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          {wa?.display_name ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Cuenta: </span>
              {wa.display_name}
            </p>
          ) : null}
          {wa?.last_error ? (
            <p className="text-sm text-red-700">Último error: {wa.last_error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {wa && wa.status === 'connected' ? (
              <ChannelCardActions channelId={wa.id} type="whatsapp" tenantSlug={tenantSlug} />
            ) : (
              <ConnectButton type="whatsapp" tenantSlug={tenantSlug} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Instagram</CardTitle>
            <CardDescription>Login con Instagram Business para responder DMs.</CardDescription>
          </div>
          {ig ? <StatusBadge status={ig.status} /> : <Badge variant="outline">No conectado</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          {ig?.display_name ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Cuenta: </span>@{ig.display_name}
            </p>
          ) : null}
          {ig?.last_error ? (
            <p className="text-sm text-red-700">Último error: {ig.last_error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {ig && ig.status === 'connected' ? (
              <ChannelCardActions channelId={ig.id} type="instagram" tenantSlug={tenantSlug} />
            ) : (
              <ConnectButton type="instagram" tenantSlug={tenantSlug} />
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function StatusBadge({ status }: { status: 'connected' | 'disconnected' | 'error' }) {
  if (status === 'connected') return <Badge variant="default">Conectado</Badge>
  if (status === 'error') return <Badge variant="destructive">Error</Badge>
  return <Badge variant="outline">Desconectado</Badge>
}
