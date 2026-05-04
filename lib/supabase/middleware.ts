import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseClientEnv } from '@/lib/env'

const PUBLIC_PATHS = new Set(['/login', '/auth/callback'])
const PUBLIC_PREFIXES = ['/capture/', '/api/webhooks/', '/_next/', '/auth/', '/accept-invite/']

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  if (pathname === '/favicon.ico' || pathname.startsWith('/static/')) return true
  return false
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseClientEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
