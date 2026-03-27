import { Resend } from 'resend'

let resendClient: Resend | null = null

export const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  process.env.EMAIL_FROM ||
  'Schedly <onboarding@resend.dev>'

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

type SendResendEmailOptions = {
  from?: string
  html?: string
  subject: string
  text?: string
  to: string | string[]
}

export async function sendResendEmail({
  from = RESEND_FROM_EMAIL,
  html,
  subject,
  text,
  to,
}: SendResendEmailOptions) {
  const resend = getResendClient()
  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  } as any)

  if (result.error) {
    throw new Error(result.error.message || 'Failed to send email with Resend')
  }

  return result.data
}