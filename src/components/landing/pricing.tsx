import Link from 'next/link'
import { Check } from 'lucide-react'
import styles from './landing.module.css'

const plans = [
  {
    name: 'Basic',
    price: 'R$ 29,90',
    period: '/mes',
    cta: 'Ativar Plano Basic',
    featured: false,
    description: 'Ideal para autonomos em fase de crescimento.',
    items: [
      '100 agendamentos por mes',
      'Multiplos servicos (Event Types)',
      'Buffer Time automatico',
      'Pagina profissional basica',
      'Notificacoes Push',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 49,90',
    period: '/mes',
    cta: 'Ativar Plano Pro',
    featured: true,
    badge: 'Mais Popular',
    description: 'Para profissionais que precisam de escala e previsibilidade.',
    items: [
      'Agendamentos ILIMITADOS',
      'Lembretes por E-mail (24h/1h)',
      'Pagina publica premium',
      'Suporte prioritario',
      'Custom Branding',
    ],
  },
  {
    name: 'Enterprise',
    price: 'R$ 89,90',
    period: '/mes',
    cta: 'Ativar Plano Enterprise',
    featured: false,
    description: 'Operacao avancada para equipes, processos e governanca.',
    items: [
      'Multiplas equipes e roteamento avancado',
      'Integracoes premium e API',
      'Relatorios avancados',
      'Permissoes e auditoria',
      'Suporte dedicado',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className={styles.container}>
        <div className={styles.centerPill}>Faturamento Seguro</div>
        <h2 className={styles.sectionHeading}>Escolha o seu plano</h2>
        <p className={styles.sectionSubheading}>
          Potencialize seu negocio com as ferramentas de agendamento mais modernas do mercado.
        </p>

        <div className={styles.plansGrid}>
          {plans.map(plan => (
            <article
              key={plan.name}
              className={`${styles.planCard} ${plan.featured ? styles.planPopular : ''}`}
            >
              {plan.badge ? <p className={styles.planTag}>{plan.badge}</p> : null}
              <h3 className={styles.planTitle}>{plan.name}</h3>
              <p className={styles.planDescription}>{plan.description}</p>
              <div className={styles.planPriceRow}>
                <p className={styles.planPrice}>{plan.price}</p>
                <p className={styles.planPeriod}>{plan.period}</p>
              </div>

              <ul className={styles.planList}>
                {plan.items.map(item => (
                  <li key={item} className={styles.planListItem}>
                    <Check size={14} />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`${styles.planButton} ${plan.featured ? styles.planButtonPrimary : ''}`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <div className={styles.pricingNote}>
          Pagamentos processados via Stripe. Cancele a qualquer momento.
        </div>
      </div>
    </section>
  )
}
