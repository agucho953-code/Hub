'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HeatmapPoint = { dow: number; hour: number; visit_count: number }

const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function Heatmap({ data }: { data: HeatmapPoint[] }) {
  const max = data.reduce((m, p) => Math.max(m, p.visit_count), 0)
  const map = new Map<string, number>()
  for (const p of data) map.set(`${p.dow}-${p.hour}`, p.visit_count)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mapa de calor de visitas</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[3rem_repeat(24,minmax(1.25rem,1fr))] gap-px text-xs">
            <div />
            {Array.from({ length: 24 }).map((_, h) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: el índice ES la hora (0-23), orden estable y semántico
              <div key={`h-${h}`} className="text-center text-muted-foreground">
                {h}
              </div>
            ))}
            {DOW_LABELS.map((label, dow) => (
              <DayRow
                key={label}
                label={label}
                dow={dow}
                max={max}
                get={(h) => map.get(`${dow}-${h}`) ?? 0}
              />
            ))}
          </div>
          {max === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Sin visitas registradas todavía.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function DayRow({
  label,
  dow,
  max,
  get,
}: {
  label: string
  dow: number
  max: number
  get: (hour: number) => number
}) {
  return (
    <>
      <div className="self-center text-right text-muted-foreground">{label}</div>
      {Array.from({ length: 24 }).map((_, h) => {
        const v = get(h)
        const intensity = max > 0 ? v / max : 0
        // Tailwind no admite opacity dinámico via clase con interpolación; usamos style.
        const bg = v === 0 ? 'transparent' : `rgba(99,102,241,${0.15 + intensity * 0.85})`
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: el índice ES la hora (0-23), orden estable y semántico
            key={`${dow}-${h}`}
            className="aspect-square rounded-sm border border-border/40"
            style={{ backgroundColor: bg }}
            title={`${label} ${h}:00 — ${v} visitas`}
          />
        )
      })}
    </>
  )
}
