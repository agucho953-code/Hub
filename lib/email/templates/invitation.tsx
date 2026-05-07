import 'server-only'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { render } from '@react-email/render'
import type { TenantRole } from '@/lib/tenant/types'

const ROLE_LABELS: Record<TenantRole, string> = {
  owner: 'Owner',
  cashier: 'Cajero',
  waiter: 'Mozo',
  kitchen: 'Cocina',
}

export type InvitationEmailProps = {
  tenantName: string
  inviterName: string | null
  role: TenantRole
  acceptUrl: string
}

function InvitationEmail({ tenantName, inviterName, role, acceptUrl }: InvitationEmailProps) {
  const roleLabel = ROLE_LABELS[role]
  const inviter = inviterName?.trim() ? `${inviterName} (${tenantName})` : tenantName
  const previewText = `${inviter} te invitó al equipo de ${tenantName} como ${roleLabel}.`

  return (
    <Html lang="es-AR">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={eyebrow}>Invitación al equipo</Text>
            <Heading style={heading}>{tenantName}</Heading>
            <Text style={paragraph}>
              <strong>{inviter}</strong> te sumó al equipo con el rol de{' '}
              <strong>{roleLabel}</strong>.
            </Text>
            <Text style={paragraph}>
              Aceptá la invitación para acceder a tu panel desde tu celular o computadora.
            </Text>
            <Section style={btnWrapper}>
              <Button href={acceptUrl} style={button}>
                Aceptar invitación
              </Button>
            </Section>
            <Hr style={hr} />
            <Text style={smallNote}>
              Si el botón no funciona, copiá y pegá este link en tu navegador:
              <br />
              <Link href={acceptUrl} style={smallLink}>
                {acceptUrl}
              </Link>
            </Text>
          </Section>
          <Text style={footer}>Si no esperabas esta invitación, podés ignorar este email.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: '#f5f5f4',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}
const container: React.CSSProperties = {
  maxWidth: 520,
  margin: '32px auto',
  padding: '0 16px',
}
const card: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 12,
  padding: '32px 28px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
}
const eyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1.6px',
  color: '#6b7280',
}
const heading: React.CSSProperties = {
  margin: '4px 0 16px',
  fontSize: 22,
  lineHeight: 1.3,
  color: '#111827',
  fontWeight: 600,
}
const paragraph: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 14,
  color: '#374151',
  lineHeight: 1.5,
}
const btnWrapper: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0',
}
const button: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 28px',
  background: '#111827',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
}
const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
}
const smallNote: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#6b7280',
  lineHeight: 1.5,
}
const smallLink: React.CSSProperties = {
  color: '#2563eb',
  wordBreak: 'break-all',
}
const footer: React.CSSProperties = {
  margin: '16px 0 0',
  textAlign: 'center',
  fontSize: 11,
  color: '#9ca3af',
}

export type RenderedInvitation = {
  subject: string
  html: string
  text: string
  reactElement: React.ReactElement
}

export async function renderInvitationEmail(
  input: InvitationEmailProps & { to: string },
): Promise<RenderedInvitation> {
  const roleLabel = ROLE_LABELS[input.role]
  const subject = `Te invitaron a ${input.tenantName} como ${roleLabel}`
  const inviter = input.inviterName?.trim()
    ? `${input.inviterName} (${input.tenantName})`
    : input.tenantName
  const text = `Hola,

${inviter} te invitó al equipo de ${input.tenantName} con el rol de ${roleLabel}.

Para aceptar la invitación y empezar a usar tu panel, abrí este link:
${input.acceptUrl}

Si no esperabas esta invitación, podés ignorar este email.

— Plataforma HUB`

  const reactElement = (
    <InvitationEmail
      tenantName={input.tenantName}
      inviterName={input.inviterName}
      role={input.role}
      acceptUrl={input.acceptUrl}
    />
  )
  const html = await render(reactElement)

  return { subject, html, text, reactElement }
}

export { InvitationEmail }
