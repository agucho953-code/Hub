import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCustomerById, listTags } from '@/lib/customers/queries'
import {
  listCustomerLedger,
  listCustomerRedemptions,
  listCustomerVisits,
} from '@/lib/points/queries'
import { getCustomerInsights } from '@/lib/stats/queries'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'
import { CustomerForm } from './_components/customer-form'
import { CustomerTags } from './_components/customer-tags'
import { DeleteButton } from './_components/delete-button'
import { LedgerTab } from './_components/ledger-tab'
import { VisitsTab } from './_components/visits-tab'

export const metadata = { title: 'Cliente — HUB' }

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  const [customer, allTags, visits, ledger, redemptions, insights] = await Promise.all([
    getCustomerById({ tenantId: access.tenant.id, id }),
    listTags({ tenantId: access.tenant.id }),
    listCustomerVisits({ tenantId: access.tenant.id, customerId: id }),
    listCustomerLedger({ tenantId: access.tenant.id, customerId: id }),
    listCustomerRedemptions({ tenantId: access.tenant.id, customerId: id }),
    getCustomerInsights(access.tenant.id, id),
  ])

  if (!customer) notFound()

  type C = {
    id: string
    first_name: string
    last_name: string
    phone: string
    notes: string | null
    birthdate: string | null
    opt_in_marketing: boolean
    points_balance: number
    total_visits: number
    total_spent_cents: number
    last_visit_at: string | null
    created_at: string
    source: string
    tags: { id: string; name: string; color: string }[]
  }
  const c = customer as unknown as C

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
            <Link href={`/${tenantSlug}/clientes`}>← Volver a clientes</Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {c.first_name} {c.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cliente desde {format(new Date(c.created_at), "d 'de' MMM yyyy", { locale: es })} ·
            Origen: {c.source}
          </p>
        </div>
        {access.role === 'owner' ? (
          <DeleteButton tenantSlug={tenantSlug} customerId={c.id} />
        ) : null}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Visitas" value={String(c.total_visits)} />
        <Stat label="Gastado" value={`$${(c.total_spent_cents / 100).toLocaleString('es-AR')}`} />
        <Stat label="Puntos" value={String(c.points_balance)} />
      </div>

      {insights ? (
        <Card className="mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <InsightLine label="Plato favorito" value={insights.favorite_item_name ?? '—'} />
            <InsightLine
              label="Categoría favorita"
              value={insights.favorite_category_name ?? '—'}
            />
            <InsightLine
              label="Ticket promedio"
              value={`$${(Number(insights.avg_ticket_cents ?? 0) / 100).toLocaleString('es-AR')}`}
            />
            <InsightLine
              label="Frecuencia"
              value={
                insights.visit_frequency_days != null
                  ? `${Number(insights.visit_frequency_days).toFixed(1)} días entre visitas`
                  : '—'
              }
            />
            <InsightLine
              label="Días sin venir"
              value={
                insights.days_since_last_visit != null
                  ? String(insights.days_since_last_visit)
                  : '—'
              }
            />
            <InsightLine
              label="Última visita"
              value={
                insights.last_visit_at
                  ? format(new Date(insights.last_visit_at), "d 'de' MMM yyyy", { locale: es })
                  : '—'
              }
            />
          </CardContent>
        </Card>
      ) : null}

      <CustomerTags
        tenantSlug={tenantSlug}
        customerId={c.id}
        currentTags={c.tags}
        allTags={allTags}
      />

      <div className="mt-3 flex justify-end">
        <Button asChild size="sm">
          <Link href={`/${tenantSlug}/clientes/${c.id}/canjear`}>Canjear puntos</Link>
        </Button>
      </div>

      <Tabs defaultValue="datos" className="mt-6">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="puntos">Puntos</TabsTrigger>
          <TabsTrigger value="comunicaciones">Comunicaciones</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerForm tenantSlug={tenantSlug} customer={c} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitas">
          <VisitsTab visits={visits} />
        </TabsContent>

        <TabsContent value="puntos">
          <LedgerTab ledger={ledger} redemptions={redemptions} balance={c.points_balance} />
        </TabsContent>

        <TabsContent value="comunicaciones">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Las difusiones y mensajes 1‑a‑1 aparecen acá una vez conectes WhatsApp (Fase 5).
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notas">
          <Card>
            <CardContent className="py-4 text-sm">
              {c.notes ? (
                <p className="whitespace-pre-wrap">{c.notes}</p>
              ) : (
                <p className="text-muted-foreground">
                  No hay notas. Editalas desde la pestaña <strong>Datos</strong>.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold">{value}</div>
    </div>
  )
}

function InsightLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
