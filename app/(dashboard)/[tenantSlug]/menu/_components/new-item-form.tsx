'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMenuItem, type MenuActionState } from '@/lib/menu/actions'

const initial: MenuActionState = { ok: true }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? 'Creando…' : '+ Ítem'}
    </Button>
  )
}

export function NewItemForm({
  tenantSlug,
  categoryId,
}: {
  tenantSlug: string
  categoryId: string
}) {
  const action = createMenuItem.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
      formRef.current?.reset()
    } else if (!state.ok) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_120px_120px_auto]"
    >
      <input type="hidden" name="category_id" value={categoryId} />
      <div className="grid gap-1">
        <Label htmlFor={`name-${categoryId}`} className="text-xs">
          Nombre
        </Label>
        <Input id={`name-${categoryId}`} name="name" required maxLength={80} />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`price-${categoryId}`} className="text-xs">
          Precio (¢)
        </Label>
        <Input
          id={`price-${categoryId}`}
          name="price_cents"
          type="number"
          required
          min={0}
          step={1}
          placeholder="150000"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`pts-${categoryId}`} className="text-xs">
          Pts override
        </Label>
        <Input
          id={`pts-${categoryId}`}
          name="points_override"
          type="number"
          step={1}
          placeholder="opcional"
        />
      </div>
      <div className="self-end">
        <SubmitBtn />
      </div>
    </form>
  )
}
