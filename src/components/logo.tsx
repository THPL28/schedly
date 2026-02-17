import Image from 'next/image'

interface LogoProps {
    size?: number;
    className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                className="relative overflow-hidden flex items-center justify-center rounded-xl shadow-lg shadow-primary/20"
                style={{ width: size, height: size }}
            >
                <Image
                    src="/logo.svg"
                    alt="Schedly Logo"
                    width={size}
                    height={size}
                    className="object-contain"
                />
            </div>
            <span className="text-gradient font-black tracking-tight" style={{ fontSize: size * 0.7 }}>
                Schedly
            </span>
        </div>
    )
}
