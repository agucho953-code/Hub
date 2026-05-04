'use client'

import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { BrandMark, BrandWordmark } from '@/components/shell/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type LoginState, sendMagicLink } from './actions'

const initialState: LoginState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="h-10 w-full gap-2">
      <Mail className="size-4" />
      {pending ? 'Enviando enlace…' : 'Mandame el enlace mágico'}
      {!pending ? <ArrowRight className="size-3.5" /> : null}
    </Button>
  )
}

export function LoginForm({
  initialEmail,
  redirectTo,
}: {
  initialEmail: string
  redirectTo: string
}) {
  const [state, formAction] = useActionState(sendMagicLink, initialState)

  useEffect(() => {
    if (state.status === 'success' && state.message) toast.success(state.message)
    if (state.status === 'error' && state.message) toast.error(state.message)
  }, [state])

  const sent = state.status === 'success'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2.5">
        <BrandMark className="size-9" />
        <BrandWordmark className="text-base" />
      </div>

      <div className="card-hairline relative overflow-hidden rounded-2xl border bg-card/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="space-y-1.5 text-center">
          <h1 className="font-display text-xl font-semibold tracking-tight">Ingresá a tu bar</h1>
          <p className="text-sm text-muted-foreground text-balance">
            Te mandamos un enlace mágico por email. Sin contraseñas, sin vueltas.
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={initialEmail}
              placeholder="vos@bar.com"
              className="h-10"
              disabled={sent}
            />
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton />
        </form>

        {sent ? (
          <div className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-xs text-success-foreground/90">
            Revisá tu bandeja de entrada. El enlace caduca en 60 minutos.
          </div>
        ) : null}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ¿Sin cuenta todavía?{' '}
        <Link href="/onboarding" className="font-medium text-foreground hover:underline">
          Creá tu bar
        </Link>
      </p>
    </div>
  )
}
