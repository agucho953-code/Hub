'use client'

import { Mail } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TenantRole } from '@/lib/tenant/types'
import { cancelInvitation } from './actions'

export function InvitationRow({
  invitation,
  tenantSlug,
}: {
  invitation: {
    id: string
    email: string
    role: TenantRole
    expires_at: string
    created_at: string
  }
  tenantSlug: string
}) {
  const [isPending, startTransition] = useTransition()
  const expired = new Date(invitation.expires_at) <= new Date()

  const handleCancel = () => {
    startTransition(async () => {
      const r = await cancelInvitation(tenantSlug, invitation.id)
      if (!r.ok) toast.error(r.message)
      else toast.success('Invitación cancelada.')
    })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        <Mail className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invitation.email}</p>
        <p className="text-[11px] text-muted-foreground">
          Expira {new Date(invitation.expires_at).toLocaleDateString('es-AR')}
          {expired ? ' · vencida' : ''}
        </p>
      </div>
      <Badge variant={expired ? 'destructive' : 'outline'} className="capitalize">
        {invitation.role}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleCancel}
        className="text-muted-foreground hover:text-destructive"
      >
        Cancelar
      </Button>
    </div>
  )
}
