'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Copy, Clock, Settings, X, Check, Megaphone, Link as LinkIcon, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions({ userSlug, isSmall }: { userSlug: string, isSmall?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${userSlug}`

    const handleCopy = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isMounted) return <div className={`${isSmall ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-slate-100 shadow-sm`} />

    const ModalContent = (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop with extreme blur and dark tint for focus */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[12px] animate-in fade-in duration-500" 
                onClick={() => setIsOpen(false)}
            ></div>
            
            {/* Modal Body */}
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-20 zoom-in-95 duration-500 border border-slate-100/50 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sm:mb-10">
                    <div>
                        <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1 sm:mb-3">Ações Rápidas</h3>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Comandos de Gerenciamento</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 shadow-sm active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="grid gap-5 sm:gap-8">
                    {/* Copy Link Action - High Contrast UI */}
                    <div className="bg-primary/5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30">
                                    <LinkIcon size={28} />
                                </div>
                                <div>
                                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.15em] block mb-1">Link de Agendamento</span>
                                    <span className="text-lg font-black text-slate-900">Seu Canal Público</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 relative z-10">
                            <div className="flex-1 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/60 text-[11px] text-slate-600 font-bold truncate flex items-center min-w-0">
                                <span className="truncate">{bookingUrl}</span>
                            </div>
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-xl hover:bg-primary active:scale-95'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-6">
                        <Link 
                            href="/schedule?new=true"
                            onClick={() => setIsOpen(false)}
                            className="p-5 sm:p-8 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 group hover:bg-primary hover:border-primary/20 transition-all duration-500 no-underline shadow-sm hover:shadow-2xl hover:shadow-primary/20"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-primary group-hover:scale-110 transition-all mb-5">
                                <Plus size={24} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-2 text-slate-400 group-hover:text-white/70">Novo</p>
                            <p className="text-lg font-black tracking-tight leading-none text-slate-900 group-hover:text-white">Agendamento</p>
                        </Link>

                        <button 
                            onClick={() => {
                                window.open(`https://wa.me/?text=${encodeURIComponent('Olá! Gostaria de confirmar nosso agendamento para hoje. Podemos confirmar?')}`, '_blank');
                                setIsOpen(false);
                            }}
                            className="p-5 sm:p-8 bg-emerald-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-100 group hover:bg-[#25D366] hover:border-[#25D366]/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[#25D366]/20 text-left"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-all mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0 0 48 48">
                                    <path fill="#fff" d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"></path>
                                    <path fill="#fff" d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"></path>
                                    <path fill="#cfd8dc" d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"></path>
                                    <path fill="#40c351" d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"></path>
                                    <path fill="#fff" fill-rule="evenodd" d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-2 text-emerald-600/70 group-hover:text-white/70">Lembrete Manual</p>
                            <p className="text-lg font-black tracking-tight leading-none text-emerald-900 group-hover:text-white">WhatsApp</p>
                        </button>

                        <Link 
                            href="/settings/availability"
                            onClick={() => setIsOpen(false)}
                            className="p-5 sm:p-8 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 group hover:bg-primary hover:border-primary/20 transition-all duration-500 no-underline shadow-sm hover:shadow-2xl hover:shadow-primary/20"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all mb-5">
                                <Clock size={24} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-2 text-slate-400 group-hover:text-white/70">Gerenciar</p>
                            <p className="text-lg font-black tracking-tight leading-none text-slate-900 group-hover:text-white">Meus Horários</p>
                        </Link>

                        <button 
                            onClick={() => {
                                const promoText = `🔥 PROMOÇÃO ESPECIAL! Aproveite nossos serviços com condições exclusivas por tempo limitado. Garanta seu horário agora mesmo aqui: ${bookingUrl}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(promoText)}`, '_blank');
                                setIsOpen(false);
                            }}
                            className="p-5 sm:p-8 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] sm:rounded-[2.5rem] group hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-500 text-left active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-all mb-5">
                                <Megaphone size={20} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-2 text-indigo-400 group-hover:text-white/70">Divulgar</p>
                            <p className="text-lg font-black tracking-tight leading-none text-indigo-900 group-hover:text-white">Promoção</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="relative">
            {/* Quick Action Trigger - Adaptive size */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`${isSmall ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 group border border-white/20`}
                title="Ações Rápidas"
            >
                <Plus size={isSmall ? 20 : 28} className={`transition-transform duration-500 ${isOpen ? 'rotate-45' : ''}`} />
            </button>

            {isOpen && createPortal(ModalContent, document.body)}
        </div>
    )
}
