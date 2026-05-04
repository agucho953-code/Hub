'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteReward, updateReward } from '@/lib/points/actions'
import type { Reward } from '@/lib/points/queries'

export function RewardsList({ tenantSlug, rewards }: { tenantSlug: string; rewards: Reward[] }) {
  const [, start] = useTransition()

  const onToggle = (r: Reward) => {
    start(async () => {
      const result = await updateReward(tenantSlug, {
        id: r.id,
        name: r.name,
        description: r.description,
        cost_points: r.cost_points,
        stock: r.stock,
        active: !r.active,
      })
      if (!result.ok) toast.error(result.message)
    })
  }

  const onDelete = (id: string) => {
    if (!confirm('¿Borrar esta recompensa?')) return
    start(async () => {
      const result = await deleteReward(tenantSlug, id)
      if (!result.ok) toast.error(result.message)
    })
  }

  if (rewards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin recompensas. Creá una arriba para que tus clientes canjeen.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-md border">
      {rewards.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
          <Badge variant={r.active ? 'default' : 'secondary'}>
            {r.active ? 'Activa' : 'Pausada'}
          </Badge>
          <span className="flex-1 font-medium">{r.name}</span>
          <span className="text-muted-foreground">{r.cost_points} pts</span>
          <span className="text-xs text-muted-foreground">
            stock: {r.stock === null ? '∞' : r.stock}
          </span>
          <Button size="sm" variant="ghost" onClick={() => onToggle(r)}>
            {r.active ? 'Pausar' : 'Activar'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)}>
            Borrar
          </Button>
        </div>
      ))}
    </div>
  )
}
