import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm, router, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { 
    User, 
    Heart, 
    Calendar, 
    X, 
    LogOut, 
    Clock, 
    CreditCard, 
    CheckCircle2, 
    AlertTriangle, 
    Trash2, 
    Mail, 
    Phone, 
    Bookmark, 
    Check,
    Lock
} from 'lucide-react';

interface ReservationItem {
    id: number;
    color?: string;
    price_at_time: string | number;
    subtotal: string | number;
    product?: {
        name: string;
        image_url: string;
    };
    inventory?: {
        size: string;
    };
}

interface Reservation {
    id: number;
    status: 'pendiente' | 'confirmada' | 'preparando' | 'entregada' | 'en_uso' | 'devuelta' | 'rechazada' | string;
    total_amount: string | number;
    guarantee_amount: string | number;
    guarantee_status: 'pendiente' | 'devuelta' | 'retenida' | string;
    payment_status: 'pendiente' | 'pagado' | string;
    payment_method?: string;
    start_date: string;
    end_date: string;
    items: ReservationItem[];
}

interface Product {
    id: number;
    name: string;
    image_url: string;
    price_per_day: string | number;
    inventories?: {
        size: string;
    }[];
}

interface PerfilProps {
    reservations: Reservation[];
    favorites: Product[];
}

export default function Perfil({ reservations, favorites }: PerfilProps) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState<'reservas' | 'favoritos' | 'editar'>('reservas');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Sync tab from URL query (?tab=reservas)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabQuery = params.get('tab');
        if (tabQuery === 'reservas' || tabQuery === 'favoritos' || tabQuery === 'editar') {
            setActiveTab(tabQuery);
        }
    }, []);

    // Form hook for profile editing
    const profileForm = useForm({
        name: (auth.user as any).name || '',
        phone: (auth.user as any).phone || ''
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/perfil/actualizar', {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Perfil actualizado correctamente.', 'success');
            },
            onError: () => {
                showToast('Ocurrió un error al guardar los cambios.', 'error');
            }
        });
    };

    const handleCancelReservation = (id: number) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta reserva? Esta acción liberará las prendas de inmediato.')) {
            router.patch(`/reservas/${id}/cancelar`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    showToast('Reserva cancelada correctamente.', 'success');
                },
                onError: () => {
                    showToast('No se pudo cancelar la reserva.', 'error');
                }
            });
        }
    };

    const handleToggleFav = (productId: number) => {
        router.post(`/favoritos/toggle/${productId}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Lista de favoritos actualizada.', 'success');
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-250">
                        Pendiente
                    </span>
                );
            case 'confirmada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-250">
                        Confirmada
                    </span>
                );
            case 'preparando':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-250">
                        Preparando
                    </span>
                );
            case 'entregada':
            case 'en_uso':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-250">
                        En Uso / Entregada
                    </span>
                );
            case 'devuelta':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-600 border border-teal-250">
                        Devuelta
                    </span>
                );
            case 'rechazada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-250">
                        Cancelada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600">
                        {status}
                    </span>
                );
        }
    };

    const getGuaranteeBadge = (status: string) => {
        switch (status) {
            case 'pendiente':
                return <span className="text-blue-500 font-extrabold">En Custodia</span>;
            case 'devuelta':
                return <span className="text-emerald-500 font-extrabold">Reembolsada</span>;
            case 'retenida':
                return <span className="text-red-500 font-extrabold">Penalizada / Retenida</span>;
            default:
                return <span className="text-gray-500">{status}</span>;
        }
    };

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Mi Perfil y Reservas - Armario UNSCH" />

            {/* Toast Alertas */}
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

            <div className="bg-[#fdfbfb] min-h-screen py-12">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
                    
                    {/* Ficha del Alumno (Cabecera) */}
                    <div className="bg-white border border-[#ebd7da] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-sm relative overflow-hidden text-left">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#ffb6c5]/5 rounded-full blur-3xl" />

                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#ebd7da] shrink-0 bg-[#fcf8f9] flex items-center justify-center text-[#3d0d16]">
                                <User size={36} />
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <h1 className="text-2xl font-serif font-black text-[#1a050a]">{auth.user.name}</h1>
                                <p className="text-xs text-[#8a3348]/60 font-semibold">{auth.user.email}</p>
                                <div className="inline-flex items-center gap-1.5 bg-[#dfb279]/15 border border-[#dfb279]/25 px-3 py-1 rounded-full mt-1.5">
                                    <CheckCircle2 size={13} className="text-[#c19a6b]" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c19a6b]">Estudiante Matriculado</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 shrink-0 z-10 w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('editar')}
                                className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-[#ebd7da] hover:bg-[#fcf8f9] text-[#3d0d16] font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer"
                            >
                                Editar datos
                            </button>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex-1 md:flex-none px-6 py-2.5 border border-red-200 text-red-500 hover:bg-red-50/50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <LogOut size={14} />
                                Salir
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Sidebar Local de Navegación */}
                        <div className="lg:col-span-3 space-y-1.5 text-left">
                            <button
                                onClick={() => setActiveTab('reservas')}
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                                    activeTab === 'reservas'
                                        ? 'bg-[#3d0d16] text-[#dfb279] shadow-md shadow-[#3d0d16]/10'
                                        : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#3d0d16] border border-[#ebd7da]'
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                Mis Alquileres & Reservas
                            </button>
                            <button
                                onClick={() => setActiveTab('favoritos')}
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                                    activeTab === 'favoritos'
                                        ? 'bg-[#3d0d16] text-[#dfb279] shadow-md shadow-[#3d0d16]/10'
                                        : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#3d0d16] border border-[#ebd7da]'
                                }`}
                            >
                                <Heart className="h-4 w-4" />
                                Mis Favoritos
                            </button>
                            <button
                                onClick={() => setActiveTab('editar')}
                                className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                                    activeTab === 'editar'
                                        ? 'bg-[#3d0d16] text-[#dfb279] shadow-md shadow-[#3d0d16]/10'
                                        : 'bg-white hover:bg-[#fcf8f9] text-[#8a3348]/70 hover:text-[#3d0d16] border border-[#ebd7da]'
                                }`}
                            >
                                <User className="h-4 w-4" />
                                Editar Perfil
                            </button>
                        </div>

                        {/* Contenido de la Pestaña seleccionada */}
                        <div className="lg:col-span-9 bg-white border border-[#ebd7da] rounded-3xl p-6 md:p-8 shadow-sm text-left">
                            
                            {/* TAB: MIS RESERVAS */}
                            {activeTab === 'reservas' && (
                                <div className="space-y-6">
                                    <div className="border-b border-[#ebd7da] pb-3">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a]">Historial de Reservas</h3>
                                        <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Consulta el estado actual de tus pedidos y la devolución de depósitos.</p>
                                    </div>

                                    {reservations && reservations.length > 0 ? (
                                        <div className="space-y-6">
                                            {reservations.map((res) => {
                                                const rentAmount = Number(res.total_amount) - Number(res.guarantee_amount);
                                                const canCancel = res.status === 'pendiente';

                                                return (
                                                    <div 
                                                        key={res.id} 
                                                        className="border border-[#ebd7da] bg-[#fcf8f9]/30 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm hover:border-[#dfb279]/35 transition-colors"
                                                    >
                                                        {/* Fila superior: ID y Estado */}
                                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                                            <div className="space-y-0.5">
                                                                <span className="text-xs font-black text-[#3d0d16]">Reserva #ALQ-0{res.id}</span>
                                                                <span className="text-[10px] text-[#8a3348]/55 font-bold block">Registrado: {res.start_date}</span>
                                                            </div>
                                                            <div>
                                                                {getStatusBadge(res.status)}
                                                            </div>
                                                        </div>

                                                        {/* Items de la reserva */}
                                                        <div className="divide-y divide-[#ebd7da]/40 pt-2">
                                                            {res.items.map((item, index) => (
                                                                <div key={index} className="flex gap-4 items-center py-3 first:pt-0 last:pb-0">
                                                                    <div className="w-14 h-16 bg-[#fcf8f9] rounded-xl overflow-hidden shrink-0 border border-[#ebd7da]">
                                                                        <img 
                                                                            src={item.product?.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'} 
                                                                            alt="Prenda" 
                                                                            className="w-full h-full object-cover object-top" 
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-extrabold text-xs text-[#1a050a] truncate leading-tight">{item.product?.name}</h4>
                                                                        <div className="text-[10px] text-[#8a3348]/55 font-bold mt-1 uppercase tracking-wider flex flex-wrap gap-2.5">
                                                                            <span>Talla: <strong className="text-[#94344c]">{item.inventory?.size || 'N/A'}</strong></span>
                                                                            {item.color && <span>Color: <strong className="text-[#94344c]">{item.color}</strong></span>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <hr className="border-[#ebd7da]/50" />

                                                        {/* Desglose Financiero */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                            {/* Detalles de Fechas */}
                                                            <div className="space-y-1.5 text-[#8a3348]/85">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={13} className="text-[#94344c]" />
                                                                    <span>Fecha de uso: <strong className="text-[#1a050a]">{res.start_date}</strong></span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={13} className="text-[#94344c]" />
                                                                    <span>Fecha de devolución: <strong className="text-[#1a050a]">{res.end_date}</strong></span>
                                                                </div>
                                                            </div>

                                                            {/* Detalles de Precios */}
                                                            <div className="space-y-1.5 text-right font-semibold text-[#8a3348]/75">
                                                                <div className="flex justify-between">
                                                                    <span>Costo de Alquiler:</span>
                                                                    <span className="text-[#1a050a]">S/ {rentAmount.toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Depósito de Garantía:</span>
                                                                    <span className="text-[#1a050a]">S/ {Number(res.guarantee_amount).toFixed(2)}</span>
                                                                </div>
                                                                <div className="flex justify-between font-extrabold border-t border-[#ebd7da] pt-1">
                                                                    <span className="text-[#94344c] uppercase text-[10px] tracking-wider">Total Cobrado:</span>
                                                                    <span className="text-[#94344c] text-sm">S/ {Number(res.total_amount).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Detalles de Pago y Garantía */}
                                                        <div className="bg-white border border-[#ebd7da] p-3.5 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-[#8a3348]/85">
                                                            <div className="flex items-center gap-1.5">
                                                                <CreditCard size={13} className="text-[#c19a6b]" />
                                                                <span>Pago: <span className="text-[#1a050a] font-extrabold uppercase">{res.payment_status}</span></span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 sm:justify-end">
                                                                <AlertTriangle size={13} className="text-[#c19a6b]" />
                                                                <span>Garantía: {getGuaranteeBadge(res.guarantee_status)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Botón de Cancelar */}
                                                        <div className="flex justify-end pt-1">
                                                            {canCancel ? (
                                                                <button
                                                                    onClick={() => handleCancelReservation(res.id)}
                                                                    className="py-2 px-5 bg-red-50 hover:bg-red-100/70 border border-red-200 text-red-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                                                >
                                                                    <Trash2 size={13} />
                                                                    Cancelar Reserva
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#8a3348]/45 bg-[#fcf8f9] border border-[#ebd7da] px-3.5 py-1.5 rounded-lg">
                                                                    <Lock size={11} />
                                                                    No Cancelable (En Proceso)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-[#8a3348]/45">
                                            <Calendar className="mx-auto h-12 w-12 text-[#94344c]/20 mb-4" />
                                            <h3 className="text-sm font-extrabold text-[#1a050a] mb-1">Sin alquileres registrados</h3>
                                            <p className="text-xs">Cuando reserves tu primer outfit, aparecerá en esta pestaña.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: FAVORITOS */}
                            {activeTab === 'favoritos' && (
                                <div className="space-y-6">
                                    <div className="border-b border-[#ebd7da] pb-3">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a]">Mis Favoritos</h3>
                                        <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Administra las prendas que has guardado como favoritas del catálogo.</p>
                                    </div>

                                    {favorites && favorites.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {favorites.map((prod) => {
                                                const sizes = prod.inventories 
                                                    ? Array.from(new Set(prod.inventories.map(inv => inv.size))).join(', ') 
                                                    : 'S, M, L';

                                                return (
                                                    <div 
                                                        key={prod.id} 
                                                        className="bg-white border border-[#ebd7da]/70 rounded-3xl p-4 flex flex-col shadow-sm hover:shadow-md hover:border-[#dfb279]/35 transition-all duration-300 group"
                                                    >
                                                        {/* Imagen */}
                                                        <div className="relative aspect-[3/4.2] w-full rounded-2xl overflow-hidden mb-4 bg-[#fcf8f9] border border-[#ebd7da]/40">
                                                            {/* Favoritos botón */}
                                                            <button 
                                                                onClick={() => handleToggleFav(prod.id)}
                                                                className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-[#94344c] text-white flex items-center justify-center shadow transition-all duration-200 border border-[#94344c] cursor-pointer"
                                                            >
                                                                <Heart size={13} fill="currentColor" />
                                                            </button>
                                                            <img 
                                                                src={prod.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'} 
                                                                alt={prod.name} 
                                                                className="w-full h-full object-cover object-top" 
                                                            />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-grow flex flex-col justify-between space-y-2">
                                                            <div className="space-y-1">
                                                                <h4 className="font-extrabold text-xs text-[#1a050a] group-hover:text-[#94344c] transition-colors leading-tight line-clamp-2">{prod.name}</h4>
                                                                <p className="text-xs font-semibold text-[#8a3348]/85">S/ {parseFloat(String(prod.price_per_day)).toFixed(2)} <span className="font-bold text-[9px] text-[#8a3348]/50 uppercase tracking-wider">/ 48h</span></p>
                                                                <div className="text-[9px] text-[#8a3348]/50 font-bold uppercase tracking-wider">Tallas: <span className="text-[#1a050a] font-black">{sizes}</span></div>
                                                            </div>

                                                            <div className="pt-2.5 border-t border-[#fcf8f9] mt-2">
                                                                <Link 
                                                                    href={`/producto/${prod.id}`}
                                                                    className="w-full py-2 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center cursor-pointer"
                                                                >
                                                                    Ver detalles
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-[#8a3348]/45">
                                            <Heart className="mx-auto h-12 w-12 text-[#94344c]/20 mb-4" />
                                            <h3 className="text-sm font-extrabold text-[#1a050a] mb-1">Aún no tienes favoritos</h3>
                                            <p className="text-xs mb-6">Navega en el catálogo y haz clic en el corazón para guardar trajes.</p>
                                            <Link
                                                href="/catalogo"
                                                className="py-2.5 px-6 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-block"
                                            >
                                                Explorar catálogo
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: EDITAR PERFIL */}
                            {activeTab === 'editar' && (
                                <div className="space-y-6">
                                    <div className="border-b border-[#ebd7da] pb-3 mb-6">
                                        <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a]">Datos de Contacto</h3>
                                        <p className="text-[11px] text-[#8a3348]/60 mt-0.5">Mantén tu información de contacto actualizada para recibir los recordatorios de devolución.</p>
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Nombre Completo <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                                <input
                                                    type="text"
                                                    value={profileForm.data.name}
                                                    onChange={e => profileForm.setData('name', e.target.value)}
                                                    className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                    required
                                                />
                                            </div>
                                            {profileForm.errors.name && <div className="text-red-500 text-[10px] font-bold mt-1">{profileForm.errors.name}</div>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Correo Electrónico</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/30" />
                                                <input
                                                    type="email"
                                                    value={auth.user.email || ''}
                                                    className="w-full bg-[#fcf8f9]/50 border border-[#ebd7da]/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a050a]/40 font-bold focus:outline-none cursor-not-allowed"
                                                    disabled
                                                />
                                            </div>
                                            <p className="text-[9px] text-[#8a3348]/50">El correo electrónico institucional no puede ser modificado.</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#8a3348]/70">Teléfono móvil</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a3348]/40" />
                                                <input
                                                    type="text"
                                                    value={profileForm.data.phone}
                                                    onChange={e => profileForm.setData('phone', e.target.value)}
                                                    className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a050a] focus:outline-none focus:border-[#94344c] font-semibold"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                className="py-2.5 px-8 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#3d0d16]/10 flex items-center gap-1.5"
                                                disabled={profileForm.processing}
                                            >
                                                <span>{profileForm.processing ? 'Guardando...' : 'Guardar Cambios'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
