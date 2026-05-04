'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type CaptureActionState, submitCapture } from '@/lib/capture/actions'

const initial: CaptureActionState | null = null

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? 'Enviando…' : 'Sumar puntos'}
    </Button>
  )
}

async function action(_prev: CaptureActionState | null, formData: FormData) {
  return await submitCapture(formData)
}

export function CaptureForm({ linkSlug, tenantName }: { linkSlug: string; tenantName: string }) {
  const [state, formAction] = useActionState(action, initial)

  if (state?.ok) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl">
          ✓
        </div>
        <h2 className="text-lg font-semibold">¡Listo!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {state.was_new
            ? `Te sumamos a la base de ${tenantName}. Disfrutá tu visita.`
            : `Bienvenido de vuelta a ${tenantName}. Disfrutá tu visita.`}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="link_slug" value={linkSlug} />

      {/* Honeypot anti-bot: oculto visual y a screen readers, debe quedar vacío. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <Label htmlFor="website">Website</Label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="351 555 1234"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            name="first_name"
            required
            maxLength={60}
            autoComplete="given-name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            name="last_name"
            required
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      </div>

      <Label className="flex items-start gap-2 text-sm leading-snug">
        <Checkbox name="opt_in_marketing" id="opt_in_marketing" defaultChecked className="mt-0.5" />
        <span>
          Quiero recibir promos por WhatsApp.{' '}
          <span className="text-muted-foreground">Podés darte de baja cuando quieras.</span>
        </span>
      </Label>

      {state && !state.ok ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  )
}
