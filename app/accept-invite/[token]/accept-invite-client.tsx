'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { acceptInvitation } from './actions'

type Preview = {
  email: string
  role: string
  tenant_name: string
}

export function AcceptInviteClient({
  token,
  preview,
  currentEmail,
}: {
  token: string
  preview: Preview
  currentEmail: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const emailMatches = currentEmail?.toLowerCase() === preview.email.toLowerCase()

  const handleAccept = () => {
    startTransition(async () => {
      const r = await acceptInvitation(token)
      if (!r.ok) {
        toast.error(r.message)
        return
      }
      router.replace(r.redirectTo)
    })
  }

  if (!currentEmail) {
    const loginHref = `/login?email=${encodeURIComponent(preview.email)}&redirectTo=${encodeURIComponent(`/accept-invite/${token}`)}`
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-muted-foreground">
          Iniciá sesión con <strong>{preview.email}</strong> para aceptar.
        </p>
        <Button asChild>
          <a href={loginHref}>Ir a iniciar sesión</a>
        </Button>
      </div>
    )
  }

  if (!emailMatches) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-destructive">
          Estás logueado como <strong>{currentEmail}</strong>, pero la invitación es para{' '}
          <strong>{preview.email}</strong>.
        </p>
        <Button variant="outline" asChild>
          <a href="/login">Cambiar de cuenta</a>
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleAccept} disabled={isPending} className="w-full">
      {isPending ? 'Aceptando…' : `Aceptar y entrar a ${preview.tenant_name}`}
    </Button>
  )
}
