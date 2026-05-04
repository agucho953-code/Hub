import { notFound } from 'next/navigation'
import { getFlow } from '@/lib/flows/queries'
import type { FlowStepConfig, FlowTriggerConfig } from '@/lib/flows/schemas'
import { createClient } from '@/lib/supabase/server'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { FlowBuilder } from '../_components/flow-builder'

export const metadata = { title: 'Editar flow — HUB' }
export const dynamic = 'force-dynamic'

export default async function EditFlowPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>
}) {
  const { tenantSlug, id } = await params
  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const flow = await getFlow(access.tenant.id, id)
  if (!flow) notFound()

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
      <h1 className="text-2xl font-semibold">Editar flow</h1>
      <FlowBuilder
        tenantSlug={tenantSlug}
        flowId={flow.id}
        initialName={flow.name}
        initialActive={flow.active}
        initialTrigger={flow.trigger_config as FlowTriggerConfig}
        initialSteps={flow.steps.map(
          (s) => ({ ...(s.config as object), type: s.type }) as FlowStepConfig,
        )}
        channels={chRes.data ?? []}
        templates={tplRes.data ?? []}
        tags={tagsRes.data ?? []}
      />
    </main>
  )
}
