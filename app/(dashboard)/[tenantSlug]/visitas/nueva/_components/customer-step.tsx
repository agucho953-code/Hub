'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCustomer } from '@/lib/customers/actions'
import { type CustomerSearchResult, searchCustomers } from '@/lib/customers/search'
import { formatPhoneForDisplay } from '@/lib/phone'
import type { WizardCustomer } from './wizard'

export function CustomerStep({
  tenantSlug,
  selected,
  onSelect,
}: {
  tenantSlug: string
  selected: WizardCustomer | null
  onSelect: (c: WizardCustomer) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const handle = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }
      setSearching(true)
      const data = await searchCustomers(tenantSlug, query)
      if (!cancelled) {
        setResults(data)
        setSearching(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [query, tenantSlug])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Nombre, apellido o teléfono…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="divide-y rounded-md border">
          {searching ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">Buscando…</div>
          ) : results.length === 0 && query.trim().length >= 2 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">Sin resultados.</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              Empezá a escribir para buscar.
            </div>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <div>
                  <div className="font-medium">
                    {c.first_name} {c.last_name}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {formatPhoneForDisplay(c.phone)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{c.points_balance} pts</div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setNewOpen(true)}>
            + Nuevo cliente
          </Button>
          {selected ? (
            <span className="text-sm text-muted-foreground">
              Seleccionado: <strong>{selected.first_name}</strong>
            </span>
          ) : null}
        </div>

        {newOpen ? (
          <NewCustomerDialog
            tenantSlug={tenantSlug}
            onClose={() => setNewOpen(false)}
            onCreated={(c) => {
              setNewOpen(false)
              onSelect(c)
            }}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}

function NewCustomerDialog({
  tenantSlug,
  onClose,
  onCreated,
}: {
  tenantSlug: string
  onClose: () => void
  onCreated: (c: WizardCustomer) => void
}) {
  const [phone, setPhone] = useState('')
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [pending, start] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('phone', phone)
    fd.set('first_name', first)
    fd.set('last_name', last)
    start(async () => {
      const r = await createCustomer(tenantSlug, { ok: true }, fd)
      if (r.ok && r.customerId) {
        onCreated({
          id: r.customerId,
          first_name: first,
          last_name: last,
          phone,
          points_balance: 0,
        })
      } else if (!r.ok) {
        toast.error(r.message)
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="nc-phone">Teléfono</Label>
            <Input
              id="nc-phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="351 555 1234"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="nc-first">Nombre</Label>
              <Input
                id="nc-first"
                required
                value={first}
                onChange={(e) => setFirst(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nc-last">Apellido</Label>
              <Input id="nc-last" required value={last} onChange={(e) => setLast(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={pending} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creando…' : 'Crear y continuar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
