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
