'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ReservationRow } from '@/lib/events/queries'
import { checkInReservation } from '@/lib/events/reservations'
import { formatPhoneForDisplay } from '@/lib/phone'

export function CheckInBoard({
  tenantSlug,
  reservations,
}: {
  tenantSlug: string
  reservations: ReservationRow[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [, start] = useTransition()
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set())

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
    setOptimisticIds(new Set([...optimisticIds, id]))
    start(async () => {
      const r = await checkInReservation(tenantSlug, id)
      if (!r.ok) {
        toast.error(r.message)
        const next = new Set(optimisticIds)
        next.delete(id)
        setOptimisticIds(next)
      } else {
        toast.success('OK')
        router.refresh()
      }
    })
  }

  const initials = (first: string, last: string) =>
    `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar nombre o teléfono…"
        className="h-12 text-lg"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      <ul className="space-y-2">
        {visible.length === 0 ? (
          <li className="rounded-md border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
            Sin coincidencias.
          </li>
        ) : (
          visible.map((r) => {
            const checked = r.status === 'checked_in' || optimisticIds.has(r.id)
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3"
              >
                <Avatar className="size-12">
                  <AvatarFallback className="text-base">
                    {initials(r.customer.first_name, r.customer.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium">
                    {r.customer.first_name} {r.customer.last_name}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {formatPhoneForDisplay(r.customer.phone)} · ×{r.guests_count}
                  </div>
                </div>
                {checked ? (
                  <Badge className="text-base">✓ OK</Badge>
                ) : (
                  <Button size="lg" onClick={() => onCheckin(r.id)}>
                    Check-in
                  </Button>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
