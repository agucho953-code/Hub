import 'server-only'
import type { TenantRole } from '@/lib/tenant/types'

const ROLE_LABELS: Record<TenantRole, string> = {
  owner: 'Owner',
  cashier: 'Cajero',
  waiter: 'Mozo',
  kitchen: 'Cocina',
}

export type InvitationEmail = {
  to: string
  tenantName: string
  inviterName: string | null
  role: TenantRole
  acceptUrl: string
}

export function renderInvitationEmail(input: InvitationEmail): {
  subject: string
  html: string
  text: string
} {
  const roleLabel = ROLE_LABELS[input.role]
  const inviter = input.inviterName?.trim()
    ? `${input.inviterName} (${input.tenantName})`
    : input.tenantName

  const subject = `Te invitaron a ${input.tenantName} como ${roleLabel}`

  const text = `Hola,

${inviter} te invitó al equipo de ${input.tenantName} con el rol de ${roleLabel}.

Para aceptar la invitación y empezar a usar tu panel, abrí este link:
${input.acceptUrl}

Si no esperabas esta invitación, podés ignorar este email.

— Plataforma HUB`

  // HTML simple inline-styled, sin imágenes ni dependencias externas.
  // Compatible con clientes de email mainstream (Gmail, Outlook, Apple Mail).
  const html = `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:32px auto;padding:0 16px;">
    <div style="background:#fff;border-radius:12px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.6px;color:#6b7280;">
        Invitación al equipo
      </p>
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827;font-weight:600;">
        ${escapeHtml(input.tenantName)}
      </h1>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.5;">
        ${escapeHtml(inviter)} te sumó al equipo con el rol de
        <strong>${escapeHtml(roleLabel)}</strong>.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.5;">
        Aceptá la invitación para acceder a tu panel desde tu celular o computadora.
      </p>
      <div style="margin:28px 0;text-align:center;">
        <a href="${escapeHtml(input.acceptUrl)}"
           style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          Aceptar invitación
        </a>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
        Si el botón no funciona, copiá y pegá este link en tu navegador:<br>
        <a href="${escapeHtml(input.acceptUrl)}" style="color:#2563eb;word-break:break-all;">${escapeHtml(input.acceptUrl)}</a>
      </p>
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#9ca3af;">
      Si no esperabas esta invitación, podés ignorar este email.
    </p>
  </div>
</body>
</html>`

  return { subject, html, text }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
