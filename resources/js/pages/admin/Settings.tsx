import { Head, useForm } from '@inertiajs/react';
import {
    Save,
    Clock,
    Coins,
    ShieldAlert,
    FileText,
    Mail,
    X,
    Check
} from 'lucide-react';
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface SettingsData {
    max_rental_days: number | string;
    overdue_penalty: number | string;
    max_items_per_student: number | string;
    auto_reminders: boolean;
    reminder_hours_before: number | string;
    default_guarantee: number | string;
    terms_conditions: string;
}

interface SettingsProps {
    settings: SettingsData;
}

export default function Settings({ settings }: SettingsProps) {
    const [activeTab, setActiveTab] = useState<'limits' | 'guarantees' | 'reminders' | 'contract'>('limits');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const form = useForm({
        max_rental_days: settings.max_rental_days,
        overdue_penalty: settings.overdue_penalty,
        max_items_per_student: settings.max_items_per_student,
        auto_reminders: settings.auto_reminders,
        reminder_hours_before: settings.reminder_hours_before,
        default_guarantee: settings.default_guarantee,
        terms_conditions: settings.terms_conditions
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/configuracion', {
            onSuccess: () => {
                showToast('Configuraciones actualizadas con éxito.', 'success');
            },
            onError: () => {
                showToast('Ocurrió un error al guardar los ajustes.', 'error');
            }
        });
    };

    return (
        <>
            <Head title="Configuración del Sistema - Armario UNSCH" />

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#571e26] border-2 border-[#ffb6c5]/35 text-white px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#94344c] p-1.5 rounded-lg text-white">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-2 text-white/50 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Configuración</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Gestión de límites de alquiler, políticas de multas, recordatorios y términos legales del armario.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tabs Sidebar */}
                <div className="lg:col-span-3 space-y-1.5">
                    <button
                        onClick={() => setActiveTab('limits')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                            activeTab === 'limits'
                                ? 'bg-[#94344c] text-white shadow-md shadow-[#94344c]/10'
                                : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#94344c] border border-[#ebd7da]'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        Límites de Alquiler
                    </button>
                    <button
                        onClick={() => setActiveTab('guarantees')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                            activeTab === 'guarantees'
                                ? 'bg-[#94344c] text-white shadow-md shadow-[#94344c]/10'
                                : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#94344c] border border-[#ebd7da]'
                        }`}
                    >
                        <Coins className="h-4 w-4" />
                        Garantías & Multas
                    </button>
                    <button
                        onClick={() => setActiveTab('reminders')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                            activeTab === 'reminders'
                                ? 'bg-[#94344c] text-white shadow-md shadow-[#94344c]/10'
                                : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#94344c] border border-[#ebd7da]'
                        }`}
                    >
                        <Mail className="h-4 w-4" />
                        Notificaciones & Alertas
                    </button>
                    <button
                        onClick={() => setActiveTab('contract')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                            activeTab === 'contract'
                                ? 'bg-[#94344c] text-white shadow-md shadow-[#94344c]/10'
                                : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#94344c] border border-[#ebd7da]'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        Contrato & Términos
                    </button>
                </div>

                {/* Settings Form Card */}
                <div className="lg:col-span-9 bg-white border border-[#ebd7da] rounded-3xl p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* LIMITS SETTINGS */}
                        {activeTab === 'limits' && (
                            <div className="space-y-5">
                                <div className="border-b border-[#ebd7da] pb-3 mb-5">
                                    <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Reglas y Límites de Alquiler</h3>
                                    <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Define los tiempos máximos y la cantidad de prendas permitidas por alumno.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Días Máximos por Alquiler <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                            <input
                                                type="number"
                                                value={form.data.max_rental_days}
                                                onChange={e => form.setData('max_rental_days', e.target.value)}
                                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#8a3348]/50">Límite de tiempo estándar que un alumno puede retener una prenda.</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Límite de prendas por Reserva <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                            <input
                                                type="number"
                                                value={form.data.max_items_per_student}
                                                onChange={e => form.setData('max_items_per_student', e.target.value)}
                                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#8a3348]/50">Cantidad máxima de prendas que un estudiante puede alquilar a la vez.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GUARANTEES SETTINGS */}
                        {activeTab === 'guarantees' && (
                            <div className="space-y-5">
                                <div className="border-b border-[#ebd7da] pb-3 mb-5">
                                    <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Políticas de Garantía & Penalidades</h3>
                                    <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Controla los montos de depósitos de garantía y multas por devoluciones atrasadas.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Garantía Estándar por Defecto (S/) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                            <input
                                                type="number"
                                                value={form.data.default_guarantee}
                                                onChange={e => form.setData('default_guarantee', e.target.value)}
                                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#8a3348]/50">Se utiliza si el producto no tiene una garantía específica configurada en catálogo.</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Multa diaria por Retraso (S/) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                            <input
                                                type="number"
                                                value={form.data.overdue_penalty}
                                                onChange={e => form.setData('overdue_penalty', e.target.value)}
                                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-[#8a3348]/50">Penalidad económica diaria acumulable en caso de retrasos en las entregas.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* REMINDERS SETTINGS */}
                        {activeTab === 'reminders' && (
                            <div className="space-y-5">
                                <div className="border-b border-[#ebd7da] pb-3 mb-5">
                                    <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Avisos & Alertas de Correo</h3>
                                    <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Automatiza las alertas por correo para evitar retrasos de devolución.</p>
                                </div>

                                <div className="space-y-5">
                                    {/* Toggle recordatorios */}
                                    <div className="flex items-center gap-3 bg-[#fcf8f9] border border-[#ebd7da] p-4 rounded-2xl">
                                        <input
                                            type="checkbox"
                                            id="auto_reminders"
                                            checked={form.data.auto_reminders}
                                            onChange={e => form.setData('auto_reminders', e.target.checked)}
                                            className="h-4.5 w-4.5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 focus:ring-offset-0 bg-[#fcf8f9] cursor-pointer"
                                        />
                                        <label htmlFor="auto_reminders" className="text-xs font-bold text-[#1a050a] cursor-pointer">
                                            Enviar recordatorios automáticos de devolución por correo electrónico
                                        </label>
                                    </div>

                                    {/* Horas previas */}
                                    {form.data.auto_reminders && (
                                        <div className="space-y-1.5 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Anticipación del Recordatorio (Horas) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                                <input
                                                    type="number"
                                                    value={form.data.reminder_hours_before}
                                                    onChange={e => form.setData('reminder_hours_before', e.target.value)}
                                                    className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                    min="1"
                                                    required
                                                />
                                            </div>
                                            <p className="text-[10px] text-[#8a3348]/50">Tiempo antes de la fecha de entrega acordada para enviar el recordatorio (ej. 24 horas).</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CONTRACT SETTINGS */}
                        {activeTab === 'contract' && (
                            <div className="space-y-5">
                                <div className="border-b border-[#ebd7da] pb-3 mb-5">
                                    <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Términos del Contrato de Alquiler</h3>
                                    <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Redacte los acuerdos de responsabilidad y políticas de uso que rigen el alquiler.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Contrato Estándar <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <textarea
                                            value={form.data.terms_conditions}
                                            onChange={e => form.setData('terms_conditions', e.target.value)}
                                            rows={8}
                                            className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-2xl p-4 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] leading-relaxed"
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#8a3348]/50">Este documento define las multas por daños, roturas, manchas o retención indebida de prendas.</p>
                                </div>
                            </div>
                        )}

                        {/* Footer - Submit button */}
                        <div className="pt-5 border-t border-[#ebd7da] flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl shadow-lg shadow-[#94344c]/10 transition-all flex items-center gap-2 cursor-pointer"
                                disabled={form.processing}
                            >
                                <Save className="h-4 w-4" />
                                <span>{form.processing ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Settings.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
