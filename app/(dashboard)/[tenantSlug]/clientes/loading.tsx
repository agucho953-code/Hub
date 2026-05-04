import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientesLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Card className="mb-4">
        <CardContent className="flex gap-3 py-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 py-4">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((k) => (
            <Skeleton key={k} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
