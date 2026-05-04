'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPerAmountRule, type LoyaltyActionState } from '@/lib/points/actions'

const initial: LoyaltyActionState = { ok: true }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? 'Creando…' : 'Crear regla'}
    </Button>
  )
}

export function NewPerAmountForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createPerAmountRule.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message)
    else if (!state.ok) toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="rounded-md border p-3">
      <p className="mb-2 text-sm font-medium">Por monto gastado</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1">
          <Label htmlFor="every-cents" className="text-xs">
            Cada (centavos)
          </Label>
          <Input
            id="every-cents"
            name="every_cents"
            type="number"
            min={1}
            required
            placeholder="100000"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="points" className="text-xs">
            Otorgar puntos
          </Label>
          <Input id="points" name="points" type="number" min={1} required placeholder="10" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="priority" className="text-xs">
            Prioridad
          </Label>
          <Input id="priority" name="priority" type="number" defaultValue={0} />
        </div>
        <div>
          <input type="hidden" name="active" value="true" />
          <SubmitBtn />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Ejemplo: cada $1.000 (= 100.000 ¢) → 10 puntos.
      </p>
    </form>
  )
}
