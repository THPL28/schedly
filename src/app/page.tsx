import Link from 'next/link'
import { verifySession } from '@/lib/auth'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Users,
  Layout,
  BarChart3
} from 'lucide-react'

export default async function Home() {
  const session = await verifySession()

  return (
    <div className="hero-gradient flex flex-col min-h-screen">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 h-[var(--header-height)] border-b border-border flex items-center px-8">
        <div className="container flex items-center w-full">
          <div className="text-2xl font-black flex items-center gap-2 flex-1 tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Calendar size={22} className="text-white" />
            </div>
            <span className="text-gradient">Schedly</span>
          </div>
          <nav className="flex gap-10 items-center">
            <Link href="#features" className="text-sm font-semibold text-muted no-underline hover:text-primary transition-colors">Características</Link>
            <Link href="/pricing" className="text-sm font-semibold text-muted no-underline hover:text-primary transition-colors">Preços</Link>
            {session ? (
              <Link href="/dashboard" className="btn btn-primary rounded-full px-7 py-2.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Painel <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Entrar</Link>
                <Link href="/register" className="btn btn-primary rounded-full px-7 py-2.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Teste Grátis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="pt-24 md:pt-36 pb-20">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[0.85rem] font-bold mb-10 border border-primary/20 animate-fade-in">
              <Zap size={14} fill="currentColor" />
              <span>Versão 2.4 já disponível</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black max-w-[1000px] mx-auto mb-8 leading-[1.05] tracking-tighter text-foreground filter drop-shadow-sm">
              Domine seu tempo com agendamento <span className="text-gradient">inteligente</span>.
            </h1>

            <p className="text-xl md:text-2xl text-muted max-w-[700px] mx-auto mb-14 leading-relaxed font-medium">
              O Schedly capacita profissionais a gerenciar calendários, automatizar reservas e escalar seus negócios sem dores de cabeça administrativas.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24">
              <Link href="/register" className="btn btn-primary px-12 py-5 text-xl rounded-full shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                Começar agora
              </Link>
              <Link href="/pricing" className="btn btn-outline px-12 py-5 text-xl rounded-full bg-white/50 backdrop-blur-sm hover:bg-white transition-all">
                Ver Planos
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative w-full max-w-[1200px] mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="glass-card relative aspect-[16/10] overflow-hidden p-6 md:p-10 border-white/40">
                <div className="flex h-full gap-6 md:gap-10">
                  <div className="w-48 md:w-64 bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50 hidden md:block">
                    <div className="w-4/5 h-3 bg-gray-200/50 rounded mb-10"></div>
                    <div className="flex flex-col gap-5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className={`w-5 h-5 rounded-md ${i === 1 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-200/50'}`}></div>
                          <div className="h-2 bg-gray-200/50 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/80 border border-gray-100 p-4 md:p-6 rounded-2xl shadow-sm border-dashed">
                          <div className="h-2 bg-gray-100 rounded w-2/5 mb-3"></div>
                          <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-[250px] md:h-[350px] bg-gray-50/50 rounded-2xl p-6 md:p-10 border border-gray-100/50">
                      <div className="h-full flex items-end gap-2 md:gap-4">
                        {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85, 55, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-primary to-indigo-400 rounded-t-lg shadow-sm" style={{ height: `${h}%`, opacity: 0.1 + (i * 0.08) }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Decorations */}
              <div className="float absolute top-[10%] -right-[5%] w-[250px] md:w-[320px] z-20">
                <div className="glass-card shadow-2xl p-6 md:p-8 border-white/60">
                  <div className="flex items-center gap-5 mb-5 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-success flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <p className="m-0 text-xs font-bold text-muted uppercase tracking-wider">Agendamento Confirmado</p>
                      <p className="m-0 text-lg font-extrabold text-foreground">Dra. Sarah Smith</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted flex gap-6 font-semibold">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> 10:30 AM</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Hoje</span>
                  </div>
                </div>
              </div>

              <div className="float absolute -bottom-[5%] -left-[5%] w-[200px] md:w-[280px] z-20" style={{ animationDelay: '1.5s' }}>
                <div className="card shadow-2xl border-none bg-slate-900 text-white p-6 md:p-8 rounded-[24px]">
                  <p className="m-0 mb-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Visão Geral</p>
                  <div className="text-3xl md:text-4xl font-black mb-3">+28.4%</div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[74%] h-full bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                  </div>
                  <p className="m-0 mt-4 text-[10px] font-medium text-slate-500">Aumento de leads mensais</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Bar */}
        <section className="py-20 border-y border-border/50 bg-white/30 backdrop-blur-sm">
          <div className="container text-center">
            <p className="text-[0.75rem] font-black text-muted/60 uppercase tracking-[0.3em] mb-12">
              Confiado por mais de 5.000 profissionais modernos
            </p>
            <div className="flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap gap-12 px-8">
              {['FORBES', 'TECHCRUNCH', 'WIRED', 'THE VERGE', 'NY TIMES'].map(logo => (
                <span key={logo} className="text-2xl font-black tracking-[0.2em]">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10"></div>

          <div className="container">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Tudo o que você precisa para <span className="text-gradient">vencer</span>.</h2>
              <p className="text-muted text-xl max-w-[650px] mx-auto font-medium leading-relaxed">Recursos poderosos projetados para automatizar seu trabalho administrativo e focar no que importa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                {
                  icon: Layout,
                  title: 'Painel Unificado',
                  desc: 'Tenha uma visão panorâmica de todo o seu negócio. Agendamentos, receita e insights de clientes em um só lugar.',
                  color: 'indigo'
                },
                {
                  icon: Clock,
                  title: 'Auto-Agendamento Inteligente',
                  desc: 'Nosso algoritmo calcula a disponibilidade em tempo real, evitando sobreposições e reservas duplas automaticamente.',
                  color: 'emerald'
                },
                {
                  icon: BarChart3,
                  title: 'Análises Profundas',
                  desc: 'Entenda suas tendências mensais. Acompanhe clientes únicos e taxas de cancelamento para otimizar seu crescimento.',
                  color: 'amber'
                }
              ].map((f, i) => (
                <div key={i} className="card feature-card p-10 group hover:bg-white hover:border-primary/20 bg-white/40 backdrop-blur-sm shadow-xl shadow-black/[0.02]">
                  <div className={`w-14 h-14 bg-${f.color}-50 text-${f.color}-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                    <f.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-extrabold mb-4 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-muted leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-32 bg-white/50 relative">
          <div className="container">
            <div className="card p-12 md:p-20 bg-slate-900 border-none text-white rounded-[40px] flex items-center gap-20 flex-wrap relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] -z-10"></div>

              <div className="flex-1 min-w-[320px]">
                <div className="flex gap-1.5 mb-10">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={22} fill="#f59e0b" stroke="none" />)}
                </div>
                <p className="text-3xl md:text-5xl font-bold leading-[1.3] mb-12 tracking-tight">
                  "O Schedly transformou completamente a forma como gerencio minha clínica. Tive uma redução de 30% nos cancelamentos desde que mudei."
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-primary text-xl">MS</div>
                  <div>
                    <p className="m-0 font-extrabold text-xl">Maria Santos</p>
                    <p className="m-0 text-sm font-medium opacity-60 text-slate-400">Psicóloga e Clínica Particular</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 flex-1 min-w-[320px]">
                {[
                  { val: '99%', label: 'Satisfação' },
                  { val: '5k+', label: 'Usuários' },
                  { val: '24/7', label: 'Suporte' },
                  { val: 'Instant', label: 'Setup' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-8 bg-white/5 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors">
                    <p className="text-4xl font-black m-0 mb-2">{stat.val}</p>
                    <p className="text-sm font-bold opacity-60 m-0 uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container text-center">
            <div className="card p-16 md:p-28 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[56px] relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[60px]"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px]"></div>

              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Pronto para escalar seu negócio?</h2>
              <p className="text-xl md:text-2xl font-medium opacity-90 max-w-[700px] mx-auto mb-16 leading-relaxed">
                Junte-se a milhares de profissionais que melhoraram sua eficiência em 40% com o Schedly.
              </p>
              <Link href="/register" className="btn bg-white text-indigo-600 px-14 py-6 text-2xl font-black rounded-full hover:scale-105 transition-all shadow-xl shadow-black/10">
                Começar Teste Grátis
              </Link>
              <p className="mt-8 text-sm font-bold opacity-60">Sem cartão de crédito necessário • Instalação em 2 minutos</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-border/60">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-20 mb-20">
            <div className="md:col-span-2">
              <div className="text-2xl font-black flex items-center gap-2 mb-8 tracking-tight">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Calendar size={18} className="text-white" />
                </div>
                <span className="text-gradient">Schedly</span>
              </div>
              <p className="text-muted max-w-sm leading-relaxed font-medium">
                A plataforma de agendamento mais completa e intuitiva para profissionais modernos em todos os setores.
              </p>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase text-xs tracking-[0.2em] text-muted/80">Produto</h4>
              <nav className="flex flex-col gap-4 font-semibold text-sm">
                <Link href="#features" className="text-muted no-underline hover:text-primary transition-colors">Características</Link>
                <Link href="/pricing" className="text-muted no-underline hover:text-primary transition-colors">Preços</Link>
                <Link href="#" className="text-muted no-underline hover:text-primary transition-colors">Estudos de Caso</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-black mb-8 uppercase text-xs tracking-[0.2em] text-muted/80">Empresa</h4>
              <nav className="flex flex-col gap-4 font-semibold text-sm">
                <Link href="#" className="text-muted no-underline hover:text-primary transition-colors">Sobre Nós</Link>
                <Link href="#" className="text-muted no-underline hover:text-primary transition-colors">Contato</Link>
                <Link href="#" className="text-muted no-underline hover:text-primary transition-colors">Privacidade</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-border/40 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-muted text-sm font-medium">
            <p>© 2026 Schedly Inc. Construído para a excelência profissional.</p>
            <div className="flex gap-10">
              <Link href="#" className="text-inherit no-underline hover:text-primary transition-colors">Twitter</Link>
              <Link href="#" className="text-inherit no-underline hover:text-primary transition-colors">LinkedIn</Link>
              <Link href="#" className="text-inherit no-underline hover:text-primary transition-colors">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


