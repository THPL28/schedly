import Link from 'next/link'
import NextImage from 'next/image'
import styles from './landing.module.css'
import CountUpValue from './count-up-value'

const ctaPoints = [
  'Branding personalizado com seu logotipo e cores',
  'Inteligencia de fuso horario para convidados globais',
  'Agendamento Round Robin',
]

const stats = [
  {
    value: '+160%',
    valueClass: styles.statValueIndigo,
    label: 'Crescimento de Receita',
    text: 'Media para equipes de vendas usando Schedly.',
  },
  {
    value: '+20%',
    valueClass: styles.statValueGreen,
    label: 'Reducao de faltas',
    text: 'Com lembretes multicanal automatizados.',
  },
  {
    value: '15h',
    valueClass: styles.statValueBlue,
    label: 'Tempo economizado semanalmente',
    text: 'Eliminando o vai e vem dos agendamentos.',
  },
  {
    value: '10M+',
    valueClass: styles.statValuePurple,
    label: 'Reunioes agendadas',
    text: 'Utilizado em mais de 150 paises.',
  },
]

const securityBadges = [
  { label: 'SOC 2 Type II', icon: '/landing/icons/seguranca/Icon-inicial.svg' },
  { label: 'Criptografia de Ponta a Ponta', icon: '/landing/icons/seguranca/Icon-2.svg' },
  { label: 'Conformidade com LGPD/GDPR', icon: '/landing/icons/seguranca/Icon-penultimo.svg' },
  { label: 'SAML SSO', icon: '/landing/icons/seguranca/Icon-end.svg' },
]

export function CTASection() {
  return (
    <>
      <section id="cta" className={styles.schedulingSection}>
        <div className={styles.container}>
          <div className={styles.schedulingCard}>
            <NextImage
              src="/landing/professional-invite-mockup.png"
              alt="Scheduling Professional Mockup"
              width={600}
              height={400}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px', display: 'block' }}
            />

            <div className={styles.schedulingCopy}>
              <h2 className={styles.schedulingTitle}>
                A maneira mais profissional de convidar convidados
              </h2>
              <p className={styles.schedulingText}>
                Seu link de agendamento personalizado e mais do que apenas um
                calendario, ele e sua porta de entrada digital.
              </p>
              <ul className={styles.schedulingList}>
                {ctaPoints.map(item => (
                  <li key={item} className={styles.schedulingListItem}>
                    <NextImage src="/landing/icons/Icon-16.svg" alt="" width={18} height={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="results" className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsIntro}>
            <p className={styles.statsEyebrow}>Resultados Reais</p>
            <h2 className={styles.statsHeading}>Impacto direto na rotina e no faturamento</h2>
            <p className={styles.statsSubheading}>
              Numeros medios observados em operacoes que adotaram o Schedly.
            </p>
          </div>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <article key={stat.label} className={styles.statCard}>
                <p className={`${styles.statValue} ${stat.valueClass}`}>
                  <CountUpValue value={stat.value} durationMs={1600} delayMs={index * 120} />
                </p>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statText}>{stat.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className={styles.securitySection}>
        <div className={styles.securityContainer}>
          <h2 className={styles.securityHeading}>Construido com seguranca em mente</h2>
          <p className={styles.securitySubheading}>
            Infraestrutura robusta para proteger dados, acessos e operacoes criticas.
          </p>
          <div className={styles.securityGrid}>
            {securityBadges.map(item => (
              <article key={item.label} className={styles.securityItem}>
                <div className={styles.securityIconWrap}>
                  <NextImage src={item.icon} alt="" width={40} height={40} />
                </div>
                <p className={styles.securityLabel}>{item.label}</p>
              </article>
            ))}
          </div>
          <Link href="/register" className={styles.securityCta}>
            Testar Schedly
          </Link>
        </div>
      </section>
    </>
  )
}
