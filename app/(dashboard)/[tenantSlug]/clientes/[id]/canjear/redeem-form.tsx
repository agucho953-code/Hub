'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { validateRedeem } from '@/lib/points/engine'
import type { Reward } from '@/lib/points/queries'
import { redeemReward } from '@/lib/visits/actions'

export function RedeemForm({
  tenantSlug,
  customerId,
  balance,
  rewards,
}: {
  tenantSlug: string
  customerId: string
  balance: number
  rewards: Reward[]
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<Reward | null>(null)
  const [pending, start] = useTransition()

  if (rewards.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay recompensas activas. Pedile al owner que cree algunas.
      </p>
    )
  }

  const onConfirm = () => {
    if (!confirming) return
    start(async () => {
      const r = await redeemReward(tenantSlug, {
        customer_id: customerId,
        reward_id: confirming.id,
      })
      if (r.ok) {
        toast.success(`Canje OK · balance ahora: ${r.balance_after} pts`)
        setConfirming(null)
        router.push(`/${tenantSlug}/clientes/${customerId}`)
        router.refresh()
      } else {
        toast.error(r.message)
        setConfirming(null)
      }
    })
  }

  return (
    <>
      <ul className="divide-y rounded-md border">
        {rewards.map((r) => {
          const validation = validateRedeem({
            balance,
            reward: { cost_points: r.cost_points, active: r.active, stock: r.stock },
          })
          const disabled = !validation.ok
          const reason = !validation.ok ? validation.error : null
          return (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{r.name}</div>
                {r.description ? (
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                ) : null}
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.cost_points} pts · {r.stock === null ? 'Stock ilimitado' : `Stock: ${r.stock}`}
                </div>
              </div>
              <Button
                size="sm"
                disabled={disabled}
                onClick={() => setConfirming(r)}
                title={reason === 'insufficient_balance' ? 'Faltan puntos' : undefined}
              >
                {reason === 'insufficient_balance'
                  ? `Faltan ${r.cost_points - balance}`
                  : reason === 'out_of_stock'
                    ? 'Sin stock'
                    : 'Canjear'}
              </Button>
            </li>
          )
        })}
      </ul>

      <AlertDialog open={confirming !== null} onOpenChange={(o) => !o && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar canje</AlertDialogTitle>
            <AlertDialogDescription>
              {confirming
                ? `Vas a descontar ${confirming.cost_points} puntos por "${confirming.name}".`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} disabled={pending}>
              {pending ? 'Canjeando…' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
