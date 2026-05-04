import { Mail, UsersRound } from 'lucide-react'
import { notFound } from 'next/navigation'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import type { TenantRole } from '@/lib/tenant/types'
import { InvitationRow } from './_invitation-row'
import { InviteForm } from './_invite-form'
import { MemberRow } from './_member-row'

export const metadata = { title: 'Equipo' }

type MembershipRow = {
  id: string
  role: TenantRole
  user_id: string
  created_at: string
}

type InvitationRowData = {
  id: string
  email: string
  role: TenantRole
  expires_at: string
  created_at: string
}

export default async function EquipoPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const supabase = await createClient()
  const { data: members } = await supabase
    .from('memberships')
    .select('id, role, user_id, created_at')
    .eq('tenant_id', access.tenant.id)
    .order('created_at', { ascending: true })

  const { data: invitations } = await supabase
    .from('invitations')
    .select('id, email, role, expires_at, created_at')
    .eq('tenant_id', access.tenant.id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Configuración"
        title="Equipo"
        description="Invitá a tu staff y asigná roles. Los cajeros y mozos ven solo lo operativo."
      />

      <div className="card-hairline rounded-xl border bg-card p-5">
        <h2 className="font-display text-sm font-semibold tracking-tight">Invitar miembro</h2>
        <p className="text-xs text-muted-foreground">
          Vamos a generarte un link único para enviárselo. El link expira en 7 días.
        </p>
        <div className="mt-4">
          <InviteForm tenantSlug={tenantSlug} />
        </div>
      </div>

      <section className="space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
            <UsersRound className="size-4 text-muted-foreground" />
            Miembros <span className="text-muted-foreground">({members?.length ?? 0})</span>
          </h2>
        </header>
        <div className="card-hairline divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
          {(members ?? []).map((m: MembershipRow) => (
            <MemberRow key={m.id} member={m} tenantSlug={tenantSlug} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
            <Mail className="size-4 text-muted-foreground" />
            Invitaciones pendientes{' '}
            <span className="text-muted-foreground">({invitations?.length ?? 0})</span>
          </h2>
        </header>
        {(invitations ?? []).length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Sin invitaciones pendientes"
            description="Cuando invites a alguien, va a aparecer acá hasta que acepte."
          />
        ) : (
          <div className="card-hairline divide-y divide-border/60 overflow-hidden rounded-xl border bg-card">
            {(invitations ?? []).map((inv: InvitationRowData) => (
              <InvitationRow key={inv.id} invitation={inv} tenantSlug={tenantSlug} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
