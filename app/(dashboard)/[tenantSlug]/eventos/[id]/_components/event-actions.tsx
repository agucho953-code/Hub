'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cancelEvent, finishEvent, publishEvent } from '@/lib/events/actions'
import type { EventStatus } from '@/types/database'

export function EventActions({
  tenantSlug,
  event,
}: {
  tenantSlug: string
  event: { id: string; status: EventStatus }
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const onPublish = () => {
    start(async () => {
      const r = await publishEvent(tenantSlug, event.id)
      if (r.ok) {
        toast.success(r.message ?? 'Publicado')
        router.refresh()
      } else toast.error(r.message)
    })
  }

  const onFinish = () => {
    start(async () => {
      const r = await finishEvent(tenantSlug, event.id)
      if (r.ok) {
        toast.success(r.message ?? 'Finalizado')
        router.refresh()
      } else toast.error(r.message)
    })
  }

  const onCancel = () => {
    start(async () => {
      const r = await cancelEvent(tenantSlug, event.id)
      if (r.ok) {
        toast.success(r.message ?? 'Cancelado')
        setConfirmCancel(false)
        router.refresh()
      } else toast.error(r.message)
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        {event.status === 'draft' ? (
          <Button onClick={onPublish} disabled={pending}>
            {pending ? '…' : 'Publicar'}
          </Button>
        ) : null}
        {event.status === 'published' ? (
          <Button variant="outline" onClick={onFinish} disabled={pending}>
            Finalizar
          </Button>
        ) : null}
        {event.status === 'draft' || event.status === 'published' ? (
          <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={pending}>
                Cancelar evento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar el evento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todas las reservas confirmadas y en waitlist quedarán como canceladas. Avisá a los
                  clientes manualmente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
                <AlertDialogAction onClick={onCancel} disabled={pending}>
                  Sí, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </CardContent>
    </Card>
  )
}
