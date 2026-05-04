'use client'

import { Button } from '@/components/ui/button'

export function ConnectButton({
  type,
  tenantSlug,
}: {
  type: 'whatsapp' | 'instagram'
  tenantSlug: string
}) {
  const href = `/api/meta/${type}/connect?tenant=${encodeURIComponent(tenantSlug)}`
  const label = type === 'whatsapp' ? 'Conectar WhatsApp' : 'Conectar Instagram'
  return (
    <Button asChild>
      <a href={href}>{label}</a>
    </Button>
  )
}
