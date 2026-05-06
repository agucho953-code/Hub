import { z } from 'zod'
import { tryNormalizePhone } from '@/lib/phone'

const browserTokenField = z.string().min(16, 'Token inválido').max(64, 'Token inválido')

const qrTokenField = z.string().min(8, 'QR inválido').max(32, 'QR inválido')

const phoneField = z
  .string()
  .min(1, 'Ingresá un teléfono')
  .transform((v, ctx) => {
    const normalized = tryNormalizePhone(v)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Teléfono inválido' })
      return z.NEVER
    }
    return normalized
  })

const nameField = z.string().trim().min(1, 'Requerido').max(60, 'Máximo 60')

export const joinSessionSchema = z.object({
  qr_token: qrTokenField,
  browser_token: browserTokenField,
  display_name: z
    .union([z.string().trim().min(1).max(40), z.literal(''), z.null(), z.undefined()])
    .transform((v) => (typeof v === 'string' && v.length > 0 ? v : null)),
})

export const registerCustomerSchema = z.object({
  qr_token: qrTokenField,
  browser_token: browserTokenField,
  phone: phoneField,
  first_name: nameField,
  last_name: nameField,
  birthdate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido'), z.literal('')])
    .transform((v) => (v && v.length > 0 ? v : null))
    .nullable()
    .optional(),
  opt_in_marketing: z.coerce.boolean().default(false),
  // honeypot
  website: z.string().optional(),
})
