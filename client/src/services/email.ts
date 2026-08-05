// FILE: client/src/services/email.ts
import emailjs from '@emailjs/browser'

export interface EmailPayload {
  name: string
  email: string
  subject: string
  message: string
}

export const EMAILJS_CONFIGURED = Boolean(
  import.meta.env.VITE_EMAILJS_SERVICE_ID &&
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
)

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EMAILJS_NOT_CONFIGURED')
  }

  emailjs.init({ publicKey })

  await emailjs.send(serviceId, templateId, {
    from_name: payload.name,
    from_email: payload.email,
    subject: payload.subject,
    message: payload.message,
    to_name: 'Rifqi Ardiansyah',
  })
}
