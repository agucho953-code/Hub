'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { subscribeChanges } from '@/lib/realtime/subscribe'
import { cancelTicketItem, updateTicketStatus } from '@/lib/tickets/actions'
import type { TicketItemRow, TicketRow } from '@/lib/tickets/queries'

function elapsed(from: string): string {
  const ms = Date.now() - new Date(from).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  return `hace ${h}h ${min % 60}min`
}

export function KdsScreen({
  tenantSlug,
  tenantId,
  initialTickets,
  initialItems,
}: {
  tenantSlug: string
  tenantId: string
  initialTickets: TicketRow[]
  initialItems: TicketItemRow[]
}) {
  const [tickets, setTickets] = useState(initialTickets)
  const [items, setItems] = useState(initialItems)
  const [pending, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/kitchen/queue?tenant_id=${encodeURIComponent(tenantId)}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as { tickets: TicketRow[]; items: TicketItemRow[] }
      setTickets(data.tickets)
      setItems(data.items)
    }
  }, [tenantId])

  useEffect(() => {
    const cleanup = subscribeChanges({
      channel: `kitchen-${tenantId}`,
      events: [
        {
          event: '*',
          table: 'tickets',
          filter: `tenant_id=eq.${tenantId}`,
          onChange: () => void refresh(),
        },
        { event: '*', table: 'ticket_items', onChange: () => void refresh() },
      ],
    })
    return cleanup
  }, [tenantId, refresh])

  const handle = (fn: () => Promise<{ ok: boolean; message?: string }>, success: string) => {
    startTransition(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(success)
        void refresh()
      } else {
        toast.error(r.message ?? 'Error')
      }
    })
  }

  const itemsByTicket = new Map<string, TicketItemRow[]>()
  for (const it of items) {
    const arr = itemsByTicket.get(it.ticket_id) ?? []
    arr.push(it)
    itemsByTicket.set(it.ticket_id, arr)
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="Sin comandas activas"
        description="Cuando el mozo confirme un pedido, va a aparecer acá."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tickets.map((t) => (
        <div key={t.id} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                #{t.id.slice(0, 6)} · {elapsed(t.submitted_at)}
              </p>
              <Badge variant={t.status === 'preparing' ? 'default' : 'outline'} className="mt-1">
                {t.status}
              </Badge>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {(itemsByTicket.get(t.id) ?? []).map((it) => (
              <li
                key={it.id}
                className={
                  it.cancelled_at
                    ? 'text-xs text-muted-foreground line-through'
                    : 'flex items-start justify-between gap-2'
                }
              >
                <span>
                  {it.quantity}× {it.menu_item_name ?? 'Ítem'}
                  {it.notes && <span className="text-xs text-muted-foreground"> — {it.notes}</span>}
                </span>
                {!it.cancelled_at && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 shrink-0 px-1.5 text-[11px]"
                    disabled={pending}
                    onClick={() => {
                      const reason = window.prompt('Motivo (típico: sin stock):') ?? ''
                      if (reason.trim()) {
                        handle(
                          () => cancelTicketItem(tenantSlug, it.id, reason.trim()),
                          'Ítem cancelado',
                        )
                      }
                    }}
                  >
                    Sin stock
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-1.5">
            {t.status === 'accepted' && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  handle(() => updateTicketStatus(tenantSlug, t.id, 'preparing'), 'Empezando')
                }
              >
                Empezar
              </Button>
            )}
            {t.status === 'preparing' && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => handle(() => updateTicketStatus(tenantSlug, t.id, 'ready'), 'Listo')}
              >
                Listo
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
