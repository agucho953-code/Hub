import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listEvents } from '@/lib/events/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { CalendarMonth } from './_components/calendar-month'
import { EventsGrid } from './_components/events-grid'
import { EventsTabs } from './_components/events-tabs'

export const metadata = { title: 'Eventos — HUB' }

const VALID_TABS = ['upcoming', 'past', 'drafts'] as const
type Tab = (typeof VALID_TABS)[number]

export default async function EventosPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { tenantSlug } = await params
  const sp = await searchParams
  const rawTab = typeof sp.tab === 'string' ? sp.tab : 'upcoming'
  const tab: Tab = VALID_TABS.includes(rawTab as Tab) ? (rawTab as Tab) : 'upcoming'

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  const isOwner = access.role === 'owner'
  if (tab === 'drafts' && !isOwner) {
    try {
      requireRole(access.role, ['owner'])
    } catch (e) {
      if (e instanceof RoleRequiredError) notFound()
      throw e
    }
  }

  const events = await listEvents({ tenantId: access.tenant.id, tab })

  // Calendario solo cuando hay próximos publicados.
  const calendarEvents = events.filter((e) => e.status === 'published')

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Eventos</h1>
        {isOwner ? (
          <Button asChild>
            <Link href={`/${tenantSlug}/eventos/nuevo`}>Nuevo evento</Link>
          </Button>
        ) : null}
      </div>

      <EventsTabs tenantSlug={tenantSlug} current={tab} showDrafts={isOwner} />

      {tab === 'upcoming' && calendarEvents.length > 0 ? (
        <Card className="mb-4">
          <CardContent className="py-4">
            <CalendarMonth tenantSlug={tenantSlug} events={calendarEvents} />
          </CardContent>
        </Card>
      ) : null}

      <EventsGrid tenantSlug={tenantSlug} events={events} />
    </main>
  )
}
