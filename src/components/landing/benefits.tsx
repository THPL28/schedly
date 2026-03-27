import {
  ArrowUpRight,
  Rocket,
  Smartphone,
} from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import styles from './landing.module.css'

const trustBrands = ['QUANTUM', 'VERTEX', 'PRISMART', 'AXIUM', 'NEXUS']

const featureListA = [
  {
    title: 'Agendamento de Equipe',
    text: 'Visualize a disponibilidade coletiva e direcione reuniões para os membros certos.',
    icon: '/landing/icons/Icon-20-coletive.svg',
  },
  {
    title: 'Lembretes Automáticos',
    text: 'Reduza faltas com lembretes automáticos por e-mail e SMS personalizados.',
    icon: '/landing/icons/Icon-19.-notificacao.svg',
  },
]

const featureListB = [
  'Notificações push instantâneas',
  'Reagendamento com um toque',
  'Acesso offline a sua agenda',
]

const integrations = [
  { label: 'Mail', icon: '/landing/icons/em-breve/Icon-1.svg' },
  { label: 'Video', icon: '/landing/icons/em-breve/Icon-2.svg' },
  { label: 'Chat', icon: '/landing/icons/em-breve/Icon-3.svg' },
  { label: 'Calendar', icon: '/landing/icons/em-breve/Icon-4.svg' },
  { label: 'Cloud', icon: '/landing/icons/em-breve/Icon-5.svg' },
]

export function Benefits() {
  return (
    <>
      <section className={styles.trustSection}>
        <div className={styles.container}>
          <p className={styles.trustLabel}>CONFIADO POR GRANDES EMPRESAS</p>
          <div className={styles.brandsRowDisplay}>
            <div className={styles.brandsMarqueeInnerFlow}>
              {[...trustBrands, ...trustBrands].map((brand, index) => (
                <p key={`${brand}-${index}`} className={styles.trustLogo}>
                  {brand}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className={styles.simplicitySection}>
        <div className={styles.simplicityContainer}>
          <h2 className={styles.simplicityTitle}>Agendamento simplificado</h2>
          <p className={styles.simplicityText}>
            O Schedly elimina o atrito do seu dia para que você possa focar no
            trabalho que realmente importa.
          </p>
          <Link href="/register" className={styles.simplicityButton}>
            Começar Hoje
          </Link>
        </div>
      </section>

      <section className={styles.featureBlocksSection}>
        <div className={styles.container}>
          <article className={styles.featureRowA}>
            <div className={styles.featureCopy}>
              <p className={styles.featurePill}>
                <Rocket size={14} />
                Automação de Fluxo de Trabalho
              </p>
              <h3 className={styles.featureTitle}>Coordene sua equipe sem esforço</h3>
              <div className={styles.featureItemList}>
                {featureListA.map(item => (
                  <div key={item.title} className={styles.featureItem}>
                    <div className={styles.featureItemIcon}>
                      <NextImage src={item.icon} alt="" width={24} height={24} />
                    </div>
                    <div>
                      <p className={styles.featureItemTitle}>{item.title}</p>
                      <p className={styles.featureItemText}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <NextImage
              src="/landing/coordination-mockup.png"
              alt="Productivity Dashboard"
              width={584}
              height={438}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </article>

          <article className={styles.featureRowB}>
            <NextImage
              src="/landing/mobile-app-final.png"
              alt="Mobile App Mockup"
              width={712}
              height={520}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className={styles.featureCopyCompact}>
              <p className={`${styles.featurePill} ${styles.featurePillBlue}`}>
                <Smartphone size={14} />
                Mobile First
              </p>
              <h3 className={styles.featureTitleCompact}>
                Sua agenda profissional sempre no bolso
              </h3>
              <p className={styles.featureBodyCompact}>
                Nosso aplicativo móvel permite que você compartilhe disponibilidade,
                gerencie reuniões e receba notificações instantâneas, mesmo longe da
                sua mesa.
              </p>
              <ul className={styles.featureCheckList}>
                {featureListB.map(item => (
                  <li key={item} className={styles.featureCheckItem}>
                    <NextImage src="/landing/icons/Icon-16.svg" alt="" width={18} height={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.integrationSection}>
        <div className={`${styles.container} ${styles.integrationLayout}`}>
          <div className={styles.integrationCopy}>
            <h2 className={styles.integrationTitle}>Conecte-se com as ferramentas que você ama hoje</h2>
            <p className={styles.integrationText}>
              O Schedly se integra aos aplicativos que você já usa todos os dias para manter tudo em sincronia.
            </p>
            <Link href="/pricing" className={styles.integrationLink} aria-label="Ver integrações">
              Ver integrações
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className={styles.integrationGrid}>
            {integrations.map((item, idx) => (
              <div key={idx} className={styles.integrationIconOnly} aria-hidden="true">
                <NextImage src={item.icon} alt={item.label} width={48} height={48} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
