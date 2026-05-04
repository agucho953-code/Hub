import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import type { TemplateStatus } from '@/types/database'
import { TemplateSyncButton } from './_sync-button'

export const metadata = { title: 'Templates — HUB' }
export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<TemplateStatus, string> = {
  draft: 'Borrador',
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  disabled: 'Deshabilitado',
}

function statusVariant(s: TemplateStatus): 'default' | 'outline' | 'destructive' | 'secondary' {
  if (s === 'approved') return 'default'
  if (s === 'rejected' || s === 'disabled') return 'destructive'
  if (s === 'pending') return 'secondary'
  return 'outline'
}

export default async function TemplatesPage({
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

  const supabase = await createClient()
  const { data: channel } = await supabase
    .from('channels')
    .select('id, status')
    .eq('tenant_id', access.tenant.id)
    .eq('type', 'whatsapp')
    .maybeSingle()

  const { data: templatesRaw } = await supabase
    .from('message_templates')
    .select('id, name, language, category, status, last_synced_at')
    .eq('tenant_id', access.tenant.id)
    .order('name', { ascending: true })

  const templates = (templatesRaw ?? []) as Array<{
    id: string
    name: string
    language: string
    category: string
    status: TemplateStatus
    last_synced_at: string | null
  }>

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Templates de WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            Sincronizá los templates aprobados por Meta para enviarlos fuera de la ventana de 24 h.
          </p>
        </div>
        {channel ? <TemplateSyncButton channelId={channel.id} tenantSlug={tenantSlug} /> : null}
      </header>

      {!channel ? (
        <Card>
          <CardHeader>
            <CardTitle>Conectá WhatsApp primero</CardTitle>
            <CardDescription>
              Andá a Canales y completá el flujo de Embedded Signup para poder gestionar templates.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Todavía no hay templates sincronizados. Tocá &quot;Sincronizar&quot; para traer los de
            Meta.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.language}</TableCell>
                    <TableCell className="capitalize">{t.category.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(t.status)}>{STATUS_LABEL[t.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.last_synced_at ? new Date(t.last_synced_at).toLocaleString('es-AR') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
