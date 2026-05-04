import { notFound } from 'next/navigation'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { AudienceForm } from '../_components/audience-form'

export const metadata = { title: 'Nueva audiencia — HUB' }

export default async function NewAudiencePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  try {
    const access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Nueva audiencia</h1>
      <AudienceForm tenantSlug={tenantSlug} />
    </main>
  )
}
