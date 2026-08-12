// FILE: client/src/services/email.ts
import emailjs from '@emailjs/browser'

export interface EmailPayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface EmailJsConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export const EMAILJS_CONFIGURED = Boolean(
  import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
)

function isConfigured(cfg: EmailJsConfig): boolean {
  return Boolean(cfg.serviceId && cfg.templateId && cfg.publicKey)
}

export async function sendEmail(payload: EmailPayload, cfg: EmailJsConfig): Promise<void> {
  if (!isConfigured(cfg)) {
    throw new Error('EMAILJS_NOT_CONFIGURED')
  }

  emailjs.init({ publicKey: cfg.publicKey })

  await emailjs.send(cfg.serviceId, cfg.templateId, {
    from_name: payload.name,
    from_email: payload.email,
    subject: payload.subject,
    message: payload.message,
    to_name: 'Rifqi Ardiansyah',
  })
}
