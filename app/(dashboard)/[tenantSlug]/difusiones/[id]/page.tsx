import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getBroadcastDetail } from '@/lib/broadcasts/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import type { RecipientStatus } from '@/types/database'

export const metadata = { title: 'Detalle difusión — HUB' }
export const dynamic = 'force-dynamic'

const RECIPIENT_LABEL: Record<RecipientStatus, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  delivered: 'Entregado',
  read: 'Leído',
  replied: 'Respondió',
  failed: 'Falló',
}

export default async function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params
  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const detail = await getBroadcastDetail(access.tenant.id, id)
  if (!detail?.broadcast) notFound()

  const b = detail.broadcast as unknown as {
    id: string
    name: string
    status: string
    scheduled_at: string | null
    started_at: string | null
    completed_at: string | null
    stats: Record<string, number>
    channel:
      | { display_name: string | null; type: string }
      | { display_name: string | null; type: string }[]
      | null
    template: { name: string; language: string } | { name: string; language: string }[] | null
    audience:
      | { name: string; customer_count_cached: number }
      | { name: string; customer_count_cached: number }[]
      | null
  }
  const channel = Array.isArray(b.channel) ? b.channel[0] : b.channel
  const template = Array.isArray(b.template) ? b.template[0] : b.template
  const audience = Array.isArray(b.audience) ? b.audience[0] : b.audience
  const stats = b.stats ?? {}
  const total = stats.total ?? 0
  const sent = stats.sent ?? 0
  const failed = stats.failed ?? 0

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{b.name}</h1>
          <p className="text-sm text-muted-foreground">
            {channel?.display_name ?? channel?.type} · template {template?.name} · audiencia{' '}
            {audience?.name}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {b.status}
        </Badge>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Enviados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{sent}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fallidos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{failed}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipients (últimos 200)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.recipients.map((r) => {
                const customer = Array.isArray(r.customer) ? r.customer[0] : r.customer
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      {customer ? `${customer.first_name} ${customer.last_name}` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer?.phone ?? '—'}
                    </TableCell>
                    <TableCell>{RECIPIENT_LABEL[r.status]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.sent_at ? new Date(r.sent_at).toLocaleString('es-AR') : '—'}
                    </TableCell>
                    <TableCell className="text-red-700">{r.error ?? ''}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
