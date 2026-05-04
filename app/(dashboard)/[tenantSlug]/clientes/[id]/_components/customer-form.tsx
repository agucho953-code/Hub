'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { type CustomerActionState, updateCustomer } from '@/lib/customers/actions'

const initial: CustomerActionState = { ok: true }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </Button>
  )
}

type CustomerFormData = {
  id: string
  first_name: string
  last_name: string
  phone: string
  notes: string | null
  birthdate: string | null
  opt_in_marketing: boolean
}

export function CustomerForm({
  tenantSlug,
  customer,
}: {
  tenantSlug: string
  customer: CustomerFormData
}) {
  const action = updateCustomer.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={customer.id} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={customer.first_name}
            required
            maxLength={60}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={customer.last_name}
            required
            maxLength={60}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={customer.phone}
            required
            autoComplete="off"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="birthdate">Cumpleaños</Label>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            defaultValue={customer.birthdate ?? ''}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notas internas</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={customer.notes ?? ''}
          maxLength={500}
          placeholder="Preferencias, alergias, observaciones…"
        />
      </div>

      <Label className="flex items-start gap-2 rounded-md border p-3">
        <Checkbox
          name="opt_in_marketing"
          id="opt_in_marketing"
          defaultChecked={customer.opt_in_marketing}
        />
        <span className="text-sm leading-snug">Acepta recibir promociones por WhatsApp/email.</span>
      </Label>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
