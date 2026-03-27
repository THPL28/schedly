'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Camera, CheckCircle, Clock, FileText, User, X } from 'lucide-react'
import { updateSettings } from '@/lib/actions'
import FeedbackBanner from '@/components/feedback-banner'

type FeedbackState = {
    variant: 'success' | 'error' | 'info'
    title: string
    message: string
} | null

export default function SettingsForm({ user }: { user: any }) {
    const searchParams = useSearchParams()
    const [feedback, setFeedback] = useState<FeedbackState>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const showFeedback = (
        variant: NonNullable<FeedbackState>['variant'],
        title: string,
        message: string
    ) => {
        setFeedback({ variant, title, message })
    }

    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'google_connected') {
            showFeedback(
                'success',
                'Google conectado',
                'Sua conta foi vinculada com sucesso. Agora você pode usar o Meet nos serviços que desejar.'
            )
        } else if (error === 'google_auth_failed') {
            showFeedback(
                'error',
                'Falha na conexão',
                'Não foi possível concluir a autenticação com o Google. Tente novamente em alguns instantes.'
            )
        } else if (error === 'token_exchange_failed' || error === 'no_code') {
            showFeedback(
                'error',
                'Integração interrompida',
                'O retorno do Google veio incompleto. Reconecte sua conta para continuar.'
            )
        }
    }, [searchParams])

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showFeedback('error', 'Arquivo inválido', 'Selecione uma imagem válida para atualizar sua foto de perfil.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showFeedback('error', 'Imagem muito grande', 'Use um arquivo com até 5 MB para manter a experiência leve.')
            return
        }

        setUploading(true)
        setFeedback(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                setAvatarUrl(data.url)
                setAvatarPreview(data.url)
                showFeedback(
                    'success',
                    'Foto pronta',
                    'Sua nova imagem foi enviada. Agora basta salvar as configurações para publicar a mudança.'
                )
            } else {
                showFeedback('error', 'Falha no upload', data.error || 'Não foi possível enviar a foto agora.')
            }
        } catch (error) {
            showFeedback('error', 'Falha no upload', 'Não foi possível enviar sua foto. Tente novamente.')
        } finally {
            setUploading(false)
        }
    }

    function handleRemoveAvatar() {
        setAvatarUrl('')
        setAvatarPreview('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        showFeedback(
            'info',
            'Foto removida',
            'Sua foto foi removida da pré-visualização. Salve as configurações para confirmar a alteração.'
        )
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setFeedback(null)

        formData.append('avatarUrl', avatarUrl || '')

        const res = await updateSettings(formData)
        setLoading(false)

        if (res?.success) {
            if (avatarUrl) setAvatarPreview(avatarUrl)
            showFeedback(
                'success',
                'Configurações atualizadas',
                'Suas preferências foram salvas com sucesso e já estão prontas para uso.'
            )
            return
        }

        if (res?.error) {
            showFeedback('error', 'Não foi possível salvar', res.error)
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <form action={handleSubmit} className="flex flex-col gap-5 md:gap-8">
            {feedback && (
                <FeedbackBanner
                    variant={feedback.variant}
                    title={feedback.title}
                    message={feedback.message}
                    className="animate-in fade-in slide-in-from-top-2"
                />
            )}

            <div className="card border-border/50 bg-white p-5 md:p-8">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-900 md:mb-8 md:text-xl">
                    <User size={20} className="text-primary" /> Identidade Visual
                </h3>

                <div className="flex flex-col items-center gap-6 sm:flex-row md:gap-10">
                    <div className="relative group">
                        <div className="relative h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white shadow-xl transition-transform group-hover:scale-[1.02]">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Perfil" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-3xl font-black text-white">
                                    {getInitials(user?.name)}
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                </div>
                            )}
                        </div>

                        <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-white shadow-lg transition-colors hover:bg-slate-50"
                        >
                            <Camera size={18} className="text-primary" />
                        </label>

                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border-none bg-danger text-white shadow-lg transition-colors hover:bg-danger/90"
                            >
                                <X size={14} />
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="avatar-upload"
                        />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="mb-1 text-lg font-bold text-slate-800">{user?.name}</h4>
                        <p className="mb-4 text-sm font-medium text-muted">{user?.email}</p>
                        <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted sm:mx-0">
                            Sua foto aparecerá na página pública de agendamentos e no seu painel. Use uma imagem nítida
                            para reforçar profissionalismo.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card flex flex-col gap-5 border-border/50 p-5 md:gap-6 md:p-8">
                <h3 className="mb-1 flex items-center gap-2 text-lg font-black text-slate-900 md:text-xl">
                    <FileText size={20} className="text-primary" /> Perfil Profissional
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="label">Nome público / negócio</label>
                        <input name="name" defaultValue={user?.name || ''} className="input h-12" placeholder="Seu nome profissional" />
                    </div>

                    <div>
                        <label className="label">Slug da URL pública</label>
                        <div className="flex h-12 items-center rounded-xl border border-border bg-muted-light/50 px-4 transition-all focus-within:ring-2 ring-primary/20">
                            <input
                                name="slug"
                                defaultValue={user?.slug || ''}
                                className="w-full border-none bg-transparent text-sm font-bold text-primary outline-none"
                                placeholder="seu-nome"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">WhatsApp / Telefone</label>
                        <input name="phone" defaultValue={user?.phone || ''} className="input h-12" placeholder="(00) 00000-0000" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Mini bio / descrição</label>
                        <textarea
                            name="bio"
                            defaultValue={user?.bio || ''}
                            className="input min-h-[120px]"
                            placeholder="Fale um pouco sobre o serviço que você presta..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="card flex flex-col gap-5 border-border/50 bg-slate-50/30 p-5 md:gap-6 md:p-8">
                <h3 className="mb-1 flex items-center gap-2 text-lg font-black text-slate-900 md:text-xl">
                    <Clock size={20} className="text-primary" /> Regras de Agendamento
                </h3>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <label className="label m-0">Antecedência mínima</label>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">RECOMENDADO</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <select name="minLeadTime" defaultValue={user?.minLeadTime || 2} className="input h-12 font-bold">
                                <option value="0">Imediato</option>
                                <option value="1">1 hora antes</option>
                                <option value="2">2 horas antes</option>
                                <option value="4">4 horas antes</option>
                                <option value="12">12 horas antes</option>
                                <option value="24">24 horas antes</option>
                            </select>
                        </div>
                        <p className="mt-2 text-[10px] font-medium text-muted">
                            Tempo mínimo que o cliente deve respeitar antes de marcar.
                        </p>
                    </div>

                    <div>
                        <label className="label">Agendamento no futuro</label>
                        <div className="flex items-center gap-3">
                            <select name="maxFutureDays" defaultValue={user?.maxFutureDays || 30} className="input h-12 font-bold">
                                <option value="7">Próximos 7 dias</option>
                                <option value="15">Próximos 15 dias</option>
                                <option value="30">Próximos 30 dias</option>
                                <option value="60">Próximos 60 dias</option>
                                <option value="90">Próximos 90 dias</option>
                            </select>
                        </div>
                        <p className="mt-2 text-[10px] font-medium text-muted">
                            Quanto tempo à frente sua agenda ficará disponível.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card group relative overflow-hidden border-border/50 bg-white p-5 md:p-10">
                <div className="absolute right-0 top-0 h-64 w-64 -mr-32 -mt-32 rounded-full bg-primary/5 blur-3xl transition-colors duration-700 group-hover:bg-primary/10"></div>

                <div className="relative z-10 flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-1 items-start gap-6">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-[#4285F4]/20 bg-gradient-to-br from-[#4285F4]/10 to-[#34A853]/10 shadow-lg">
                            <svg width="36" height="36" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 md:text-2xl">Google Meet & Agenda</h3>
                                {user?.googleCalendarEnabled ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-700">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Conectado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                                        Não conectado
                                    </span>
                                )}
                            </div>
                            <p className="mb-6 max-w-lg text-sm font-medium leading-relaxed text-muted">
                                Conecte sua conta Google para criar links do Meet automaticamente em cada agendamento e sincronizar tudo com sua agenda pessoal.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Link Meet automático', 'Sincronia com Agenda', 'E-mail com link da reunião', 'Gestão de eventos'].map((feat) => (
                                    <span key={feat} className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                                        <CheckCircle size={11} className="shrink-0 text-green-500" /> {feat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-3 md:w-fit md:self-center">
                        <a
                            href="/api/auth/google"
                            className="flex w-full items-center justify-center gap-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 md:w-auto"
                            style={{
                                backgroundColor: 'white',
                                border: '1.5px solid #dadce0',
                                color: '#3c4043',
                                padding: '14px 24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                textDecoration: 'none',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span style={{ color: '#3c4043', fontWeight: 600 }}>
                                {user?.googleCalendarEnabled ? 'Reconectar Google' : 'Entrar com o Google'}
                            </span>
                        </a>
                        {user?.googleCalendarEnabled && (
                            <p className="text-center text-[10px] font-medium text-muted">Clique para atualizar suas permissões.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="sticky bottom-4 z-20 flex justify-stretch md:bottom-8 md:justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary h-14 w-full text-lg shadow-2xl shadow-primary/30 md:w-auto md:px-12"
                >
                    {loading ? 'Salvando...' : 'Salvar todas as configurações'}
                </button>
            </div>
        </form>
    )
}
