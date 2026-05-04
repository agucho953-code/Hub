'use client'

import { ArrowRight, LogIn } from 'lucide-react'
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
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-pretty">
          Necesitás iniciar sesión con{' '}
          <strong className="font-mono text-foreground">{preview.email}</strong> para aceptar.
        </p>
        <Button asChild className="w-full gap-2" size="lg">
          <a href={loginHref}>
            <LogIn className="size-4" />
            Iniciar sesión
          </a>
        </Button>
      </div>
    )
  }

  if (!emailMatches) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive text-pretty">
          Estás logueado como <strong className="font-mono">{currentEmail}</strong>, pero la
          invitación es para <strong className="font-mono">{preview.email}</strong>.
        </div>
        <Button variant="outline" asChild className="w-full">
          <a href="/login">Cambiar de cuenta</a>
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleAccept} disabled={isPending} className="w-full gap-2" size="lg">
      {isPending ? 'Aceptando…' : `Entrar a ${preview.tenant_name}`}
      {!isPending ? <ArrowRight className="size-4" /> : null}
    </Button>
  )
}
