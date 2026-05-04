import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getChurnRisk,
  getCommunicationStats,
  getDailyMetrics,
  getEventsRanking,
  getHeatmap,
  getKpis,
  getTopCustomersBySpent,
} from '@/lib/stats/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { ChurnCard } from './_components/churn-card'
import { Heatmap } from './_components/heatmap'
import { RevenueChart } from './_components/revenue-chart'

export const metadata = { title: 'Estadísticas — HUB' }
export const dynamic = 'force-dynamic'

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export default async function EstadisticasPage({
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

  const [kpis, daily90, heatmap, top, churn, events, comms] = await Promise.all([
    getKpis(access.tenant.id),
    getDailyMetrics(access.tenant.id, 90),
    getHeatmap(access.tenant.id),
    getTopCustomersBySpent(access.tenant.id, 50),
    getChurnRisk(access.tenant.id, 200),
    getEventsRanking(access.tenant.id, 20),
    getCommunicationStats(access.tenant.id),
  ])

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Estadísticas</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visión general</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="comms">Comunicación</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Clientes" value={kpis.customers_total.toLocaleString('es-AR')} />
            <Kpi label="Activos 30d" value={kpis.customers_active_30d.toLocaleString('es-AR')} />
            <Kpi label="Visitas 30d" value={kpis.visits_30d.toLocaleString('es-AR')} />
            <Kpi label="Ticket promedio" value={fmtCents(kpis.avg_ticket_30d_cents)} />
          </section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue últimos 90 días</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <RevenueChart
                data={daily90.map((d) => ({
                  day: d.day,
                  visits: d.visits,
                  revenue_cents: Number(d.revenue_cents ?? 0),
                }))}
                metric="revenue_cents"
              />
            </CardContent>
          </Card>
          <Heatmap data={heatmap} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">Top 50 por gasto</CardTitle>
                <p className="text-xs text-muted-foreground">Clientes con más spent acumulado.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a
                  href={`/api/stats/export?slug=${encodeURIComponent(tenantSlug)}&type=top_customers`}
                  download
                >
                  Exportar CSV
                </a>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Visitas</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Ticket prom.</TableHead>
                    <TableHead>Última visita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="p-6 text-center text-sm text-muted-foreground"
                      >
                        Sin datos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    top.map((c) => (
                      <TableRow key={c.customer_id}>
                        <TableCell>
                          <Link
                            href={`/${tenantSlug}/clientes/${c.customer_id}`}
                            className="font-medium hover:underline"
                          >
                            {c.first_name} {c.last_name}
                          </Link>
                        </TableCell>
                        <TableCell>{c.total_visits}</TableCell>
                        <TableCell>{fmtCents(c.total_spent_cents)}</TableCell>
                        <TableCell>{fmtCents(c.avg_ticket_cents)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.last_visit_at
                            ? new Date(c.last_visit_at).toLocaleDateString('es-AR')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ChurnCard rows={churn} tenantSlug={tenantSlug} />
          <div>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/api/stats/export?slug=${encodeURIComponent(tenantSlug)}&type=churn_risk`}
                download
              >
                Exportar churn CSV
              </a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eventos por asistencia</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Asistieron</TableHead>
                    <TableHead>No-show rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="p-6 text-center text-sm text-muted-foreground"
                      >
                        Sin eventos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((e) => (
                      <TableRow key={e.event_id}>
                        <TableCell className="font-medium">{e.event_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(e.starts_at).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell>{e.reservations}</TableCell>
                        <TableCell>{e.attended}</TableCell>
                        <TableCell>
                          <Badge variant={e.no_show_rate > 0.2 ? 'destructive' : 'secondary'}>
                            {(e.no_show_rate * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comms" className="space-y-4">
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Recipients" value={comms.total_recipients.toLocaleString('es-AR')} />
            <Kpi label="Enviados" value={comms.sent.toLocaleString('es-AR')} />
            <Kpi label="Entregados" value={comms.delivered.toLocaleString('es-AR')} />
            <Kpi label="Leídos" value={comms.read.toLocaleString('es-AR')} />
          </section>
          <Card>
            <CardContent className="space-y-1 p-4 text-sm">
              <p>
                <span className="font-medium">Open rate (proxy):</span>{' '}
                {comms.sent > 0 ? `${((comms.read / comms.sent) * 100).toFixed(1)}%` : '—'}
              </p>
              <p>
                <span className="font-medium">Reply rate:</span> —{' '}
                <span className="text-xs text-muted-foreground">
                  (asociación de replies a broadcasts no implementada en v1)
                </span>
              </p>
              <p>
                <span className="font-medium">Failed:</span> {comms.failed.toLocaleString('es-AR')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  )
}
