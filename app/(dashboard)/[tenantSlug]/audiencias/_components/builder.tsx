'use client'

import { useEffect, useMemo, useState } from 'react'
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
import {
  type AudienceFilter,
  CONDITION_FIELDS,
  CONDITION_OPS,
  type ConditionField,
  type ConditionOp,
  EMPTY_FILTER,
} from '@/lib/audiences/schemas'

type Group = Extract<AudienceFilter, { kind: 'group' }>
type Condition = Extract<AudienceFilter, { kind: 'condition' }>

const FIELD_LABELS: Record<ConditionField, string> = {
  opt_in_marketing: 'Opt-in marketing',
  birth_month: 'Mes de cumpleaños',
  days_since_last_visit: 'Días desde última visita',
  visits_count: 'Cantidad de visitas',
  total_spent_cents: 'Gasto total (centavos)',
  points_balance: 'Saldo de puntos',
  created_days_ago: 'Días desde creación',
  has_tag: 'Tiene tag (uuid)',
  attended_event_id: 'Asistió a evento (uuid)',
  source: 'Origen (qr/manual/import)',
}

const OP_LABELS: Record<ConditionOp, string> = {
  eq: '=',
  neq: '≠',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  in: 'en',
  not_in: 'no en',
  is_true: 'es verdadero',
  is_false: 'es falso',
  is_null: 'es nulo',
  is_not_null: 'no es nulo',
}

function defaultCondition(): Condition {
  return { kind: 'condition', field: 'visits_count', op: 'gte', value: 1 }
}

type BuilderProps = {
  tenantSlug: string
  initialName?: string
  initialFilters?: AudienceFilter
  hiddenIdField?: string
  submitLabel: string
  submitName?: string
}

export function AudienceBuilder({
  tenantSlug,
  initialName = '',
  initialFilters = EMPTY_FILTER,
  hiddenIdField,
  submitLabel,
  submitName,
}: BuilderProps) {
  const [name, setName] = useState(initialName)
  const [root, setRoot] = useState<Group>(toGroup(initialFilters))
  const [preview, setPreview] = useState<{ total: number; sample: string[] } | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const filtersJson = useMemo(() => JSON.stringify(root), [root])

  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      setIsPreviewing(true)
      setPreviewError(null)
      try {
        const res = await fetch('/api/audiences/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: tenantSlug, filters: JSON.parse(filtersJson) }),
        })
        const data = await res.json()
        if (cancelled) return
        if (!data.ok) {
          setPreviewError(data.message ?? 'preview_failed')
          setPreview(null)
        } else {
          setPreview({ total: data.total, sample: data.sample })
        }
      } catch (e) {
        if (!cancelled) setPreviewError((e as Error).message)
      } finally {
        if (!cancelled) setIsPreviewing(false)
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [filtersJson, tenantSlug])

  return (
    <div className="space-y-4">
      <Input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la audiencia"
        maxLength={80}
        required
      />
      <input type="hidden" name="filters" value={filtersJson} />
      {hiddenIdField ? <input type="hidden" name="id" value={hiddenIdField} /> : null}

      <GroupEditor group={root} onChange={setRoot} />

      <Card>
        <CardContent className="space-y-2 p-4 text-sm">
          {isPreviewing ? (
            <p className="text-muted-foreground">Calculando…</p>
          ) : previewError ? (
            <p className="text-red-700">Error: {previewError}</p>
          ) : preview ? (
            <>
              <p>
                <span className="font-medium">{preview.total}</span> clientes coinciden.
              </p>
              {preview.sample.length > 0 ? (
                <p className="text-xs text-muted-foreground break-all">
                  Muestra (ids): {preview.sample.slice(0, 20).join(', ')}
                </p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Button type="submit" name={submitName ?? undefined}>
        {submitLabel}
      </Button>
    </div>
  )
}

function toGroup(f: AudienceFilter): Group {
  if (f.kind === 'group') return f
  return { kind: 'group', op: 'AND', nodes: [f] }
}

function GroupEditor({
  group,
  onChange,
  level = 0,
}: {
  group: Group
  onChange: (next: Group) => void
  level?: number
}) {
  return (
    <Card className={level === 0 ? '' : 'border-dashed'}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Combinar con</span>
          <Select
            value={group.op}
            onValueChange={(v) => onChange({ ...group, op: v as 'AND' | 'OR' })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">Y</SelectItem>
              <SelectItem value="OR">O</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {group.nodes.map((node, i) => (
            <NodeEditor
              // biome-ignore lint/suspicious/noArrayIndexKey: el nodo no tiene id estable; el orden es semántico (el usuario los ordena explícitamente)
              key={`${level}-${i}`}
              node={node}
              onChange={(next) => {
                const copy = [...group.nodes]
                copy[i] = next
                onChange({ ...group, nodes: copy })
              }}
              onRemove={() => {
                const copy = group.nodes.filter((_, j) => j !== i)
                onChange({ ...group, nodes: copy })
              }}
              level={level + 1}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...group, nodes: [...group.nodes, defaultCondition()] })}
          >
            + Condición
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              onChange({
                ...group,
                nodes: [...group.nodes, { kind: 'group', op: 'AND', nodes: [defaultCondition()] }],
              })
            }
          >
            + Subgrupo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function NodeEditor({
  node,
  onChange,
  onRemove,
  level,
}: {
  node: AudienceFilter
  onChange: (next: AudienceFilter) => void
  onRemove: () => void
  level: number
}) {
  if (node.kind === 'group') {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <GroupEditor group={node} onChange={onChange} level={level} />
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          ✕
        </Button>
      </div>
    )
  }

  if (node.kind === 'static_list') {
    return (
      <div className="flex items-center justify-between gap-2 rounded border border-dashed px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Lista estática de {node.customer_ids.length} clientes
        </span>
        <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
          ✕
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={node.field}
        onValueChange={(v) => onChange({ ...node, field: v as ConditionField })}
      >
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_FIELDS.map((f) => (
            <SelectItem key={f} value={f}>
              {FIELD_LABELS[f]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={node.op} onValueChange={(v) => onChange({ ...node, op: v as ConditionOp })}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONDITION_OPS.map((o) => (
            <SelectItem key={o} value={o}>
              {OP_LABELS[o]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {needsValue(node.op) ? (
        <Input
          className="w-48"
          value={node.value === null || node.value === undefined ? '' : String(node.value)}
          onChange={(e) => onChange({ ...node, value: e.target.value })}
          placeholder="valor"
        />
      ) : null}
      <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
        ✕
      </Button>
    </div>
  )
}

function needsValue(op: ConditionOp): boolean {
  return !['is_true', 'is_false', 'is_null', 'is_not_null'].includes(op)
}
