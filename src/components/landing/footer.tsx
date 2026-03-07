import Link from 'next/link'
import { Instagram, Linkedin, Twitter } from 'lucide-react'
import styles from './landing.module.css'
import Logo from '@/components/logo'

const footerGroups = [
  {
    title: 'Produto',
    links: [
      { label: 'Recursos', href: '#benefits' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Corporativo', href: '/pricing' },
      { label: 'Soluções', href: '#cta' },
    ],
  },
  {
    title: 'Integrações',
    links: [{ label: 'Google Calendar', href: '#benefits' }],
  },
  {
    title: 'Suporte',
    links: [{ label: 'Central de Ajuda', href: '/pricing' }],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre Nós', href: '#' },
      { label: 'Privacidade', href: '#' },
      { label: 'Termos de Uso', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div>
            <Link href="/" className={styles.brand} aria-label="Schedly home">
              <Logo size={28} />
            </Link>
            <p className={styles.footerBrandText}>
              A maneira mais fácil de agendar reuniões sem o vai e vem.
            </p>
            <div className={styles.footerSocial}>
              <Link href="#" className={styles.footerSocialLink} aria-label="Twitter">
                <Twitter size={14} />
              </Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="LinkedIn">
                <Linkedin size={14} />
              </Link>
              <Link href="#" className={styles.footerSocialLink} aria-label="Instagram">
                <Instagram size={14} />
              </Link>
            </div>
          </div>

          <div className={styles.footerCols}>
            {footerGroups.map(group => (
              <div key={group.title}>
                <h3 className={styles.footerTitle}>{group.title}</h3>
                <ul className={styles.footerList}>
                  {group.links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerBottomText}>
            &copy; 2024 Schedly Inc. Todos os direitos reservados.
          </p>
          <div className={styles.footerBottomLinks}>
            <Link href="#" className={styles.footerLink}>
              Status
            </Link>
            <Link href="#" className={styles.footerLink}>
              Segurança
            </Link>
            <Link href="#" className={styles.footerLink}>
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
