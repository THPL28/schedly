import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: Math.max(8, Math.round(size * 0.25)) }}>
      <div style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          src="/icon.svg"
          alt="Schedly"
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
      <span style={{ fontSize: size * 0.68, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>
        Schedly
      </span>
    </div>
  )
}
