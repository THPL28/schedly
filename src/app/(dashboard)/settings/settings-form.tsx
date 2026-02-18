'use client'

import { updateSettings } from '@/lib/actions'
import { useState, useRef } from 'react'
import { Link2, User, Globe, CheckCircle, Upload, Phone, FileText, Globe as GlobeIcon, Camera, X } from 'lucide-react'
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

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            setMessage('Por favor, selecione uma imagem válida')
            setIsError(true)
            return
        }

        // Validar tamanho (5MB)
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
                setMessage('Foto enviada com sucesso! Clique em "Salvar Alterações" para confirmar.')
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
        
        // Adicionar avatarUrl ao formData se houver
        if (avatarUrl) {
            formData.append('avatarUrl', avatarUrl)
        }

        const res = await updateSettings(formData)
        setLoading(false)

        if (res?.success) {
            setMessage('Configurações salvas com sucesso!')
            // Atualizar preview após salvar
            if (avatarUrl) {
                setAvatarPreview(avatarUrl)
            }
        }
        if (res?.error) {
            setMessage(res.error)
            setIsError(true)
        }
    }

    // Obter iniciais do nome
    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Seção de Perfil */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Foto de Perfil</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Preview da Foto */}
                    <div style={{ position: 'relative' }}>
                        {avatarPreview ? (
                            <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', background: '#f1f5f9' }}>
                                {avatarPreview.startsWith('data:') ? (
                                    // Base64 image
                                    <img
                                        src={avatarPreview}
                                        alt="Foto de perfil"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    // Regular image URL
                                    <Image
                                        src={avatarPreview}
                                        alt="Foto de perfil"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized={avatarPreview.startsWith('/uploads/')}
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 28,
                                        height: 28,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                    }}
                                    title="Remover foto"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ 
                                width: 120, 
                                height: 120, 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 700,
                                border: '3px solid var(--primary)'
                            }}>
                                {getInitials(user?.name)}
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="avatar-upload"
                        />
                        <label
                            htmlFor="avatar-upload"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--primary)',
                                color: 'white',
                                borderRadius: '0.75rem',
                                cursor: uploading ? 'wait' : 'pointer',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                opacity: uploading ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {uploading ? (
                                <>Carregando...</>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    {avatarPreview ? 'Alterar Foto' : 'Enviar Foto'}
                                </>
                            )}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                            JPG, PNG ou WebP. Máximo 5MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Informações do Perfil */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Informações Pessoais</h3>
                
                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} /> Nome Profissional
                    </label>
                    <input name="name" defaultValue={user?.name || ''} className="input" placeholder="Seu nome ou nome do negócio" />
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} /> Telefone
                    </label>
                    <input 
                        name="phone" 
                        type="tel"
                        defaultValue={user?.phone || ''} 
                        className="input" 
                        placeholder="(00) 00000-0000" 
                    />
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} /> Biografia
                    </label>
                    <textarea 
                        name="bio" 
                        defaultValue={user?.bio || ''} 
                        className="input" 
                        placeholder="Conte um pouco sobre você ou seu negócio..."
                        rows={4}
                        style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GlobeIcon size={14} /> Website
                    </label>
                    <input 
                        name="website" 
                        type="url"
                        defaultValue={user?.website || ''} 
                        className="input" 
                        placeholder="https://seusite.com.br" 
                    />
                </div>
            </div>

            {/* Configurações */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configurações</h3>
                
                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link2 size={14} /> Link Público de Agendamento
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0 1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>schedly.com/book/</span>
                        <input
                            name="slug"
                            defaultValue={user?.slug || ''}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '0.75rem 0.5rem',
                                flex: 1,
                                outline: 'none',
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.875rem'
                            }}
                            placeholder="ex: barbearia-do-joao"
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Dica: Use um nome fácil para seus clientes decorarem.</p>
                </div>

                <div>
                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={14} /> Idioma do Sistema
                    </label>
                    <select name="language" defaultValue={user?.language || 'pt-BR'} className="input">
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en">English (International)</option>
                    </select>
                </div>
            </div>

            {message && (
                <div style={{
                    background: isError ? '#fef2f2' : '#ecfdf5',
                    color: isError ? '#991b1b' : '#059669',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: `1px solid ${isError ? '#fee2e2' : '#d1fae5'}`
                }}>
                    {isError ? null : <CheckCircle size={18} />}
                    <span>{message}</span>
                </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '1rem 2rem', borderRadius: '0.75rem' }}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </form>
    )
}
