'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type AudienceFromListState, createAudienceFromList } from '@/lib/stats/audience-from-list'
import type { ChurnRiskRow } from '@/lib/stats/queries'

const initial: AudienceFromListState = { ok: true, id: '' }

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export function ChurnCard({ rows, tenantSlug }: { rows: ChurnRiskRow[]; tenantSlug: string }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(
    createAudienceFromList.bind(null, tenantSlug),
    initial,
  )
  const [name, setName] = useState('Riesgo de churn')

  useEffect(() => {
    if (state.ok && state.id) {
      toast.success('Audiencia creada.')
      router.push(`/${tenantSlug}/audiencias/${state.id}`)
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state, router, tenantSlug])

  const ids = rows.map((r) => r.customer_id).join(',')

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Riesgo de churn</CardTitle>
          <p className="text-xs text-muted-foreground">
            Clientes que eran frecuentes y no volvieron en 2× su frecuencia habitual.
          </p>
        </div>
        {rows.length > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm">Crear audiencia con esta lista</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Crear audiencia desde lista</AlertDialogTitle>
                <AlertDialogDescription>
                  Se va a crear una audiencia estática con los {rows.length} clientes identificados
                  como riesgo de churn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form action={action} className="space-y-3">
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                />
                <input type="hidden" name="customer_ids" value={ids} />
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
                  <AlertDialogAction type="submit" disabled={pending}>
                    {pending ? 'Creando…' : 'Crear audiencia'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No hay clientes en riesgo de churn según la lógica actual.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Frecuencia (días)</TableHead>
                <TableHead>Sin volver (días)</TableHead>
                <TableHead>Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.customer_id}>
                  <TableCell className="font-medium">
                    {r.first_name} {r.last_name}
                  </TableCell>
                  <TableCell>{r.total_visits}</TableCell>
                  <TableCell>
                    {r.visit_frequency_days?.toFixed?.(1) ?? r.visit_frequency_days}
                  </TableCell>
                  <TableCell>{r.days_since_last_visit}</TableCell>
                  <TableCell>{fmtCents(r.total_spent_cents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
