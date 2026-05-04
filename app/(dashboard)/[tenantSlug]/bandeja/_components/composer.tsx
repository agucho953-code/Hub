'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type MetaActionState, sendTemplateMessage, sendTextMessage } from '@/lib/meta/actions'
import type { ChannelType } from '@/types/database'

type Template = {
  id: string
  name: string
  language: string
  category: string
  components: unknown
}

const initial: MetaActionState = { ok: true }

function countBodyVariables(components: unknown): number {
  if (!Array.isArray(components)) return 0
  for (const c of components) {
    if (c && typeof c === 'object' && (c as Record<string, unknown>).type === 'BODY') {
      const text = (c as { text?: string }).text ?? ''
      const matches = text.match(/\{\{\d+\}\}/g)
      return matches ? matches.length : 0
    }
  }
  return 0
}

export function Composer({
  tenantSlug,
  conversationId,
  channelType,
  insideWindow,
  templates,
}: {
  tenantSlug: string
  conversationId: string
  channelType: ChannelType
  insideWindow: boolean
  templates: Template[]
}) {
  const canSendText = insideWindow || channelType === 'instagram'

  const [textState, textAction, textPending] = useActionState(
    sendTextMessage.bind(null, tenantSlug),
    initial,
  )
  const [tplState, tplAction, tplPending] = useActionState(
    sendTemplateMessage.bind(null, tenantSlug),
    initial,
  )

  useEffect(() => {
    if (!textState.ok && textState.message) toast.error(textState.message)
  }, [textState])

  useEffect(() => {
    if (!tplState.ok && tplState.message) toast.error(tplState.message)
  }, [tplState])

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  )
  const variableCount = selectedTemplate ? countBodyVariables(selectedTemplate.components) : 0

  if (canSendText) {
    return (
      <form action={textAction} className="border-t p-3">
        <input type="hidden" name="conversation_id" value={conversationId} />
        <div className="flex gap-2">
          <Textarea
            name="body"
            placeholder="Escribí tu mensaje…"
            rows={2}
            required
            maxLength={4096}
            className="flex-1"
          />
          <Button type="submit" disabled={textPending}>
            {textPending ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form action={tplAction} className="space-y-3 border-t p-3">
      <p className="text-xs text-muted-foreground">
        Fuera de la ventana de 24 h. Elegí un template aprobado.
      </p>
      <input type="hidden" name="conversation_id" value={conversationId} />
      <Select
        name="template_name"
        value={selectedTemplate?.name ?? ''}
        onValueChange={(value) => {
          const t = templates.find((x) => x.name === value)
          setSelectedTemplateId(t?.id ?? '')
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Elegí template" />
        </SelectTrigger>
        <SelectContent>
          {templates.length === 0 ? (
            <SelectItem value="__none" disabled>
              No hay templates aprobados
            </SelectItem>
          ) : (
            templates.map((t) => (
              <SelectItem key={t.id} value={t.name}>
                {t.name} ({t.language})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedTemplate ? (
        <input type="hidden" name="template_language" value={selectedTemplate.language} />
      ) : null}
      {Array.from({ length: variableCount }).map((_, i) => (
        <Input
          // biome-ignore lint/suspicious/noArrayIndexKey: el orden de variables es estable por contrato del template Meta ({{1}}, {{2}}…)
          key={`${selectedTemplateId || 'noop'}-${i}`}
          name="variable"
          placeholder={`Variable {{${i + 1}}}`}
          required
        />
      ))}
      <Button type="submit" disabled={tplPending || !selectedTemplate}>
        {tplPending ? 'Enviando…' : 'Enviar template'}
      </Button>
    </form>
  )
}
