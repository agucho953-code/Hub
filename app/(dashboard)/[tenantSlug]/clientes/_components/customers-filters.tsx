'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Tag = { id: string; name: string; color: string }

export function CustomersFilters({ tags }: { tags: Tag[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, start] = useTransition()

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value && value.length > 0) next.set(key, value)
    else next.delete(key)
    next.delete('page') // resetear paginado al cambiar filtros
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = fd.get('q')
    setParam('q', typeof q === 'string' ? q : null)
  }

  const q = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const since = searchParams.get('since') ?? ''

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"
      aria-busy={pending}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder="Buscar por nombre o teléfono…"
        autoComplete="off"
      />
      <Select
        defaultValue={tag || 'all'}
        onValueChange={(v) => setParam('tag', v === 'all' ? null : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Etiqueta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las etiquetas</SelectItem>
          {tags.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={since || 'any'}
        onValueChange={(v) => setParam('since', v === 'any' ? null : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Última visita" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Cualquier visita</SelectItem>
          <SelectItem value="30d">Últimos 30 días</SelectItem>
          <SelectItem value="90d">Últimos 90 días</SelectItem>
          <SelectItem value="never">Nunca volvió</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="default">
        Buscar
      </Button>
    </form>
  )
}
