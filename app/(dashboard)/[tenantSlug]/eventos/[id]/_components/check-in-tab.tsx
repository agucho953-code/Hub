'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ReservationRow } from '@/lib/events/queries'
import { checkInReservation } from '@/lib/events/reservations'
import { formatPhoneForDisplay } from '@/lib/phone'

export function CheckInTab({
  tenantSlug,
  reservations,
}: {
  tenantSlug: string
  reservations: ReservationRow[]
}) {
  const [query, setQuery] = useState('')
  const [, start] = useTransition()

  const visible = reservations.filter((r) => {
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

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar nombre o teléfono…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <ul className="divide-y rounded-md border">
        {visible.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Sin coincidencias.
          </li>
        ) : (
          visible.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {r.customer.first_name} {r.customer.last_name}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {formatPhoneForDisplay(r.customer.phone)}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">×{r.guests_count}</span>
              {r.status === 'checked_in' ? (
                <Badge>Check-in OK</Badge>
              ) : (
                <Button size="sm" onClick={() => onCheckin(r.id)}>
                  Check-in
                </Button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
