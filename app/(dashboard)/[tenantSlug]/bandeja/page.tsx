import { notFound } from 'next/navigation'
import {
  RoleRequiredError,
  requireRole,
  requireTenantAccess,
  TenantNotFoundError,
} from '@/lib/tenant'
import { ConversationList } from './_components/conversation-list'
import { ConversationView } from './_components/conversation-view'
import { listApprovedTemplates, listConversations } from './queries'

export const metadata = { title: 'Bandeja — HUB' }
export const dynamic = 'force-dynamic'

export default async function BandejaPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { tenantSlug } = await params
  const { c: selectedId } = await searchParams

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
    requireRole(access.role, ['owner', 'cashier', 'waiter'])
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    if (error instanceof RoleRequiredError) notFound()
    throw error
  }

  const conversations = await listConversations(access.tenant.id)
  const templates = await listApprovedTemplates(access.tenant.id)

  return (
    <main className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-6xl">
      <aside className="w-80 border-r">
        <ConversationList
          conversations={conversations}
          tenantSlug={tenantSlug}
          selectedId={selectedId ?? null}
        />
      </aside>
      <section className="flex-1 overflow-hidden">
        {selectedId ? (
          <ConversationView
            tenantSlug={tenantSlug}
            tenantId={access.tenant.id}
            conversationId={selectedId}
            templates={templates}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Elegí una conversación
          </div>
        )}
      </section>
    </main>
  )
}
