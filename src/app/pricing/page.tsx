import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

export default async function PricingPage(props: { searchParams?: Promise<{ expired?: string }> }) {
    const session = await verifySession()
    const searchParams = await props.searchParams
    const isExpired = searchParams?.expired === 'true'

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <header className="h-16 bg-white border-b border-border flex items-center px-4 md:px-8">
                <Link href="/" className="inline-flex items-center gap-2 text-lg md:text-xl font-extrabold text-foreground no-underline">
                    <div style={{ width: 20, height: 20, background: 'var(--primary)', borderRadius: 4 }}></div>
                    <span className="hidden sm:inline">Schedly</span>
                </Link>
            </header>

            <div className="container py-12 md:py-24 text-center">
                {isExpired && (
                    <div className="max-w-[600px] mx-auto mb-8 md:mb-12 bg-red-50 border border-red-100 p-4 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left text-red-700">
                        <ShieldAlert size={24} className="md:w-8 md:h-8 flex-shrink-0" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem md:1.1rem', fontWeight: 700 }}>Sua conta está expirada</h3>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.875rem md:0.9rem' }}>Escolha um plano abaixo para reativar seu acesso e continuar agendando.</p>
                        </div>
                    </div>
                )}

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 tracking-tight px-4">Planos Simples e Transparentes</h1>
                <p className="text-base sm:text-lg md:text-xl text-muted max-w-[600px] mx-auto mb-12 md:mb-16 px-4">Agende com facilidade e faça seu negócio crescer. Comece hoje seu teste gratuito de 3 dias.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-[1000px] mx-auto px-4">

                    {/* Basic */}
                    <div className="card p-6 md:p-8 text-left flex flex-col">
                        <h3 className="text-lg md:text-xl font-bold mb-2">Basic</h3>
                        <div className="text-4xl md:text-5xl font-extrabold my-4">R$29<span className="text-sm md:text-base font-normal text-muted">.90/mês</span></div>
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
                    <div className="card p-6 md:p-8 text-left border-2 border-primary relative flex flex-col">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm font-black uppercase">Mais Popular</div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">Pro</h3>
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
