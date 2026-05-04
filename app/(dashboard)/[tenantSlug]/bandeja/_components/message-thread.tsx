'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { MessageRow } from '../queries'

function statusLabel(status: MessageRow['status']): string {
  if (!status) return ''
  if (status === 'queued') return 'enviando…'
  if (status === 'sent') return 'enviado'
  if (status === 'delivered') return 'entregado'
  if (status === 'read') return 'leído'
  if (status === 'failed') return 'falló'
  return status
}

export function MessageThread({
  conversationId,
  initialMessages,
}: {
  conversationId: string
  initialMessages: MessageRow[]
}) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // biome-ignore lint/correctness/useExhaustiveDependencies: queremos disparar scroll cuando cambia la lista
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as MessageRow
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as MessageRow
          setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)))
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin mensajes.</p>
      ) : null}
      {messages.map((m) => {
        const outbound = m.direction === 'outbound'
        return (
          <div key={m.id} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                outbound ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content ?? '(sin contenido)'}</p>
              <p
                className={`mt-1 text-xs ${
                  outbound ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {new Date(m.sent_at ?? m.created_at).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {outbound && m.status ? ` · ${statusLabel(m.status)}` : null}
                {m.error ? ` · ${m.error}` : null}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
