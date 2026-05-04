'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  deleteCategory,
  deleteMenuItem,
  reorderItems,
  updateCategory,
  updateMenuItem,
} from '@/lib/menu/actions'
import type { MenuCategory, MenuItem } from '@/lib/menu/queries'
import { CategoryEditDialog } from './category-edit-dialog'
import { ItemEditDialog } from './item-edit-dialog'
import { NewItemForm } from './new-item-form'

export function CategoryRow({
  category,
  items: initialItems,
  tenantSlug,
  allCategories,
}: {
  category: MenuCategory
  items: MenuItem[]
  tenantSlug: string
  allCategories: MenuCategory[]
}) {
  const [items, setItems] = useState(initialItems)
  const [, startTransition] = useTransition()
  const [editingCat, setEditingCat] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    startTransition(async () => {
      const r = await reorderItems(
        tenantSlug,
        category.id,
        next.map((i) => i.id),
      )
      if (!r.ok) {
        toast.error(r.message)
        setItems(items)
      }
    })
  }

  const onToggleItem = (id: string, active: boolean) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setItems(items.map((i) => (i.id === id ? { ...i, active } : i)))
    startTransition(async () => {
      const r = await updateMenuItem(tenantSlug, { ...item, active })
      if (!r.ok) toast.error(r.message)
    })
  }

  const onDeleteItem = (id: string) => {
    if (!confirm('¿Borrar este ítem?')) return
    const previous = items
    setItems(items.filter((i) => i.id !== id))
    startTransition(async () => {
      const r = await deleteMenuItem(tenantSlug, id)
      if (!r.ok) {
        toast.error(r.message)
        setItems(previous)
      }
    })
  }

  const onDeleteCat = () => {
    if (!confirm(`¿Borrar la categoría "${category.name}"? Sus ítems deben moverse antes.`)) return
    startTransition(async () => {
      const r = await deleteCategory(tenantSlug, category.id)
      if (!r.ok) toast.error(r.message)
    })
  }

  const onToggleCat = () => {
    startTransition(async () => {
      const r = await updateCategory(tenantSlug, {
        id: category.id,
        name: category.name,
        active: !category.active,
      })
      if (!r.ok) toast.error(r.message)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditingCat(true)}>
          <Pencil className="mr-1 size-3.5" /> Editar
        </Button>
        <Button size="sm" variant="outline" onClick={onToggleCat}>
          {category.active ? 'Pausar' : 'Activar'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDeleteCat}>
          <Trash2 className="mr-1 size-3.5" /> Borrar
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y rounded-md border">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Sin ítems en esta categoría.
              </div>
            ) : (
              items.map((it) => (
                <SortableItem
                  key={it.id}
                  item={it}
                  onEdit={() => setEditingItem(it)}
                  onToggle={() => onToggleItem(it.id, !it.active)}
                  onDelete={() => onDeleteItem(it.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <NewItemForm tenantSlug={tenantSlug} categoryId={category.id} />

      {editingCat ? (
        <CategoryEditDialog
          category={category}
          tenantSlug={tenantSlug}
          onClose={() => setEditingCat(false)}
        />
      ) : null}
      {editingItem ? (
        <ItemEditDialog
          item={editingItem}
          tenantSlug={tenantSlug}
          categories={allCategories}
          onClose={() => setEditingItem(null)}
        />
      ) : null}
    </div>
  )
}

function SortableItem({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: MenuItem
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-3 py-2">
      <button
        {...attributes}
        {...listeners}
        aria-label={`Mover ${item.name}`}
        className="cursor-grab text-muted-foreground hover:text-foreground"
        type="button"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-muted-foreground">
            ${(item.price_cents / 100).toLocaleString('es-AR')}
          </span>
          {item.points_override !== null ? (
            <span className="text-xs text-emerald-600">+{item.points_override} pts</span>
          ) : null}
          {!item.active ? <span className="text-xs text-muted-foreground">(pausado)</span> : null}
        </div>
        {item.description ? (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Pencil className="size-3.5" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onToggle}>
        {item.active ? 'Pausar' : 'Activar'}
      </Button>
      <Button size="sm" variant="ghost" onClick={onDelete}>
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}
