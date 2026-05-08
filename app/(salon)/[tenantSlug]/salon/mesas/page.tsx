import { ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Salón · Mesas' }

export default async function SalonMesasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Salón"
        title="Mesas activas"
        description="Cada mesa abierta en tu turno. Tap para entrar, swipe-left para marcar pagada."
      />
      <EmptyState
        icon={ClipboardList}
        title="Casi listo"
        description="La vista de mesas en vivo aterriza en el próximo commit del rediseño. Mientras tanto, podés entrar a /sesiones para ver las mesas con el viejo dashboard."
      />
    </div>
  )
}
