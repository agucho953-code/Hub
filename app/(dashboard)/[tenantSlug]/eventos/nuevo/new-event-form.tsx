'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEvent, type EventActionState } from '@/lib/events/actions'

const initial: EventActionState = { ok: true }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creando…' : 'Crear evento'}
    </Button>
  )
}

export function NewEventForm({ tenantSlug }: { tenantSlug: string }) {
  const action = createEvent.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)
  const router = useRouter()

  useEffect(() => {
    if (state.ok && state.eventId) {
      toast.success(state.message ?? 'Evento creado.')
      router.push(`/${tenantSlug}/eventos/${state.eventId}`)
    } else if (!state.ok) {
      toast.error(state.message)
    }
  }, [state, router, tenantSlug])

  return (
    <form action={formAction} encType="multipart/form-data" className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required maxLength={120} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" maxLength={2000} rows={3} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="starts_at">Inicio</Label>
          <Input id="starts_at" name="starts_at" type="datetime-local" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ends_at">Fin</Label>
          <Input id="ends_at" name="ends_at" type="datetime-local" required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="capacity">Capacidad</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            placeholder="Vacío = ilimitado"
          />
        </div>
        <Label className="flex items-center gap-2 self-end rounded-md border p-3">
          <Checkbox name="waitlist_enabled" defaultChecked />
          <span className="text-sm">Habilitar lista de espera</span>
        </Label>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cover_image">Imagen de portada (opcional)</Label>
        <Input id="cover_image" name="cover_image" type="file" accept="image/*" />
      </div>

      <div className="flex justify-end">
        <SubmitBtn />
      </div>
    </form>
  )
}
