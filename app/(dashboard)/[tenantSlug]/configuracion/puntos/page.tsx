import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listMenu } from '@/lib/menu/queries'
import { listRewards, listRules } from '@/lib/points/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { NewPerAmountForm } from './_components/new-per-amount-form'
import { NewPerItemForm } from './_components/new-per-item-form'
import { NewRewardForm } from './_components/new-reward-form'
import { RewardsList } from './_components/rewards-list'
import { RulesList } from './_components/rules-list'

export const metadata = { title: 'Puntos — HUB' }

export default async function PuntosPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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

  const [rules, rewards, menu] = await Promise.all([
    listRules({ tenantId: access.tenant.id }),
    listRewards({ tenantId: access.tenant.id }),
    listMenu({ tenantId: access.tenant.id }),
  ])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Puntos y recompensas</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reglas de puntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NewPerAmountForm tenantSlug={tenantSlug} />
            <NewPerItemForm
              tenantSlug={tenantSlug}
              items={menu.items}
              categories={menu.categories}
            />
            <RulesList tenantSlug={tenantSlug} rules={rules} menu={menu} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recompensas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NewRewardForm tenantSlug={tenantSlug} />
            <RewardsList tenantSlug={tenantSlug} rewards={rewards} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
