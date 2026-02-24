'use client';

import { useState } from 'react';
import { createEventType, updateEventType, deleteEventType } from '@/lib/actions';
import { Plus, Clock, Tag, MoreVertical, Copy, SquareArrowOutUpRight, AlertCircle, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';

export default function EventTypesClient({ initialEventTypes, userSlug }: { initialEventTypes: any[], userSlug: string }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingType, setEditingType] = useState<any | null>(null);
    const [isCustomDuration, setIsCustomDuration] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState<string | null>(null);

    const handleCopy = (path: string) => {
        const url = `${window.location.protocol}//${window.location.host}${path}`;
        navigator.clipboard.writeText(url);
        setCopySuccess(path);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return;
        const res = await deleteEventType(id);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black mb-2 text-slate-900">Serviços</h1>
                    <p className="text-muted font-medium">Crie e gerencie seus tipos de atendimento e links de agendamento.</p>
                </div>
                {!isCreating && !editingType && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn btn-primary flex items-center gap-2 h-12 px-6 shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Novo Serviço
                    </button>
                )}
            </div>

            {(isCreating || editingType) && (
                <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
                    <div className="card p-8 border-primary/20 bg-primary/[0.02]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingType ? 'Editar Serviço' : 'Configurar Novo Serviço'}
                                </h2>
                                <p className="text-muted text-sm font-medium">Defina os detalhes do atendimento que você oferece.</p>
                            </div>
                            <button
                                onClick={() => { setIsCreating(false); setEditingType(null); }}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form action={async (formData) => {
                            const res = editingType
                                ? await updateEventType(formData)
                                : await createEventType(formData);
                            if (res.success) {
                                setIsCreating(false);
                                setEditingType(null);
                                window.location.reload();
                            } else {
                                alert(res.error);
                            }
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {editingType && <input type="hidden" name="id" value={editingType.id} />}

                            <div className="col-span-full">
                                <label className="label">Nome do Serviço</label>
                                <input
                                    name="name"
                                    className="input text-lg py-6"
                                    placeholder="Ex: Consultoria de Negócios"
                                    defaultValue={editingType?.name || ''}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Duração</label>
                                <div className="flex gap-2">
                                    {!isCustomDuration ? (
                                        <select
                                            name="duration"
                                            className="input"
                                            defaultValue={editingType?.duration || '60'}
                                            onChange={(e) => { if (e.target.value === 'custom') setIsCustomDuration(true) }}
                                        >
                                            <option value="15">15 min</option>
                                            <option value="30">30 min</option>
                                            <option value="60">60 min</option>
                                            <option value="90">90 min</option>
                                            <option value="120">120 min</option>
                                            <option value="custom">Customizado...</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2 w-full">
                                            <input
                                                name="duration"
                                                type="number"
                                                className="input"
                                                placeholder="Minutos"
                                                defaultValue={editingType?.duration || ''}
                                                autoFocus
                                            />
                                            <button type="button" onClick={() => setIsCustomDuration(false)} className="text-xs font-bold text-primary">Voltar</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="label">Intervalo de Buffer (min)</label>
                                <input
                                    name="bufferTime"
                                    type="number"
                                    className="input"
                                    defaultValue={editingType?.bufferTime ?? "15"}
                                    placeholder="Tempo entre agendamentos"
                                />
                            </div>

                            <div>
                                <label className="label">Preço Opcional (R$)</label>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    className="input"
                                    placeholder="0,00"
                                    defaultValue={editingType?.price ? Number(editingType.price).toString() : ''}
                                />
                            </div>

                            <div>
                                <label className="label">Cor de Identificação</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        name="color"
                                        type="color"
                                        className="w-12 h-12 rounded-xl p-1 border border-border cursor-pointer"
                                        defaultValue={editingType?.color || "#6366f1"}
                                    />
                                    <span className="text-xs text-muted font-bold">Cor visual na agenda</span>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label className="label">Descrição do Atendimento</label>
                                <textarea
                                    name="description"
                                    className="input min-h-[100px]"
                                    placeholder="O que está incluso neste serviço?"
                                    defaultValue={editingType?.description || ''}
                                ></textarea>
                            </div>

                            <div className="col-span-full pt-4 border-t border-slate-100 flex gap-4">
                                <button type="submit" className="btn btn-primary h-14 text-lg flex-1 shadow-xl shadow-primary/20">
                                    {editingType ? 'Salvar Alterações' : 'Criar e Ativar Serviço'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsCreating(false); setEditingType(null); }}
                                    className="btn btn-outline h-14 px-8"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialEventTypes.length === 0 && !isCreating ? (
                    <div className="col-span-full py-32 text-center bg-muted-light/30 border-2 border-dashed border-border rounded-[2.5rem]">
                        <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-border">
                            <Plus className="text-primary" size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Sua prateleira está vazia</h3>
                        <p className="text-muted mb-8 max-w-sm mx-auto font-medium">Crie seu primeiro tipo de serviço para começar a receber agendamentos online.</p>
                        <button onClick={() => setIsCreating(true)} className="btn btn-primary px-8">Novo Serviço</button>
                    </div>
                ) : (
                    initialEventTypes.map((type) => {
                        const publicPath = `/book/${userSlug}/${type.slug}`;
                        const isCopied = copySuccess === publicPath;

                        return (
                            <div
                                key={type.id}
                                className="card group relative flex flex-col hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99]"
                            >
                                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: type.color }}></div>

                                <div className="flex justify-between items-start mb-6 pt-2">
                                    <h3 className="text-xl font-bold m-0 text-slate-900 group-hover:text-primary transition-colors pr-8">{type.name}</h3>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowOptions(showOptions === type.id ? null : type.id)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {showOptions === type.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={() => { setEditingType(type); setShowOptions(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <Pencil size={16} className="text-primary" /> Editar Serviço
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(publicPath)}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <Copy size={16} className="text-blue-500" /> Copiar Link
                                                </button>
                                                <button
                                                    onClick={() => window.open(publicPath, '_blank')}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                >
                                                    <SquareArrowOutUpRight size={16} className="text-slate-400" /> Ver Página
                                                </button>
                                                <div className="h-px bg-slate-50 my-2" />
                                                <button
                                                    onClick={() => { handleDelete(type.id); setShowOptions(null); }}
                                                    className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-8">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-black text-slate-600">
                                        <Clock size={14} className="text-primary" />
                                        {type.duration} MIN
                                    </div>
                                    {type.price && (
                                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 text-xs font-black text-green-700">
                                            <Tag size={14} />
                                            R$ {Number(type.price).toFixed(2)}
                                        </div>
                                    )}
                                    {type.bufferTime > 0 && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400">
                                            + {type.bufferTime}M INTERVALO
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="text-[10px] font-black text-slate-300 uppercase truncate pr-4">
                                        {type.slug}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(publicPath)}
                                        className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl transition-all border ${isCopied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40'}`}
                                    >
                                        {isCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                        {isCopied ? 'Copiado!' : 'Copiar Link'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-16 bg-muted-light/30 border border-border rounded-3xl p-6 flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <AlertCircle className="text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-1">Dica de Profissional</h4>
                    <p className="text-sm text-muted m-0 font-medium">Cada serviço gera um link único que você pode enviar direto aos seus clientes, economizando tempo de negociação de horários.</p>
                </div>
            </div>
        </div>
    );
}
