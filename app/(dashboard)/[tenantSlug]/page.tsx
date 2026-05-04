import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requireTenantAccess } from '@/lib/tenant'

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>
}) {
  const { tenantSlug } = await params
  const { tenant, role } = await requireTenantAccess(tenantSlug)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">{tenant.name}</h1>
        <p className="text-sm text-muted-foreground">
          Tu rol: <span className="font-medium">{role}</span>
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Acá vas a ver el resumen del bar: ventas del día, clientes activos, próximos eventos.
        </CardContent>
      </Card>
    </main>
  )
}
