import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  hideText?: boolean
}

export default function Logo({ size = 32, className = '', hideText = false }: LogoProps) {
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: Math.max(8, Math.round(size * 0.25)) }}>
      <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          src="/logo.svg"
          alt="Schedly"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
      {!hideText && (
        <span style={{ fontSize: size * 0.68, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>
          Schedly
        </span>
      )}
    </div>
  )
}
