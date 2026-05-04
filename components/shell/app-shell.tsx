import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMembershipsForUser } from '@/lib/tenant'
import type { Tenant, TenantRole } from '@/lib/tenant/types'
import { MobileShell } from './mobile-shell'
import { SidebarContent } from './sidebar-content'
import { UserMenu } from './user-menu'

export async function AppShell({
  tenant,
  role,
  children,
}: {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug' | 'logo_url'>
  role: TenantRole
  children: React.ReactNode
}) {
  const memberships = await getMembershipsForUser()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? ''

  return (
    <div className="bg-app-gradient relative min-h-screen">
      {/* Sidebar fija — desktop */}
      <aside
        aria-label="Navegación principal"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-surface/80 backdrop-blur-xl lg:flex"
      >
        <SidebarContent tenant={tenant} role={role} memberships={memberships} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <MobileShell tenant={tenant} role={role} memberships={memberships} />

          <div className="hidden flex-1 items-center md:flex">
            <button
              type="button"
              disabled
              className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-card disabled:cursor-not-allowed"
            >
              <Search className="size-4" />
              <span className="flex-1 truncate">Buscar clientes, eventos, mesas…</span>
              <kbd className="hidden items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <UserMenu email={email} role={role} />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
