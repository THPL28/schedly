import { verifySession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'
import { getClinicalPatient } from '@/services/clinicalService'

export default async function NewClinicalEncounterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') redirect('/login')
  const { id } = await params
  const data = await getClinicalPatient(session.userId, id)
  if (!data) notFound()

  const { patient, appointments } = data
  if (patient.vertical !== 'MEDICAL') redirect(`/clients/${id}`)

  const recentAppointments = appointments.filter((appointment) => appointment.status === 'SCHEDULED' || appointment.attended).slice(0, 10)

  return (
    <div className="page-shell max-w-5xl">
      <Link href={`/clients/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={14} /> Voltar para o paciente</Link>
      <header className="page-header">
        <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FileText size={20} /></div><div><h1 className="page-title">Registrar atendimento</h1><p className="page-description">Paciente: {patient.name}. Registre apenas as informações necessárias para o atendimento.</p></div></div>
      </header>

      <form action="/api/clinical/encounters" method="post" className="space-y-4">
        <input type="hidden" name="clientId" value={id} />
        <section className="section-card p-5 sm:p-6">
          <div className="form-grid">
            <label className="form-field"><span>Data e hora</span><input name="occurredAt" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} /></label>
            <label className="form-field"><span>Agendamento relacionado</span><select name="appointmentId" defaultValue=""><option value="">Sem vínculo</option>{recentAppointments.map((a) => <option key={a.id} value={a.id}>{new Date(a.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {a.startTime} · {a.eventTypeName || 'Consulta'}</option>)}</select></label>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="mb-5"><h2 className="text-sm font-bold text-slate-900">Registro clínico</h2><p className="mt-1 text-xs text-slate-500">Campos organizados para facilitar a evolução sem transformar o agendamento em prontuário.</p></div>
          <div className="space-y-4">
            <label className="form-field"><span>Queixa principal</span><textarea name="chiefComplaint" rows={3} placeholder="Motivo principal da consulta" /></label>
            <label className="form-field"><span>Anamnese</span><textarea name="anamnesis" rows={6} placeholder="História, sintomas, evolução e informações relevantes" /></label>
            <label className="form-field"><span>Exame físico</span><textarea name="physicalExam" rows={5} placeholder="Achados do exame físico, quando aplicável" /></label>
            <label className="form-field"><span>Avaliação</span><textarea name="assessment" rows={5} placeholder="Avaliação clínica registrada pelo profissional" /></label>
            <label className="form-field"><span>Conduta</span><textarea name="conduct" rows={5} placeholder="Conduta e orientações definidas no atendimento" /></label>
            <label className="form-field"><span>Observações</span><textarea name="notes" rows={4} placeholder="Outras observações relevantes" /></label>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><div><strong>Dados sensíveis.</strong> Esta primeira versão registra histórico clínico básico. Antes de uso comercial como prontuário eletrônico, valide requisitos regulatórios, segurança, retenção, auditoria, assinatura e certificação aplicáveis.</div></div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={`/clients/${id}`} className="ui-btn ui-btn-secondary justify-center">Cancelar</Link><button type="submit" className="ui-btn ui-btn-primary justify-center">Salvar atendimento</button></div>
      </form>
    </div>
  )
}
