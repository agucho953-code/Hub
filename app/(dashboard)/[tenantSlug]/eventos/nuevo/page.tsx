import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { NewEventForm } from './new-event-form'

export const metadata = { title: 'Nuevo evento — HUB' }

export default async function NuevoEventoPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (e) {
    if (e instanceof TenantNotFoundError) notFound()
    if (e instanceof RoleRequiredError) notFound()
    throw e
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nuevo evento</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${tenantSlug}/eventos`}>Volver</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos del evento</CardTitle>
        </CardHeader>
        <CardContent>
          <NewEventForm tenantSlug={tenantSlug} />
        </CardContent>
      </Card>
    </main>
  )
}
