import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Forzamos refresh para que el custom_access_token_hook
      // inyecte el active_tenant_id en el JWT antes de la 1ra página.
      await supabase.auth.refreshSession()
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth.callback] exchange failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=callback`)
}
