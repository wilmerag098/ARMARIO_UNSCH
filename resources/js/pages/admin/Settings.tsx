import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
    return (
        <>
            <Head title="Configuración de Administración" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Configuración del Sistema</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Ajustes del panel administrativo, límites de alquiler y notificaciones.
                    </p>
                </div>
            </div>

            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl p-6 md:p-8 max-w-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#290a0f]">
                    <SettingsIcon className="h-5 w-5 text-[#ffb6c5]" />
                    <h2 className="font-semibold text-lg text-[#fdeaea]">Preferencias Generales</h2>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Max days */}
                    <div className="space-y-2">
                        <label htmlFor="max_rental_days" className="block text-sm font-medium text-[#d2a9b1]">
                            Días máximos por alquiler
                        </label>
                        <input 
                            type="number" 
                            id="max_rental_days" 
                            defaultValue={5}
                            className="w-full bg-[#120202] border border-[#290a0f] rounded-xl px-4 py-2.5 text-[#fdeaea] focus:outline-none focus:border-[#ffb6c5] transition-all"
                        />
                        <p className="text-xs text-[#d2a9b1]/60">Límite de tiempo que un alumno puede retener una prenda.</p>
                    </div>

                    {/* Deposit */}
                    <div className="space-y-2">
                        <label htmlFor="overdue_penalty" className="block text-sm font-medium text-[#d2a9b1]">
                            Multa por día de retraso (S/)
                        </label>
                        <input 
                            type="number" 
                            id="overdue_penalty" 
                            defaultValue={10}
                            className="w-full bg-[#120202] border border-[#290a0f] rounded-xl px-4 py-2.5 text-[#fdeaea] focus:outline-none focus:border-[#ffb6c5] transition-all"
                        />
                    </div>

                    {/* Auto reminders */}
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="auto_reminders" 
                            defaultChecked
                            className="h-4 w-4 rounded border-[#290a0f] text-[#94344c] focus:ring-0 focus:ring-offset-0 bg-[#120202]"
                        />
                        <label htmlFor="auto_reminders" className="text-sm font-medium text-[#fdeaea]">
                            Enviar recordatorios automáticos de devolución por correo
                        </label>
                    </div>

                    <button 
                        type="button" 
                        className="bg-[#ffb6c5] hover:bg-[#ffa3b6] text-[#120202] font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2"
                    >
                        <Save className="h-4.5 w-4.5" />
                        <span>Guardar Cambios</span>
                    </button>
                </form>
            </div>
        </>
    );
}

Settings.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
