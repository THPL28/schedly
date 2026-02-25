import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Download, FileText, BarChart, TrendingUp, Filter } from 'lucide-react';

export default async function ReportsPage() {
    const session = await verifySession();
    if (!session) redirect('/login');

    const reportTypes = [
        { title: 'Relatório Financeiro', desc: 'Resumo de receitas por serviço e período.', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'Performance de Agenda', desc: 'Taxas de ocupação e novos clientes.', icon: BarChart, color: 'text-primary', bg: 'bg-indigo-50' },
        { title: 'Histórico de Cancelamentos', desc: 'Analise os motivos e frequência.', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-black">Relatórios & Exportações</h1>
                <p className="text-muted text-sm font-medium">Extraia dados da sua conta para análise em ferramentas externas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {reportTypes.map((report, i) => (
                    <div key={i} className="card hover:border-primary/50 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl ${report.bg} ${report.color} flex items-center justify-center mb-6`}>
                            <report.icon size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{report.title}</h3>
                        <p className="text-sm text-muted font-medium mb-6">{report.desc}</p>
                        <div className="flex gap-2">
                            <a
                                href="/api/provider/reports?format=xlsx"
                                className="btn btn-outline flex-1 text-xs py-2 h-auto"
                                download
                            >
                                <Download size={14} /> EXCEL
                            </a>
                            <a
                                href="/api/provider/reports?format=csv"
                                className="btn btn-outline flex-1 text-xs py-2 h-auto"
                                download
                            >
                                <Download size={14} /> CSV
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card p-8 bg-slate-900 border-none relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-2">Exportação Personalizada</h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-md">Selecione filtros específicos para gerar um arquivo formatado de acordo com suas necessidades.</p>

                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Período</label>
                            <input type="date" className="input bg-slate-800 border-slate-700 text-white" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Até</label>
                            <input type="date" className="input bg-slate-800 border-slate-700 text-white" />
                        </div>
                        <button className="btn btn-primary h-11 px-8">Gerar Relatório</button>
                    </div>
                </div>

                {/* Abstract background element */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
            </div>
        </div>
    );
}
