'use client';

import { useState } from 'react';

const PLANS = [
    {
        name: 'Basic',
        priceId: 'prod_U1ADHKfh6Bxw9h', // Note: This is an ID provided by the user, but checkout usually needs the Price ID (price_...) or Product ID if it has a default price.
        price: 'R$ 29,90',
        description: 'Ideal para profissionais independentes.',
        features: ['Calendário Ilimitado', 'Notificações Push', '100 agendamentos/mês'],
    },
    {
        name: 'Pro',
        priceId: 'prod_U1AE1hdAt9j5jx',
        price: 'R$ 59,90',
        description: 'Completo para quem quer crescer.',
        features: ['Tudo do Basic', 'Agendamentos Ilimitados', 'Página de reserva personalizada', 'Lembretes por E-mail'],
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

    const handlePortal = async () => {
        setLoading('portal');
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                window.alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            console.error('Portal error:', error);
            window.alert('Erro ao abrir portal. Verifique se você já possui uma assinatura ativa.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Assinatura</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {PLANS.map((plan) => (
                    <div key={plan.name} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                        <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                        <div className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal text-slate-400">/mês</span></div>
                        <p className="text-slate-400 mb-6">{plan.description}</p>
                        <ul className="mb-8 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center text-slate-300 mb-2">
                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleCheckout(plan.priceId)}
                            disabled={loading !== null}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading === plan.priceId ? 'Processando...' : `Assinar ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Conta</h3>
                <p className="text-slate-400 mb-6">
                    Acesse o portal do cliente para gerenciar suas formas de pagamento, ver faturas ou cancelar sua assinatura.
                </p>
                <button
                    onClick={handlePortal}
                    disabled={loading !== null}
                    className="px-6 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 transition disabled:opacity-50"
                >
                    {loading === 'portal' ? 'Abrindo...' : 'Abrir Portal do Cliente'}
                </button>
            </div>
        </div>
    );
}
