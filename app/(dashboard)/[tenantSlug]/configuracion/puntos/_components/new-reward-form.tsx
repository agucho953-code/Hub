'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createReward, type LoyaltyActionState } from '@/lib/points/actions'

const initial: LoyaltyActionState = { ok: true }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? 'Creando…' : 'Crear recompensa'}
    </Button>
  )
}

export function NewRewardForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createReward.bind(null, tenantSlug)
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
    <form ref={formRef} action={formAction} className="grid gap-2 rounded-md border p-3">
      <div className="grid gap-1.5">
        <Label htmlFor="rw-name" className="text-xs">
          Nombre
        </Label>
        <Input id="rw-name" name="name" required maxLength={80} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="rw-desc" className="text-xs">
          Descripción
        </Label>
        <Textarea id="rw-desc" name="description" maxLength={300} />
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="rw-cost" className="text-xs">
            Costo (puntos)
          </Label>
          <Input id="rw-cost" name="cost_points" type="number" min={1} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="rw-stock" className="text-xs">
            Stock
          </Label>
          <Input id="rw-stock" name="stock" type="number" min={0} placeholder="Vacío = ilimitado" />
        </div>
        <div>
          <SubmitBtn />
        </div>
      </div>
    </form>
  )
}
