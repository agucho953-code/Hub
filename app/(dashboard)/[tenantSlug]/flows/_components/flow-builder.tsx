'use client'

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFlow, type FlowActionState, updateFlow } from '@/lib/flows/actions'
import type { FlowStepConfig, FlowTriggerConfig } from '@/lib/flows/schemas'

type Channel = { id: string; display_name: string | null; type: 'whatsapp' | 'instagram' }
type Template = { id: string; name: string; language: string; channel_id: string }
type Tag = { id: string; name: string }

const initial: FlowActionState = { ok: true }

function defaultStep(channels: Channel[], templates: Template[]): FlowStepConfig {
  const ch = channels[0]
  const tpl = templates.find((t) => !ch || t.channel_id === ch.id) ?? templates[0]
  if (ch && tpl) {
    return {
      type: 'send_template',
      channel_id: ch.id,
      template_id: tpl.id,
      variables: [],
    }
  }
  return { type: 'wait', minutes: 60 }
}

const STEP_LABEL: Record<FlowStepConfig['type'], string> = {
  send_template: 'Enviar template',
  wait: 'Esperar',
  condition: 'Condición',
  add_tag: 'Agregar tag',
}

type WithRowId = FlowStepConfig & { __id: string }

export function FlowBuilder({
  tenantSlug,
  flowId,
  initialName,
  initialTrigger,
  initialSteps,
  initialActive,
  channels,
  templates,
  tags,
}: {
  tenantSlug: string
  flowId?: string
  initialName?: string
  initialTrigger?: FlowTriggerConfig
  initialSteps?: FlowStepConfig[]
  initialActive?: boolean
  channels: Channel[]
  templates: Template[]
  tags: Tag[]
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName ?? '')
  const [active, setActive] = useState<boolean>(initialActive ?? false)
  const [trigger, setTrigger] = useState<FlowTriggerConfig>(
    initialTrigger ?? { type: 'after_visit' },
  )
  const [steps, setSteps] = useState<WithRowId[]>(
    (initialSteps && initialSteps.length > 0
      ? initialSteps
      : [defaultStep(channels, templates)]
    ).map((s, i) => ({ ...s, __id: `init-${i}-${Math.random().toString(36).slice(2, 6)}` })),
  )

  const action = flowId ? updateFlow.bind(null, tenantSlug) : createFlow.bind(null, tenantSlug)
  const [state, formAction, pending] = useActionState(action, initial)

  useEffect(() => {
    if (state.ok && state.id) {
      toast.success(flowId ? 'Flow actualizado.' : 'Flow creado.')
      router.push(`/${tenantSlug}/flows`)
      router.refresh()
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state, flowId, router, tenantSlug])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const stepsJson = useMemo(() => JSON.stringify(steps.map(({ __id, ...rest }) => rest)), [steps])
  const triggerJson = useMemo(() => JSON.stringify(trigger), [trigger])

  const onDragEnd = (event: DragEndEvent) => {
    const { active: a, over } = event
    if (!over || a.id === over.id) return
    setSteps((items) => {
      const oldIndex = items.findIndex((it) => it.__id === a.id)
      const newIndex = items.findIndex((it) => it.__id === over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <form action={formAction} className="space-y-6">
      {flowId ? <input type="hidden" name="id" value={flowId} /> : null}
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="trigger" value={triggerJson} />
      <input type="hidden" name="steps" value={stepsJson} />
      <input type="hidden" name="active" value={active ? 'true' : 'false'} />

      <Card>
        <CardContent className="space-y-3 p-4">
          <Input
            placeholder="Nombre del flow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
          <TriggerEditor value={trigger} onChange={setTrigger} tags={tags} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Activo
          </label>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={steps.map((s) => s.__id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <SortableStep
                key={step.__id}
                id={step.__id}
                index={idx}
                step={step}
                channels={channels}
                templates={templates}
                tags={tags}
                onChange={(next) =>
                  setSteps((arr) =>
                    arr.map((s) => (s.__id === step.__id ? { ...next, __id: s.__id } : s)),
                  )
                }
                onRemove={() =>
                  setSteps((arr) =>
                    arr.length > 1 ? arr.filter((s) => s.__id !== step.__id) : arr,
                  )
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setSteps((arr) => [
              ...arr,
              { ...defaultStep(channels, templates), __id: `new-${Date.now()}` },
            ])
          }
        >
          + Step
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar flow'}
        </Button>
      </div>
    </form>
  )
}

function TriggerEditor({
  value,
  onChange,
  tags,
}: {
  value: FlowTriggerConfig
  onChange: (next: FlowTriggerConfig) => void
  tags: Tag[]
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Trigger</p>
      <Select
        value={value.type}
        onValueChange={(v) => {
          const t = v as FlowTriggerConfig['type']
          if (t === 'customer_inactive') onChange({ type: t, days: 30 })
          else if (t === 'event_starting') onChange({ type: t, hours_before: 24 })
          else if (t === 'tag_added') onChange({ type: t })
          else onChange({ type: t })
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="customer_inactive">Cliente inactivo</SelectItem>
          <SelectItem value="birthday">Cumpleaños</SelectItem>
          <SelectItem value="after_visit">Después de visita</SelectItem>
          <SelectItem value="event_starting">Evento próximo</SelectItem>
          <SelectItem value="tag_added">Tag agregado</SelectItem>
        </SelectContent>
      </Select>
      {value.type === 'customer_inactive' ? (
        <Input
          type="number"
          min={1}
          max={365}
          value={value.days}
          onChange={(e) =>
            onChange({ type: 'customer_inactive', days: Math.max(1, Number(e.target.value)) })
          }
        />
      ) : null}
      {value.type === 'event_starting' ? (
        <Input
          type="number"
          min={1}
          max={168}
          value={value.hours_before}
          onChange={(e) =>
            onChange({
              type: 'event_starting',
              hours_before: Math.max(1, Number(e.target.value)),
            })
          }
        />
      ) : null}
      {value.type === 'tag_added' ? (
        <Select
          value={value.tag_id ?? ''}
          onValueChange={(v) =>
            onChange({ type: 'tag_added', tag_id: v === '__any' ? undefined : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Cualquier tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__any">Cualquier tag</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  )
}

function SortableStep({
  id,
  index,
  step,
  channels,
  templates,
  tags,
  onChange,
  onRemove,
}: {
  id: string
  index: number
  step: WithRowId
  channels: Channel[]
  templates: Template[]
  tags: Tag[]
  onChange: (next: FlowStepConfig) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab text-muted-foreground"
              aria-label="Reordenar"
            >
              ⋮⋮
            </button>
            <Badge variant="outline">#{index + 1}</Badge>
            <Select
              value={step.type}
              onValueChange={(v) =>
                onChange(
                  buildDefaultForType(v as FlowStepConfig['type'], channels, templates, tags),
                )
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_template">{STEP_LABEL.send_template}</SelectItem>
                <SelectItem value="wait">{STEP_LABEL.wait}</SelectItem>
                <SelectItem value="condition">{STEP_LABEL.condition}</SelectItem>
                <SelectItem value="add_tag">{STEP_LABEL.add_tag}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            ✕
          </Button>
        </div>

        <StepDetail
          step={step}
          onChange={onChange}
          channels={channels}
          templates={templates}
          tags={tags}
        />
      </CardContent>
    </Card>
  )
}

function buildDefaultForType(
  type: FlowStepConfig['type'],
  channels: Channel[],
  templates: Template[],
  tags: Tag[],
): FlowStepConfig {
  if (type === 'send_template') {
    const ch = channels[0]
    const tpl = templates.find((t) => !ch || t.channel_id === ch.id) ?? templates[0]
    return {
      type: 'send_template',
      channel_id: ch?.id ?? '',
      template_id: tpl?.id ?? '',
      variables: [],
    }
  }
  if (type === 'wait') return { type: 'wait', minutes: 60 }
  if (type === 'condition') {
    return { type: 'condition', field: 'customer.opt_in_marketing', op: 'is_true', else_offset: 1 }
  }
  return { type: 'add_tag', tag_id: tags[0]?.id ?? '' }
}

function StepDetail({
  step,
  onChange,
  channels,
  templates,
  tags,
}: {
  step: FlowStepConfig
  onChange: (next: FlowStepConfig) => void
  channels: Channel[]
  templates: Template[]
  tags: Tag[]
}) {
  if (step.type === 'send_template') {
    const filtered = templates.filter((t) => t.channel_id === step.channel_id)
    return (
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={step.channel_id}
          onValueChange={(v) => onChange({ ...step, channel_id: v, template_id: '' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.display_name ?? c.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={step.template_id}
          onValueChange={(v) => onChange({ ...step, template_id: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} ({t.language})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }
  if (step.type === 'wait') {
    return (
      <Input
        type="number"
        min={1}
        max={43200}
        value={step.minutes}
        onChange={(e) => onChange({ type: 'wait', minutes: Math.max(1, Number(e.target.value)) })}
      />
    )
  }
  if (step.type === 'condition') {
    return (
      <div className="grid grid-cols-3 gap-2">
        <Input
          value={step.field}
          onChange={(e) => onChange({ ...step, field: e.target.value })}
          placeholder="customer.field o context.field"
        />
        <Select
          value={step.op}
          onValueChange={(v) => onChange({ ...step, op: v as typeof step.op })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eq">=</SelectItem>
            <SelectItem value="neq">≠</SelectItem>
            <SelectItem value="gt">&gt;</SelectItem>
            <SelectItem value="gte">≥</SelectItem>
            <SelectItem value="lt">&lt;</SelectItem>
            <SelectItem value="lte">≤</SelectItem>
            <SelectItem value="is_true">true</SelectItem>
            <SelectItem value="is_false">false</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={
            typeof step.value === 'string' || typeof step.value === 'number'
              ? String(step.value)
              : ''
          }
          onChange={(e) => onChange({ ...step, value: e.target.value })}
          placeholder="valor"
        />
      </div>
    )
  }
  return (
    <Select value={step.tag_id} onValueChange={(v) => onChange({ ...step, tag_id: v })}>
      <SelectTrigger>
        <SelectValue placeholder="Tag" />
      </SelectTrigger>
      <SelectContent>
        {tags.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
