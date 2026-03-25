import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
    try {
        await resend.emails.send({
            from: 'Schedlyfy <onboarding@resend.dev>',
            to,
            subject: 'Bem-vindo ao Schedlyfy!',
            html: `
        <h1>Olá, ${name}!</h1>
        <p>Estamos muito felizes em ter você conosco.</p>
        <p>Você iniciou seu período de teste de 3 dias. Aproveite todas as funcionalidades para organizar sua agenda!</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Acesse seu painel agora</a></p>
      `,
        });
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}

export async function sendTrialEndingEmail(to: string, name: string) {
    try {
        await resend.emails.send({
            from: 'Schedlyfy <onboarding@resend.dev>',
            to,
            subject: 'Seu período de teste está acabando!',
            html: `
        <h1>Olá, ${name}!</h1>
        <p>Seu período de teste de 3 dias expira amanhã.</p>
        <p>Para continuar agendando sem interrupções, faça o upgrade para um de nossos planos.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing">Escolher um plano</a></p>
      `,
        });
    } catch (error) {
        console.error('Error sending trial ending email:', error);
    }
}

export async function sendSubscriptionSuccessEmail(to: string, name: string, planName: string) {
    try {
        await resend.emails.send({
            from: 'Schedlyfy <onboarding@resend.dev>',
            to,
            subject: 'Assinatura Confirmada!',
            html: `
        <h1>Parabéns, ${name}!</h1>
        <p>Sua assinatura do plano <strong>${planName}</strong> foi confirmada com sucesso.</p>
        <p>Agora você tem acesso total a todas as ferramentas premium do Schedlyfy.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Ir para o Painel</a></p>
      `,
        });
    } catch (error) {
        console.error('Error sending subscription success email:', error);
    }
}

import { generateGoogleCalendarLink } from './calendar';

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
    const calendarLink = generateGoogleCalendarLink({
        title: `${serviceName} - ${providerName}`,
        details: `Agendamento confirmado via Schedlyfy.\n${googleMeetLink ? `Link do Meet: ${googleMeetLink}\n` : ''}Link para gerenciar: ${process.env.NEXT_PUBLIC_APP_URL}/appointment/${token}`,
        location: googleMeetLink || locationAddress || 'No local do prestador',
        date: date.split('T')[0],
        startTime: time,
        duration: duration
    });

    try {
        await resend.emails.send({
            from: 'Schedlyfy <onboarding@resend.dev>',
            to,
            subject: `Confirmado: ${serviceName} com ${providerName}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">Tudo certo!</h1>
                <p style="font-size: 16px; color: #64748b; margin: 0;">Seu agendamento foi confirmado com sucesso.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
                <h2 style="font-size: 18px; margin: 0 0 24px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">Detalhes do Atendimento</h2>
                <p style="margin: 0 0 16px 0; font-size: 15px;"><strong>Serviço:</strong> <span style="color: #6366f1;">${serviceName}</span></p>
                <p style="margin: 0 0 16px 0; font-size: 15px;"><strong>Profissional:</strong> ${providerName}</p>
                <p style="margin: 0 0 16px 0; font-size: 15px;"><strong>Data e Hora:</strong> ${date} às ${time}</p>
                
                ${googleMeetLink ? `
                <div style="margin-top: 24px; padding: 20px; background: #eef2ff; border-radius: 16px; border: 1px solid #c7d2fe; text-align: center;">
                    <p style="margin: 0 0 12px 0; font-weight: bold; color: #4338ca;">🎥 Reunião via Google Meet</p>
                    <a href="${googleMeetLink}" style="display: inline-block; background-color: #4338ca; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">Entrar na Reunião</a>
                </div>
                ` : locationAddress ? `
                <div style="margin-top: 24px; padding: 20px; background: #f1f5f9; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 14px; color: #475569;"><strong>📍 Localização:</strong><br>${locationAddress}</p>
                </div>
                ` : ''}
            </div>

            <div style="margin: 32px 0; text-align: center;">
                <a href="${calendarLink}" style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 12px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">Adicionar à Minha Agenda</a>
                <br><br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointment/${token}" style="display: inline-block; color: #64748b; padding: 14px 28px; text-decoration: underline; font-size: 13px;">Gerenciar ou cancelar agendamento</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">Você recebeu este e-mail porque realizou um agendamento via <strong>Schedlyfy</strong>.<br>Por favor, não responda a este e-mail.</p>
        </div>
      `,
        });
    } catch (error) {
        console.error('Error sending appointment confirmation email:', error);
    }
}
