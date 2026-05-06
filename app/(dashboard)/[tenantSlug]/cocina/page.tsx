import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { requireTenantAccess } from '@/lib/tenant'
import { listKitchenQueue, listTicketItemsForTickets } from '@/lib/tickets/queries'
import { KdsScreen } from './_components/kds-screen'

export const metadata = { title: 'Cocina' }
export const dynamic = 'force-dynamic'

export default async function CocinaPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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

  if (!['kitchen', 'owner'].includes(role)) notFound()

  const tickets = await listKitchenQueue(tenantId)
  const items = await listTicketItemsForTickets(tickets.map((t) => t.id))

  return (
    <main className="space-y-6 py-6">
      <PageHeader title="Cocina" description="Comandas activas en orden de antigüedad." />
      <KdsScreen
        tenantSlug={tenantSlug}
        tenantId={tenantId}
        initialTickets={tickets}
        initialItems={items}
      />
    </main>
  )
}
