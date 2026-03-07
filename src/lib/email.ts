import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  text?: string
  html?: string
}

async function createTransporter() {
  // Prefer explicit SMTP config in production
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'true' || (port === 465)

  if (host && port) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    })
  }

  // Support SendGrid via API key using SMTP credentials (user 'apikey')
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      secure: true,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    })
  }

  // Development fallback: Ethereal test account
  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  }

  throw new Error('No mail transporter configured. Set SMTP_HOST/SMTP_PORT or SENDGRID_API_KEY')
}

export async function sendMail(opts: MailOptions) {
  const transporter = await createTransporter()
  const from = process.env.EMAIL_FROM || `no-reply@${process.env.NEXT_PUBLIC_URL?.replace(/^https?:\/\//, '') || 'schedly.local'}`

  const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html })

  // In development with Ethereal provide preview URL
  const preview = (nodemailer as any).getTestMessageUrl ? (nodemailer as any).getTestMessageUrl(info) : null
  return { info, preview }
}
