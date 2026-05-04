'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email('Email inválido'),
  redirectTo: z.string().optional(),
})

export type LoginState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    redirectTo: formData.get('redirectTo') ?? undefined,
  })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Email inválido' }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const callback = new URL('/auth/callback', appUrl)
  if (parsed.data.redirectTo) callback.searchParams.set('next', parsed.data.redirectTo)

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callback.toString(),
    },
  })

  if (error) {
    const status = (error as { status?: number }).status
    const code = (error as { code?: string }).code
    if (status === 429 || code === 'over_email_send_rate_limit') {
      return {
        status: 'error',
        message:
          'Alcanzaste el límite de envíos de email del servidor SMTP por defecto. Esperá unos minutos antes de pedir otro enlace, o configurá un SMTP propio en Supabase Auth → Email.',
      }
    }
    console.error('[login.sendMagicLink]', { status, code, message: error.message })
    return { status: 'error', message: 'No pudimos enviar el enlace. Probá de nuevo en un rato.' }
  }

  return { status: 'success', message: 'Te mandamos un enlace por email.' }
}
