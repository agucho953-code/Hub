'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type DailyPoint = { day: string; visits: number; revenue_cents: number }

export function RevenueChart({
  data,
  metric,
}: {
  data: DailyPoint[]
  metric: 'visits' | 'revenue_cents'
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sin datos en el rango.
      </div>
    )
  }

  const labelY = metric === 'visits' ? 'Visitas' : 'Revenue'
  const fmtY =
    metric === 'revenue_cents'
      ? (v: number) => `$${(v / 100).toLocaleString('es-AR')}`
      : (v: number) => v.toLocaleString('es-AR')

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="day"
          tickFormatter={(v) => {
            const d = new Date(`${v}T00:00:00`)
            return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
          }}
          tick={{ fontSize: 11 }}
        />
        <YAxis tickFormatter={fmtY} tick={{ fontSize: 11 }} width={70} />
        <Tooltip
          formatter={(value) => [fmtY(Number(value)), labelY]}
          labelFormatter={(v) =>
            new Date(`${String(v)}T00:00:00`).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          }
        />
        <Line
          type="monotone"
          dataKey={metric}
          stroke="currentColor"
          className="text-primary"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
