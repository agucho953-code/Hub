import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { listCaptureLinks } from '@/lib/customers/queries'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { LinkRow } from './_components/link-row'
import { NewLinkForm } from './_components/new-link-form'

export const metadata = { title: 'Captura — HUB' }

export default async function CapturaConfigPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const links = await listCaptureLinks({ tenantId: access.tenant.id })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Captura de clientes</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo link</CardTitle>
          </CardHeader>
          <CardContent>
            <NewLinkForm tenantSlug={tenantSlug} />
            <p className="mt-3 text-xs text-muted-foreground">
              Cada link genera un QR único. Imprimilo y ponelo en mesas, barra o stickers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links de captura ({links.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no creaste ningún link.</p>
            ) : (
              links.map((link) => (
                <LinkRow key={link.id} link={link} tenantSlug={tenantSlug} appUrl={appUrl} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
