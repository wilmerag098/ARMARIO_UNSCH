import { Head, usePage } from '@inertiajs/react';
import { 
    Mail, 
    Phone, 
    MapPin, 
    Clock, 
    Send, 
    Check, 
    X,
    MessageCircle
} from 'lucide-react';
import React, { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Contacto() {
    const { auth } = usePage().props;
    const [toast, setToast] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Local form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulación de envío exitoso
        setTimeout(() => {
            setLoading(false);
            setToast('¡Tu mensaje ha sido enviado correctamente! Nos pondremos en contacto contigo pronto.');
            
            // Clean states
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            
            // Auto hide toast
            setTimeout(() => setToast(null), 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            title: "Ubicación Física",
            description: "Oficina de Servicio Social, Dirección de Bienestar Universitario. Ciudad Universitaria UNSCH (Av. Independencia, Ayacucho).",
            icon: MapPin,
            color: "text-[#94344c]",
            bgColor: "bg-[#94344c]/10"
        },
        {
            title: "Teléfonos de Soporte",
            description: "+51 066 312510 | Anexo: Bienestar Estudiantil",
            icon: Phone,
            color: "text-[#dfb279]",
            bgColor: "bg-[#dfb279]/20"
        },
        {
            title: "Correo Electrónico",
            description: "bienestar.social@unsch.edu.pe",
            icon: Mail,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Horario de Atención",
            description: "Lunes a Viernes: 8:00 AM - 1:00 PM y 3:00 PM - 6:00 PM.",
            icon: Clock,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        }
    ];

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Contacto y Soporte - Armario UNSCH" />

            {/* Toast Alerta */}
            {toast && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#571e26] border-2 border-[#ffb6c5]/35 text-white px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#94344c] p-1.5 rounded-lg text-white">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{toast}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-2 text-white/50 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="bg-[#fdfbfb] min-h-screen py-16">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8 text-left">
                    
                    {/* Header Principal */}
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#94344c] bg-[#94344c]/10 px-4 py-1.5 rounded-full">Soporte y Consultas</span>
                        <h1 className="text-4xl font-serif font-black text-[#1a050a] tracking-tight">Ponte en Contacto</h1>
                        <p className="text-xs font-semibold text-[#8a3348]/60 uppercase tracking-wider leading-relaxed">
                            ¿Tienes dudas sobre los requisitos o las penalidades? Escríbenos o visítanos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Ficha de Información de Contacto */}
                        <div className="lg:col-span-5 space-y-6">
                            <h2 className="text-xl font-serif font-black text-[#1a050a] border-b border-[#ebd7da] pb-3 mb-6">Datos del Módulo Físico</h2>
                            
                            <div className="grid grid-cols-1 gap-6">
                                {contactInfo.map((info, idx) => (
                                    <div key={idx} className="bg-white border border-[#ebd7da] p-5 rounded-2xl shadow-sm flex items-start gap-4">
                                        <div className={`h-10 w-10 rounded-xl ${info.bgColor} ${info.color} flex items-center justify-center shrink-0`}>
                                            <info.icon size={18} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#1a050a]">{info.title}</h3>
                                            <p className="text-xs text-[#8a3348]/75 leading-relaxed font-semibold">{info.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* WhatsApp Directo Widget */}
                            <div className="bg-[#ebd5b3]/15 border border-[#dfb279]/25 p-6 rounded-2xl space-y-4">
                                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3d0d16] flex items-center gap-2">
                                    <MessageCircle className="text-emerald-600 fill-emerald-600" size={16} />
                                    Atención vía WhatsApp
                                </h3>
                                <p className="text-[11px] text-[#8a3348]/80 leading-relaxed font-semibold">
                                    Si requieres asistencia inmediata o deseas consultar el estado de una devolución, escríbenos directamente a nuestra línea de WhatsApp.
                                </p>
                                <a 
                                    href="https://wa.me/51999888777" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-block text-center"
                                >
                                    Escribir por WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Formulario de Contacto */}
                        <div className="lg:col-span-7 bg-white border border-[#ebd7da] p-6 md:p-8 rounded-3xl shadow-sm">
                            <h2 className="text-xl font-serif font-black text-[#1a050a] border-b border-[#ebd7da] pb-3 mb-6">Envíanos un Mensaje</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a3348]/70">Nombre Completo <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a3348]/70">Correo Electrónico <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a3348]/70">Asunto <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a3348]/70">Mensaje o Consulta <span className="text-red-500">*</span></label>
                                    <textarea
                                        rows={5}
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="py-2.5 px-8 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#3d0d16]/10 flex items-center gap-1.5"
                                        disabled={loading}
                                    >
                                        <Send size={13} />
                                        <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
