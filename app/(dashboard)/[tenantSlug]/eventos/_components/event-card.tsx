import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { EventListEntry } from '@/lib/events/queries'

const statusLabel: Record<
  EventListEntry['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  published: { label: 'Publicado', variant: 'default' },
  finished: { label: 'Finalizado', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

export function EventCard({ tenantSlug, event }: { tenantSlug: string; event: EventListEntry }) {
  const occupancy =
    event.capacity !== null
      ? `${event.confirmed_seats}/${event.capacity}`
      : `${event.confirmed_seats}`
  const ratio = event.capacity ? Math.min(1, event.confirmed_seats / event.capacity) : 0
  const status = statusLabel[event.status]

  return (
    <Card className="overflow-hidden">
      {event.cover_image_url ? (
        // biome-ignore lint/performance/noImgElement: cover image url ya viene del bucket público
        <img src={event.cover_image_url} alt={event.name} className="h-32 w-full object-cover" />
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-primary/15 to-muted" />
      )}
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/${tenantSlug}/eventos/${event.id}`} className="font-medium hover:underline">
            {event.name}
          </Link>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(event.starts_at), 'EEEE d MMM · HH:mm', { locale: es })}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium">{occupancy}</span>
        </div>
        {event.waitlist_count > 0 ? (
          <div className="text-xs text-muted-foreground">+{event.waitlist_count} en waitlist</div>
        ) : null}
      </CardContent>
    </Card>
  )
}
