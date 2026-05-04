import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listMenu } from '@/lib/menu/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { MenuBoard } from './_components/menu-board'
import { NewCategoryForm } from './_components/new-category-form'

export const metadata = { title: 'Menú — HUB' }

export default async function MenuPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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

  const { categories, items } = await listMenu({ tenantId: access.tenant.id })

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Menú</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nueva categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCategoryForm tenantSlug={tenantSlug} />
        </CardContent>
      </Card>

      <MenuBoard tenantSlug={tenantSlug} categories={categories} items={items} />
    </main>
  )
}
