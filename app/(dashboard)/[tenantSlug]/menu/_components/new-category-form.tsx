'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, type MenuActionState } from '@/lib/menu/actions'

const initial: MenuActionState = { ok: true }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creando…' : 'Crear'}
    </Button>
  )
}

export function NewCategoryForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createCategory.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message)
    else if (!state.ok) toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-1.5">
        <Label htmlFor="cat-name">Nombre</Label>
        <Input
          id="cat-name"
          name="name"
          required
          maxLength={60}
          placeholder="Tragos, Comida, ..."
        />
      </div>
      <div className="self-end">
        <SubmitBtn />
      </div>
    </form>
  )
}
