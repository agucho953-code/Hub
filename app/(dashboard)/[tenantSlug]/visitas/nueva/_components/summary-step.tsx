'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MenuItem } from '@/lib/menu/queries'
import { calculatePoints } from '@/lib/points/engine'
import type { PointsRule, VisitForEngine } from '@/lib/points/types'
import { closeTable } from '@/lib/visits/actions'
import type { WizardCustomer, WizardLine } from './wizard'

export function SummaryStep({
  tenantSlug,
  customer,
  items,
  lines,
  notes,
  rules,
  submitting,
  setSubmitting,
  onBack,
}: {
  tenantSlug: string
  customer: WizardCustomer
  items: MenuItem[]
  lines: WizardLine[]
  notes: string
  rules: PointsRule[]
  submitting: boolean
  setSubmitting: (b: boolean) => void
  onBack: () => void
}) {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState<{
    points: number
    breakdown: { description: string; points: number }[]
  } | null>(null)

  const { total, preview } = useMemo(() => {
    let total = 0
    const visitItems = lines
      .map((l) => {
        const item = items.find((i) => i.id === l.item_id)
        if (!item) return null
        const lineTotal = item.price_cents * l.quantity
        total += lineTotal
        return {
          menu_item_id: item.id,
          category_id: item.category_id,
          quantity: l.quantity,
          unit_price_cents: item.price_cents,
          line_total_cents: lineTotal,
          points_override: item.points_override,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    const visit: VisitForEngine = { total_amount_cents: total, items: visitItems }
    const preview = calculatePoints(visit, rules)
    return { total, preview }
  }, [items, lines, rules])

  const onSubmit = async () => {
    setSubmitting(true)
    const result = await closeTable(tenantSlug, {
      customer_id: customer.id,
      items: lines.map((l) => ({ item_id: l.item_id, quantity: l.quantity })),
      notes: notes.trim().length > 0 ? notes.trim() : null,
    })
    setSubmitting(false)
    if (result.ok) {
      setConfirmed({ points: result.points_awarded, breakdown: result.breakdown })
      toast.success(`Mesa cerrada · +${result.points_awarded} pts`)
    } else {
      toast.error(result.message)
    }
  }

  if (confirmed) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-xl">
            ✓
          </div>
          <h2 className="text-xl font-semibold">Mesa cerrada</h2>
          <p className="text-sm text-muted-foreground">
            {customer.first_name} sumó <strong>{confirmed.points} puntos</strong>.
          </p>
          {confirmed.breakdown.length > 0 ? (
            <ul className="mx-auto max-w-sm space-y-1 text-left text-sm">
              {confirmed.breakdown.map((b) => (
                <li
                  key={`${b.description}-${b.points}`}
                  className="flex justify-between rounded-md bg-muted/40 px-3 py-1.5"
                >
                  <span>{b.description}</span>
                  <span className="font-medium">+{b.points}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/${tenantSlug}/clientes/${customer.id}`)}
            >
              Ver ficha
            </Button>
            <Button onClick={() => router.push(`/${tenantSlug}/visitas/nueva`)}>
              Cerrar otra mesa
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Cliente</div>
          <div className="font-medium">
            {customer.first_name} {customer.last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            Balance actual: {customer.points_balance} pts
          </div>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-sm font-medium">Detalle</div>
          <ul className="divide-y">
            {lines.map((l) => {
              const item = items.find((i) => i.id === l.item_id)
              if (!item) return null
              return (
                <li key={l.item_id} className="flex justify-between px-3 py-2 text-sm">
                  <span>
                    {l.quantity}× {item.name}
                  </span>
                  <span>${((item.price_cents * l.quantity) / 100).toLocaleString('es-AR')}</span>
                </li>
              )
            })}
          </ul>
          <div className="flex justify-between border-t px-3 py-2 text-base font-semibold">
            <span>Total</span>
            <span>${(total / 100).toLocaleString('es-AR')}</span>
          </div>
        </div>

        <div className="rounded-md border bg-emerald-50 p-3 dark:bg-emerald-900/20">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Puntos a otorgar</span>
            <span className="text-2xl font-semibold text-emerald-600">+{preview.delta}</span>
          </div>
          {preview.breakdown.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {preview.breakdown.map((b) => (
                <li
                  key={`${b.rule_id ?? 'override'}-${b.source}-${b.points}`}
                  className="flex justify-between"
                >
                  <span>{b.description}</span>
                  <span>+{b.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Sin reglas aplicables. Configurá reglas en <strong>Puntos y recompensas</strong>.
            </p>
          )}
        </div>

        {notes ? (
          <div className="rounded-md border p-3 text-sm">
            <div className="text-xs text-muted-foreground">Notas</div>
            <p className="whitespace-pre-wrap">{notes}</p>
          </div>
        ) : null}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={submitting}>
            ← Atrás
          </Button>
          <Button onClick={onSubmit} disabled={submitting} size="lg">
            {submitting ? 'Cerrando…' : 'Confirmar y cobrar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
