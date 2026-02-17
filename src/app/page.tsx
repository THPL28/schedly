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
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <span className="text-gradient">Schedly</span>
          </div>
          <nav className="flex gap-10 items-center">
            <Link href="#features" className="text-sm font-semibold text-muted no-underline hover:text-primary transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-semibold text-muted no-underline hover:text-primary transition-colors">Pricing</Link>
            {session ? (
              <Link href="/dashboard" className="btn btn-primary rounded-full px-6 py-2.5">
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-foreground no-underline hover:text-primary transition-colors">Sign In</Link>
                <Link href="/register" className="btn btn-primary rounded-full px-6 py-2.5">
                  Start Free Trial
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[0.85rem] font-bold mb-10">
              <Zap size={14} fill="currentColor" />
              <span>Version 2.0 is now live</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black max-w-[900px] mx-auto mb-6 leading-[1.05] tracking-tighter text-foreground">
              Master your time with <span className="text-gradient">intelligent</span> scheduling.
            </h1>

            <p className="text-xl text-muted max-w-[650px] mx-auto mb-12 leading-relaxed">
              Schedly empowers professionals to manage calendars, automate bookings, and scale their business without the administrative headache.
            </p>

            <div className="flex gap-5 justify-center items-center">
              <Link href="/register" className="btn btn-primary px-10 py-5 text-lg rounded-full shadow-lg shadow-primary/20">
                Start My 3-Day Trial
              </Link>
              <Link href="/pricing" className="btn btn-outline px-10 py-5 text-lg rounded-full">
                View Plans
              </Link>
            </div>

            {/* Floating UI Graphics */}
            <div className="mt-24 relative w-full max-w-[1100px] mx-auto">
              <div className="bg-white rounded-[24px] shadow-2xl shadow-black/8 border border-border aspect-[16/10] overflow-hidden p-8">
                <div className="flex h-full gap-8">
                  <div className="w-60 bg-gray-50 rounded-2xl p-6">
                    <div className="w-4/5 h-3 bg-gray-200 rounded mb-8"></div>
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className={`w-4 h-4 rounded ${i === 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                          <div className="h-2 bg-gray-200 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="card p-4 border-dashed">
                          <div className="h-2.5 bg-gray-100 rounded w-2/5 mb-2.5"></div>
                          <div className="h-5 bg-gray-100 rounded w-4/5"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-[300px] bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="h-full flex items-end gap-2">
                        {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary rounded-t" style={{ height: `${h}%`, opacity: 0.1 + (i * 0.1) }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Overlays */}
              <div className="float absolute top-[15%] -right-[5%] w-[280px] z-10">
                <div className="card shadow-2xl border-none bg-white/90 backdrop-blur-md p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-success flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold text-muted">Booking Confirmed</p>
                      <p className="m-0 text-sm font-bold">Dr. Sarah Smith</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted flex gap-4">
                    <span className="flex items-center gap-1"><Clock size={12} /> 10:30 AM</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              <div className="float absolute bottom-[10%] -left-[8%] w-[240px]" style={{ animationDelay: '1s' }}>
                <div className="card shadow-2xl border-none bg-[#111827] text-white p-6">
                  <p className="m-0 mb-4 text-[10px] font-semibold opacity-60 uppercase tracking-wider">Stats Overview</p>
                  <div className="text-2xl font-bold mb-2">+24%</div>
                  <div className="h-1 bg-white/10 rounded-full">
                    <div className="w-[70%] h-full bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 border-y border-border bg-white">
          <div className="container text-center">
            <p className="text-[0.85rem] font-semibold text-muted uppercase tracking-widest mb-10">
              Trusted by 5,000+ modern professionals
            </p>
            <div className="flex justify-between items-center opacity-40 flex-wrap gap-8 px-4">
              {['FORBES', 'TECHCRUNCH', 'WIRED', 'THE VERGE', 'NY TIMES'].map(logo => (
                <span key={logo} className="text-xl font-black tracking-widest">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="container">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Everything you need to <span className="text-gradient">succeed</span>.</h2>
              <p className="text-muted text-lg max-w-[600px] mx-auto">Power-packed features designed to automate your administrative work.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card feature-card p-8 group">
                <div className="w-12 h-12 bg-indigo-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layout size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Unified Dashboard</h3>
                <p className="text-muted leading-relaxed">Get a birds-eye view of your entire business. Appointments, revenue, and client insights in one place.</p>
              </div>
              <div className="card feature-card p-8 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Auto-Booking</h3>
                <p className="text-muted leading-relaxed">Our algorithm calculates availability in real-time, preventing overlaps and double-bookings automatically.</p>
              </div>
              <div className="card feature-card p-8 group">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
                <p className="text-muted leading-relaxed">Understand your monthly trends. Track unique clients and cancellation rates to optimize your growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-32 bg-white">
          <div className="container">
            <div className="card p-12 md:p-16 bg-[#111827] text-white rounded-[32px] flex items-center gap-16 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#f59e0b" stroke="none" />)}
                </div>
                <p className="text-3xl md:text-4xl font-semibold leading-snug mb-10">
                  "Schedly has completely transformed how I manage my private practice. I've seen a 30% reduction in cancellations since switching."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-primary">MS</div>
                  <div>
                    <p className="m-0 font-bold">Maria Santos</p>
                    <p className="m-0 text-sm opacity-60">Psychologist & Private Practitioner</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1 min-w-[300px]">
                {[
                  { val: '99%', label: 'Satisfaction' },
                  { val: '5k+', label: 'Users' },
                  { val: '24/7', label: 'Support' },
                  { val: 'Instant', label: 'Setup' }
                ].map((stat, i) => (
                  <div key={i} className="text-center p-6 bg-white/5 rounded-2xl">
                    <p className="text-3xl font-bold m-0 mb-1">{stat.val}</p>
                    <p className="text-sm opacity-60 m-0">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container text-center">
            <div className="card p-16 md:p-24 bg-gradient-to-br from-primary to-purple-600 text-white rounded-[48px] relative overflow-hidden">
              <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-[10%] -left-[10%] w-[300px] h-[300px] bg-white/5 rounded-full"></div>

              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Ready to scale your business?</h2>
              <p className="text-xl md:text-2xl opacity-90 max-w-[600px] mx-auto mb-12">
                Join thousands of professionals who improved their efficiency by 40% with Schedly.
              </p>
              <Link href="/register" className="btn bg-white text-primary px-12 py-5 text-xl font-extrabold rounded-full hover:scale-105 transition-transform">
                Start Your Free Trial Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-16">
            <div className="md:col-span-2">
              <div className="text-2xl font-black flex items-center gap-2 mb-6 tracking-tight">
                <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                  <Calendar size={18} className="text-white" />
                </div>
                <span className="text-gradient">Schedly</span>
              </div>
              <p className="text-muted max-w-xs leading-relaxed">
                The most complete and intuitive scheduling platform for modern professionals across all industries.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <nav className="flex flex-col gap-4">
                <Link href="#features" className="text-muted no-underline text-sm hover:text-primary transition-colors">Features</Link>
                <Link href="/pricing" className="text-muted no-underline text-sm hover:text-primary transition-colors">Pricing</Link>
                <Link href="#" className="text-muted no-underline text-sm hover:text-primary transition-colors">Case Studies</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <nav className="flex flex-col gap-4">
                <Link href="#" className="text-muted no-underline text-sm hover:text-primary transition-colors">About Us</Link>
                <Link href="#" className="text-muted no-underline text-sm hover:text-primary transition-colors">Contact</Link>
                <Link href="#" className="text-muted no-underline text-sm hover:text-primary transition-colors">Privacy</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-muted text-sm">
            <p>© 2026 Schedly Inc. Built for professional excellence.</p>
            <div className="flex gap-8">
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

