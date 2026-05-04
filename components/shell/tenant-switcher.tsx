'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  current: Pick<Tenant, 'id' | 'name' | 'slug' | 'logo_url'>
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

  if (memberships.length <= 1) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-2.5 py-2">
        <Avatar className="size-7">
          {current.logo_url ? <AvatarImage src={current.logo_url} alt={current.name} /> : null}
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {current.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{current.name}</p>
          <p className="truncate font-mono text-[10px] leading-tight text-muted-foreground">
            /{current.slug}
          </p>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isPending}
          className="h-auto w-full justify-between gap-2 rounded-lg border-border/60 bg-card/40 px-2.5 py-2 hover:bg-card"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="size-7">
              {current.logo_url ? <AvatarImage src={current.logo_url} alt={current.name} /> : null}
              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                {current.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium leading-tight">{current.name}</p>
              <p className="truncate font-mono text-[10px] leading-tight text-muted-foreground">
                /{current.slug}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tus bares
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map(({ tenant, role }) => (
          <DropdownMenuItem
            key={tenant.id}
            onSelect={() => handleSelect(tenant.id, tenant.slug)}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="size-6">
                {tenant.logo_url ? <AvatarImage src={tenant.logo_url} alt={tenant.name} /> : null}
                <AvatarFallback className="text-[10px] font-semibold">
                  {tenant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm leading-tight">{tenant.name}</p>
                <p className="truncate text-[10px] capitalize leading-tight text-muted-foreground">
                  {role}
                </p>
              </div>
            </div>
            {tenant.id === current.id ? <Check className="size-4 shrink-0 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
