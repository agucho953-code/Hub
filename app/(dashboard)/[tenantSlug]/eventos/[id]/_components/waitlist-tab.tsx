'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ReservationRow } from '@/lib/events/queries'
import { cancelReservation } from '@/lib/events/reservations'
import { formatPhoneForDisplay } from '@/lib/phone'

export function WaitlistTab({
  tenantSlug,
  reservations,
}: {
  tenantSlug: string
  reservations: ReservationRow[]
}) {
  const [, start] = useTransition()

  const onCancel = (id: string) => {
    if (!confirm('¿Quitar de la waitlist?')) return
    start(async () => {
      const r = await cancelReservation(tenantSlug, id)
      if (!r.ok) toast.error(r.message)
      else toast.success('Quitado de la lista.')
    })
  }

  if (reservations.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        Nadie en lista de espera.
      </div>
    )
  }

  return (
    <ul className="divide-y">
      {reservations
        .sort((a, b) => (a.waitlist_position ?? 0) - (b.waitlist_position ?? 0))
        .map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono font-medium">
              {r.waitlist_position ?? '?'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {r.customer.first_name} {r.customer.last_name}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {formatPhoneForDisplay(r.customer.phone)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">×{r.guests_count}</span>
            <Button size="sm" variant="ghost" onClick={() => onCancel(r.id)}>
              Quitar
            </Button>
          </li>
        ))}
    </ul>
  )
}
