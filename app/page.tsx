import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveTenant, getMembershipsForUser } from '@/lib/tenant'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getMembershipsForUser()
  if (memberships.length === 0) redirect('/onboarding')

  const active = await getActiveTenant()
  const targetSlug = active?.tenant.slug ?? memberships[0]?.tenant.slug
  if (!targetSlug) redirect('/onboarding')
  redirect(`/${targetSlug}`)
}
