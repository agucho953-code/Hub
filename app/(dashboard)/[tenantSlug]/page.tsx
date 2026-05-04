import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDailyMetrics, getKpis, getTopCustomersBySpent } from '@/lib/stats/queries'
import { requireTenantAccess } from '@/lib/tenant'
import { RevenueChart } from './estadisticas/_components/revenue-chart'

export const dynamic = 'force-dynamic'

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant, role } = await requireTenantAccess(tenantSlug)
  const isOwner = role === 'owner'

  const [kpis, daily, topCustomers] = await Promise.all([
    getKpis(tenant.id),
    getDailyMetrics(tenant.id, 30),
    isOwner ? getTopCustomersBySpent(tenant.id, 5) : Promise.resolve([]),
  ])

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{tenant.name}</h1>
          <p className="text-sm text-muted-foreground">
            Tu rol: <span className="font-medium">{role}</span>
          </p>
        </div>
        {isOwner ? (
          <Link
            href={`/${tenantSlug}/estadisticas`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ver estadísticas →
          </Link>
        ) : null}
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Clientes" value={kpis.customers_total.toLocaleString('es-AR')} />
        <Kpi label="Activos 30d" value={kpis.customers_active_30d.toLocaleString('es-AR')} />
        <Kpi label="Visitas 30d" value={kpis.visits_30d.toLocaleString('es-AR')} />
        <Kpi label="Revenue 30d" value={fmtCents(kpis.revenue_30d_cents)} />
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Visitas últimos 30 días</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <RevenueChart
            data={daily.map((d) => ({
              day: d.day,
              visits: d.visits,
              revenue_cents: Number(d.revenue_cents ?? 0),
            }))}
            metric="visits"
          />
        </CardContent>
      </Card>

      {isOwner ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 5 clientes del mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            ) : (
              topCustomers.map((c) => (
                <div
                  key={c.customer_id}
                  className="flex items-center justify-between gap-3 border-b py-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.total_visits} visitas
                      {c.favorite_item_name ? ` · favorito: ${c.favorite_item_name}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">{fmtCents(c.total_spent_cents)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
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
