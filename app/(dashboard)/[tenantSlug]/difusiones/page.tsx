import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listBroadcasts } from '@/lib/broadcasts/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import type { BroadcastStatus } from '@/types/database'

export const metadata = { title: 'Difusiones — HUB' }
export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<BroadcastStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  sending: 'Enviando',
  sent: 'Enviada',
  failed: 'Fallida',
  cancelled: 'Cancelada',
}

function statusVariant(s: BroadcastStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (s === 'sent') return 'default'
  if (s === 'sending' || s === 'scheduled') return 'secondary'
  if (s === 'failed' || s === 'cancelled') return 'destructive'
  return 'outline'
}

export default async function DifusionesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const broadcasts = await listBroadcasts(access.tenant.id)

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Difusiones</h1>
        <Button asChild>
          <Link href={`/${tenantSlug}/difusiones/nueva`}>Nueva difusión</Link>
        </Button>
      </header>

      {broadcasts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay difusiones.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Programada</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead aria-label="acciones" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => {
                  const total = b.stats.total ?? 0
                  const sent = b.stats.sent ?? 0
                  const failed = b.stats.failed ?? 0
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(b.status)}>{STATUS_LABEL[b.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('es-AR') : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sent}/{total} {failed > 0 ? `(${failed} fallidos)` : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/${tenantSlug}/difusiones/${b.id}`}>Ver</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
