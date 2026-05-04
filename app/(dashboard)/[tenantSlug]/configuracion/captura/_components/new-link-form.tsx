'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCaptureLink, type LinkActionState } from '@/lib/capture/actions'

const initial: LinkActionState = { ok: true }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creando…' : 'Crear link'}
    </Button>
  )
}

export function NewLinkForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createCaptureLink.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message)
    else if (!state.ok) toast.error(state.message)
  }, [state])

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="grid gap-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          minLength={4}
          maxLength={32}
          pattern="[a-zA-Z0-9_\-]+"
          placeholder="mesa-1, barra, jueves-trivia"
          autoComplete="off"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="label">Etiqueta interna</Label>
        <Input
          id="label"
          name="label"
          required
          maxLength={60}
          placeholder="QR Mesa 1"
          autoComplete="off"
        />
      </div>
      <div className="self-end">
        <SubmitButton />
      </div>
    </form>
  )
}
