import { Globe2, Palette, Type } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'

export const metadata = { title: 'Apariencia' }

export default async function AparienciaPage({
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuración · Apariencia"
        title="Apariencia"
        description="Cómo se ve tu bar dentro de HUB. Algunas opciones llegan pronto."
      />

      <Card className="card-hairline gap-4 border-border/70 bg-card/85 p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-[--cream-tint] text-primary">
            <Type className="size-5" aria-hidden />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold tracking-tight">Logo del bar</h2>
              <Badge variant="muted">Próximamente</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Subí un logo cuadrado (PNG transparente, mínimo 256×256). Se va a mostrar en el menú
              público, en los emails y en el QR de mesa.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Tenant actual: <span className="font-mono text-foreground">/{tenantSlug}</span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="card-hairline gap-4 border-border/70 bg-card/85 p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-[--cream-tint] text-primary">
            <Palette className="size-5" aria-hidden />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-semibold tracking-tight">Acento del bar</h2>
              <Badge variant="muted">Próximamente</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              HUB hereda forest green como acento. Cuando se habilite, vas a poder elegir un color
              de marca propio que aparece en sidebar, botones primarios y emails.
            </p>
          </div>
        </div>
      </Card>

      <Card className="card-hairline gap-4 border-border/70 bg-card/85 p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-[--cream-tint] text-primary">
            <Globe2 className="size-5" aria-hidden />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="font-serif text-lg font-semibold tracking-tight">
              Idioma · zona horaria
            </h2>
            <p className="text-sm text-muted-foreground">
              HUB se muestra en español rioplatense (es-AR). La zona horaria está fijada en{' '}
              <span className="font-mono text-foreground">America/Argentina/Cordoba</span>.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Estos valores son fijos por ahora. Si necesitás otra TZ, escribinos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
