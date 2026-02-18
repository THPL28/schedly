import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

export default async function PricingPage(props: { searchParams?: Promise<{ expired?: string }> }) {
    const session = await verifySession()
    const searchParams = await props.searchParams
    const isExpired = searchParams?.expired === 'true'

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <header style={{ height: 64, background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1rem md:0 2rem' }}>
                <Link href="/" style={{ fontSize: '1.25rem md:1.5rem', fontWeight: 800, textDecoration: 'none', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 20, height: 20, background: 'var(--primary)', borderRadius: 4 }}></div>
                    <span className="hidden sm:inline">Schedly</span>
                </Link>
            </header>

            <div className="container" style={{ padding: '3rem 1rem 2rem md:6rem 1rem 4rem', textAlign: 'center' }}>
                {isExpired && (
                    <div style={{ maxWidth: '600px', margin: '0 auto 2rem md:3rem', background: '#fef2f2', border: '1px solid #fee2e2', padding: '1rem md:1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column sm:flex-row', alignItems: 'flex-start sm:center', gap: '1rem', textAlign: 'left', color: '#991b1b' }}>
                        <ShieldAlert size={24} className="md:w-8 md:h-8 flex-shrink-0" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem md:1.1rem', fontWeight: 700 }}>Sua conta está expirada</h3>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.875rem md:0.9rem' }}>Escolha um plano abaixo para reativar seu acesso e continuar agendando.</p>
                        </div>
                    </div>
                )}

                <h1 style={{ fontSize: '2rem sm:2.5rem md:3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.025em', padding: '0 1rem' }}>Planos Simples e Transparentes</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1rem sm:1.125rem md:1.25rem', marginBottom: '3rem md:4rem', maxWidth: '600px', margin: '0 auto 3rem md:4rem', padding: '0 1rem' }}>
                    Agende com facilidade e faça seu negócio crescer. Comece hoje seu teste gratuito de 3 dias.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem md:2rem', maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>

                    {/* Basic */}
                    <div className="card" style={{ padding: '2rem 1.5rem md:3rem 2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.125rem md:1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Basic</h3>
                        <div style={{ fontSize: '2.5rem md:3.5rem', fontWeight: 800, margin: '1rem 0' }}>R$29<span style={{ fontSize: '0.875rem md:1rem', fontWeight: 400, color: 'var(--muted)' }}>.90/mês</span></div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.875rem md:0.95rem', marginBottom: '2rem md:2.5rem' }}>Ideal para profissionais individuais em início de carreira.</p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Agendamentos ilimitados</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Lembretes por e-mail</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Relatórios básicos</li>
                        </ul>

                        {session ? (
                            <button className="btn btn-outline" style={{ width: '100%', padding: '1rem' }} disabled>Falar com Admin</button>
                        ) : (
                            <Link href="/register?plan=basic" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Iniciar Teste Grátis</Link>
                        )}
                    </div>

                    {/* Pro */}
                    <div className="card" style={{ padding: '2rem 1.5rem md:3rem 2.5rem', textAlign: 'left', border: '2px solid var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.75rem md:0.4rem 1rem', borderRadius: '30px', fontSize: '0.7rem md:0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mais Popular</div>
                        <h3 style={{ fontSize: '1.125rem md:1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</h3>
                        <div style={{ fontSize: '2.5rem md:3.5rem', fontWeight: 800, margin: '1rem 0' }}>R$49<span style={{ fontSize: '0.875rem md:1rem', fontWeight: 400, color: 'var(--muted)' }}>.90/mês</span></div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.875rem md:0.95rem', marginBottom: '2rem md:2.5rem' }}>Para profissionais em crescimento que buscam o melhor.</p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Tudo do Basic</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Relatórios avançados</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Branding personalizado</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}><CheckCircle2 size={18} color="var(--success)" /> Suporte prioritário</li>
                        </ul>

                        {session ? (
                            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled>Falar com Admin</button>
                        ) : (
                            <Link href="/register?plan=pro" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Iniciar Teste Grátis</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
