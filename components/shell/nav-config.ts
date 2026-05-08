import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Settings2,
  Stamp,
  Star,
  Users,
  UsersRound,
  UtensilsCrossed,
  Workflow,
} from 'lucide-react'
import type { TenantRole } from '@/lib/tenant/types'

export type NavItem = {
  label: string
  href: (slug: string) => string
  icon: LucideIcon
  /** Si está, sólo se muestra a estos roles. Si no, a todos. */
  roles?: TenantRole[]
  /** Match exacto (true) o prefijo (false, default). */
  exact?: boolean
  /** Abre en nueva pestaña. Para "Salón en vivo" desde el manager. */
  newTab?: boolean
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/**
 * Information architecture del Manager Workspace — 6 dominios.
 * Cada dominio agrupa por job-to-be-done del owner:
 *   HOY       — qué está pasando ahora
 *   CLIENTES  — quién viene
 *   MARKETING — cómo los traigo de vuelta
 *   CATÁLOGO  — qué vendo y cómo se premia
 *   INSIGHTS  — qué entiendo
 *   AJUSTES   — cómo lo configuro
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Hoy',
    items: [
      {
        label: 'Resumen',
        href: (s) => `/${s}`,
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Salón en vivo',
        href: (s) => `/${s}/sesiones`,
        icon: ClipboardList,
        newTab: true,
        roles: ['owner'],
      },
      {
        label: 'Bandeja',
        href: (s) => `/${s}/bandeja`,
        icon: Inbox,
      },
    ],
  },
  {
    label: 'Clientes',
    items: [
      {
        label: 'Personas',
        href: (s) => `/${s}/clientes`,
        icon: Users,
      },
      {
        label: 'Audiencias',
        href: (s) => `/${s}/audiencias`,
        icon: UsersRound,
        roles: ['owner'],
      },
    ],
  },
  {
    label: 'Marketing',
    items: [
      {
        label: 'Difusiones',
        href: (s) => `/${s}/difusiones`,
        icon: Megaphone,
        roles: ['owner'],
      },
      {
        label: 'Flows',
        href: (s) => `/${s}/flows`,
        icon: Workflow,
        roles: ['owner'],
      },
      {
        label: 'Eventos',
        href: (s) => `/${s}/eventos`,
        icon: CalendarDays,
      },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      {
        label: 'Menú',
        href: (s) => `/${s}/menu`,
        icon: UtensilsCrossed,
        roles: ['owner'],
      },
      {
        label: 'Puntos',
        href: (s) => `/${s}/puntos`,
        icon: Star,
        roles: ['owner'],
      },
      {
        label: 'Punch cards',
        href: (s) => `/${s}/punch-cards`,
        icon: Stamp,
        roles: ['owner'],
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Estadísticas',
        href: (s) => `/${s}/estadisticas`,
        icon: BarChart3,
        roles: ['owner'],
      },
    ],
  },
  {
    label: 'Ajustes',
    items: [
      {
        label: 'Configuración',
        href: (s) => `/${s}/configuracion`,
        icon: Settings2,
        roles: ['owner'],
      },
    ],
  },
]

export function visibleGroups(role: TenantRole): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)
}
