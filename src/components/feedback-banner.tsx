'use client'

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

type FeedbackVariant = 'success' | 'error' | 'info'

interface FeedbackBannerProps {
    title: string
    message: string
    variant?: FeedbackVariant
    className?: string
}

const styles: Record<FeedbackVariant, { wrapper: string; icon: typeof AlertCircle }> = {
    success: {
        wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        icon: CheckCircle2,
    },
    error: {
        wrapper: 'border-red-200 bg-red-50 text-red-700',
        icon: AlertCircle,
    },
    info: {
        wrapper: 'border-indigo-200 bg-indigo-50 text-indigo-800',
        icon: Info,
    },
}

export default function FeedbackBanner({
    title,
    message,
    variant = 'info',
    className = '',
}: FeedbackBannerProps) {
    const config = styles[variant]
    const Icon = config.icon

    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            className={`rounded-[1.5rem] border px-4 py-4 md:px-5 md:py-4 ${config.wrapper} ${className}`.trim()}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <p className="m-0 text-sm font-black tracking-tight">{title}</p>
                    <p className="mt-1 text-sm font-medium leading-relaxed opacity-90">{message}</p>
                </div>
            </div>
        </div>
    )
}
