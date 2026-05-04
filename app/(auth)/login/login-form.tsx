'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type LoginState, sendMagicLink } from './actions'

const initialState: LoginState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando…' : 'Mandame el enlace'}
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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Ingresar a HUB</CardTitle>
        <CardDescription>Te mandamos un enlace mágico por email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={initialEmail}
              placeholder="vos@bar.com"
            />
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
