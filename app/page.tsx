import { redirect } from 'next/navigation'
import { getActiveTenant, getMembershipsForUser } from '@/lib/tenant'

export default async function HomePage() {
  const memberships = await getMembershipsForUser()

  if (memberships.length === 0) {
    redirect('/onboarding')
  }

  const active = await getActiveTenant()
  const targetSlug = active?.tenant.slug ?? memberships[0]?.tenant.slug
  if (!targetSlug) redirect('/onboarding')
  redirect(`/${targetSlug}`)
}
