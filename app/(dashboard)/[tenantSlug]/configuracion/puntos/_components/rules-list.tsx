'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MenuCategory, MenuItem } from '@/lib/menu/queries'
import { deleteRule, toggleRule } from '@/lib/points/actions'
import type { PointsRule } from '@/lib/points/types'

export function RulesList({
  tenantSlug,
  rules,
  menu,
}: {
  tenantSlug: string
  rules: PointsRule[]
  menu: { items: MenuItem[]; categories: MenuCategory[] }
}) {
  const [, start] = useTransition()

  const describe = (rule: PointsRule): string => {
    if (rule.type === 'per_amount') {
      const cfg = rule.config as { every_cents: number; points: number }
      return `Cada $${(cfg.every_cents / 100).toLocaleString('es-AR')} → ${cfg.points} pts`
    }
    const cfg = rule.config as Record<string, unknown>
    if (typeof cfg.item_id === 'string') {
      const item = menu.items.find((i) => i.id === cfg.item_id)
      return `Ítem "${item?.name ?? '???'}" → ${cfg.points as number} pts`
    }
    if (typeof cfg.category_id === 'string') {
      const cat = menu.categories.find((c) => c.id === cfg.category_id)
      return `Cat "${cat?.name ?? '???'}" → ${cfg.points as number} pts c/u`
    }
    return 'Regla desconocida'
  }

  const onToggle = (id: string, current: boolean) => {
    start(async () => {
      const r = await toggleRule(tenantSlug, id, !current)
      if (!r.ok) toast.error(r.message)
    })
  }

  const onDelete = (id: string) => {
    if (!confirm('¿Borrar esta regla?')) return
    start(async () => {
      const r = await deleteRule(tenantSlug, id)
      if (!r.ok) toast.error(r.message)
    })
  }

  if (rules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin reglas. Crear una arriba para empezar a otorgar puntos.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-md border">
      {rules.map((r) => (
        <div key={r.id} className="flex items-center gap-2 px-3 py-2 text-sm">
          <Badge variant={r.active ? 'default' : 'secondary'}>
            {r.active ? 'Activa' : 'Pausada'}
          </Badge>
          <span className="flex-1">{describe(r)}</span>
          <span className="text-xs text-muted-foreground">prio {r.priority}</span>
          <Button size="sm" variant="ghost" onClick={() => onToggle(r.id, r.active)}>
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
