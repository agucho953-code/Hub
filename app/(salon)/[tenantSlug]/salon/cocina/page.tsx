import { ChefHat } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Salón · Cocina' }

export default async function SalonCocinaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Salón"
        title="Cocina"
        description="Tickets activos en cola. Empezar, listo o marcar sin stock."
      />
      <EmptyState
        icon={ChefHat}
        title="Próximamente"
        description="El KDS mobile aterriza en el próximo commit. Por ahora podés ver la cocina desde /cocina con el dashboard viejo."
      />
    </div>
  )
}
