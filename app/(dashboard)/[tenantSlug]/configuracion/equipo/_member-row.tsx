'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TenantRole } from '@/lib/tenant/types'
import { removeMember, updateMemberRole } from './actions'

export function MemberRow({
  member,
  tenantSlug,
}: {
  member: { id: string; role: TenantRole; user_id: string; created_at: string }
  tenantSlug: string
}) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<TenantRole>(member.role)
  const [open, setOpen] = useState(false)

  const handleRoleChange = (next: string) => {
    const nextRole = next as TenantRole
    setRole(nextRole)
    startTransition(async () => {
      const r = await updateMemberRole(tenantSlug, member.id, nextRole)
      if (!r.ok) {
        toast.error(r.message)
        setRole(member.role)
      } else {
        toast.success('Rol actualizado.')
      }
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      const r = await removeMember(tenantSlug, member.id)
      if (!r.ok) toast.error(r.message)
      else {
        toast.success('Miembro removido.')
        setOpen(false)
      }
    })
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-sm">
        <code className="text-xs text-muted-foreground">{member.user_id.slice(0, 8)}…</code>
      </div>
      <div className="flex items-center gap-2">
        <Select value={role} onValueChange={handleRoleChange} disabled={isPending}>
          <SelectTrigger className="w-32" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="cashier">Cajero</SelectItem>
            <SelectItem value="waiter">Mozo</SelectItem>
          </SelectContent>
        </Select>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              Remover
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover miembro</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El miembro pierde acceso al bar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove} disabled={isPending}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
