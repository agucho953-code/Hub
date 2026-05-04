import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCustomerById } from '@/lib/customers/queries'
import { listActiveRewards } from '@/lib/points/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { RedeemForm } from './redeem-form'

export const metadata = { title: 'Canjear puntos — HUB' }

export default async function CanjearPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner', 'cashier'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const [customer, rewards] = await Promise.all([
    getCustomerById({ tenantId: access.tenant.id, id }),
    listActiveRewards({ tenantId: access.tenant.id }),
  ])
  if (!customer) notFound()

  const c = customer as unknown as {
    id: string
    first_name: string
    last_name: string
    points_balance: number
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Canjear puntos</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${tenantSlug}/clientes/${id}`}>Volver</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {c.first_name} {c.last_name} —{' '}
            <span className="text-emerald-600">{c.points_balance} pts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemForm
            tenantSlug={tenantSlug}
            customerId={c.id}
            balance={c.points_balance}
            rewards={rewards}
          />
        </CardContent>
      </Card>
    </main>
  )
}
