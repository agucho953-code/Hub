import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'
import { NewCustomerForm } from './new-customer-form'

export const metadata = { title: 'Nuevo cliente — HUB' }

export default async function NuevoClientePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  try {
    await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nuevo cliente</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${tenantSlug}/clientes`}>Volver</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos básicos</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCustomerForm tenantSlug={tenantSlug} />
        </CardContent>
      </Card>
    </main>
  )
}
