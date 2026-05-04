import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DataTableShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'card-hairline relative overflow-hidden rounded-xl border bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DataTableScroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>
}

export function DataTableRoot({ children }: { children: ReactNode }) {
  return <table className="w-full text-sm">{children}</table>
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border/60 bg-secondary/30 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </thead>
  )
}

export function DataTableHeader({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <th scope="col" className={cn('px-4 py-2.5 font-semibold', className)}>
      {children}
    </th>
  )
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border/60">{children}</tbody>
}

export function DataTableRow({
  className,
  children,
  onClick,
}: {
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors',
        onClick ? 'cursor-pointer hover:bg-secondary/40' : 'hover:bg-secondary/30',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function DataTableCell({
  className,
  children,
  colSpan,
}: {
  className?: string
  children: ReactNode
  colSpan?: number
}) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3 align-middle', className)}>
      {children}
    </td>
  )
}

export function DataTableFooter({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border/60 bg-secondary/20 px-4 py-2.5 text-xs text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}
