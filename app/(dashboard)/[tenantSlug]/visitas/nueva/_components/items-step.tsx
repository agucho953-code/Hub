'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { MenuCategory, MenuItem } from '@/lib/menu/queries'
import type { WizardLine } from './wizard'

export function ItemsStep({
  categories,
  items,
  lines,
  notes,
  onAdd,
  onRemove,
  onQty,
  onNotes,
  onBack,
  onNext,
}: {
  categories: MenuCategory[]
  items: MenuItem[]
  lines: WizardLine[]
  notes: string
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onQty: (id: string, qty: number) => void
  onNotes: (n: string) => void
  onBack: () => void
  onNext: () => void
}) {
  const [tab, setTab] = useState<string>(categories[0]?.id ?? '')

  const total = lines.reduce((acc, line) => {
    const item = items.find((i) => i.id === line.item_id)
    return acc + (item ? item.price_cents * line.quantity : 0)
  }, 0)

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No hay categorías activas en el menú. Pedile al owner que cree algunas.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex flex-wrap h-auto">
              {categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {items
                    .filter((i) => i.category_id === c.id)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAdd(item.id)}
                        className="flex flex-col rounded-md border p-3 text-left hover:bg-muted/50 active:scale-[0.98]"
                      >
                        <span className="font-medium leading-tight">{item.name}</span>
                        <span className="mt-1 text-sm text-muted-foreground">
                          ${(item.price_cents / 100).toLocaleString('es-AR')}
                        </span>
                        {item.points_override !== null ? (
                          <span className="mt-1 text-xs text-emerald-600">
                            +{item.points_override} pts
                          </span>
                        ) : null}
                      </button>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <h3 className="font-medium">Cuenta</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tocá ítems del menú para agregarlos.</p>
          ) : (
            <ul className="divide-y">
              {lines.map((l) => {
                const item = items.find((i) => i.id === l.item_id)
                if (!item) return null
                return (
                  <li key={l.item_id} className="flex items-center gap-2 py-2">
                    <span className="flex-1 text-sm">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQty(l.item_id, l.quantity - 1)}
                        aria-label="Restar"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{l.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQty(l.item_id, l.quantity + 1)}
                        aria-label="Sumar"
                      >
                        <Plus className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemove(l.item_id)}
                        aria-label="Quitar"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <span className="w-20 text-right text-sm font-medium">
                      ${((item.price_cents * l.quantity) / 100).toLocaleString('es-AR')}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex items-baseline justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-semibold">${(total / 100).toLocaleString('es-AR')}</span>
          </div>
          <Textarea
            placeholder="Notas (opcional)"
            maxLength={300}
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
          />
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              ← Atrás
            </Button>
            <Button onClick={onNext} disabled={lines.length === 0}>
              Resumen →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
