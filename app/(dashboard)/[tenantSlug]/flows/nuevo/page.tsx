import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { FlowBuilder } from '../_components/flow-builder'

export const metadata = { title: 'Nuevo flow — HUB' }
export const dynamic = 'force-dynamic'

export default async function NewFlowPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
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
  const [chRes, tplRes, tagsRes] = await Promise.all([
    supabase
      .from('channels')
      .select('id, type, display_name')
      .eq('tenant_id', access.tenant.id)
      .eq('status', 'connected'),
    supabase
      .from('message_templates')
      .select('id, name, language, channel_id')
      .eq('tenant_id', access.tenant.id)
      .eq('status', 'approved'),
    supabase.from('customer_tags').select('id, name').eq('tenant_id', access.tenant.id),
  ])

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Nuevo flow</h1>
      <FlowBuilder
        tenantSlug={tenantSlug}
        channels={chRes.data ?? []}
        templates={tplRes.data ?? []}
        tags={tagsRes.data ?? []}
      />
    </main>
  )
}
