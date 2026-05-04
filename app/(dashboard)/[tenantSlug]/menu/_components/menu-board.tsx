'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reorderCategories } from '@/lib/menu/actions'
import type { MenuCategory, MenuItem } from '@/lib/menu/queries'
import { CategoryRow } from './category-row'

export function MenuBoard({
  tenantSlug,
  categories,
  items,
}: {
  tenantSlug: string
  categories: MenuCategory[]
  items: MenuItem[]
}) {
  const [order, setOrder] = useState(categories)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = order.findIndex((c) => c.id === active.id)
    const newIndex = order.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(order, oldIndex, newIndex)
    setOrder(next)
    startTransition(async () => {
      const result = await reorderCategories(
        tenantSlug,
        next.map((c) => c.id),
      )
      if (!result.ok) {
        toast.error(result.message)
        setOrder(order)
      }
    })
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Todavía no creaste categorías. Empezá agregando una arriba.
        </CardContent>
      </Card>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {order.map((cat) => (
            <SortableCategory
              key={cat.id}
              category={cat}
              items={items.filter((i) => i.category_id === cat.id)}
              tenantSlug={tenantSlug}
              allCategories={order}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableCategory({
  category,
  items,
  tenantSlug,
  allCategories,
}: {
  category: MenuCategory
  items: MenuItem[]
  tenantSlug: string
  allCategories: MenuCategory[]
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Mover ${category.name}`}
          className="cursor-grab text-muted-foreground hover:text-foreground"
          type="button"
        >
          <GripVertical className="size-4" />
        </button>
        <CardTitle className="flex-1">
          {category.name}
          {!category.active ? (
            <span className="ml-2 text-xs text-muted-foreground">(pausada)</span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryRow
          category={category}
          items={items}
          tenantSlug={tenantSlug}
          allCategories={allCategories}
        />
      </CardContent>
    </Card>
  )
}
