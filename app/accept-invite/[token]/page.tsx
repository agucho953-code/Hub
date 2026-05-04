import { Mail } from 'lucide-react'
import { BrandMark, BrandWordmark } from '@/components/shell/brand-mark'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteClient } from './accept-invite-client'

export const metadata = { title: 'Aceptar invitación' }

type Preview = {
  email: string
  role: 'owner' | 'cashier' | 'waiter'
  tenant_name: string
  expired: boolean
}

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: previewArr } = await supabase.rpc('get_invitation_preview', { p_token: token })
  const preview = (previewArr as Preview[] | null)?.[0] ?? null
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="bg-app-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[480px] w-[680px] rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-2.5">
          <BrandMark className="size-9" />
          <BrandWordmark className="text-base" />
        </div>

        <div className="card-hairline relative overflow-hidden rounded-2xl border bg-card/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mail className="size-5" />
            </div>
            <h1 className="mt-4 font-display text-xl font-semibold tracking-tight">
              {preview ? 'Tenés una invitación' : 'Invitación no encontrada'}
            </h1>
            {preview ? (
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                Te invitaron a unirte a{' '}
                <strong className="text-foreground">{preview.tenant_name}</strong> como{' '}
                <Badge variant="outline" className="ml-0.5 capitalize">
                  {preview.role}
                </Badge>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Esta invitación no existe o ya fue usada. Pedile al owner del bar que te genere una
                nueva.
              </p>
            )}
          </div>

          {preview ? (
            preview.expired ? (
              <p className="mt-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-center text-sm text-warning">
                La invitación expiró. Pedile al owner que genere una nueva.
              </p>
            ) : (
              <div className="mt-6">
                <AcceptInviteClient
                  token={token}
                  preview={preview}
                  currentEmail={user?.email ?? null}
                />
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  )
}
