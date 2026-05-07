'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'
import { sendEmail } from '@/lib/email/send'
import { renderInvitationEmail } from '@/lib/email/templates/invitation'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
  UnauthenticatedError,
} from '@/lib/tenant'
import { TENANT_ROLES, type TenantRole } from '@/lib/tenant/types'

const inviteSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  role: z.enum(TENANT_ROLES as [TenantRole, ...TenantRole[]]),
})

const idSchema = z.object({ id: z.string().uuid() })
const updateRoleSchema = idSchema.extend({
  role: z.enum(TENANT_ROLES as [TenantRole, ...TenantRole[]]),
})

export type ActionState =
  | {
      ok: true
      message?: string
      inviteLink?: string
      emailSent?: boolean
      emailError?: string
    }
  | { ok: false; message: string }

async function authorizeOwner(slug: string) {
  try {
    const { tenant, role } = await requireTenantAccess(slug)
    requireRole(role, ['owner'])
    return tenant
  } catch (error) {
    if (
      error instanceof RoleRequiredError ||
      error instanceof TenantNotFoundError ||
      error instanceof UnauthenticatedError
    ) {
      return null
    }
    throw error
  }
}

export async function inviteMember(
  slug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const tenant = await authorizeOwner(slug)
  if (!tenant) return { ok: false, message: 'No tenés permiso.' }

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { ok: false, message: 'No autenticado.' }

  // Si ya existe pendiente, regenerar token (UPSERT manual: delete+insert)
  await supabase
    .from('invitations')
    .delete()
    .eq('tenant_id', tenant.id)
    .eq('email', parsed.data.email)
    .is('accepted_at', null)

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      tenant_id: tenant.id,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: user.user.id,
    })
    .select('token')
    .single()

  if (error || !invitation) {
    return { ok: false, message: 'No pudimos crear la invitación.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteLink = `${appUrl}/accept-invite/${invitation.token}`

  // Mandar email — si falla por config faltante o error de provider, no
  // abortamos: la invitación queda creada y el owner ve el link manual.
  const inviterName = user.user.user_metadata?.full_name ?? user.user.email ?? null
  const { subject, html, text } = renderInvitationEmail({
    to: parsed.data.email,
    tenantName: tenant.name,
    inviterName,
    role: parsed.data.role,
    acceptUrl: inviteLink,
  })
  const emailResult = await sendEmail({
    to: parsed.data.email,
    subject,
    html,
    text,
    tag: 'team_invitation',
  })

  if (!emailResult.ok) {
    console.warn('[invite] email no enviado:', emailResult.reason, emailResult.error)
  }

  await logAudit({
    tenantId: tenant.id,
    userId: user.user.id,
    action: 'invitation.created',
    entity: 'invitation',
    payload: {
      email: parsed.data.email,
      role: parsed.data.role,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : emailResult.reason,
    },
  })

  revalidatePath(`/${slug}/configuracion/equipo`)
  return {
    ok: true,
    message: emailResult.ok
      ? `Invitación enviada por email a ${parsed.data.email}.`
      : 'Invitación generada — copiá el link manualmente (el email no se pudo enviar).',
    inviteLink,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.reason,
  }
}

export async function cancelInvitation(slug: string, invitationId: string): Promise<ActionState> {
  const tenant = await authorizeOwner(slug)
  if (!tenant) return { ok: false, message: 'No tenés permiso.' }

  const parsed = idSchema.safeParse({ id: invitationId })
  if (!parsed.success) return { ok: false, message: 'Inválido.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', parsed.data.id)
    .eq('tenant_id', tenant.id)

  if (error) return { ok: false, message: 'No pudimos cancelar.' }

  await logAudit({
    tenantId: tenant.id,
    userId: (await supabase.auth.getUser()).data.user?.id ?? null,
    action: 'invitation.cancelled',
    entity: 'invitation',
    entityId: parsed.data.id,
  })

  revalidatePath(`/${slug}/configuracion/equipo`)
  return { ok: true }
}

export async function updateMemberRole(
  slug: string,
  membershipId: string,
  role: TenantRole,
): Promise<ActionState> {
  const tenant = await authorizeOwner(slug)
  if (!tenant) return { ok: false, message: 'No tenés permiso.' }

  const parsed = updateRoleSchema.safeParse({ id: membershipId, role })
  if (!parsed.success) return { ok: false, message: 'Datos inválidos.' }

  const supabase = await createClient()
  const { data: me } = await supabase.auth.getUser()

  // No permitir auto-degradar el último owner
  if (parsed.data.role !== 'owner') {
    const { data: target } = await supabase
      .from('memberships')
      .select('user_id, role')
      .eq('id', parsed.data.id)
      .eq('tenant_id', tenant.id)
      .maybeSingle()
    if (target?.role === 'owner') {
      const { count } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .eq('role', 'owner')
      if ((count ?? 0) <= 1) {
        return { ok: false, message: 'No podés dejar al bar sin owners.' }
      }
    }
  }

  const { error } = await supabase
    .from('memberships')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.id)
    .eq('tenant_id', tenant.id)

  if (error) return { ok: false, message: 'No pudimos actualizar.' }

  await logAudit({
    tenantId: tenant.id,
    userId: me.user?.id ?? null,
    action: 'membership.role_updated',
    entity: 'membership',
    entityId: parsed.data.id,
    payload: { role: parsed.data.role },
  })

  revalidatePath(`/${slug}/configuracion/equipo`)
  return { ok: true }
}

export async function removeMember(slug: string, membershipId: string): Promise<ActionState> {
  const tenant = await authorizeOwner(slug)
  if (!tenant) return { ok: false, message: 'No tenés permiso.' }

  const parsed = idSchema.safeParse({ id: membershipId })
  if (!parsed.success) return { ok: false, message: 'Inválido.' }

  const supabase = await createClient()
  const { data: me } = await supabase.auth.getUser()

  const { data: target } = await supabase
    .from('memberships')
    .select('user_id, role')
    .eq('id', parsed.data.id)
    .eq('tenant_id', tenant.id)
    .maybeSingle()

  if (!target) return { ok: false, message: 'No existe.' }
  if (target.user_id === me.user?.id) {
    return { ok: false, message: 'No te podés remover a vos mismo.' }
  }
  if (target.role === 'owner') {
    const { count } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('role', 'owner')
    if ((count ?? 0) <= 1) {
      return { ok: false, message: 'No podés dejar al bar sin owners.' }
    }
  }

  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('id', parsed.data.id)
    .eq('tenant_id', tenant.id)

  if (error) return { ok: false, message: 'No pudimos remover.' }

  await logAudit({
    tenantId: tenant.id,
    userId: me.user?.id ?? null,
    action: 'membership.removed',
    entity: 'membership',
    entityId: parsed.data.id,
  })

  revalidatePath(`/${slug}/configuracion/equipo`)
  return { ok: true }
}
