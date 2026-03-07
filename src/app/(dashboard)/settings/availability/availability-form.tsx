'use client';

import { useState } from 'react';
import { updateAvailability } from '@/lib/actions';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

const DAYS = [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

interface AvailabilityItem {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export default function AvailabilityForm({ initialAvailability }: { initialAvailability: any[] }) {
    const [availability, setAvailability] = useState<AvailabilityItem[]>(
        initialAvailability.map(a => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
        }))
    );
    const [loading, setLoading] = useState(false);

    const toggleDay = (dayIndex: number) => {
        const isActive = availability.some(a => a.dayOfWeek === dayIndex);
        if (isActive) {
            setAvailability(prev => prev.filter(a => a.dayOfWeek !== dayIndex));
        } else {
            setAvailability(prev => [...prev, { dayOfWeek: dayIndex, startTime: '09:00', endTime: '18:00' }]);
        }
    };

    const addBlock = (dayIndex: number) => {
        setAvailability(prev => [...prev, { dayOfWeek: dayIndex, startTime: '14:00', endTime: '18:00' }]);
    };

    const removeBlock = (index: number) => {
        setAvailability(prev => prev.filter((_, i) => i !== index));
    };

    const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
        setAvailability(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
    };

    const handleSave = async () => {
        setLoading(true);
        const res = await updateAvailability(availability);
        if (res.success) {
            window.alert('Disponibilidade salva com sucesso!');
        } else {
            window.alert('Erro ao salvar disponibilidade.');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="card p-0 overflow-hidden border-border">
                {DAYS.map((day, dayIndex) => {
                    const dayBlocks = availability.map((a, i) => ({ ...a, originalIndex: i })).filter(a => a.dayOfWeek === dayIndex);
                    const isActive = dayBlocks.length > 0;

                    return (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 border-b border-border last:border-0 hover:bg-muted-light/20 transition-colors">
                            <div className="flex items-center gap-4 min-w-[160px] pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isActive}
                                        onChange={() => toggleDay(dayIndex)}
                                    />
                                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className={`font-bold text-sm uppercase tracking-wider ${isActive ? 'text-foreground' : 'text-muted'}`}>{day}</span>
                            </div>

                            <div className="flex-1">
                                {isActive ? (
                                    <div className="flex flex-col gap-3">
                                        {dayBlocks.map((block, i) => (
                                            <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                                                <div className="flex items-center gap-2 bg-muted-light/50 p-1.5 rounded-xl border border-border">
                                                    <Clock size={14} className="text-muted ml-2" />
                                                    <input
                                                        type="time"
                                                        className="bg-transparent border-none outline-none font-bold text-sm p-1 cursor-pointer"
                                                        value={block.startTime}
                                                        onChange={(e) => updateTime(block.originalIndex, 'startTime', e.target.value)}
                                                    />
                                                    <span className="text-muted px-1">—</span>
                                                    <input
                                                        type="time"
                                                        className="bg-transparent border-none outline-none font-bold text-sm p-1 cursor-pointer"
                                                        value={block.endTime}
                                                        onChange={(e) => updateTime(block.originalIndex, 'endTime', e.target.value)}
                                                    />
                                                </div>

                                                {dayBlocks.length > 1 && (
                                                    <button
                                                        onClick={() => removeBlock(block.originalIndex)}
                                                        className="text-muted hover:text-danger p-2 bg-transparent border-none cursor-pointer transition-colors"
                                                        title="Remover bloco"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                                {i === dayBlocks.length - 1 && (
                                                    <button
                                                        onClick={() => addBlock(dayIndex)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover p-2 bg-transparent border-none cursor-pointer ml-2"
                                                    >
                                                        <Plus size={14} /> Novo Intervalo
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted text-sm font-medium h-10 flex items-center">Indisponível</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 text-primary text-sm font-medium">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="m-0">Suas configurações de disponibilidade são aplicadas globalmente a todos os serviços, a menos que você defina exceções específicas por data.</p>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary px-12 h-14 text-lg shadow-lg shadow-primary/20"
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
}
