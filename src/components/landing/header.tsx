import Link from 'next/link'
import styles from './landing.module.css'
import Logo from '@/components/logo'

type HeaderProps = {
  isAuthenticated: boolean
}

export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label="Página inicial do Schedly">
          <Logo size={30} />
        </Link>

        <nav className={styles.navLinks} aria-label="Principal">
          <Link href="/#benefits" className={styles.navLink}>
            Produto
          </Link>
          <Link href="/#cta" className={styles.navLink}>
            Soluções
          </Link>
          <Link href="/#results" className={styles.navLink}>
            Resultados
          </Link>
          <Link href="/#pricing" className={styles.navLink}>
            Preços
          </Link>
        </nav>

        <div className={styles.headerActions}>
          {isAuthenticated ? (
            <Link href="/dashboard" className={styles.primaryButton}>
              Ir para o painel
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.ghostButton}>
                Entrar
              </Link>
              <Link href="/register" className={styles.primaryButton}>
                Começar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}