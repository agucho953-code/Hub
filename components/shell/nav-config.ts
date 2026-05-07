import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChefHat,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  MessageSquareText,
  QrCode,
  Receipt,
  Settings2,
  Sparkles,
  Stamp,
  Star,
  Tags,
  Users,
  UsersRound,
  UtensilsCrossed,
  Workflow,
  Zap,
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
  /** Para el atajo destacado tipo CTA. */
  emphasis?: boolean
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      {
        label: 'Resumen',
        href: (s) => `/${s}`,
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Sesiones',
        href: (s) => `/${s}/sesiones`,
        icon: ClipboardList,
        emphasis: true,
        roles: ['owner', 'cashier', 'waiter'],
      },
      {
        label: 'Cocina',
        href: (s) => `/${s}/cocina`,
        icon: ChefHat,
        roles: ['owner', 'kitchen'],
      },
      {
        label: 'Cerrar mesa (legacy)',
        href: (s) => `/${s}/visitas/nueva`,
        icon: Receipt,
        roles: ['owner', 'cashier'],
      },
      {
        label: 'Clientes',
        href: (s) => `/${s}/clientes`,
        icon: Users,
      },
      {
        label: 'Eventos',
        href: (s) => `/${s}/eventos`,
        icon: CalendarDays,
      },
      {
        label: 'Bandeja',
        href: (s) => `/${s}/bandeja`,
        icon: Inbox,
      },
    ],
  },
  {
    label: 'Ayuda',
    items: [
      {
        label: 'Documentación',
        href: (s) => `/${s}/docs`,
        icon: BookOpen,
      },
    ],
  },
  {
    label: 'Análisis',
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
    label: 'Marketing',
    items: [
      {
        label: 'Audiencias',
        href: (s) => `/${s}/audiencias`,
        icon: UsersRound,
        roles: ['owner'],
      },
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
    ],
  },
  {
    label: 'Configuración',
    items: [
      {
        label: 'Menú',
        href: (s) => `/${s}/menu`,
        icon: UtensilsCrossed,
        roles: ['owner'],
      },
      {
        label: 'Mesas',
        href: (s) => `/${s}/configuracion/mesas`,
        icon: LayoutGrid,
        roles: ['owner'],
      },
      {
        label: 'Puntos',
        href: (s) => `/${s}/configuracion/puntos`,
        icon: Star,
        roles: ['owner'],
      },
      {
        label: 'Punch cards',
        href: (s) => `/${s}/configuracion/punch-cards`,
        icon: Stamp,
        roles: ['owner'],
      },
      {
        label: 'Tags de carta',
        href: (s) => `/${s}/configuracion/tags`,
        icon: Tags,
        roles: ['owner'],
      },
      {
        label: 'Auto-aceptación',
        href: (s) => `/${s}/configuracion/auto-aceptacion`,
        icon: Zap,
        roles: ['owner'],
      },
      {
        label: 'Captura legacy',
        href: (s) => `/${s}/configuracion/captura`,
        icon: QrCode,
        roles: ['owner'],
      },
      {
        label: 'Canales',
        href: (s) => `/${s}/configuracion/canales`,
        icon: Sparkles,
        roles: ['owner'],
      },
      {
        label: 'Plantillas',
        href: (s) => `/${s}/configuracion/templates`,
        icon: MessageSquareText,
        roles: ['owner'],
      },
      {
        label: 'Equipo',
        href: (s) => `/${s}/configuracion/equipo`,
        icon: UsersRound,
        roles: ['owner'],
      },
      {
        label: 'Preferencias',
        href: (s) => `/${s}/configuracion`,
        icon: Settings2,
        roles: ['owner'],
        exact: true,
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
