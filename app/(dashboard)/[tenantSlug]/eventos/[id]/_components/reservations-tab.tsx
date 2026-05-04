'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ReservationRow } from '@/lib/events/queries'
import { cancelReservation, checkInReservation } from '@/lib/events/reservations'
import { formatPhoneForDisplay } from '@/lib/phone'
import type { EventStatus } from '@/types/database'
import { NewReservationDialog } from './new-reservation-dialog'

export function ReservationsTab({
  tenantSlug,
  eventId,
  reservations,
  capacity,
  confirmedSeats,
  status,
}: {
  tenantSlug: string
  eventId: string
  reservations: ReservationRow[]
  capacity: number | null
  confirmedSeats: number
  status: EventStatus
}) {
  const [query, setQuery] = useState('')
  const [openNew, setOpenNew] = useState(false)
  const [, start] = useTransition()

  const visible = reservations
    .filter((r) => r.status === 'confirmed' || r.status === 'checked_in')
    .filter((r) => {
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return (
        r.customer.first_name.toLowerCase().includes(q) ||
        r.customer.last_name.toLowerCase().includes(q) ||
        r.customer.phone.includes(q)
      )
    })

  const onCheckin = (id: string) => {
    start(async () => {
      const r = await checkInReservation(tenantSlug, id)
      if (!r.ok) toast.error(r.message)
      else toast.success('Check-in registrado')
    })
  }

  const onCancel = (id: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    start(async () => {
      const r = await cancelReservation(tenantSlug, id)
      if (!r.ok) toast.error(r.message)
      else toast.success(r.promoted_id ? 'Cancelada · promovió waitlist' : 'Cancelada')
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <Input
          placeholder="Buscar por nombre o teléfono…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground">
          {capacity === null
            ? `${confirmedSeats} confirmadas`
            : `${confirmedSeats}/${capacity} ocupado`}
        </span>
        <div className="ml-auto">
          <Button
            size="sm"
            disabled={status !== 'published' && status !== 'draft'}
            onClick={() => setOpenNew(true)}
          >
            + Reservar
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          {query ? 'Sin coincidencias.' : 'Aún no hay reservas confirmadas.'}
        </div>
      ) : (
        <ul className="divide-y">
          {visible.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {r.customer.first_name} {r.customer.last_name}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatPhoneForDisplay(r.customer.phone)}
                </div>
              </div>
              <Badge variant="secondary">×{r.guests_count}</Badge>
              {r.status === 'checked_in' ? (
                <Badge>Check-in</Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onCheckin(r.id)}>
                  Check-in
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onCancel(r.id)}>
                Cancelar
              </Button>
            </li>
          ))}
        </ul>
      )}

      {openNew ? (
        <NewReservationDialog
          tenantSlug={tenantSlug}
          eventId={eventId}
          onClose={() => setOpenNew(false)}
        />
      ) : null}
    </div>
  )
}
