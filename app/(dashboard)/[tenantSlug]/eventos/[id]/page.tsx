import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getEvent, listReservations } from '@/lib/events/queries'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'
import { CheckInTab } from './_components/check-in-tab'
import { EventActions } from './_components/event-actions'
import { EventSidebar } from './_components/event-sidebar'
import { ReservationsTab } from './_components/reservations-tab'
import { WaitlistTab } from './_components/waitlist-tab'

export const metadata = { title: 'Evento — HUB' }

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
  } catch (e) {
    if (e instanceof TenantNotFoundError) notFound()
    throw e
  }

  const detail = await getEvent({ tenantId: access.tenant.id, id })
  if (!detail) notFound()
  const reservations = await listReservations({ tenantId: access.tenant.id, eventId: id })

  const confirmed = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'checked_in',
  )
  const waitlist = reservations.filter((r) => r.status === 'waitlist')
  const isOwner = access.role === 'owner'

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${tenantSlug}/eventos`}>← Volver a eventos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/${tenantSlug}/eventos/${id}/check-in`}>Modo Check-in</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <EventSidebar
            event={detail.event}
            confirmedSeats={detail.confirmed_seats}
            waitlistCount={detail.waitlist_count}
          />
          {isOwner ? <EventActions tenantSlug={tenantSlug} event={detail.event} /> : null}
        </div>

        <Tabs defaultValue="reservas">
          <TabsList>
            <TabsTrigger value="reservas">Reservas ({confirmed.length})</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist ({waitlist.length})</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
          </TabsList>

          <TabsContent value="reservas">
            <Card>
              <CardContent className="p-0">
                <ReservationsTab
                  tenantSlug={tenantSlug}
                  eventId={id}
                  reservations={reservations}
                  capacity={detail.event.capacity}
                  confirmedSeats={detail.confirmed_seats}
                  status={detail.event.status}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist">
            <Card>
              <CardContent className="p-0">
                <WaitlistTab tenantSlug={tenantSlug} reservations={waitlist} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkin">
            <Card>
              <CardContent className="p-4">
                <CheckInTab tenantSlug={tenantSlug} reservations={confirmed} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
