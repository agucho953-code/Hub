'use server'

import { revalidatePath } from 'next/cache'
import { logAudit } from '@/lib/audit'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
  UnauthenticatedError,
} from '@/lib/tenant'

export type MarkPaidResult =
  | {
      ok: true
      sessionId: string
      idempotent: boolean
      totalCents: number
      visitsCreated: number
      totalPoints: number
    }
  | { ok: false; message: string }

async function authorize(slug: string) {
  try {
    const { tenant, role } = await requireTenantAccess(slug)
    requireRole(role, ['waiter', 'cashier', 'owner'])
    return { tenant, role }
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

export async function markSessionPaid(slug: string, sessionId: string): Promise<MarkPaidResult> {
  const access = await authorize(slug)
  if (!access) return { ok: false, message: 'No tenés permiso.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'No autenticado.' }

  const { data, error } = await supabase.rpc('mark_session_paid', { p_session_id: sessionId })
  if (error) {
    if (error.message.includes('session_not_open')) {
      return { ok: false, message: 'La sesión no está abierta.' }
    }
    if (error.message.includes('session_not_found')) {
      return { ok: false, message: 'Sesión no encontrada.' }
    }
    console.error('[sessions.markPaid]', error.message)
    return { ok: false, message: 'No se pudo cobrar la mesa.' }
  }

  const result = data as {
    session_id: string
    idempotent: boolean
    total_cents: number
    visits_created: number
    total_points: number
  }

  await logAudit({
    tenantId: access.tenant.id,
    userId: user.id,
    action: 'mark_paid',
    entity: 'table_session',
    entityId: sessionId,
    payload: {
      total_cents: result.total_cents,
      visits_created: result.visits_created,
      total_points: result.total_points,
    },
  })

  revalidatePath(`/${slug}/sesiones`)
  revalidatePath(`/${slug}/sesiones/${sessionId}`)
  return {
    ok: true,
    sessionId: result.session_id,
    idempotent: result.idempotent,
    totalCents: result.total_cents,
    visitsCreated: result.visits_created,
    totalPoints: result.total_points,
  }
}
