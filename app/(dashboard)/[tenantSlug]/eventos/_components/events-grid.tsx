import { Card, CardContent } from '@/components/ui/card'
import type { EventListEntry } from '@/lib/events/queries'
import { EventCard } from './event-card'

export function EventsGrid({
  tenantSlug,
  events,
}: {
  tenantSlug: string
  events: EventListEntry[]
}) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No hay eventos en esta categoría.
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} tenantSlug={tenantSlug} event={e} />
      ))}
    </div>
  )
}
