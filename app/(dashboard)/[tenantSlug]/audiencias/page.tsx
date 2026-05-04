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
import { listAudiences } from '@/lib/audiences/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'

export const metadata = { title: 'Audiencias — HUB' }
export const dynamic = 'force-dynamic'

export default async function AudiencesPage({
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

  const audiences = await listAudiences(access.tenant.id)

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Audiencias</h1>
          <p className="text-sm text-muted-foreground">
            Definí grupos de clientes para usar en difusiones y flows.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${tenantSlug}/audiencias/nueva`}>Nueva audiencia</Link>
        </Button>
      </header>

      {audiences.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay audiencias. Tocá &quot;Nueva audiencia&quot; para empezar.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Clientes</TableHead>
                  <TableHead>Última calc.</TableHead>
                  <TableHead aria-label="acciones" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {audiences.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{a.customer_count_cached}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.last_calculated_at
                        ? new Date(a.last_calculated_at).toLocaleString('es-AR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/${tenantSlug}/audiencias/${a.id}`}>Editar</Link>
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
