import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export const metadata = { title: 'Equipo — HUB' }

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
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Equipo</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invitar miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteForm tenantSlug={tenantSlug} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miembros ({members?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {(members ?? []).map((m: MembershipRow) => (
              <MemberRow key={m.id} member={m} tenantSlug={tenantSlug} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitaciones pendientes ({invitations?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {(invitations ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay invitaciones pendientes.</p>
            ) : (
              (invitations ?? []).map((inv: InvitationRowData) => (
                <InvitationRow key={inv.id} invitation={inv} tenantSlug={tenantSlug} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
