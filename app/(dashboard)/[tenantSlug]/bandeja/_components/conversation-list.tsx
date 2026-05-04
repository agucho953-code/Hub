'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { ConversationListRow } from '../queries'

function formatRelative(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'ahora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`
  return d.toLocaleDateString('es-AR')
}

export function ConversationList({
  conversations,
  tenantSlug,
  selectedId,
}: {
  conversations: ConversationListRow[]
  tenantSlug: string
  selectedId: string | null
}) {
  if (conversations.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">Sin conversaciones todavía.</div>
  }
  return (
    <ul className="divide-y overflow-y-auto">
      {conversations.map((c) => {
        const active = c.id === selectedId
        const display = c.customer_name ?? c.external_user_id
        return (
          <li key={c.id}>
            <Link
              href={`/${tenantSlug}/bandeja?c=${c.id}`}
              className={`block px-4 py-3 hover:bg-muted ${active ? 'bg-muted' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{display}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(c.last_message_at)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">{c.preview ?? '—'}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant="outline" className="capitalize">
                    {c.channel_type === 'whatsapp' ? 'WA' : 'IG'}
                  </Badge>
                  {c.unread_count > 0 ? <Badge variant="default">{c.unread_count}</Badge> : null}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
