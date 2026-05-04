import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CustomerListRow } from '@/lib/customers/queries'
import { formatPhoneForDisplay } from '@/lib/phone'
import { TagPill } from './tag-pill'

export function CustomersTable({
  rows,
  tenantSlug,
}: {
  rows: CustomerListRow[]
  tenantSlug: string
}) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-sm text-muted-foreground">
        Todavía no hay clientes que coincidan con la búsqueda.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Etiquetas</TableHead>
          <TableHead>Última visita</TableHead>
          <TableHead className="text-right">Puntos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((c) => (
          <TableRow
            key={c.id}
            className="cursor-pointer"
            data-href={`/${tenantSlug}/clientes/${c.id}`}
          >
            <TableCell>
              <Link
                href={`/${tenantSlug}/clientes/${c.id}`}
                className="font-medium hover:underline"
              >
                {c.first_name} {c.last_name}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-xs">{formatPhoneForDisplay(c.phone)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {c.tags.length === 0 ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : (
                  c.tags.map((t) => <TagPill key={t.id} tag={t} />)
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {c.last_visit_at
                ? format(new Date(c.last_visit_at), "d 'de' MMM yyyy", { locale: es })
                : 'Nunca'}
            </TableCell>
            <TableCell className="text-right font-medium">{c.points_balance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
