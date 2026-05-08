import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Section } from '@/components/ui/section'
import { listOpenSessions } from '@/lib/sessions-waiter/queries'
import { requireTenantAccess } from '@/lib/tenant'
import { SessionsGrid } from './_components/sessions-grid'

export const metadata = { title: 'Sesiones' }
export const dynamic = 'force-dynamic'

export default async function SesionesPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let tenantId: string
  let role: string
  try {
    const access = await requireTenantAccess(tenantSlug)
    tenantId = access.tenant.id
    role = access.role
  } catch {
    notFound()
  }

  if (!['waiter', 'owner', 'cashier'].includes(role)) notFound()

  const sessions = await listOpenSessions(tenantId)

  return (
    <main className="space-y-6 py-6">
      <PageHeader title="Sesiones" description="Mesas abiertas y comandas activas." />
      <Section>
        <SessionsGrid tenantSlug={tenantSlug} initialSessions={sessions} tenantId={tenantId} />
      </Section>
    </main>
  )
}
