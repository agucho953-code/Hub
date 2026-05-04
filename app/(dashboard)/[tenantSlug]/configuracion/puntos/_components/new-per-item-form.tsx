'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MenuCategory, MenuItem } from '@/lib/menu/queries'
import { createPerItemRule } from '@/lib/points/actions'

export function NewPerItemForm({
  tenantSlug,
  items,
  categories,
}: {
  tenantSlug: string
  items: MenuItem[]
  categories: MenuCategory[]
}) {
  const [mode, setMode] = useState<'item' | 'category'>('category')
  const [targetId, setTargetId] = useState('')
  const [points, setPoints] = useState('5')
  const [priority, setPriority] = useState('0')
  const [pending, start] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId) {
      toast.error('Elegí un destino')
      return
    }
    const pts = Number.parseInt(points, 10)
    if (Number.isNaN(pts) || pts < 1) {
      toast.error('Puntos inválido')
      return
    }
    start(async () => {
      const r = await createPerItemRule(tenantSlug, {
        mode,
        targetId,
        points: pts,
        priority: Number.parseInt(priority, 10) || 0,
      })
      if (r.ok) {
        toast.success(r.message ?? 'Regla creada')
        setTargetId('')
      } else {
        toast.error(r.message)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">Por ítem o categoría</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_80px_80px_auto] sm:items-end">
        <div className="grid gap-1">
          <Label className="text-xs">Aplicar a</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as 'item' | 'category')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Categoría</SelectItem>
              <SelectItem value="item">Ítem específico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">{mode === 'category' ? 'Categoría' : 'Ítem'}</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger>
              <SelectValue placeholder="Elegir…" />
            </SelectTrigger>
            <SelectContent>
              {(mode === 'category' ? categories : items).map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Puntos</Label>
          <Input type="number" min={1} value={points} onChange={(e) => setPoints(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Prio.</Label>
          <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
        </div>
        <Button type="submit" disabled={pending} size="sm">
          {pending ? '…' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
