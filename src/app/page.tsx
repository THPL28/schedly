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
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-header" style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, letterSpacing: '-0.02em' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="white" />
            </div>
            <span className="text-gradient">Schedly</span>
          </div>
          <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <Link href="#features" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>Features</Link>
            <Link href="/pricing" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--muted)', textDecoration: 'none' }}>Pricing</Link>
            {session ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '100px' }}>
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' }}>Sign In</Link>
                <Link href="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '100px' }}>
                  Start Free Trial
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ padding: '8rem 0 4rem' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              padding: '0.5rem 1rem',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '2.5rem'
            }}>
              <Zap size={14} fill="currentColor" />
              <span>Version 2.0 is now live</span>
            </div>

            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              maxWidth: '900px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: 'var(--foreground)'
            }}>
              Master your time with <span className="text-gradient">intelligent</span> scheduling.
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: 'var(--muted)',
              maxWidth: '650px',
              margin: '0 auto 3rem',
              lineHeight: 1.6
            }}>
              Schedly empowers professionals to manage calendars, automate bookings, and scale their business without the administrative headache.
            </p>

            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', alignItems: 'center' }}>
              <Link href="/register" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '100px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}>
                Start My 3-Day Trial
              </Link>
              <Link href="/pricing" className="btn btn-outline" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '100px' }}>
                View Plans
              </Link>
            </div>

            {/* Floating UI Graphics */}
            <div style={{ marginTop: '6rem', position: 'relative', width: '100%', maxWidth: '1100px', margin: '6rem auto 0' }}>
              <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.08)',
                border: '1px solid var(--border)',
                aspectRatio: '16/10',
                overflow: 'hidden',
                padding: '2rem'
              }}>
                <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
                  <div style={{ width: '240px', background: '#f8fafc', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ width: '80%', height: '12px', background: '#e2e8f0', borderRadius: 6, marginBottom: '2rem' }}></div>
                    <div style={{ spaceY: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{ width: 16, height: 16, background: i === 1 ? 'var(--primary)' : '#e2e8f0', borderRadius: 4 }}></div>
                          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, flex: 1 }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ padding: '1rem', borderStyle: 'dashed' }}>
                          <div style={{ height: 10, background: '#f1f5f9', borderRadius: 4, width: '40%', marginBottom: 10 }}></div>
                          <div style={{ height: 20, background: '#f1f5f9', borderRadius: 4, width: '70%' }}></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '300px', background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                        {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85].map((h, i) => (
                          <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', opacity: 0.1 + (i * 0.1), borderRadius: '4px 4px 0 0' }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Overlays */}
              <div className="float" style={{ position: 'absolute', top: '15%', right: '-5%', width: '280px', zIndex: 10 }}>
                <div className="card" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ecfdf5', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)' }}>Booking Confirmed</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Dr. Sarah Smith</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: '1rem' }}>
                    <span style={{ display: 'flex', itemsCenter: 'center', gap: 4 }}><Clock size={12} /> 10:30 AM</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              <div className="float" style={{ position: 'absolute', bottom: '10%', left: '-8%', width: '240px', animationDelay: '1s' }}>
                <div className="card" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: 'none', background: 'var(--sidebar-bg)', color: 'white' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>Stats Overview</p>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>+24%</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ width: '70%', height: '100%', background: 'var(--primary)', borderRadius: 2 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'white' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem' }}>
              Trusted by 5,000+ modern professionals
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4, flexWrap: 'wrap', gap: '2rem' }}>
              {['FORBES', 'TECHCRUNCH', 'WIRED', 'THE VERGE', 'NY TIMES'].map(logo => (
                <span key={logo} style={{ fontSize: '1.25rem', fontWeight: 900, tracking: '0.2rem' }}>{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '8rem 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Everything you need to <span className="text-gradient">succeed</span>.</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>Power-packed features designed to automate your administrative work.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div className="card feature-card">
                <div style={{ width: 48, height: 48, background: '#f5f3ff', color: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Layout size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Unified Dashboard</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Get a birds-eye view of your entire business. Appointments, revenue, and client insights in one place.</p>
              </div>
              <div className="card feature-card">
                <div style={{ width: 48, height: 48, background: '#ecfdf5', color: '#10b981', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Clock size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Smart Auto-Booking</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Our algorithm calculates availability in real-time, preventing overlaps and double-bookings automatically.</p>
              </div>
              <div className="card feature-card">
                <div style={{ width: 48, height: 48, background: '#fffbeb', color: '#f59e0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <BarChart3 size={24} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>Deep Analytics</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>Understand your monthly trends. Track unique clients and cancellation rates to optimize your growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section style={{ padding: '8rem 0', background: 'white' }}>
          <div className="container">
            <div className="card" style={{
              padding: '4rem',
              background: 'var(--sidebar-bg)',
              color: 'white',
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '4rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="#f59e0b" stroke="none" />)}
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '2.5rem' }}>
                  "Schedly has completely transformed how I manage my private practice. I've seen a 30% reduction in cancellations since switching."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>MS</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>Maria Santos</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>Psychologist & Private Practitioner</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', flex: 1, minWidth: '300px' }}>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>99%</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>Satisfaction</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>5k+</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>Users</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>24/7</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>Support</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Instant</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>Setup</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '8rem 0' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="card" style={{
              padding: '6rem 2rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
              color: 'white',
              borderRadius: '48px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>

              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>Ready to scale your business?</h2>
              <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 3rem' }}>
                Join thousands of professionals who improved their efficiency by 40% with Schedly.
              </p>
              <Link href="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '100px', fontWeight: 800 }}>
                Start Your Free Trial Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '6rem 0 4rem', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color="white" />
                </div>
                <span className="text-gradient">Schedly</span>
              </div>
              <p style={{ color: 'var(--muted)', maxWidth: '300px', lineHeight: 1.6 }}>
                The most complete and intuitive scheduling platform for modern professionals across all industries.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="#features" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Features</Link>
                <Link href="/pricing" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</Link>
                <Link href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Case Studies</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>About Us</Link>
                <Link href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</Link>
                <Link href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</Link>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
            <p>© 2026 Schedly Inc. Built for professional excellence.</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</Link>
              <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</Link>
              <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
