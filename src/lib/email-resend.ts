import { generateGoogleCalendarLink } from './calendar'
import { EMAIL_PALETTE, renderEmailLayout, renderEmailPanel } from './email-theme'
import { sendResendEmail } from './resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function logEmailError(type: string, error: unknown) {
  console.error(`Error sending ${type} email:`, error)
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await sendResendEmail({
      to,
      subject: 'Bem-vindo ao Schedly!',
      html: renderEmailLayout({
        eyebrow: 'Boas-vindas',
        title: `Olá, ${name}!`,
        description:
          'Seu período de teste já começou. Aproveite os próximos dias para configurar sua agenda e conhecer todos os recursos do produto.',
        contentHtml: renderEmailPanel(
          `
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};">
              Explore todos os recursos do Schedly durante os próximos 3 dias e ajuste sua agenda do jeito que fizer mais sentido para o seu negócio.
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">
              Quando estiver pronto, basta acessar seu painel para criar tipos de evento, horários e links de agendamento.
            </p>
          `,
          'primary'
        ),
        primaryAction: {
          label: 'Acessar meu painel',
          url: `${APP_URL}/dashboard`,
        },
        footerHtml:
          'Você recebeu este e-mail porque criou uma conta no <strong>Schedly</strong>.',
      }),
    })
  } catch (error) {
    logEmailError('welcome', error)
  }
}

export async function sendTrialEndingEmail(to: string, name: string) {
  try {
    await sendResendEmail({
      to,
      subject: 'Seu período de teste está acabando',
      html: renderEmailLayout({
        eyebrow: 'Período de teste',
        title: `Olá, ${name}!`,
        description:
          'Seu período de teste está perto do fim. Escolha um plano para continuar usando todos os recursos sem interrupções.',
        contentHtml: renderEmailPanel(
          `
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};">
              Seu teste gratuito termina em breve e seu acesso pode ser limitado caso nenhum plano seja selecionado.
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">
              Faça o upgrade quando quiser para manter seus agendamentos, disponibilidade e integrações funcionando normalmente.
            </p>
          `,
          'default'
        ),
        primaryAction: {
          label: 'Escolher um plano',
          url: `${APP_URL}/billing`,
        },
        footerHtml:
          'Você recebeu este e-mail porque sua conta de teste no <strong>Schedly</strong> está perto do vencimento.',
      }),
    })
  } catch (error) {
    logEmailError('trial ending', error)
  }
}

export async function sendSubscriptionSuccessEmail(to: string, name: string, planName: string) {
  try {
    await sendResendEmail({
      to,
      subject: 'Assinatura confirmada!',
      html: renderEmailLayout({
        eyebrow: 'Assinatura ativa',
        title: `Parabéns, ${name}!`,
        description:
          'Seu pagamento foi confirmado e sua assinatura já está ativa. Você pode continuar usando a plataforma sem limitações do período de teste.',
        contentHtml: renderEmailPanel(
          `
            <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};">
              O plano <strong>${planName}</strong> foi confirmado com sucesso.
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">
              Agora você pode usar todos os recursos premium do Schedly sem limitações.
            </p>
          `,
          'success'
        ),
        primaryAction: {
          label: 'Ir para o painel',
          url: `${APP_URL}/dashboard`,
        },
        footerHtml:
          'Você recebeu este e-mail porque houve uma confirmação de assinatura na sua conta do <strong>Schedly</strong>.',
      }),
    })
  } catch (error) {
    logEmailError('subscription success', error)
  }
}

function getAppointmentLocationLabel(
  googleMeetLink: string | null,
  locationType: string,
  locationAddress: string | null
) {
  if (googleMeetLink) return 'Google Meet'
  if (locationAddress) return locationAddress
  if (locationType === 'PHONE') return 'Atendimento por telefone'
  if (locationType === 'ONLINE') return 'Atendimento on-line'
  return 'No local do prestador'
}

export async function sendAppointmentConfirmationEmail(
  to: string,
  clientName: string,
  providerName: string,
  serviceName: string,
  date: string,
  time: string,
  token: string,
  duration: number = 30,
  googleMeetLink: string | null = null,
  locationType: string = 'IN_PERSON',
  locationAddress: string | null = null
) {
  const appointmentUrl = `${APP_URL}/appointment/${token}`
  const locationLabel = getAppointmentLocationLabel(googleMeetLink, locationType, locationAddress)
  const calendarLink = generateGoogleCalendarLink({
    title: `${serviceName} - ${providerName}`,
    details: `Agendamento confirmado via Schedly.\nCliente: ${clientName}\n${googleMeetLink ? `Link do Meet: ${googleMeetLink}\n` : ''}Link para gerenciar: ${appointmentUrl}`,
    location: locationLabel,
    date: date.split('T')[0],
    startTime: time,
    duration,
  })

  try {
    await sendResendEmail({
      to,
      subject: `Confirmado: ${serviceName} com ${providerName}`,
      html: renderEmailLayout({
        eyebrow: 'Agendamento confirmado',
        title: `Tudo certo, ${clientName}!`,
        description: 'Seu atendimento foi confirmado com sucesso. Confira abaixo os detalhes e os próximos passos.',
        contentHtml: `
          ${renderEmailPanel(
            `
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Serviço:</strong> ${serviceName}</p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Profissional:</strong> ${providerName}</p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Data:</strong> ${date}</p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Horário:</strong> ${time}</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Local:</strong> ${locationLabel}</p>
            `,
            'primary'
          )}
          ${googleMeetLink ? `
            <div style="margin-top: 18px;">
              ${renderEmailPanel(
                `
                  <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.7; color: ${EMAIL_PALETTE.foreground};"><strong>Reunião on-line</strong></p>
                  <a href="${googleMeetLink}" style="display: inline-block; background: ${EMAIL_PALETTE.primary}; color: #ffffff; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 700;">Entrar no Google Meet</a>
                `,
                'success'
              )}
            </div>
          ` : ''}
        `,
        primaryAction: {
          label: 'Adicionar à agenda',
          url: calendarLink,
        },
        secondaryAction: {
          label: 'Gerenciar agendamento',
          url: appointmentUrl,
        },
        footerHtml:
          'Você recebeu este e-mail porque realizou um agendamento via <strong>Schedly</strong>.',
      }),
    })
  } catch (error) {
    logEmailError('appointment confirmation', error)
  }
}