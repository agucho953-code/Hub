import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">HUB Platform</h1>
        <p className="max-w-md text-muted-foreground">
          CRM multi-tenant para bares. Captura, fideliza y comunicate con tus clientes.
        </p>
        <Button size="lg" className="gap-2">
          <Sparkles className="size-4" />
          Botón de prueba
        </Button>
      </div>
    </main>
  )
}
