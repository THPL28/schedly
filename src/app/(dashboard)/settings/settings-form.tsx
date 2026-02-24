'use client'

import { updateSettings } from '@/lib/actions'
import { useState, useRef } from 'react'
import { Link2, User, CheckCircle, Upload, Phone, FileText, Globe as GlobeIcon, X, Clock, CalendarDays, Camera } from 'lucide-react'
import Image from 'next/image'

export default function SettingsForm({ user }: { user: any }) {
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
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
