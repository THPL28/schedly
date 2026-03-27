import { verifySession } from '@/lib/auth'
import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import { Benefits } from '@/components/landing/benefits'
import { Pricing } from '@/components/landing/pricing'
import { CTASection } from '@/components/landing/cta-section'
import { Footer } from '@/components/landing/footer'
import styles from '@/components/landing/landing.module.css'

export default async function Home() {
  const session = await verifySession()

  return (
    <div className={styles.page}>
      <Header isAuthenticated={Boolean(session)} />
      <main>
        <Hero />
        <Benefits />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}


