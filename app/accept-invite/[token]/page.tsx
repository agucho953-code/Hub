import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteClient } from './accept-invite-client'

export const metadata = { title: 'Aceptar invitación — HUB' }

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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invitación a HUB</CardTitle>
          <CardDescription>
            {preview
              ? `Te invitaron a "${preview.tenant_name}" como ${preview.role}.`
              : 'Esta invitación no existe o ya fue usada.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview ? (
            <p className="text-sm text-muted-foreground">
              Pedile al owner del bar que te genere una nueva.
            </p>
          ) : preview.expired ? (
            <p className="text-sm text-muted-foreground">La invitación expiró.</p>
          ) : (
            <AcceptInviteClient
              token={token}
              preview={preview}
              currentEmail={user?.email ?? null}
            />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
