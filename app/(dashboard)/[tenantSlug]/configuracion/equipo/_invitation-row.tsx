'use client'

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
    <div className="flex items-center justify-between py-3 text-sm">
      <div className="flex flex-col">
        <span className="font-medium">{invitation.email}</span>
        <span className="text-xs text-muted-foreground">
          Expira {new Date(invitation.expires_at).toLocaleDateString('es-AR')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={expired ? 'destructive' : 'secondary'} className="capitalize">
          {invitation.role}
        </Badge>
        <Button variant="ghost" size="sm" disabled={isPending} onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
