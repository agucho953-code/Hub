import { getConversation, listMessages } from '../queries'
import { Composer } from './composer'
import { MessageThread } from './message-thread'

type Template = {
  id: string
  name: string
  language: string
  category: string
  components: unknown
}

export async function ConversationView({
  tenantSlug,
  tenantId,
  conversationId,
  templates,
}: {
  tenantSlug: string
  tenantId: string
  conversationId: string
  templates: Template[]
}) {
  const [convo, messages] = await Promise.all([
    getConversation(tenantId, conversationId),
    listMessages(tenantId, conversationId),
  ])
  if (!convo) {
    return <div className="p-4 text-sm text-muted-foreground">Conversación no encontrada.</div>
  }

  const lastInboundMs = convo.last_inbound_at ? new Date(convo.last_inbound_at).getTime() : 0
  const insideWindow = lastInboundMs > 0 && Date.now() - lastInboundMs < 24 * 3600 * 1000

  return (
    <div className="flex h-full flex-col">
      <header className="border-b p-4">
        <p className="font-medium">{convo.customer_name ?? convo.external_user_id}</p>
        <p className="text-xs text-muted-foreground">
          {convo.channel_type === 'whatsapp' ? 'WhatsApp' : 'Instagram'} ·{' '}
          {insideWindow ? 'dentro de ventana 24 h' : 'fuera de ventana'}
        </p>
      </header>
      <MessageThread conversationId={convo.id} initialMessages={messages} />
      <Composer
        tenantSlug={tenantSlug}
        conversationId={convo.id}
        channelType={convo.channel_type}
        insideWindow={insideWindow}
        templates={templates}
      />
    </div>
  )
}
