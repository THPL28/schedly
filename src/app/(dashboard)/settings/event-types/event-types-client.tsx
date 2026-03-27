'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEventType, updateEventType, deleteEventType } from '@/lib/actions';
import FeedbackBanner from '@/components/feedback-banner';
import {
    Plus,
    Clock,
    Tag,
    MoreVertical,
    Copy,
    SquareArrowOutUpRight,
    AlertCircle,
    CheckCircle2,
    Pencil,
    Trash2,
    X,
    Video,
    MapPin,
    Megaphone
} from 'lucide-react';

type FeedbackState = {
    variant: 'success' | 'error' | 'info';
    title: string;
    message: string;
} | null;

const PRESET_DURATIONS = ['15', '30', '60', '90', '120'];

export default function EventTypesClient({
    initialEventTypes,
    userSlug,
    googleCalendarEnabled
}: {
    initialEventTypes: any[];
    userSlug: string;
    googleCalendarEnabled: boolean;
}) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [editingType, setEditingType] = useState<any | null>(null);
    const [isCustomDuration, setIsCustomDuration] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

    const showFeedback = (
        variant: NonNullable<FeedbackState>['variant'],
        title: string,
        message: string
    ) => {
        setFeedback({ variant, title, message });
    };

    const closeEditor = () => {
        setIsCreating(false);
        setEditingType(null);
        setIsCustomDuration(false);
    };

    const openCreate = () => {
        setFeedback(null);
        setPendingDeleteId(null);
        setShowOptions(null);
        setEditingType(null);
        setIsCustomDuration(false);
        setIsCreating(true);
    };

    const openEdit = (eventType: any) => {
        setFeedback(null);
        setPendingDeleteId(null);
        setShowOptions(null);
        setIsCreating(false);
        setEditingType(eventType);
        setIsCustomDuration(!PRESET_DURATIONS.includes(String(eventType?.duration ?? '60')));
    };

    const handleCopy = (path: string) => {
        const url = `${window.location.protocol}//${window.location.host}${path}`;
        navigator.clipboard.writeText(url);
        setCopySuccess(path);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (pendingDeleteId !== id) {
            setPendingDeleteId(id);
            showFeedback(
                'info',
                'Confirme a exclusao',
                'Clique novamente em Excluir para remover este servico de forma permanente.'
            );
            return;
        }

        setIsDeletingId(id);
        setFeedback(null);

        const res = await deleteEventType(id);

        setIsDeletingId(null);
        if (res.success) {
            setPendingDeleteId(null);
            setShowOptions(null);
            showFeedback('success', 'Serviço excluído', 'O serviço foi removido com sucesso.');
            router.refresh();
            return;
        }

        showFeedback(
            'error',
            'Não foi possível excluir',
            res.error || 'Tivemos um problema ao excluir este serviço.'
        );
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSaving(true);
        setFeedback(null);

        const wasEditing = Boolean(editingType);
        const res = wasEditing
            ? await updateEventType(formData)
            : await createEventType(formData);

        setIsSaving(false);
        if (res.success) {
            closeEditor();
            showFeedback(
                'success',
                wasEditing ? 'Serviço atualizado' : 'Serviço criado',
                wasEditing
                    ? 'As alterações foram salvas e o serviço já está pronto para novos agendamentos.'
                    : 'Seu novo serviço foi criado com sucesso e já pode ser compartilhado.'
            );
            router.refresh();
            return;
        }

        showFeedback(
            'error',
            'Não foi possível salvar',
            res.error || 'Tivemos um problema ao salvar este serviço.'
        );
    };

    return (
        <div className="min-h-screen max-w-7xl mx-auto p-4 sm:p-8">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="mb-2 text-4xl font-black text-slate-900">Serviços</h1>
                    <p className="font-medium text-muted">
                        Crie e gerencie seus tipos de atendimento e links de agendamento.
                    </p>
                </div>
                {!isCreating && !editingType && (
                    <button
                        onClick={openCreate}
                        className="btn btn-primary flex h-12 items-center gap-2 px-6 shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Novo serviço
                    </button>
                )}
            </div>

            {feedback && (
                <FeedbackBanner
                    variant={feedback.variant}
                    title={feedback.title}
                    message={feedback.message}
                    className="mb-8 animate-in fade-in slide-in-from-top-2"
                />
            )}

            {(isCreating || editingType) && (
                <div className="mb-12 animate-in slide-in-from-top-4 duration-300">
                    <div className="card border-primary/20 bg-primary/[0.02] p-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingType ? 'Editar serviço' : 'Configurar novo serviço'}
                                </h2>
                                <p className="text-sm font-medium text-muted">
                                    Defina os detalhes do atendimento que você oferece.
                                </p>
                            </div>
                            <button
                                onClick={closeEditor}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {editingType && <input type="hidden" name="id" value={editingType.id} />}

                            <div className="col-span-full">
                                <label className="label">Nome do serviço</label>
                                <input
                                    name="name"
                                    className="input py-6 text-lg"
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
                                            defaultValue={
                                                PRESET_DURATIONS.includes(String(editingType?.duration ?? '60'))
                                                    ? String(editingType?.duration ?? '60')
                                                    : 'custom'
                                            }
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') setIsCustomDuration(true);
                                            }}
                                        >
                                            <option value="15">15 min</option>
                                            <option value="30">30 min</option>
                                            <option value="60">60 min</option>
                                            <option value="90">90 min</option>
                                            <option value="120">120 min</option>
                                            <option value="custom">Customizado...</option>
                                        </select>
                                    ) : (
                                        <div className="flex w-full items-center gap-2">
                                            <input
                                                name="duration"
                                                type="number"
                                                className="input"
                                                placeholder="Minutos"
                                                defaultValue={editingType?.duration || ''}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomDuration(false)}
                                                className="text-xs font-bold text-primary"
                                            >
                                                Voltar
                                            </button>
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
                                    defaultValue={editingType?.bufferTime ?? '15'}
                                    placeholder="Tempo entre agendamentos"
                                />
                            </div>

                            <div>
                                <label className="label">Preço opcional (R$)</label>
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
                                <label className="label">Cor de identificação</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        name="color"
                                        type="color"
                                        className="h-12 w-12 cursor-pointer rounded-xl border border-border p-1"
                                        defaultValue={editingType?.color || '#6366f1'}
                                    />
                                    <span className="text-xs font-bold text-muted">Cor visual na agenda</span>
                                </div>
                            </div>

                            <div className="col-span-full grid grid-cols-1 gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
                                <div>
                                <label className="label">Local do atendimento</label>
                                    <select
                                        name="locationType"
                                        className="input h-12"
                                        defaultValue={editingType?.locationType || 'IN_PERSON'}
                                        onChange={(e) => {
                                            if (e.target.value === 'GOOGLE_MEET' && !googleCalendarEnabled) {
                                                showFeedback(
                                                    'info',
                                                    'Conecte sua agenda Google',
                                                    'Ative a integração com o Google nas configurações antes de usar o Google Meet.'
                                                );
                                                e.target.value = 'IN_PERSON';
                                            }
                                        }}
                                    >
                                        <option value="IN_PERSON">Atendimento Presencial</option>
                                        <option value="GOOGLE_MEET" disabled={!googleCalendarEnabled}>
                                            Google Meet (Automático)
                                        </option>
                                    </select>
                                    {!googleCalendarEnabled && (
                                        <p className="mt-2 text-[10px] font-bold text-amber-600">
                                            Conecte o Google Agenda para usar reuniões online.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Endereco / Link de Acesso</label>
                                    <input
                                        name="locationAddress"
                                        className="input h-12"
                                        placeholder="Ex: Av. Paulista, 1000 ou Link do Zoom"
                                        defaultValue={editingType?.locationAddress || ''}
                                    />
                                    <p className="mt-2 text-[10px] text-muted">
                                        Para Google Meet, o link será gerado automaticamente.
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label className="label">Descrição do atendimento</label>
                                <textarea
                                    name="description"
                                    className="input min-h-[100px]"
                                    placeholder="O que está incluso neste serviço?"
                                    defaultValue={editingType?.description || ''}
                                ></textarea>
                            </div>

                            <div className="col-span-full flex gap-4 border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn btn-primary h-14 flex-1 text-lg shadow-xl shadow-primary/20"
                                >
                                    {isSaving
                                        ? 'Salvando...'
                                        : editingType
                                            ? 'Salvar alterações'
                                            : 'Criar e ativar serviço'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditor}
                                    className="btn btn-outline h-14 px-8"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {initialEventTypes.length === 0 && !isCreating ? (
                    <div className="col-span-full rounded-[2.5rem] border-2 border-dashed border-border bg-muted-light/30 py-32 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-white shadow-sm">
                            <Plus className="text-primary" size={32} />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-800">Sua prateleira está vazia</h3>
                        <p className="mx-auto mb-8 max-w-sm font-medium text-muted">
                            Crie seu primeiro tipo de serviço para começar a receber agendamentos online.
                        </p>
                        <button onClick={openCreate} className="btn btn-primary px-8">
                            Novo serviço
                        </button>
                    </div>
                ) : (
                    initialEventTypes.map((type) => {
                        const publicPath = `/book/${userSlug}/${type.slug}`;
                        const isCopied = copySuccess === publicPath;

                        return (
                            <div
                                key={type.id}
                                className="card group relative flex flex-col transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99]"
                            >
                                <div
                                    className="absolute left-0 top-0 h-1.5 w-full"
                                    style={{ backgroundColor: type.color }}
                                ></div>

                                <div className="mb-6 flex items-start justify-between pt-2">
                                    <h3 className="m-0 pr-8 text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
                                        {type.name}
                                    </h3>

                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setPendingDeleteId(null);
                                                setShowOptions(showOptions === type.id ? null : type.id);
                                            }}
                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100"
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {showOptions === type.id && (
                                            <div className="absolute right-0 z-10 mt-2 w-48 animate-in zoom-in-95 rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl duration-200">
                                                <button
                                                    onClick={() => openEdit(type)}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
                                                >
                                                    <Pencil size={16} className="text-primary" /> Editar serviço
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleCopy(publicPath);
                                                        setPendingDeleteId(null);
                                                        setShowOptions(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
                                                >
                                                    <Copy size={16} className="text-blue-500" /> Copiar Link
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPendingDeleteId(null);
                                                        setShowOptions(null);
                                                        window.open(publicPath, '_blank');
                                                    }}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
                                                >
                                                    <SquareArrowOutUpRight size={16} className="text-slate-400" /> Ver página
                                                </button>
                                                <div className="my-2 h-px bg-slate-50" />
                                                <button
                                                    onClick={() => {
                                                        const pUrl = `${window.location.protocol}//${window.location.host}${publicPath}`;
                                                        const pText = `OFERTA: Aproveite o serviço "${type.name}"${type.price ? ` por apenas R$ ${Number(type.price).toFixed(2)}` : ''}! Garanta seu horário agora: ${pUrl}`;
                                                        setPendingDeleteId(null);
                                                        setShowOptions(null);
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(pText)}`, '_blank');
                                                    }}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    <Megaphone size={16} className="text-indigo-600" /> Promover serviço
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(type.id)}
                                                    disabled={isDeletingId === type.id}
                                                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    <Trash2 size={16} />
                                                    {isDeletingId === type.id
                                                        ? 'Excluindo...'
                                                        : pendingDeleteId === type.id
                                                            ? 'Confirmar exclusão'
                                                            : 'Excluir'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-8 flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600">
                                        <Clock size={14} className="text-primary" />
                                        {type.duration} MIN
                                    </div>
                                    {type.price && (
                                        <div className="flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                                            <Tag size={14} />
                                            R$ {Number(type.price).toFixed(2)}
                                        </div>
                                    )}
                                    {type.locationType === 'GOOGLE_MEET' ? (
                                        <div className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700">
                                            <Video size={14} />
                                            GOOGLE MEET
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">
                                            <MapPin size={14} />
                                            PRESENCIAL
                                        </div>
                                    )}
                                    {type.bufferTime > 0 && (
                                        <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-400">
                                            + {type.bufferTime}M INTERVALO
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-6">
                                    <div className="truncate pr-4 text-[10px] font-black uppercase text-slate-300">
                                        {type.slug}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(publicPath)}
                                        className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-black transition-all ${
                                            isCopied
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-primary/20 bg-white text-primary hover:border-primary/40 hover:bg-primary/5'
                                        }`}
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

            <div className="mt-16 flex gap-4 rounded-3xl border border-border bg-muted-light/30 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <AlertCircle className="text-primary" />
                </div>
                <div>
                    <h4 className="mb-1 font-bold text-slate-900">Dica de Profissional</h4>
                    <p className="m-0 text-sm font-medium text-muted">
                        Cada serviço gera um link único que você pode enviar direto aos seus clientes,
                        economizando tempo na negociação de horários.
                    </p>
                </div>
            </div>
        </div>
    );
}
