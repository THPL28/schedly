'use client'

import { updateSettings } from '@/lib/actions'
import { useState, useRef, useEffect } from 'react'
import { Link2, User, CheckCircle, Upload, Phone, FileText, Globe as GlobeIcon, X, Clock, CalendarDays, Camera } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function SettingsForm({ user }: { user: any }) {
    const searchParams = useSearchParams()
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'google_connected') {
            setMessage('Google Agenda conectado com sucesso! Agora você pode ativar o Google Meet em seus serviços.')
            setIsError(false)
        } else if (error === 'google_auth_failed') {
            setMessage('Falha ao conectar com o Google. Tente novamente.')
            setIsError(true)
        }
    }, [searchParams])
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
    const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setMessage('Por favor, selecione uma imagem válida')
            setIsError(true)
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('A imagem deve ter no máximo 5MB')
            setIsError(true)
            return
        }

        setUploading(true)
        setMessage('')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setAvatarUrl(data.url)
                setAvatarPreview(data.url)
                setMessage('Foto enviada com sucesso! Lembre-se de salvar as alterações.')
                setIsError(false)
            } else {
                setMessage(data.error || 'Erro ao enviar foto')
                setIsError(true)
            }
        } catch (error) {
            setMessage('Erro ao enviar foto. Tente novamente.')
            setIsError(true)
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
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage('')
        setIsError(false)

        if (avatarUrl) {
            formData.append('avatarUrl', avatarUrl)
        } else {
            formData.append('avatarUrl', '')
        }

        const res = await updateSettings(formData)
        setLoading(false)

        if (res?.success) {
            setMessage('Configurações salvas com sucesso!')
            if (avatarUrl) setAvatarPreview(avatarUrl)
            setTimeout(() => setMessage(''), 3000)
        }
        if (res?.error) {
            setMessage(res.error)
            setIsError(true)
        }
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <form action={handleSubmit} className="flex flex-col gap-8">
            {/* Perfil & Identidade Visual */}
            <div className="card p-8 bg-white border-border/50">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <User size={20} className="text-primary" /> Identidade Visual
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl relative transition-transform group-hover:scale-[1.02]">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Perfil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl font-black text-white">
                                    {getInitials(user?.name)}
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                </div>
                            )}
                        </div>

                        <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-border rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <Camera size={18} className="text-primary" />
                        </label>

                        {avatarPreview && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-danger text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-danger/90 transition-colors border-none"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="avatar-upload" />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-slate-800 text-lg mb-1">{user?.name}</h4>
                        <p className="text-muted text-sm font-medium mb-4">{user?.email}</p>
                        <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto sm:mx-0">Sua foto aparecerá na página pública de agendamentos e no seu painel. Use uma foto nítida para passar profissionalismo.</p>
                    </div>
                </div>
            </div>

            {/* Informações Profissionais */}
            <div className="card p-8 flex flex-col gap-6 border-border/50">
                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={20} className="text-primary" /> Perfil Profissional
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="label">Nome Público / Negócio</label>
                        <input name="name" defaultValue={user?.name || ''} className="input h-12" placeholder="Seu nome profissional" />
                    </div>

                    <div>
                        <label className="label">Slug da URL (schedlyfy.com/book/...)</label>
                        <div className="flex items-center bg-muted-light/50 border border-border rounded-xl px-4 h-12 focus-within:ring-2 ring-primary/20 transition-all">
                            <input name="slug" defaultValue={user?.slug || ''} className="bg-transparent border-none outline-none w-full font-bold text-sm text-primary" placeholder="seu-nome" />
                        </div>
                    </div>

                    <div>
                        <label className="label">WhatsApp / Telefone</label>
                        <input name="phone" defaultValue={user?.phone || ''} className="input h-12" placeholder="(00) 00000-0000" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Mini Bio / Descrição</label>
                        <textarea name="bio" defaultValue={user?.bio || ''} className="input min-h-[120px]" placeholder="Fale um pouco sobre o serviço que você presta..."></textarea>
                    </div>
                </div>
            </div>

            {/* Configurações de Agendamento */}
            <div className="card p-8 flex flex-col gap-6 border-border/50 bg-slate-50/30">
                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <Clock size={20} className="text-primary" /> Regras de Agendamento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="label m-0">Antecedência Mínima</label>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">RECOMENDADO</span>
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
                        <p className="text-[10px] text-muted mt-2 font-medium">Tempo mínimo que o cliente deve respeitar para marcar.</p>
                    </div>

                    <div>
                        <label className="label">Agendamento no Futuro</label>
                        <div className="flex items-center gap-3">
                            <select name="maxFutureDays" defaultValue={user?.maxFutureDays || 30} className="input h-12 font-bold">
                                <option value="7">Próximos 7 dias</option>
                                <option value="15">Próximos 15 dias</option>
                                <option value="30">Próximos 30 dias</option>
                                <option value="60">Próximos 60 dias</option>
                                <option value="90">Próximos 90 dias</option>
                            </select>
                        </div>
                        <p className="text-[10px] text-muted mt-2 font-medium">Quanto tempo à frente sua agenda ficará disponível.</p>
                    </div>
                </div>
            </div>

            {/* Integração & Automatização - Google Meet */}
            <div className="card p-10 bg-white border-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>

                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                    {/* Icon & Info */}
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4285F4]/10 to-[#34A853]/10 flex items-center justify-center shadow-lg border border-[#4285F4]/20 flex-shrink-0">
                            <svg width="36" height="36" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-2xl font-black text-slate-900">Google Meet & Agenda</h3>
                                {user?.googleCalendarEnabled ? (
                                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[9px] font-black px-3 py-1 rounded-full border border-green-200 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                                        Conectado
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[9px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                                        Não Conectado
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted font-medium leading-relaxed mb-6 max-w-lg">
                                Conecte sua conta Google para criar links do Google Meet automaticamente em cada agendamento e sincronizar tudo com sua agenda pessoal.
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {['Link Meet automático', 'Sinc. com Google Agenda', 'E-mail com link da reunião', 'Gestão de eventos'].map((feat) => (
                                    <span key={feat} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
                                        <CheckCircle size={11} className="text-green-500 flex-shrink-0" /> {feat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Google-style button */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3 md:self-center">
                        <a
                            href="/api/auth/google"
                            className="flex items-center gap-3 rounded-2xl font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-95"
                            style={{
                                backgroundColor: 'white',
                                border: '1.5px solid #dadce0',
                                color: '#3c4043',
                                padding: '12px 24px',
                                minWidth: '230px',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                textDecoration: 'none',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span style={{ color: '#3c4043', fontWeight: 600 }}>
                                {user?.googleCalendarEnabled ? 'Reconectar Google' : 'Entrar com o Google'}
                            </span>
                        </a>
                        {user?.googleCalendarEnabled && (
                            <p className="text-[10px] text-muted text-center font-medium">Clique para atualizar as permissões</p>
                        )}
                    </div>
                </div>
            </div>
            {message && (
                <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                    {!isError && <CheckCircle size={18} />}
                    {message}
                </div>
            )}

            <div className="sticky bottom-8 z-20 flex justify-end">
                <button type="submit" disabled={loading} className="btn btn-primary h-14 px-12 text-lg shadow-2xl shadow-primary/30">
                    {loading ? 'Salvando...' : 'Salvar Todas as Alterações'}
                </button>
            </div>
        </form>
    )
}
