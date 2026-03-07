import Link from 'next/link'
import Image from 'next/image'
import styles from './landing.module.css'

export function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.blurTop} />
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>
              Agendamento inteligente
              <br />
              <span className={styles.heroHighlight}>ao seu alcance</span>
            </h1>

            <p className={styles.heroText}>
              O Schedly é a plataforma de agendamento moderna que ajuda
              profissionais e equipes a organizar reuniões sem fricção.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link href="/register" className={styles.heroPrimary}>
              Começar Gratuitamente
            </Link>
            <Link href="#cta" className={styles.heroSecondary}>
              Ver Demonstração
            </Link>
          </div>
        </div>

        <div className={styles.heroVisualContainer}>
          <div className={styles.glowEffect} />
          <Image
            src="/landing/hero-dashboard.png"
            alt="Schedly Dashboard Mockup"
            width={1200}
            height={800}
            priority
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </section>
  )
}
