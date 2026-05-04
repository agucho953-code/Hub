import { notFound } from 'next/navigation'
import { getAudience } from '@/lib/audiences/queries'
import type { AudienceFilter } from '@/lib/audiences/schemas'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { AudienceForm } from '../_components/audience-form'

export const metadata = { title: 'Editar audiencia — HUB' }
export const dynamic = 'force-dynamic'

export default async function EditAudiencePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params
  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const audience = await getAudience(access.tenant.id, id)
  if (!audience) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Editar audiencia</h1>
      <AudienceForm
        tenantSlug={tenantSlug}
        audienceId={audience.id}
        initialName={audience.name}
        initialFilters={audience.filters as unknown as AudienceFilter}
      />
    </main>
  )
}
