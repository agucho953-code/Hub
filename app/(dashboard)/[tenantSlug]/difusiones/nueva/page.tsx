import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { BroadcastForm } from '../_components/broadcast-form'

export const metadata = { title: 'Nueva difusión — HUB' }
export const dynamic = 'force-dynamic'

export default async function NuevaDifusionPage({
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
  const [channelsRes, templatesRes, audiencesRes] = await Promise.all([
    supabase
      .from('channels')
      .select('id, type, display_name, status')
      .eq('tenant_id', access.tenant.id)
      .eq('status', 'connected'),
    supabase
      .from('message_templates')
      .select('id, name, language, channel_id, status')
      .eq('tenant_id', access.tenant.id)
      .eq('status', 'approved')
      .order('name'),
    supabase
      .from('audiences')
      .select('id, name, customer_count_cached')
      .eq('tenant_id', access.tenant.id)
      .order('updated_at', { ascending: false }),
  ])

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Nueva difusión</h1>
      <BroadcastForm
        tenantSlug={tenantSlug}
        channels={channelsRes.data ?? []}
        templates={templatesRes.data ?? []}
        audiences={audiencesRes.data ?? []}
      />
    </main>
  )
}
