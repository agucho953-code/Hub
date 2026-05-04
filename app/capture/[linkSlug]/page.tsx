import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { CaptureForm } from './capture-form'

export const metadata = { title: 'Cargar mis datos' }

export default async function CapturePage({ params }: { params: Promise<{ linkSlug: string }> }) {
  const { linkSlug } = await params

  // Cliente anon (sin sesión): RLS permite SELECT cuando active = true.
  const supabase = await createClient()
  const { data: link } = await supabase
    .from('customer_capture_links')
    .select('id, slug, label, tenant_id')
    .eq('slug', linkSlug)
    .eq('active', true)
    .maybeSingle()

  if (!link) notFound()

  // Resolvemos el nombre del bar via service client (anon no ve `tenants`
  // porque RLS exige membership). Esto es lectura pública mínima del nombre.
  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()
  const { data: tenant } = await service
    .from('tenants')
    .select('name')
    .eq('id', link.tenant_id)
    .maybeSingle()

  const tenantName = tenant?.name ?? 'el bar'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Bienvenido a {tenantName}</h1>
          <p className="text-sm text-muted-foreground">
            Cargá tus datos para sumar puntos en tu próxima visita.
          </p>
        </div>
        <Card>
          <CardContent className="py-6">
            <CaptureForm linkSlug={link.slug} tenantName={tenantName} />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tus datos quedan solo con {tenantName}. No los compartimos con terceros.
        </p>
      </div>
    </main>
  )
}
