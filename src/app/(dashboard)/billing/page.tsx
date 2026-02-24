'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Zap, Star } from 'lucide-react';

const PLANS = [
    {
        name: 'Basic',
        priceId: 'prod_U1ADHKfh6Bxw9h',
        price: 'R$ 29,90',
        description: 'Ideal para profissionais independentes começando.',
        features: ['100 agendamentos por mês', 'Múltiplos serviços (Event Types)', 'Buffer Time automático', 'Página profissional básica', 'Notificações Push'],
        recommended: false,
        icon: Zap
    },
    {
        name: 'Pro',
        priceId: 'prod_U1AE1hdAt9j5jx',
        price: 'R$ 49,90',
        description: 'Completo para quem busca excelência e escala.',
        features: ['Agendamentos ILIMITADOS', 'Lembretes por E-mail (24h/1h)', 'Página pública premium', 'Suporte prioritário', 'Custom Branding'],
        recommended: true,
        icon: Star
    },
];

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (priceId: string) => {
        setLoading(priceId);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                window.alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            window.alert('Erro ao processar checkout. Tente novamente.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-8">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    <ShieldCheck size={14} /> Faturamento Seguro
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Escolha o seu plano</h1>
                <p className="text-slate-500 max-w-xl mx-auto font-medium">Potencialize seu negócio com as ferramentas de agendamento mais modernas do mercado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`card relative p-8 md:p-12 flex flex-col transition-all duration-300 hover:translate-y-[-4px] ${plan.recommended ? 'border-primary shadow-2xl shadow-primary/10 bg-primary/[0.01]' : 'border-border shadow-xl shadow-slate-200/50'}`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg shadow-primary/20">
                                Mais Popular
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-8">
                            <div className={`p-4 rounded-3xl ${plan.recommended ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <plan.icon size={28} />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest m-0">{plan.name}</p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-3xl font-black text-slate-900 mb-2">{plan.price}<span className="text-sm text-slate-400 font-bold">/mês</span></h3>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-12 flex-1">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-4">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.recommended ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                                        <Check size={12} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleCheckout(plan.priceId)}
                            disabled={loading !== null}
                            className={`btn h-16 text-lg font-black transition-all ${plan.recommended ? 'btn-primary shadow-2xl shadow-primary/30' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            {loading === plan.priceId ? 'Processando...' : `Ativar Plano ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-20 text-center">
                <p className="text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                    <ShieldCheck size={14} /> Pagamentos processados via Stripe. Cancele a qualquer momento.
                </p>
            </div>
        </div>
    );
}
