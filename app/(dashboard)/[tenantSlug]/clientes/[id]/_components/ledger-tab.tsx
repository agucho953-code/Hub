import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LedgerEntry, RedemptionListEntry } from '@/lib/points/queries'

export function LedgerTab({
  ledger,
  redemptions,
  balance,
}: {
  ledger: LedgerEntry[]
  redemptions: RedemptionListEntry[]
  balance: number
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            Balance: <span className="text-emerald-600">{balance} pts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ledger.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted-foreground">Sin movimientos todavía.</p>
          ) : (
            <ul className="divide-y">
              {ledger.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-2 text-sm">
                  <span
                    className={`shrink-0 font-mono font-semibold ${
                      e.delta > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {e.delta > 0 ? '+' : ''}
                    {e.delta}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{describeReason(e)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(e.created_at), 'd MMM yyyy · HH:mm', { locale: es })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canjes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {redemptions.length === 0 ? (
            <p className="px-6 py-6 text-sm text-muted-foreground">Sin canjes.</p>
          ) : (
            <ul className="divide-y">
              {redemptions.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{r.reward_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(r.redeemed_at), 'd MMM yyyy', { locale: es })} ·{' '}
                      <span className="capitalize">{r.status}</span>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-red-600">−{r.points_spent}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function describeReason(e: LedgerEntry): string {
  if (e.reason === 'rule_engine') {
    const breakdown = e.payload as unknown as { description: string }[]
    if (Array.isArray(breakdown) && breakdown.length > 0) {
      return `Visita · ${breakdown.map((b) => b.description).join(' + ')}`
    }
    return 'Visita'
  }
  if (e.reason === 'reward_redeem') {
    const payload = e.payload as { reward_name?: string }
    return `Canje · ${payload.reward_name ?? 'recompensa'}`
  }
  return e.reason
}
