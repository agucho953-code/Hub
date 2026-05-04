import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { EventStatus } from '@/types/database'

const statusLabel: Record<
  EventStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  published: { label: 'Publicado', variant: 'default' },
  finished: { label: 'Finalizado', variant: 'outline' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

export function EventSidebar({
  event,
  confirmedSeats,
  waitlistCount,
}: {
  event: {
    name: string
    description: string | null
    starts_at: string
    ends_at: string
    capacity: number | null
    waitlist_enabled: boolean
    status: EventStatus
    cover_image_url: string | null
  }
  confirmedSeats: number
  waitlistCount: number
}) {
  const status = statusLabel[event.status]
  const occupancyPct =
    event.capacity !== null && event.capacity > 0
      ? Math.round((confirmedSeats / event.capacity) * 100)
      : 0

  return (
    <Card className="overflow-hidden">
      {event.cover_image_url ? (
        // biome-ignore lint/performance/noImgElement: cover viene del bucket público
        <img src={event.cover_image_url} alt={event.name} className="h-32 w-full object-cover" />
      ) : null}
      <CardContent className="space-y-3 p-4">
        <div>
          <h2 className="text-lg font-semibold">{event.name}</h2>
          <Badge variant={status.variant} className="mt-1">
            {status.label}
          </Badge>
        </div>

        <dl className="space-y-1.5 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Inicio</dt>
            <dd>{format(new Date(event.starts_at), 'EEE d MMM · HH:mm', { locale: es })}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Fin</dt>
            <dd>{format(new Date(event.ends_at), 'EEE d MMM · HH:mm', { locale: es })}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Cupo</dt>
            <dd>
              {event.capacity === null
                ? `${confirmedSeats} (ilimitado)`
                : `${confirmedSeats}/${event.capacity} (${occupancyPct}%)`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Waitlist</dt>
            <dd>
              {event.waitlist_enabled ? `Habilitada · ${waitlistCount} en cola` : 'Deshabilitada'}
            </dd>
          </div>
        </dl>

        {event.description ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{event.description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
