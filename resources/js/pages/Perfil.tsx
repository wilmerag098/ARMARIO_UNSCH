import { Head, Link, usePage, useForm } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { useState } from 'react';
import { User, Heart, HelpCircle, FileText, CheckCircle2, MoreVertical, Clock, Calendar, X, ArrowLeft, LogOut } from 'lucide-react';

export default function Perfil({ reservations }: { reservations: any[] }) {
    const { auth } = usePage().props;
    const [activeView, setActiveView] = useState('home'); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-900/30">
                        🟡 Pendiente
                    </span>
                );
            case 'confirmada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-900/30">
                        🔵 Confirmada
                    </span>
                );
            case 'preparando':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-400 border border-purple-900/30">
                        🟣 Preparando
                    </span>
                );
            case 'entregada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-900/30">
                        🟢 Entregada
                    </span>
                );
            case 'en_uso':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-900/30">
                        🟠 En Uso
                    </span>
                );
            case 'devuelta':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-400 border border-teal-900/30">
                        🔴 Devuelta
                    </span>
                );
            case 'rechazada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-900/30">
                        🔥 Rechazada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900 text-gray-400">
                        {status}
                    </span>
                );
        }
    };

    const { data, setData, patch, processing, errors } = useForm({
        name: (auth.user.name || '') as string,
        email: (auth.user.email || '') as string,
        phone: (auth.user.phone || '') as string,
    });

    const handleSaveProfile = () => {
        patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    return (
        <PublicLayout auth={auth}>
            <Head title="Mi Perfil" />
            
            <div className="container mx-auto px-4 md:px-8 py-10 max-w-screen-lg min-h-[70vh]">
                <div className="bg-[#2a0710] border border-[#3a0d16] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-xl relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#ffb6c5]/5 rounded-full blur-3xl"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#3a0d16] shrink-0 shadow-lg bg-[#120202]">
                            <User size={48} className="w-full h-full p-4 text-[#ffb6c5]" />
                        </div>
                        <div className="mt-2 md:mt-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#ffb6c5] mb-1">{auth.user.name}</h1>
                            <p className="text-sm text-white/70 mb-4">{auth.user.email}</p>
                            <div className="inline-flex items-center gap-2 bg-[#120202]/50 border border-[#3a0d16] px-4 py-1.5 rounded-full">
                                <CheckCircle2 size={16} className="text-[#ffb6c5]" />
                                <span className="text-xs font-medium text-white/90">Estudiante UNSCH</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 z-10">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-6 py-2.5 rounded-full border border-[#ffb6c5] text-[#ffb6c5] text-sm font-bold hover:bg-[#ffb6c5] hover:text-[#1b0308] transition-colors whitespace-nowrap shadow-lg"
                        >
                            EDITAR PERFIL
                        </button>
                        <Link 
                            href="/logout" 
                            method="post" 
                            as="button"
                            className="px-6 py-2.5 rounded-full border border-red-500/50 text-red-400 text-sm font-bold hover:bg-red-500/20 hover:text-red-300 transition-colors whitespace-nowrap shadow-lg flex items-center justify-center gap-2"
                        >
                            <LogOut size={16} />
                            SALIR
                        </Link>
                    </div>
                </div>

                {activeView === 'home' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-12">
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-white">Tus Reservas Recientes</h2>
                                <button onClick={() => setActiveView('historial')} className="text-sm text-[#ffb6c5] hover:underline hover:text-[#ffc6d2] transition-colors">
                                    Ver todas
                                </button>
                            </div>
                            
                            {reservations && reservations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {reservations.slice(0, 3).map((res) => (
                                        <div key={res.id} className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-5 shadow-lg relative flex flex-col group hover:border-[#ffb6c5]/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    {getStatusBadge(res.status)}
                                                </div>
                                                <span className="text-xs font-bold text-[#ffb6c5]">S/ {res.total_amount}</span>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 rounded-xl bg-[#120202] overflow-hidden shrink-0 border border-[#3a0d16]">
                                                    <img src={res.items[0]?.product?.image_url} alt="Prod" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white mb-1.5 leading-tight">{res.items[0]?.product?.name}</h3>
                                                    <p className="text-xs text-white/50 flex items-center gap-1.5"><Calendar size={12}/> {res.start_date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-white/50 text-sm">No tienes reservas recientes.</div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button onClick={() => setIsEditModalOpen(true)} className="bg-[#1f050b] border border-[#3a0d16] hover:border-[#ffb6c5]/50 hover:bg-[#2a0812] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 transition-all shadow-lg group">
                                    <User size={28} className="text-[#ffb6c5] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white/90">Mi Perfil</span>
                                </button>
                                <button onClick={() => setActiveView('historial')} className="bg-[#1f050b] border border-[#3a0d16] hover:border-[#ffb6c5]/50 hover:bg-[#2a0812] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 transition-all shadow-lg group">
                                    <FileText size={28} className="text-[#ffb6c5] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white/90">Historial</span>
                                </button>
                                <button onClick={() => setActiveView('favoritos')} className="bg-[#1f050b] border border-[#3a0d16] hover:border-[#ffb6c5]/50 hover:bg-[#2a0812] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 transition-all shadow-lg group">
                                    <Heart size={28} className="text-[#ffb6c5] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white/90">Mis Favoritos</span>
                                </button>
                                <Link href="/catalogo" className="bg-[#1f050b] border border-[#3a0d16] hover:border-[#ffb6c5]/50 hover:bg-[#2a0812] rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 transition-all shadow-lg group">
                                    <HelpCircle size={28} className="text-[#ffb6c5] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-white/90">Catálogo</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'historial' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="w-10 h-10 rounded-full bg-[#1f050b] border border-[#3a0d16] flex items-center justify-center text-white/70 hover:text-white hover:border-[#ffb6c5] transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-white">Historial de Reservas</h2>
                        </div>
                        
                        {reservations && reservations.length > 0 ? (
                            <div className="grid gap-4">
                                {reservations.map((res) => (
                                    <div key={res.id} className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-[#120202] rounded-xl overflow-hidden shrink-0">
                                            <img src={res.items[0]?.product?.image_url} alt="Prod" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-1">{res.items[0]?.product?.name}</h4>
                                            <p className="text-xs text-white/50 mb-2">Reserva #{res.id}</p>
                                            <div className="mt-1">
                                                {getStatusBadge(res.status)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white text-lg">S/ {res.total_amount}</p>
                                            <p className="text-xs text-white/50">{res.start_date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                                <FileText size={48} className="text-[#3a0d16] mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Sin reservas pasadas</h3>
                            </div>
                        )}
                    </div>
                )}
                
                {activeView === 'favoritos' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setActiveView('home')} className="w-10 h-10 rounded-full bg-[#1f050b] border border-[#3a0d16] flex items-center justify-center text-white/70 hover:text-white hover:border-[#ffb6c5] transition-all">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-white">Mis Favoritos</h2>
                        </div>
                        <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                            <Heart size={48} className="text-[#3a0d16] mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Aún no tienes favoritos</h3>
                            <Link href="/catalogo" className="mt-6 px-6 py-2.5 bg-[#ffb6c5] text-[#1b0308] font-bold rounded-xl hover:bg-[#ffc6d2] transition-colors">
                                Explorar Catálogo
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#3a0d16] flex justify-between items-center bg-[#1b0308]">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <User size={18} className="text-[#ffb6c5]" />
                                Editar Perfil
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-[#ffb6c5] transition-colors p-1 rounded-lg hover:bg-[#3a0d16]/50">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold tracking-wider text-white/50 mb-2 uppercase">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] transition-colors shadow-inner" 
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-wider text-white/50 mb-2 uppercase">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] transition-colors shadow-inner" 
                                />
                                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-wider text-white/50 mb-2 uppercase">Teléfono (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={data.phone} 
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] transition-colors shadow-inner" 
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-[#3a0d16] flex justify-end gap-3 bg-[#1b0308]">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-white/60 hover:text-white hover:bg-[#3a0d16] rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button onClick={handleSaveProfile} disabled={processing} className="bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold text-sm px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#ffb6c5]/20 disabled:opacity-50">
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
