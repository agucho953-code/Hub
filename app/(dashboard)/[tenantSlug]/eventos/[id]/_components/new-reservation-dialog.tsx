'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type CustomerSearchResult, searchCustomers } from '@/lib/customers/search'
import { createReservation } from '@/lib/events/reservations'
import { formatPhoneForDisplay } from '@/lib/phone'

export function NewReservationDialog({
  tenantSlug,
  eventId,
  onClose,
}: {
  tenantSlug: string
  eventId: string
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [picked, setPicked] = useState<CustomerSearchResult | null>(null)
  const [guests, setGuests] = useState('1')
  const [pending, start] = useTransition()

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }
      const data = await searchCustomers(tenantSlug, query)
      if (!cancelled) setResults(data)
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, tenantSlug])

  const onSubmit = () => {
    if (!picked) {
      toast.error('Elegí un cliente')
      return
    }
    const g = Number.parseInt(guests, 10)
    if (Number.isNaN(g) || g < 1) {
      toast.error('Cantidad inválida')
      return
    }
    start(async () => {
      const r = await createReservation(tenantSlug, {
        event_id: eventId,
        customer_id: picked.id,
        guests: g,
      })
      if (r.ok) {
        toast.success(
          r.status === 'waitlist'
            ? `En lista de espera (posición ${r.waitlist_position})`
            : 'Reserva confirmada',
        )
        onClose()
      } else {
        toast.error(r.message)
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva reserva</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="search-cust">Buscar cliente</Label>
            <Input
              id="search-cust"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPicked(null)
              }}
              placeholder="Nombre o teléfono…"
              autoFocus
            />
          </div>

          {!picked && results.length > 0 ? (
            <ul className="max-h-48 divide-y overflow-y-auto rounded-md border">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(c)
                      setQuery(`${c.first_name} ${c.last_name}`)
                      setResults([])
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50"
                  >
                    <span className="text-sm">
                      <strong>
                        {c.first_name} {c.last_name}
                      </strong>{' '}
                      <span className="text-xs text-muted-foreground">
                        {formatPhoneForDisplay(c.phone)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {picked ? (
            <div className="rounded-md border bg-muted/40 p-2 text-sm">
              Cliente:{' '}
              <strong>
                {picked.first_name} {picked.last_name}
              </strong>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="guests">Comensales</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={99}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={pending || !picked}>
            {pending ? 'Reservando…' : 'Reservar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
