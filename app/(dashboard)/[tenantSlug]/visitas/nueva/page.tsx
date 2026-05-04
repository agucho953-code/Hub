import { notFound } from 'next/navigation'
import { listActiveMenu } from '@/lib/menu/queries'
import { listRules } from '@/lib/points/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { CloseTableWizard } from './_components/wizard'

export const metadata = { title: 'Cerrar mesa — HUB' }

export default async function NuevaVisitaPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner', 'cashier'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const [menu, rules] = await Promise.all([
    listActiveMenu({ tenantId: access.tenant.id }),
    listRules({ tenantId: access.tenant.id }),
  ])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Cerrar mesa</h1>
      <CloseTableWizard
        tenantSlug={tenantSlug}
        categories={menu.categories}
        items={menu.items}
        rules={rules}
      />
    </main>
  )
}
