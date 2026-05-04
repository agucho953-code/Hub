'use client'

import { Send } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ActionState, inviteMember } from './actions'

const initial: ActionState = { ok: true }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-1.5">
      <Send className="size-3.5" />
      {pending ? 'Generando…' : 'Invitar'}
    </Button>
  )
}

export function InviteForm({ tenantSlug }: { tenantSlug: string }) {
  const action = inviteMember.bind(null, tenantSlug)
  const [state, formAction] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.inviteLink) {
      navigator.clipboard?.writeText(state.inviteLink).catch(() => {})
      toast.success('Link copiado al portapapeles.', {
        description: state.inviteLink,
      })
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          placeholder="staff@bar.com"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="role">Rol</Label>
        <Select name="role" defaultValue="cashier">
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="cashier">Cajero</SelectItem>
            <SelectItem value="waiter">Mozo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SubmitButton />
    </form>
  )
}
