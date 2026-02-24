import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import { ShieldAlert } from 'lucide-react'
import PricingButtons from '@/components/pricing-buttons'
import Logo from '@/components/logo'

export default async function PricingPage(props: { searchParams?: Promise<{ expired?: string }> }) {
    const session = await verifySession()
    const searchParams = await props.searchParams
    const isExpired = searchParams?.expired === 'true'

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <header className="h-16 bg-white border-b border-border flex items-center px-4 md:px-8 justify-between">
                <Link href="/" className="inline-flex items-center gap-2 text-lg md:text-xl font-extrabold text-foreground no-underline">
                    <Logo size={24} />
                    <span className="hidden sm:inline">Schedly</span>
                </Link>
                {session ? (
                    <Link href="/dashboard" className="btn btn-outline h-10 px-4 text-sm">Painel Principal</Link>
                ) : (
                    <Link href="/login" className="btn btn-ghost h-10 px-4 text-sm font-bold">Entrar</Link>
                )}
            </header>

            <div className="container py-12 md:py-24 text-center">
                {isExpired && (
                    <div className="max-w-[600px] mx-auto mb-8 md:mb-12 bg-red-50 border border-red-100 p-4 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left text-red-700 shadow-sm">
                        <ShieldAlert size={24} className="md:w-8 md:h-8 flex-shrink-0" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Sua conta está expirada</h3>
                            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.875rem' }}>Escolha um plano abaixo para reativar seu acesso e continuar agendando.</p>
                        </div>
                    </div>
                )}

                <div className="mb-12 md:mb-16 px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">Planos Simples e Transparentes</h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted max-w-[600px] mx-auto">
                        {session
                            ? "Upgrade sua conta para desbloquear todos os recursos profissionais."
                            : "Agende com facilidade e faça seu negócio crescer. Comece hoje seu teste gratuito de 3 dias."}
                    </p>
                </div>

                <PricingButtons session={session} isExpired={isExpired} />

                <div className="mt-16 text-muted text-sm px-4">
                    <p>Precisa de um plano personalizado para sua empresa? <Link href="mailto:contato@schedlyfy.com" className="text-primary font-bold hover:underline">Fale conosco</Link></p>
                </div>
            </div>
        </div>
    )
}

