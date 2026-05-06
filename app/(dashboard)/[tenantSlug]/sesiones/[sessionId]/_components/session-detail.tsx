'use client'

import { Receipt } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { subscribeChanges } from '@/lib/realtime/subscribe'
import type { WaiterSessionDetail } from '@/lib/sessions-waiter/queries'
import type { TicketItemRow, TicketRow } from '@/lib/tickets/queries'
import { TicketCard } from './ticket-card'

export function SessionDetail({
  tenantSlug,
  session,
  initialTickets,
  initialItems,
}: {
  tenantSlug: string
  session: WaiterSessionDetail
  initialTickets: TicketRow[]
  initialItems: TicketItemRow[]
}) {
  const [tickets, setTickets] = useState(initialTickets)
  const [items, setItems] = useState(initialItems)
  const [billRequested, setBillRequested] = useState(session.bill_requested)

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/${encodeURIComponent(session.id)}/snapshot`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as {
        tickets: TicketRow[]
        items: TicketItemRow[]
        bill_requested: boolean
      }
      setTickets(data.tickets)
      setItems(data.items)
      setBillRequested(data.bill_requested)
    }
  }, [session.id])

  useEffect(() => {
    const cleanup = subscribeChanges({
      channel: `session-${session.id}`,
      events: [
        {
          event: '*',
          table: 'tickets',
          filter: `session_id=eq.${session.id}`,
          onChange: () => void refresh(),
        },
        { event: '*', table: 'ticket_items', onChange: () => void refresh() },
        {
          event: 'INSERT',
          table: 'table_session_events',
          filter: `session_id=eq.${session.id}`,
          onChange: () => void refresh(),
        },
      ],
    })
    return cleanup
  }, [session.id, refresh])

  const itemsByTicket = new Map<string, TicketItemRow[]>()
  for (const it of items) {
    const arr = itemsByTicket.get(it.ticket_id) ?? []
    arr.push(it)
    itemsByTicket.set(it.ticket_id, arr)
  }

  return (
    <div className="space-y-4">
      {billRequested && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <Receipt className="size-4 text-destructive" />
          <span>El comensal pidió la cuenta.</span>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Comensales ({session.guests.length})
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {session.guests.map((g) => (
            <Badge key={g.id} variant={g.customer_id ? 'default' : 'outline'}>
              {g.display_name ?? `Guest #${g.id.slice(0, 4)}`}
              {g.customer_id ? ' ✓' : ''}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Comandas ({tickets.length})
        </h2>
        <div className="space-y-2">
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin comandas todavía.</p>
          ) : (
            tickets.map((t) => (
              <TicketCard
                key={t.id}
                tenantSlug={tenantSlug}
                ticket={t}
                items={itemsByTicket.get(t.id) ?? []}
                onChange={refresh}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}
