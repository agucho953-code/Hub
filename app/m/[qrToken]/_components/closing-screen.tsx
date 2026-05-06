'use client'

import { CheckCircle2, Sparkles } from 'lucide-react'
import type { SessionStateData } from '@/lib/m-session/actions'

export function ClosingScreen({
  tenantName,
  tableLabel,
  state,
}: {
  tenantName: string
  tableLabel: string
  state: SessionStateData | null
}) {
  const myTotal = state
    ? state.my_tickets
        .filter((t) => t.status !== 'cancelled')
        .reduce((sum, t) => sum + t.total_cents, 0)
    : 0

  const isRegistered = Boolean(state?.customer_id)

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-8" />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {tenantName}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          ¡Gracias por venir a {tableLabel}!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La cuenta quedó cobrada. Te llevás esto:
        </p>
      </div>

      <div className="card-hairline rounded-2xl border bg-card/90 p-5 text-left shadow-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-sm text-muted-foreground">Lo que pediste</span>
          <span className="font-display text-lg font-semibold">${(myTotal / 100).toFixed(2)}</span>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {state?.my_tickets
            .filter((t) => t.status !== 'cancelled')
            .flatMap((t) => t.items)
            .filter((it) => !it.cancelled_at)
            .map((it) => (
              <li key={it.id} className="flex justify-between gap-2 text-muted-foreground">
                <span>
                  {it.quantity}× {it.menu_item_name ?? 'Ítem'}
                </span>
                <span>${(it.line_total_cents / 100).toFixed(2)}</span>
              </li>
            ))}
        </ul>
      </div>

      {isRegistered ? (
        <div className="card-hairline space-y-2 rounded-2xl border bg-primary/5 p-5 text-left shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            Tus puntos ya están sumados
          </div>
          <p className="text-xs text-muted-foreground">
            La próxima vez que vengas, mostrá tu teléfono al mozo para canjear.
          </p>
        </div>
      ) : (
        <div className="card-hairline space-y-2 rounded-2xl border border-dashed bg-card/60 p-5 text-left shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-muted-foreground" />
            La próxima sumás puntos
          </div>
          <p className="text-xs text-muted-foreground">
            Si te registrás antes de pedir, sumás puntos por cada consumo.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">¡Te esperamos pronto!</p>
    </div>
  )
}
