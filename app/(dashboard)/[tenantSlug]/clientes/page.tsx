import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { listCaptureLinks, listCustomers, listTags, PAGE_SIZE } from '@/lib/customers/queries'
import { listFiltersSchema } from '@/lib/customers/schemas'
import { requireTenantAccess, TenantNotFoundError } from '@/lib/tenant'
import { CustomersFilters } from './_components/customers-filters'
import { CustomersTable } from './_components/customers-table'

export const metadata = { title: 'Clientes — HUB' }

export default async function ClientesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { tenantSlug } = await params
  const sp = await searchParams

  let access: Awaited<ReturnType<typeof requireTenantAccess>>
  try {
    access = await requireTenantAccess(tenantSlug)
  } catch (error) {
    if (error instanceof TenantNotFoundError) notFound()
    throw error
  }

  const filters = listFiltersSchema.parse({
    q: sp.q,
    tag: sp.tag,
    since: sp.since,
    page: sp.page ?? 1,
  })

  const [{ rows, total }, tags, links] = await Promise.all([
    listCustomers({ tenantId: access.tenant.id, filters }),
    listTags({ tenantId: access.tenant.id }),
    listCaptureLinks({ tenantId: access.tenant.id }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasCaptureLinks = links.length > 0

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'cliente' : 'clientes'} en total
          </p>
        </div>
        <div className="flex gap-2">
          {!hasCaptureLinks ? (
            <Button asChild variant="outline">
              <Link href={`/${tenantSlug}/configuracion/captura`}>Crear link de captura</Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href={`/${tenantSlug}/clientes/nuevo`}>Nuevo cliente</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="py-4">
          <CustomersFilters tags={tags} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <CustomersTable rows={rows} tenantSlug={tenantSlug} />
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <Pagination tenantSlug={tenantSlug} page={filters.page} totalPages={totalPages} sp={sp} />
      ) : null}
    </main>
  )
}

function Pagination({
  tenantSlug,
  page,
  totalPages,
  sp,
}: {
  tenantSlug: string
  page: number
  totalPages: number
  sp: Record<string, string | string[] | undefined>
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === 'string') params.set(k, v)
    }
    params.set('page', String(p))
    return `/${tenantSlug}/clientes?${params.toString()}`
  }
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? <Link href={buildHref(page - 1)}>Anterior</Link> : <span>Anterior</span>}
      </Button>
      <span className="text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
        {page < totalPages ? (
          <Link href={buildHref(page + 1)}>Siguiente</Link>
        ) : (
          <span>Siguiente</span>
        )}
      </Button>
    </div>
  )
}
