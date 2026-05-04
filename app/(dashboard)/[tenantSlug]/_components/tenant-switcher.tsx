'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setActiveTenant } from '@/lib/tenant/actions'
import type { MembershipWithTenant, Tenant } from '@/lib/tenant/types'

export function TenantSwitcher({
  current,
  memberships,
}: {
  current: Pick<Tenant, 'id' | 'name' | 'slug'>
  memberships: MembershipWithTenant[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSelect = (tenantId: string, slug: string) => {
    if (tenantId === current.id) return
    startTransition(async () => {
      const result = await setActiveTenant(tenantId)
      if (!result.ok) {
        toast.error('No pudimos cambiar de bar.')
        return
      }
      router.push(`/${slug}`)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending} className="gap-2">
          Cambiar bar
          <ChevronsUpDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Tus bares</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map(({ tenant }) => (
          <DropdownMenuItem
            key={tenant.id}
            onSelect={() => handleSelect(tenant.id, tenant.slug)}
            className="flex items-center justify-between"
          >
            <span>{tenant.name}</span>
            {tenant.id === current.id ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
