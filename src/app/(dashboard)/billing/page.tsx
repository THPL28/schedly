'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Zap, Star } from 'lucide-react';
import FeedbackBanner from '@/components/feedback-banner';

const PLANS = [
    {
        name: 'Basic',
        planId: 'BASIC',
        price: 'R$ 29,90',
        description: 'Ideal para profissionais independentes começando.',
        features: ['100 agendamentos por mês', 'Múltiplos serviços (Event Types)', 'Buffer Time automático', 'Página profissional básica', 'Notificações Push'],
        recommended: false,
        icon: Zap
    },
    {
        name: 'Pro',
        planId: 'PRO',
        price: 'R$ 49,90',
        description: 'Completo para quem busca excelência e escala.',
        features: ['Agendamentos ILIMITADOS', 'Lembretes por E-mail (24h/1h)', 'Página pública premium', 'Suporte prioritário', 'Custom Branding'],
        recommended: true,
        icon: Star
    },
];

type FeedbackState = {
    variant: 'success' | 'error' | 'info';
    title: string;
    message: string;
} | null;

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);

    const showFeedback = (
        variant: NonNullable<FeedbackState>['variant'],
        title: string,
        message: string
    ) => {
        setFeedback({ variant, title, message });
    };

    const handleCheckout = async (planId: string) => {
        setLoading(planId);
        setFeedback(null);

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
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
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="mb-16 space-y-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <ShieldCheck size={14} /> Faturamento Seguro
                </div>
                <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">Escolha o seu plano</h1>
                <p className="mx-auto max-w-xl font-medium text-slate-500">
                    Potencialize seu negócio com as ferramentas de agendamento mais modernas do mercado.
                </p>
            </div>

            {feedback && (
                <FeedbackBanner
                    variant={feedback.variant}
                    title={feedback.title}
                    message={feedback.message}
                    className="mb-8 animate-in fade-in slide-in-from-top-2"
                />
            )}

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`card relative flex flex-col p-8 transition-all duration-300 hover:translate-y-[-4px] md:p-12 ${plan.recommended ? 'border-primary bg-primary/[0.01] shadow-2xl shadow-primary/10' : 'border-border shadow-xl shadow-slate-200/50'}`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20">
                                Mais Popular
                            </div>
                        )}

                        <div className="mb-8 flex items-center justify-between">
                            <div className={`rounded-3xl p-4 ${plan.recommended ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <plan.icon size={28} />
                            </div>
                            <div className="text-right">
                                <p className="m-0 text-sm font-black uppercase tracking-widest text-slate-400">{plan.name}</p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="mb-2 text-3xl font-black text-slate-900">
                                {plan.price}
                                <span className="text-sm font-bold text-slate-400">/mês</span>
                            </h3>
                            <p className="text-sm font-medium leading-relaxed text-slate-500">{plan.description}</p>
                        </div>

                        <div className="mb-12 flex-1 space-y-4">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-4">
                                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.recommended ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                                        <Check size={12} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleCheckout(plan.planId)}
                            disabled={loading !== null}
                            className={`btn h-16 text-lg font-black transition-all ${plan.recommended ? 'btn-primary shadow-2xl shadow-primary/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            {loading === plan.planId ? 'Processando...' : `Ativar Plano ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 text-center">
                <p className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                    <ShieldCheck size={14} /> Pagamentos processados via Stripe. Cancele a qualquer momento.
                </p>
            </div>
        </div>
    );
}
