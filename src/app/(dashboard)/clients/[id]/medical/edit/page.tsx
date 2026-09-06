import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, HeartPulse, Save } from 'lucide-react'
import { verifySession } from '@/lib/auth'
import { getClinicalPatient } from '@/services/clinicalService'

export default async function EditMedicalPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session || typeof session.userId !== 'string') redirect('/login')
  const { id } = await params
  const data = await getClinicalPatient(session.userId, id)
  if (!data || data.patient.vertical !== 'MEDICAL') notFound()
  const { patient } = data

  const birthDate = patient.birthDate ? new Date(patient.birthDate).toISOString().slice(0, 10) : ''

  return (
    <div className="page-shell max-w-4xl">
      <Link href={`/clients/${id}`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={14} /> Voltar para o paciente</Link>
      <header className="page-header">
        <div><h1 className="page-title">Dados clínicos</h1><p className="page-description">Atualize as informações básicas de {patient.name}.</p></div>
      </header>

      <form action="/api/clinical/patient" method="post" className="space-y-4">
        <input type="hidden" name="clientId" value={id} />
        <section className="section-card p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900"><HeartPulse size={17} className="text-rose-600" /> Identificação clínica</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="form-field"><span>Nome</span><input value={patient.name} disabled /></label>
            <label className="form-field"><span>Data de nascimento</span><input type="date" name="birthDate" defaultValue={birthDate} /></label>
            <label className="form-field"><span>Sexo</span><select name="sex" defaultValue={patient.sex || ''}><option value="">Não informado</option><option value="FEMININO">Feminino</option><option value="MASCULINO">Masculino</option><option value="INTERSEXO">Intersexo</option><option value="NAO_INFORMADO">Prefiro não informar</option></select></label>
            <label className="form-field"><span>CPF</span><input name="cpf" defaultValue={patient.cpf || ''} inputMode="numeric" placeholder="Somente se necessário" /></label>
            <label className="form-field md:col-span-2"><span>Contato de emergência</span><input name="emergencyContact" defaultValue={patient.emergencyContact || ''} placeholder="Nome e telefone" /></label>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-bold text-slate-900">Informações clínicas</h2>
          <div className="space-y-4">
            <label className="form-field"><span>Alergias</span><textarea name="allergies" rows={3} defaultValue={patient.allergies || ''} placeholder="Alergias conhecidas e reações relevantes" /></label>
            <label className="form-field"><span>Medicamentos atuais</span><textarea name="currentMedications" rows={4} defaultValue={patient.currentMedications || ''} placeholder="Medicamentos em uso informados pelo paciente" /></label>
            <label className="form-field"><span>Condições relevantes</span><textarea name="relevantConditions" rows={4} defaultValue={patient.relevantConditions || ''} placeholder="Condições e antecedentes relevantes" /></label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link href={`/clients/${id}`} className="ui-btn ui-btn-secondary justify-center">Cancelar</Link><button type="submit" className="ui-btn ui-btn-primary justify-center"><Save size={16} /> Salvar dados clínicos</button></div>
      </form>
    </div>
  )
}
