import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = { title: 'Salón · Bandeja' }

export default async function SalonBandejaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Salón"
        title="Bandeja"
        description="Mensajes de WhatsApp e Instagram. Respondé desde el celular."
      />
      <EmptyState
        icon={Inbox}
        title="Próximamente"
        description="La bandeja mobile aterriza en el próximo commit. Por ahora podés ver tus conversaciones desde /bandeja con el dashboard viejo."
      />
    </div>
  )
}
