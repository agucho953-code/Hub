import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import type { EventListEntry } from '@/lib/events/queries'
import { cn } from '@/lib/utils'

export function CalendarMonth({
  tenantSlug,
  events,
}: {
  tenantSlug: string
  events: EventListEntry[]
}) {
  // Anclamos al mes del primer evento próximo (o hoy).
  const anchor = events[0] ? new Date(events[0].starts_at) : new Date()
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const eventsByDay = new Map<string, EventListEntry[]>()
  for (const ev of events) {
    const key = format(new Date(ev.starts_at), 'yyyy-MM-dd')
    if (!eventsByDay.has(key)) eventsByDay.set(key, [])
    eventsByDay.get(key)!.push(ev)
  }

  const weekHeader = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div>
      <div className="mb-2 text-center text-sm font-medium capitalize">
        {format(monthStart, 'LLLL yyyy', { locale: es })}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekHeader.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, monthStart)
          const today = isSameDay(day, new Date())
          return (
            <div
              key={key}
              className={cn(
                'min-h-16 rounded border p-1 text-xs',
                inMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground',
                today && 'border-primary',
              )}
            >
              <div className="text-right font-medium">{format(day, 'd')}</div>
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/${tenantSlug}/eventos/${ev.id}`}
                    className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] text-primary hover:bg-primary/25"
                    title={ev.name}
                  >
                    {format(new Date(ev.starts_at), 'HH:mm')} {ev.name}
                  </Link>
                ))}
                {dayEvents.length > 2 ? (
                  <div className="px-1 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 2} más
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
