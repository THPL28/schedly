import Link from 'next/link'
import styles from './legal-page.module.css'

export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
}

type LegalPageProps = {
  eyebrow: string
  title: string
  summary: string
  lastUpdated: string
  sections: LegalSection[]
}

const publicLinks = [
  { label: 'Página inicial', href: '/' },
  { label: 'Política de Privacidade', href: '/privacy' },
  { label: 'Termos de Serviço', href: '/terms' },
]

export function LegalPage({
  eyebrow,
  title,
  summary,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className={styles.pageMain}>
      <div className={styles.backdropGlow} aria-hidden="true" />

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.summary}>{summary}</p>

            <div className={styles.heroChips}>
              <span className={styles.chip}>Documento público</span>
              <span className={styles.chip}>Português do Brasil</span>
              <span className={styles.chip}>Atualizado em {lastUpdated}</span>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <div className={styles.panelCard}>
              <span className={styles.panelLabel}>Links públicos</span>
              <div className={styles.linkRow}>
                {publicLinks.map(link => (
                  <Link key={link.href} href={link.href} className={styles.linkPill}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.panelMetaGrid}>
              <div className={styles.panelMiniCard}>
                <span className={styles.panelLabel}>Última atualização</span>
                <p className={styles.panelValue}>{lastUpdated}</p>
              </div>

              <div className={styles.panelMiniCard}>
                <span className={styles.panelLabel}>Contato</span>
                <p className={styles.panelText}>
                  Em caso de dúvidas sobre estes documentos, fale com nosso time em{' '}
                  <Link href="mailto:contato@schedlyfy.com" className={styles.contactLink}>
                    contato@schedlyfy.com
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <span className={styles.sidebarLabel}>Nesta página</span>
              <nav className={styles.sidebarNav} aria-label="Índice da página">
                {sections.map((section, index) => (
                  <Link key={section.id} href={`#${section.id}`} className={styles.sidebarLink}>
                    <span className={styles.sidebarIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <span>{section.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <article className={styles.article}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                  </div>
                </div>

                <div className={styles.sectionBody}>
                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}

                  {section.items ? (
                    <ul className={styles.list}>
                      {section.items.map(item => (
                        <li key={item} className={styles.listItem}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  )
}