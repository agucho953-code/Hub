'use client'

import { Bell, Receipt, Users } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { subscribeChanges } from '@/lib/realtime/subscribe'
import type { WaiterSessionRow } from '@/lib/sessions-waiter/queries'

export function SessionsGrid({
  tenantSlug,
  tenantId,
  initialSessions,
}: {
  tenantSlug: string
  tenantId: string
  initialSessions: WaiterSessionRow[]
}) {
  const [sessions, setSessions] = useState(initialSessions)

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/list?tenant_id=${encodeURIComponent(tenantId)}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = (await res.json()) as { sessions: WaiterSessionRow[] }
      setSessions(data.sessions)
    }
  }, [tenantId])

  useEffect(() => {
    const cleanup = subscribeChanges({
      channel: `waiter-${tenantId}`,
      events: [
        {
          event: '*',
          table: 'tickets',
          filter: `tenant_id=eq.${tenantId}`,
          onChange: () => void refresh(),
        },
        {
          event: '*',
          table: 'table_sessions',
          filter: `tenant_id=eq.${tenantId}`,
          onChange: () => void refresh(),
        },
        { event: 'INSERT', table: 'table_session_events', onChange: () => void refresh() },
      ],
    })
    return cleanup
  }, [tenantId, refresh])

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No hay mesas abiertas"
        description="Cuando un comensal escanee un QR, la mesa va a aparecer acá."
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => (
        <Link
          key={s.id}
          href={`/${tenantSlug}/sesiones/${s.id}`}
          className="block rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-card/95"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{s.table_label ?? 'Mesa'}</h3>
              <p className="text-xs text-muted-foreground">
                Abierta{' '}
                {new Date(s.opened_at).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <p className="font-semibold">${(s.total_cents / 100).toFixed(2)}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="gap-1">
              <Users className="size-3" />
              {s.guest_count}
            </Badge>
            {s.pending_tickets > 0 && (
              <Badge className="gap-1 bg-amber-100 text-amber-900 hover:bg-amber-100">
                <Bell className="size-3" />
                {s.pending_tickets} pending
              </Badge>
            )}
            {s.bill_requested && (
              <Badge variant="destructive" className="gap-1">
                <Receipt className="size-3" />
                Pidieron cuenta
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
