import { redirect } from 'next/navigation'
import { getMembershipsForUser } from '@/lib/tenant'
import { OnboardingForm } from './onboarding-form'

export const metadata = {
  title: 'Crear bar — HUB',
}

export default async function OnboardingPage() {
  const memberships = await getMembershipsForUser()
  if (memberships.length > 0) {
    redirect(`/${memberships[0]?.tenant.slug}`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <OnboardingForm />
    </main>
  )
}
