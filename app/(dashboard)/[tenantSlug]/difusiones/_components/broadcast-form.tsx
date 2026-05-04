'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type BroadcastActionState, scheduleBroadcast } from '@/lib/broadcasts/actions'

type Channel = { id: string; type: 'whatsapp' | 'instagram'; display_name: string | null }
type Template = { id: string; name: string; language: string; channel_id: string }
type Audience = { id: string; name: string; customer_count_cached: number }

const initial: BroadcastActionState = { ok: true }

export function BroadcastForm({
  tenantSlug,
  channels,
  templates,
  audiences,
}: {
  tenantSlug: string
  channels: Channel[]
  templates: Template[]
  audiences: Audience[]
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(scheduleBroadcast.bind(null, tenantSlug), initial)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [channelId, setChannelId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [audienceId, setAudienceId] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')

  const filteredTemplates = useMemo(
    () => templates.filter((t) => !channelId || t.channel_id === channelId),
    [templates, channelId],
  )
  const audience = audiences.find((a) => a.id === audienceId)

  useEffect(() => {
    if (state.ok && state.id) {
      toast.success('Difusión programada.')
      router.push(`/${tenantSlug}/difusiones/${state.id}`)
      router.refresh()
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state, router, tenantSlug])

  const canNext = (() => {
    if (step === 0) return channels.length > 0 && channelId.length > 0
    if (step === 1) return templateId.length > 0
    if (step === 2) return audienceId.length > 0
    if (step === 3) return name.length > 0 // y opcionalmente scheduledAt
    return true
  })()

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="channel_id" value={channelId} />
      <input type="hidden" name="template_id" value={templateId} />
      <input type="hidden" name="audience_id" value={audienceId} />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="scheduled_at" value={scheduledAt} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Paso {step + 1} de 5</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {step === 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Canal</p>
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay canales conectados. Conectá WhatsApp en Configuración → Canales.
                </p>
              ) : (
                <Select value={channelId} onValueChange={setChannelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name ?? c.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Template aprobado</p>
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay templates aprobados para ese canal. Sincronizá en Configuración →
                  Templates.
                </p>
              ) : (
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí template" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.language})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Audiencia</p>
              {audiences.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay audiencias. Creá una en /audiencias.
                </p>
              ) : (
                <Select value={audienceId} onValueChange={setAudienceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí audiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.customer_count_cached})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <Input
                placeholder="Nombre interno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
              <div className="space-y-1">
                <label htmlFor="scheduled-at-input" className="block text-sm font-medium">
                  Cuándo enviar
                </label>
                <Input
                  id="scheduled-at-input"
                  type="datetime-local"
                  value={scheduledAt.slice(0, 16)}
                  onChange={(e) =>
                    setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : '')
                  }
                />
                <span className="block text-xs text-muted-foreground">Vacío = enviar ahora.</span>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Canal: </span>
                {channels.find((c) => c.id === channelId)?.display_name ?? channelId}
              </p>
              <p>
                <span className="text-muted-foreground">Template: </span>
                {filteredTemplates.find((t) => t.id === templateId)?.name ?? templateId}
              </p>
              <p>
                <span className="text-muted-foreground">Audiencia: </span>
                {audience?.name} ({audience?.customer_count_cached ?? '?'} clientes)
              </p>
              <p>
                <span className="text-muted-foreground">Cuándo: </span>
                {scheduledAt ? new Date(scheduledAt).toLocaleString('es-AR') : 'Ahora'}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Atrás
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(4, s + 1))}
          >
            Siguiente
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? 'Programando…' : 'Programar difusión'}
          </Button>
        )}
      </div>
    </form>
  )
}
