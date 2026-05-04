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
import { listFlows } from '@/lib/flows/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import type { FlowTriggerType } from '@/types/database'

export const metadata = { title: 'Flows — HUB' }
export const dynamic = 'force-dynamic'

const TRIGGER_LABEL: Record<FlowTriggerType, string> = {
  customer_inactive: 'Cliente inactivo',
  birthday: 'Cumpleaños',
  after_visit: 'Después de visita',
  event_starting: 'Evento próximo',
  tag_added: 'Tag agregado',
}

export default async function FlowsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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

  const flows = await listFlows(access.tenant.id)

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Flows</h1>
        <Button asChild>
          <Link href={`/${tenantSlug}/flows/nuevo`}>Nuevo flow</Link>
        </Button>
      </header>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay flows automáticos.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead aria-label="acciones" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {flows.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{TRIGGER_LABEL[f.trigger_type]}</TableCell>
                    <TableCell>{f.step_count}</TableCell>
                    <TableCell>
                      <Badge variant={f.active ? 'default' : 'outline'}>
                        {f.active ? 'Activo' : 'Pausado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/${tenantSlug}/flows/${f.id}`}>Editar</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
