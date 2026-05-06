'use server'

import type { z } from 'zod'
import { getRequestIp, getRequestUserAgent } from '@/lib/ip'
import { RateLimitedError, rateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { joinSessionSchema, registerCustomerSchema } from './schemas'

export type JoinSessionResult =
  | { ok: true; sessionId: string; guestId: string; wasNewGuest: boolean }
  | { ok: false; message: string }

export type RegisterCustomerResult =
  | { ok: true; customerId: string; wasNewCustomer: boolean }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

function flattenIssues(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function joinSession(params: {
  qrToken: string
  browserToken: string
  displayName?: string | null
}): Promise<JoinSessionResult> {
  const ip = await getRequestIp()
  try {
    rateLimit({ key: `m-join:${ip}`, limit: 30, windowMs: 60_000 })
  } catch (e) {
    if (e instanceof RateLimitedError) {
      return { ok: false, message: 'Esperá un minuto antes de reintentar.' }
    }
    throw e
  }

  const parsed = joinSessionSchema.safeParse({
    qr_token: params.qrToken,
    browser_token: params.browserToken,
    display_name: params.displayName ?? null,
  })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('join_session_as_guest', {
    p_qr_token: parsed.data.qr_token,
    p_browser_token: parsed.data.browser_token,
    p_display_name: parsed.data.display_name,
  })

  if (error) {
    if (error.message.includes('invalid_qr_token')) {
      return { ok: false, message: 'El QR no es válido o la mesa no está activa.' }
    }
    console.error('[m-session.joinSession]', error.message)
    return { ok: false, message: 'No pudimos unirte a la mesa.' }
  }

  const result = data as {
    session_id: string
    guest_id: string
    was_new_guest: boolean
  }
  return {
    ok: true,
    sessionId: result.session_id,
    guestId: result.guest_id,
    wasNewGuest: result.was_new_guest,
  }
}

export async function registerCustomer(formData: FormData): Promise<RegisterCustomerResult> {
  const ip = await getRequestIp()
  const userAgent = await getRequestUserAgent()

  try {
    rateLimit({ key: `m-register:${ip}`, limit: 10, windowMs: 60_000 })
  } catch (e) {
    if (e instanceof RateLimitedError) {
      return { ok: false, message: 'Esperá un minuto antes de reintentar.' }
    }
    throw e
  }

  const parsed = registerCustomerSchema.safeParse({
    qr_token: formData.get('qr_token'),
    browser_token: formData.get('browser_token'),
    phone: formData.get('phone'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    birthdate: formData.get('birthdate') ?? '',
    opt_in_marketing: formData.get('opt_in_marketing') === 'on',
    website: formData.get('website') ?? '',
  })
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      fieldErrors: flattenIssues(parsed.error),
    }
  }

  // Honeypot anti-bot
  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: false, message: 'Solicitud rechazada' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('register_customer_for_session', {
    p_qr_token: parsed.data.qr_token,
    p_browser_token: parsed.data.browser_token,
    p_phone: parsed.data.phone,
    p_first_name: parsed.data.first_name,
    p_last_name: parsed.data.last_name,
    p_birthdate: parsed.data.birthdate ?? null,
    p_opt_in_marketing: parsed.data.opt_in_marketing,
    p_ip: ip,
    p_user_agent: userAgent ?? '',
  })

  if (error) {
    if (error.message.includes('no_active_session')) {
      return { ok: false, message: 'No hay una mesa activa para este QR.' }
    }
    if (error.message.includes('guest_not_found')) {
      return { ok: false, message: 'Volvé a escanear el QR.' }
    }
    if (error.message.includes('invalid_phone')) {
      return { ok: false, message: 'Teléfono inválido' }
    }
    console.error('[m-session.registerCustomer]', error.message)
    return { ok: false, message: 'No pudimos guardar tus datos.' }
  }

  const result = data as { customer_id: string; was_new_customer: boolean }
  return {
    ok: true,
    customerId: result.customer_id,
    wasNewCustomer: result.was_new_customer,
  }
}
