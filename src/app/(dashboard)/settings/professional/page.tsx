import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Stethoscope, UserRound } from 'lucide-react'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const verticals = [
  ['GENERAL', 'Outro', 'Agenda e gestão de clientes'],
  ['MEDICAL', 'Médico', 'Pacientes e histórico clínico'],
  ['PSYCHOLOGY', 'Psicólogo', 'Clientes e evolução de sessões'],
  ['DENTISTRY', 'Dentista', 'Pacientes e procedimentos'],
  ['NUTRITION', 'Nutricionista', 'Pacientes e acompanhamento'],
  ['PHYSIOTHERAPY', 'Fisioterapeuta', 'Pacientes e sessões'],
  ['THERAPY', 'Terapeuta', 'Clientes e sessões'],
  ['CONSULTING', 'Consultor', 'Clientes e serviços'],
] as const

export default async function ProfessionalSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') redirect('/login')
  const params = await searchParams
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { medicalProfile: true } })
  if (!user) redirect('/login')

  return (
    <div className="page-shell max-w-5xl">
      <header className="page-header">
        <div>
          <h1 className="page-title">Perfil profissional</h1>
          <p className="page-description">Escolha sua área para adaptar o Schedly ao seu fluxo de atendimento.</p>
        </div>
      </header>

      {params.saved === '1' && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={17} /> Perfil profissional atualizado.
        </div>
      )}

      <form action="/api/medical/profile" method="post" className="space-y-5">
        <section className="section-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><UserRound size={18} /></div>
            <div><h2 className="text-sm font-bold text-slate-900">Sua profissão</h2><p className="text-xs text-slate-500">O módulo médico fica disponível quando Médico é selecionado.</p></div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {verticals.map(([value, label, description]) => (
              <label key={value} className="cursor-pointer">
                <input className="peer sr-only" type="radio" name="vertical" value={value} defaultChecked={user.vertical === value} />
                <span className="block rounded-xl border border-slate-200 p-4 transition peer-checked:border-indigo-500 peer-checked:bg-indigo-50/50 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/30 hover:border-slate-300">
                  <span className="block text-sm font-bold text-slate-900">{label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Stethoscope size={18} /></div><div><h2 className="text-sm font-bold text-slate-900">Dados médicos</h2><p className="text-xs text-slate-500">Preencha somente se você atua como médico.</p></div></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="form-field"><span>Especialidade</span><input name="specialty" defaultValue={user.medicalProfile?.specialty || ''} placeholder="Ex.: Clínica médica" /></label>
            <label className="form-field"><span>CRM</span><input name="crm" defaultValue={user.medicalProfile?.crm || ''} placeholder="Número do CRM" /></label>
            <label className="form-field"><span>UF do CRM</span><input name="crmState" maxLength={2} defaultValue={user.medicalProfile?.crmState || ''} placeholder="SP" /></label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href="/settings" className="ui-btn ui-btn-secondary justify-center">Voltar</Link>
          <button className="ui-btn ui-btn-primary justify-center" type="submit">Salvar perfil profissional</button>
        </div>
      </form>
    </div>
  )
}
