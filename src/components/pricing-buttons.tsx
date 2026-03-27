'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import FeedbackBanner from '@/components/feedback-banner';

interface Plan {
    name: string;
    planId: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
}

type FeedbackState = {
    variant: 'success' | 'error' | 'info';
    title: string;
    message: string;
} | null;

const PLANS: Plan[] = [
    {
        name: 'Basic',
        planId: 'BASIC',
        price: 'R$ 29,90',
        description: 'Ideal para profissionais independentes começando.',
        features: [
            '100 agendamentos por mês',
            'Múltiplos serviços (Event Types)',
            'Buffer Time automático',
            'Página profissional básica',
            'Notificações Push'
        ],
    },
    {
        name: 'Pro',
        planId: 'PRO',
        price: 'R$ 49,90',
        description: 'Completo para quem busca excelência e escala.',
        features: [
            'Agendamentos ILIMITADOS',
            'Lembretes por E-mail (24h/1h)',
            'Página pública premium',
            'Suporte prioritário',
            'Custom Branding'
        ],
        popular: true,
    },
];

export default function PricingButtons({ session, isExpired }: { session: any, isExpired?: boolean }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const router = useRouter();

    const showFeedback = (
        variant: NonNullable<FeedbackState>['variant'],
        title: string,
        message: string
    ) => {
        setFeedback({ variant, title, message });
    };

    const handleAction = async (plan: Plan) => {
        if (!session) {
            router.push(`/register?plan=${plan.name.toLowerCase()}`);
            return;
        }

        setLoading(plan.planId);
        setFeedback(null);

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.planId }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
                return;
            }

            if (data.error) {
                showFeedback('error', 'Checkout indisponível', data.error);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showFeedback(
                'error',
                'Falha ao iniciar checkout',
                'Não foi possível processar o checkout agora. Tente novamente em alguns instantes.'
            );
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto px-4">
            {feedback && (
                <FeedbackBanner
                    variant={feedback.variant}
                    title={feedback.title}
                    message={feedback.message}
                    className="mb-6 animate-in fade-in slide-in-from-top-2"
                />
            )}

            <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`card relative flex flex-col p-6 text-left md:p-8 ${plan.popular ? 'border-2 border-primary' : ''}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-black uppercase text-white md:px-4 md:text-sm">
                                Mais Popular
                            </div>
                        )}
                        <h3 className="mb-2 text-lg font-bold md:text-xl">{plan.name}</h3>
                        <div className="my-4 text-4xl font-extrabold md:text-5xl">
                            {plan.price}
                            <span className="text-sm font-normal text-muted md:text-base">/mês</span>
                        </div>
                        <p className="mb-8 text-sm text-muted md:text-base">{plan.description}</p>

                        <ul className="mb-8 flex-1 space-y-4">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm md:text-base">
                                    <CheckCircle2 size={18} className="text-success" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleAction(plan)}
                            disabled={loading !== null}
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} h-12 w-full text-base`}
                        >
                            {loading === plan.planId
                                ? 'Processando...'
                                : session
                                    ? plan.name === 'Basic'
                                        ? 'Assinar Basic'
                                        : 'Assinar Pro'
                                    : 'Iniciar Teste Grátis'}
                        </button>

                        {session && !isExpired && (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="mt-4 text-center text-xs font-medium text-muted underline transition-colors hover:text-primary"
                            >
                                Acessar plataforma sem assinar agora
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
