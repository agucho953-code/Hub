import { notFound } from 'next/navigation'
import { AppShell } from '@/components/shell/app-shell'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  return (
    <AppShell tenant={access.tenant} role={access.role}>
      {children}
    </AppShell>
  )
}
