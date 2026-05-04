'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const tokenSchema = z.string().uuid()

export type AcceptResult =
  | { ok: true; redirectTo: string }
  | {
      ok: false
      code: 'unauthenticated' | 'email_mismatch' | 'expired' | 'unknown'
      message: string
    }

export async function acceptInvitation(token: string): Promise<AcceptResult> {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) {
    return { ok: false, code: 'unknown', message: 'Token inválido.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, code: 'unauthenticated', message: 'Necesitás iniciar sesión.' }
  }

  const { data, error } = await supabase.rpc('accept_invitation', { p_token: parsed.data })
  if (error) {
    if (error.message.includes('email_mismatch')) {
      return {
        ok: false,
        code: 'email_mismatch',
        message: 'El email de tu cuenta no coincide con el de la invitación.',
      }
    }
    if (error.message.includes('invalid_or_expired_token')) {
      return { ok: false, code: 'expired', message: 'La invitación expiró o ya fue usada.' }
    }
    return { ok: false, code: 'unknown', message: 'No pudimos aceptar la invitación.' }
  }

  await supabase.auth.refreshSession()

  // Resolver slug del tenant para redirigir
  const tenantId = (data as { tenant_id?: string } | null)?.tenant_id
  let slug = ''
  if (tenantId) {
    const { data: t } = await supabase
      .from('tenants')
      .select('slug')
      .eq('id', tenantId)
      .maybeSingle()
    slug = t?.slug ?? ''
  }

  return { ok: true, redirectTo: slug ? `/${slug}` : '/' }
}
