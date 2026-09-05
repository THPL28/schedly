import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Stethoscope, ShieldCheck } from 'lucide-react'

export default async function MedicalSettingsPage() {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') redirect('/login')
  const rows = await prisma.$queryRaw<any[]>`SELECT id, name, vertical FROM "User" WHERE id = ${session.userId} LIMIT 1`
  const user = rows[0]
  if (!user) redirect('/login')
  const active = user.vertical === 'MEDICAL'

  return (
    <div className="page-shell max-w-3xl">
      <header className="page-header"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Stethoscope size={20} /></div><div><h1 className="page-title">Modo Médico</h1><p className="page-description">Adapte o Schedly à rotina de consultórios médicos.</p></div></div></header>
      <section className="section-card overflow-hidden">
        <div className="border-b border-slate-100 p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Área profissional</p><h2 className="mt-1 text-lg font-bold text-slate-900">{active ? 'Medicina ativada' : 'Ativar experiência médica'}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{active ? 'Seu espaço pode usar pacientes e histórico clínico.' : 'A ativação prepara o espaço para pacientes, registros de atendimento e histórico clínico.'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{active ? 'Ativo' : 'Geral'}</span></div></div>
        <div className="p-5 sm:p-6"><div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">Pacientes</p><p className="mt-1 text-xs leading-5 text-slate-500">Perfil básico e informações clínicas.</p></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">Histórico</p><p className="mt-1 text-xs leading-5 text-slate-500">Linha do tempo dos atendimentos.</p></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">Agenda integrada</p><p className="mt-1 text-xs leading-5 text-slate-500">Atendimento vinculado ao agendamento.</p></div></div><form action="/api/settings/vertical" method="post"><input type="hidden" name="vertical" value={active ? 'GENERAL' : 'MEDICAL'} /><button className="ui-btn ui-btn-primary">{active ? 'Voltar para modo geral' : 'Ativar modo Médico'}</button></form></div>
      </section>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><p>Esta versão é uma base de histórico clínico. Antes de uso comercial como prontuário eletrônico, valide requisitos regulatórios, segurança, retenção, auditoria, assinatura e certificação aplicáveis.</p></div>
    </div>
  )
}
