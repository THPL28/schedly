import { verifySession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, ChevronRight, FileText, HeartPulse, Phone, Mail, Plus, ShieldCheck, UserRound } from 'lucide-react'
import { getClinicalPatient } from '@/services/clinicalService'

function formatDate(value: Date | string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(new Date(value))
}

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value))
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') redirect('/login')
  const { id } = await params
  const data = await getClinicalPatient(session.userId, id)
  if (!data) notFound()

  const { patient, appointments, encounters } = data
  const isMedical = patient.vertical === 'MEDICAL'

  return (
    <div className="page-shell">
      <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/clients" className="hover:text-indigo-600">Clientes</Link>
        <ChevronRight size={13} />
        <span className="text-slate-700">{patient.name}</span>
      </div>

      <header className="page-header">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><UserRound size={20} /></div>
          <div>
            <h1 className="page-title">{isMedical ? 'Paciente' : 'Cliente'}: {patient.name}</h1>
            <p className="page-description">{isMedical ? 'Dados do paciente e histórico de atendimentos.' : 'Dados e histórico de agendamentos.'}</p>
          </div>
        </div>
        <div className="page-actions">
          {isMedical && <Link href={`/clients/${id}/encounters/new`} className="ui-btn ui-btn-primary"><Plus size={17} /> Registrar atendimento</Link>}
          <Link href="/appointment" className="ui-btn ui-btn-secondary">Novo agendamento</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="section-card p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><UserRound size={16} className="text-indigo-600" /> Dados básicos</div>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-slate-400">E-mail</dt><dd className="mt-0.5 flex items-center gap-2 text-slate-700"><Mail size={13} />{patient.email}</dd></div>
              <div><dt className="text-xs text-slate-400">Telefone</dt><dd className="mt-0.5 flex items-center gap-2 text-slate-700"><Phone size={13} />{patient.phone || '—'}</dd></div>
              {isMedical && <>
                <div><dt className="text-xs text-slate-400">Nascimento</dt><dd className="mt-0.5 text-slate-700">{formatDate(patient.birthDate)}</dd></div>
                <div><dt className="text-xs text-slate-400">Sexo</dt><dd className="mt-0.5 text-slate-700">{patient.sex || '—'}</dd></div>
              </>}
            </dl>
          </section>

          {isMedical && <section className="section-card p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"><HeartPulse size={16} className="text-rose-600" /> Informações clínicas</div>
            <div className="space-y-4 text-sm">
              <div><p className="text-xs text-slate-400">Alergias</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{patient.allergies || 'Não informado'}</p></div>
              <div><p className="text-xs text-slate-400">Medicamentos atuais</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{patient.currentMedications || 'Não informado'}</p></div>
              <div><p className="text-xs text-slate-400">Condições relevantes</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{patient.relevantConditions || 'Não informado'}</p></div>
            </div>
          </section>}

          {isMedical && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> Dados clínicos exigem controle de acesso, rastreabilidade e proteção adequada antes de uso em produção.</div>}
        </aside>

        <main className="space-y-4">
          {isMedical && <section className="section-card overflow-hidden">
            <div className="section-card-header"><div><h2 className="text-sm font-bold text-slate-900">Histórico clínico</h2><p className="mt-0.5 text-xs text-slate-500">Registros de atendimentos em ordem cronológica.</p></div><Link href={`/clients/${id}/encounters/new`} className="ui-btn ui-btn-secondary h-9 text-xs"><FileText size={15} /> Novo registro</Link></div>
            {encounters.length === 0 ? <div className="p-10 text-center"><FileText className="mx-auto mb-3 text-slate-300" size={32} /><p className="text-sm font-semibold text-slate-800">Nenhum atendimento registrado</p><p className="mt-1 text-xs text-slate-500">Após uma consulta, registre o atendimento para construir a linha do tempo clínica.</p></div> : <div className="divide-y divide-slate-100">{encounters.map((encounter) => <article key={encounter.id} className="p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><CalendarDays size={14} className="text-indigo-600" />{formatDateTime(encounter.occurredAt)}</div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">Registro clínico</span></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{[['Queixa principal', encounter.chiefComplaint], ['Anamnese', encounter.anamnesis], ['Exame físico', encounter.physicalExam], ['Avaliação', encounter.assessment], ['Conduta', encounter.conduct], ['Observações', encounter.notes]].map(([label, value]) => value ? <div key={label as string}><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label as string}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value as string}</p></div> : null)}</div></article>)}</div>}
          </section>}

          <section className="section-card overflow-hidden">
            <div className="section-card-header"><div><h2 className="text-sm font-bold text-slate-900">Agendamentos</h2><p className="mt-0.5 text-xs text-slate-500">Histórico da relação com o profissional.</p></div></div>
            {appointments.length === 0 ? <div className="p-10 text-center"><CalendarDays className="mx-auto mb-3 text-slate-300" size={32} /><p className="text-sm font-semibold text-slate-800">Nenhum agendamento encontrado</p></div> : <div className="table-wrap border-0 rounded-none"><table><thead><tr><th>Data</th><th>Serviço</th><th>Status</th><th>Atendido</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td className="whitespace-nowrap text-sm">{formatDate(appointment.date)} · {appointment.startTime}</td><td>{appointment.eventTypeName || '—'}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{appointment.status}</span></td><td>{appointment.attended ? 'Sim' : 'Não'}</td></tr>)}</tbody></table></div>}
          </section>
        </main>
      </div>
    </div>
  )
}
