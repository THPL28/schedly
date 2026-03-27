'use client'
import { useState } from 'react'
import { activateSubscription, expireSubscription, extendTrial, setUserRole, updateSubscriptionOverrides } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { Zap, CalendarPlus, ShieldPlus, MoreHorizontal, Settings, CheckCircle2, XCircle, Clock, ChevronRight, Lock, Unlock } from 'lucide-react'

export default function AdminActions({ userId, subscription, userRole }: any) {
    const [loading, setLoading] = useState(false)
    const [showPermissions, setShowPermissions] = useState(false)
    const router = useRouter()

    const currentStatus = subscription?.status

    const handleAction = async (action: (...args: any[]) => any, ...args: any[]) => {
        setLoading(true)
        try {
            await action(userId, ...args)
            router.refresh()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-end gap-3 relative">
            <div className="flex gap-2 items-center p-2 bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm">
                {currentStatus !== 'ACTIVE' && (
                    <button 
                      onClick={() => handleAction(activateSubscription)} 
                      disabled={loading} 
                      className="w-10 h-10 rounded-xl bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm border border-emerald-100"
                      title="Ativar Assinatura"
                    >
                        <CheckCircle2 size={18} />
                    </button>
                )}

                <button 
                  onClick={() => handleAction(extendTrial, 30)} 
                  disabled={loading} 
                  className="w-10 h-10 rounded-xl bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm border border-indigo-100"
                  title="+30 Dias Trial"
                >
                    <CalendarPlus size={18} />
                </button>

                <button 
                  onClick={() => handleAction(setUserRole, userRole === 'ADMIN' ? 'USER' : 'ADMIN')} 
                  disabled={loading} 
                  className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm border ${userRole === 'ADMIN' ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' : 'bg-white text-slate-400 border-slate-200 hover:bg-indigo-600 hover:text-white'}`}
                  title={userRole === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
                >
                    <ShieldPlus size={18} />
                </button>

                <button
                    onClick={() => setShowPermissions(!showPermissions)}
                    className={`w-10 h-10 rounded-xl transition-all duration-500 flex items-center justify-center shadow-sm border ${showPermissions ? 'bg-indigo-600 text-white scale-110 border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-600 hover:text-white'}`}
                    title="Liberar Recursos"
                >
                    <Settings size={18} className={showPermissions ? 'animate-spin-slow' : ''} />
                </button>

                {currentStatus !== 'EXPIRED' && currentStatus !== 'CANCELED' && (
                    <button 
                      onClick={() => handleAction(expireSubscription)} 
                      disabled={loading} 
                      className="w-10 h-10 rounded-xl bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm border border-red-100"
                      title="Expirar"
                    >
                        <XCircle size={18} />
                    </button>
                )}
            </div>

            {showPermissions && (
                <div className="absolute top-14 right-0 z-50 w-80 bg-white/95 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Power-Ups</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recursos Exclusivos</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <PermissionToggle
                            icon={<MoreHorizontal size={14} />}
                            label="Agend. Ilimitados"
                            active={subscription?.maxAppointmentsOverride === 999999}
                            onChange={(v: boolean) => handleAction(updateSubscriptionOverrides, { maxAppointmentsOverride: v ? 999999 : null })}
                            disabled={loading}
                        />
                        <PermissionToggle
                            icon={<Zap size={14} />}
                            label="Múltiplos Serviços"
                            active={subscription?.multipleEventTypesOverride === true}
                            onChange={(v: boolean) => handleAction(updateSubscriptionOverrides, { multipleEventTypesOverride: v ? true : null })}
                            disabled={loading}
                        />
                        <PermissionToggle
                            icon={<CheckCircle2 size={14} />}
                            label="Custom Branding"
                            active={subscription?.customBrandingOverride === true}
                            onChange={(v: boolean) => handleAction(updateSubscriptionOverrides, { customBrandingOverride: v ? true : null })}
                            disabled={loading}
                        />
                        <PermissionToggle
                            icon={<Clock size={14} />}
                            label="Buffer Extra"
                            active={subscription?.bufferTimeOverride === true}
                            onChange={(v: boolean) => handleAction(updateSubscriptionOverrides, { bufferTimeOverride: v ? true : null })}
                            disabled={loading}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        <span>Acesso via Override</span>
                        <Lock size={12} />
                    </div>
                </div>
            )}
        </div>
    )
}

function PermissionToggle({ label, active, onChange, disabled, icon }: any) {
    return (
        <label className={`
          flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer
          ${active ? 'bg-primary/5 border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-transparent' : 'bg-white border-slate-100 hover:border-slate-200'}
          ${disabled ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02]'}
        `}>
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-primary text-white shadow-xl shadow-primary/30 rotate-3' : 'bg-slate-50 text-slate-300'}`}>
                    {icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-tight truncate ${active ? 'text-primary' : 'text-slate-400'}`}>
                    {label}
                </span>
            </div>
            <input
                type="checkbox"
                className="hidden"
                checked={active}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className={`w-10 h-6 rounded-full relative transition-all duration-500 ${active ? 'bg-primary shadow-inner shadow-black/20' : 'bg-slate-100 border border-slate-200'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 shadow-sm ${active ? 'left-5 bg-white' : 'left-1 bg-white'}`}></div>
            </div>
        </label>
    )
}
