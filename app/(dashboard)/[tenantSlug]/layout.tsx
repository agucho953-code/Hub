import { notFound } from 'next/navigation'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'
import { DashboardHeader } from './_components/dashboard-header'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let tenant: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    tenant = await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader tenant={tenant.tenant} role={tenant.role} />
      <div className="flex-1">{children}</div>
    </div>
  )
}
