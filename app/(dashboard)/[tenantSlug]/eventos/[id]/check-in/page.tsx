import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getEvent, listReservations } from '@/lib/events/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { CheckInBoard } from './check-in-board'

export const metadata = { title: 'Check-in — HUB' }

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner', 'cashier', 'waiter'])
  } catch (e) {
    if (e instanceof TenantNotFoundError) notFound()
    if (e instanceof RoleRequiredError) notFound()
    throw e
  }

  const detail = await getEvent({ tenantId: access.tenant.id, id })
  if (!detail) notFound()
  const reservations = await listReservations({ tenantId: access.tenant.id, eventId: id })
  const eligible = reservations.filter((r) => r.status === 'confirmed' || r.status === 'checked_in')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{detail.event.name}</h1>
            <p className="text-xs text-muted-foreground">
              Modo check-in · {detail.confirmed_seats}
              {detail.event.capacity !== null ? `/${detail.event.capacity}` : ''} confirmadas
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${tenantSlug}/eventos/${id}`}>Salir</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <CheckInBoard tenantSlug={tenantSlug} reservations={eligible} />
      </main>
    </div>
  )
}
