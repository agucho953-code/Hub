import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import type { VisitListEntry } from '@/lib/points/queries'

export function VisitsTab({ visits }: { visits: VisitListEntry[] }) {
  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Todavía no tiene visitas registradas.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {visits.map((v) => (
            <li key={v.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {format(new Date(v.visited_at), "d 'de' MMM yyyy · HH:mm", { locale: es })}
                </div>
                {v.notes ? (
                  <div className="truncate text-xs text-muted-foreground">{v.notes}</div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ${(v.total_amount_cents / 100).toLocaleString('es-AR')}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{v.source}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
