'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface Plan {
    name: string;
    priceId: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
}

const PLANS: Plan[] = [
    {
        name: 'Basic',
        priceId: 'prod_U1ADHKfh6Bxw9h',
        price: 'R$ 29,90',
        description: 'Ideal para profissionais individuais em início de carreira.',
        features: ['Agendamentos ilimitados', 'Lembretes por e-mail', 'Relatórios básicos'],
    },
    {
        name: 'Pro',
        priceId: 'prod_U1AE1hdAt9j5jx',
        price: 'R$ 49,90',
        description: 'Para profissionais em crescimento que buscam o melhor.',
        features: ['Tudo do Basic', 'Relatórios avançados', 'Branding personalizado', 'Suporte prioritário'],
        popular: true,
    },
];

export default function PricingButtons({ session, isExpired }: { session: any, isExpired?: boolean }) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = async (plan: Plan) => {
        if (!session) {
            router.push(`/register?plan=${plan.name.toLowerCase()}`);
            return;
        }

        setLoading(plan.priceId);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: plan.priceId }),
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-[1000px] mx-auto px-4">
            {PLANS.map((plan) => (
                <div key={plan.name} className={`card p-6 md:p-8 text-left flex flex-col relative ${plan.popular ? 'border-2 border-primary' : ''}`}>
                    {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm font-black uppercase">
                            Mais Popular
                        </div>
                    )}
                    <h3 className="text-lg md:text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl md:text-5xl font-extrabold my-4">
                        {plan.price}<span className="text-sm md:text-base font-normal text-muted">/mês</span>
                    </div>
                    <p className="text-muted text-sm md:text-base mb-8">{plan.description}</p>

                    <ul className="space-y-4 mb-8 flex-1">
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
                        className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} w-full h-12 text-base`}
                    >
                        {loading === plan.priceId ? 'Processando...' :
                            session ? (plan.name === 'Basic' ? 'Assinar Basic' : 'Assinar Pro') : 'Iniciar Teste Grátis'}
                    </button>

                    {session && !isExpired && (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="mt-4 text-xs text-muted hover:text-primary transition-colors font-medium text-center underline"
                        >
                            Acessar plataforma sem assinar agora
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
