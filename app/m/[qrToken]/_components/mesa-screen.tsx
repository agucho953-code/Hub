'use client'

import { Sparkles, UserCircle2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { joinSession } from '@/lib/m-session/actions'
import { getOrCreateBrowserToken } from '@/lib/m-session/browser-token'
import { RegisterDialog } from './register-dialog'

type SessionInfo = {
  sessionId: string
  guestId: string
  wasNewGuest: boolean
}

export function MesaScreen({
  qrToken,
  tableLabel,
  tenantName,
}: {
  qrToken: string
  tableLabel: string
  tenantName: string
}) {
  const [browserToken, setBrowserToken] = useState<string | null>(null)
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [registered, setRegistered] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getOrCreateBrowserToken()
    setBrowserToken(token)
  }, [])

  useEffect(() => {
    if (!browserToken) return
    let cancelled = false
    void (async () => {
      const result = await joinSession({ qrToken, browserToken, displayName: null })
      if (cancelled) return
      if (result.ok) {
        setSession({
          sessionId: result.sessionId,
          guestId: result.guestId,
          wasNewGuest: result.wasNewGuest,
        })
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [browserToken, qrToken])

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {tenantName}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{tableLabel}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {error ? 'No pudimos abrir tu mesa.' : 'Estás en tu mesa.'}
        </p>
      </div>

      {session && !registered && (
        <div className="card-hairline space-y-4 rounded-2xl border bg-card/90 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span>Sumá puntos en cada pedido.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Cargá tu teléfono y nombre en 30 segundos. Es opcional — podés pedir igual sin
            registrarte.
          </p>
          <Button className="w-full" onClick={() => setShowRegister(true)}>
            Registrarme para sumar puntos
          </Button>
        </div>
      )}

      {registered && (
        <div className="card-hairline space-y-2 rounded-2xl border bg-card/90 p-5 shadow-xl">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle2 className="size-4 text-primary" />
            <span>Estás registrado para sumar puntos.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            En el próximo plan vas a poder pedir desde acá. Por ahora pedile al mozo lo que quieras
            y al cobrar la mesa sumás tus puntos.
          </p>
        </div>
      )}

      {session && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Users className="size-3" />
          Sesión abierta · ID interno {session.sessionId.slice(0, 8)}
        </p>
      )}

      {session && showRegister && browserToken && (
        <RegisterDialog
          qrToken={qrToken}
          browserToken={browserToken}
          tenantName={tenantName}
          onClose={() => setShowRegister(false)}
          onRegistered={() => {
            setRegistered(true)
            setShowRegister(false)
            toast.success('¡Listo! Tus puntos van a sumarse al cerrar la mesa.')
          }}
        />
      )}
    </div>
  )
}
