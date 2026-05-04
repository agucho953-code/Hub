'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type CustomerActionState, createCustomer } from '@/lib/customers/actions'

const initial: CustomerActionState = { ok: true }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Guardando…' : 'Crear cliente'}
    </Button>
  )
}

export function NewCustomerForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createCustomer.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.ok && state.customerId) {
      toast.success(state.message ?? 'Cliente creado.')
      router.push(`/${tenantSlug}/clientes/${state.customerId}`)
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state, router, tenantSlug])

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+54 9 351 555 1234"
          autoComplete="off"
          aria-invalid={state.ok ? undefined : Boolean(state.fieldErrors?.phone)}
        />
        <p className="text-xs text-muted-foreground">
          Lo normalizamos automáticamente. Aceptamos formatos con o sin código país.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" required maxLength={60} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Apellido</Label>
          <Input id="last_name" name="last_name" required maxLength={60} />
        </div>
      </div>

      <Label className="flex items-start gap-2 rounded-md border p-3">
        <Checkbox name="opt_in_marketing" id="opt_in_marketing" />
        <span className="text-sm leading-snug">
          El cliente acepta recibir mensajes promocionales por WhatsApp y email.
          <span className="block text-xs text-muted-foreground">
            Solo marcá esto si te lo confirmó verbalmente o por escrito.
          </span>
        </span>
      </Label>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
