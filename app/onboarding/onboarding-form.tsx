'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { slugify } from '@/lib/tenant/slugify'
import { type CreateTenantState, createTenant } from './actions'

const initialState: CreateTenantState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Creando…' : 'Crear bar'}
    </Button>
  )
}

export function OnboardingForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(createTenant, initialState)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  useEffect(() => {
    if (state.status === 'error' && state.message) toast.error(state.message)
    if (state.status === 'success' && state.redirectTo) {
      toast.success('Bar creado.')
      router.replace(state.redirectTo)
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Creá tu bar</CardTitle>
        <CardDescription>Esto va a ser tu espacio en HUB.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bar HUB"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]{2,40}"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugTouched(true)
              }}
              placeholder="bar-hub"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Tu URL va a ser <code>/{slug || 'tu-slug'}</code>. Solo minúsculas, números y guiones.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
}
