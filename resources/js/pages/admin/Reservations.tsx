import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Calendar,
    Tag,
    ChevronDown,
    Search,
    Filter,
    Check,
    X,
    Clock,
    AlertTriangle,
    Shirt,
    Info,
    User,
    Mail,
    TrendingUp,
    ShieldAlert,
    Eye,
    Save
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Pagination from '@/components/Pagination';

interface UserInfo {
    name: string;
    email: string;
}

interface ProductInfo {
    name: string;
    image_url?: string;
}

interface InventoryInfo {
    size: string;
    sku: string;
}

interface ReservationItem {
    id: number;
    price_at_time: string | number;
    subtotal: string | number;
    color?: string;
    product?: ProductInfo;
    inventory?: InventoryInfo;
}

interface Reservation {
    id: number;
    order_number: string;
    start_date: string;
    end_date: string;
    total_amount: string | number;
    status: 'pendiente' | 'confirmada' | 'preparando' | 'entregada' | 'en_uso' | 'devuelta' | 'rechazada';
    user?: UserInfo;
    items?: ReservationItem[];
}

interface ReservationsProps {
    reservations: Reservation[];
}

export default function Reservations({ reservations }: ReservationsProps) {
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all'); // all, today_deliveries, today_returns, overdue

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, timeFilter]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleManage = (res: Reservation) => {
        setSelectedReservation(res);
        setNewStatus(res.status);
        setDialogOpen(true);
    };

    const handleStatusUpdateDirect = (res: Reservation, status: string) => {
        router.put(`/admin/reservas/${res.id}/status`, {
            status: status
        }, {
            onSuccess: () => {
                showToast('Estado de la reserva e inventario físico actualizados correctamente.', 'success');
            },
            onError: () => {
                showToast('Ocurrió un error al actualizar el estado.', 'error');
            }
        });
    };

    const handleStatusUpdate = () => {
        if (selectedReservation) {
            router.put(`/admin/reservas/${selectedReservation.id}/status`, {
                status: newStatus
            }, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setSelectedReservation(null);
                    showToast('Reserva e inventario físico actualizados con éxito.', 'success');
                },
                onError: () => {
                    showToast('Ocurrió un error al guardar los cambios.', 'error');
                }
            });
        }
    };

    const isOverdue = (res: Reservation) => {
        if (!['entregada', 'en_uso'].includes(res.status)) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(res.end_date + 'T00:00:00');
        endDate.setHours(0, 0, 0, 0);

        return today > endDate;
    };

    const isToday = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    };

    const filteredReservations = reservations.filter((res) => {
        const matchesSearch =
            res.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (res.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (res.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || res.status === statusFilter;

        let matchesTime = true;
        if (timeFilter === 'today_deliveries') {
            matchesTime = isToday(res.start_date);
        } else if (timeFilter === 'today_returns') {
            matchesTime = isToday(res.end_date);
        } else if (timeFilter === 'overdue') {
            matchesTime = isOverdue(res);
        }

        return matchesSearch && matchesStatus && matchesTime;
    });

    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const currentReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (res: Reservation) => {
        if (isOverdue(res)) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Atrasada (Vencida)
                </span>
            );
        }

        switch (res.status) {
            case 'pendiente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Pendiente
                    </span>
                );
            case 'confirmada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmada
                    </span>
                );
            case 'preparando':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
                        <Clock className="h-3 w-3" />
                        Preparando
                    </span>
                );
            case 'entregada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="h-3 w-3" />
                        Lista p/ Entrega
                    </span>
                );
            case 'en_uso':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping" />
                        En Uso / Alquilada
                    </span>
                );
            case 'devuelta':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        <Check className="h-3 w-3" />
                        Devuelta
                    </span>
                );
            case 'rechazada':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <X className="h-3 w-3" />
                        Rechazada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200">
                        {res.status}
                    </span>
                );
        }
    };

    function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        );
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <Head title="Administrar Reservas de Ropa" />

            {/* Toast Alerta */}
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
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Reservas de Prendas</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Historial completo de solicitudes, alquileres activos, devoluciones y retrasos del sistema.
                    </p>
                </div>
            </div>

            {/* Bar filters */}
            <div className="bg-white border border-[#ebd7da] p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60" />
                    <input
                        type="text"
                        placeholder="Buscar por orden, alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1a050a] placeholder-[#571e26]/35 focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Status filter */}
                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="preparando">Preparando</option>
                            <option value="entregada">Lista p/ Entrega</option>
                            <option value="en_uso">En Uso</option>
                            <option value="devuelta">Devuelta</option>
                            <option value="rechazada">Rechazada</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>

                    {/* Time Filter */}
                    <div className="relative min-w-[170px]">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50" />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Cualquier Fecha</option>
                            <option value="today_deliveries">Entregas para Hoy</option>
                            <option value="today_returns">Devoluciones de Hoy</option>
                            <option value="overdue">Atrasadas (Vencidas)</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#ebd7da] text-[#571e26] bg-[#fcf8f9] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Código Orden</th>
                                <th className="px-6 py-4 font-semibold">Estudiante / Alumno</th>
                                <th className="px-6 py-4 font-semibold">Fechas del Alquiler</th>
                                <th className="px-6 py-4 font-semibold text-right">Total cobrado</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                            {filteredReservations.length > 0 ? (
                                currentReservations.map((res) => (
                                    <tr key={res.id} className={`hover:bg-[#fdf9fa] transition-colors ${isOverdue(res) ? 'bg-red-50/30' : ''}`}>
                                        {/* Order number */}
                                        <td className="px-6 py-4 font-mono font-bold text-[#94344c] tracking-wider">
                                            {res.order_number}
                                        </td>

                                        {/* Student details */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#1a050a] flex items-center gap-1.5">
                                                <span>{res.user?.name || 'Estudiante Desconocido'}</span>
                                            </div>
                                            <div className="text-xs text-[#571e26]/75">{res.user?.email || '-'}</div>
                                        </td>

                                        {/* Dates */}
                                        <td className="px-6 py-4 text-xs space-y-0.5 text-[#571e26]">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[#571e26]/60 font-medium">Inicio:</span>
                                                <span className="font-semibold text-[#1a050a]">{formatDate(res.start_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[#571e26]/60 font-medium">Devolver:</span>
                                                <span className={`font-semibold ${isOverdue(res) ? 'text-red-600 font-bold' : 'text-[#1a050a]'}`}>{formatDate(res.end_date)}</span>
                                            </div>
                                        </td>

                                        {/* Total Amount */}
                                        <td className="px-6 py-4 text-right font-extrabold text-[#1a050a]">
                                            S/ {Number(res.total_amount).toFixed(2)}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(res)}
                                        </td>

                                        {/* Action buttons */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Context actions */}
                                                {res.status === 'pendiente' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdateDirect(res, 'confirmada')}
                                                            className="inline-flex items-center gap-1 text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 py-1.5 px-2.5 rounded-lg transition-all font-semibold cursor-pointer"
                                                            title="Confirmar Reserva"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdateDirect(res, 'rechazada')}
                                                            className="inline-flex items-center gap-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-2.5 rounded-lg transition-all font-semibold cursor-pointer"
                                                            title="Rechazar Reserva"
                                                        >
                                                            <X className="h-3 w-3" />
                                                            Rechazar
                                                        </button>
                                                    </>
                                                )}

                                                {res.status === 'confirmada' && (
                                                    <button
                                                        onClick={() => handleStatusUpdateDirect(res, 'preparando')}
                                                        className="inline-flex items-center gap-1 text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-1.5 px-3 rounded-lg transition-all font-semibold cursor-pointer"
                                                        title="Comenzar preparación"
                                                    >
                                                        <Clock className="h-3 w-3" />
                                                        Preparar
                                                    </button>
                                                )}

                                                {res.status === 'preparando' && (
                                                    <button
                                                        onClick={() => handleStatusUpdateDirect(res, 'entregada')}
                                                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-lg transition-all font-semibold cursor-pointer animate-pulse"
                                                        title="Prendas listas en el vestuario"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Lista p/ Retiro
                                                    </button>
                                                )}

                                                {res.status === 'entregada' && (
                                                    <button
                                                        onClick={() => handleStatusUpdateDirect(res, 'en_uso')}
                                                        className="inline-flex items-center gap-1 text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-1.5 px-3 rounded-lg transition-all font-semibold cursor-pointer"
                                                        title="Entregar vestuario físico"
                                                    >
                                                        <Shirt className="h-3 w-3" />
                                                        Entregar
                                                    </button>
                                                )}

                                                {res.status === 'en_uso' && (
                                                    <button
                                                        onClick={() => handleStatusUpdateDirect(res, 'devuelta')}
                                                        className="inline-flex items-center gap-1 text-[11px] bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 py-1.5 px-3 rounded-lg transition-all font-semibold cursor-pointer"
                                                        title="Recibir devolución y enviar prendas a lavandería"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Devuelta / Lavado
                                                    </button>
                                                )}

                                                {/* Detalle / Gestionar Completo */}
                                                <button
                                                    onClick={() => handleManage(res)}
                                                    className="text-xs bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] p-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center"
                                                    title="Gestionar detalles"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-[#571e26]/70">
                                        No se encontraron reservas con los criterios de búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme="light"
                />
            </div>

            {/* Manage Reservation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-[#1c050a] border border-[#ffb6c5]/20 text-[#fdeaea] rounded-3xl max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
                    <DialogHeader className="p-5 border-b border-[#290a0f] bg-[#290a0f]/40 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-bold text-[#ffb6c5] flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[#94344c]" />
                                Gestionar Reserva
                            </DialogTitle>
                            <DialogDescription className="text-[#d2a9b1]/80 text-xs mt-1">
                                Detalle completo e historial de la orden de reserva <strong>{selectedReservation?.order_number}</strong>.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                        {/* Info cards (Student / User) */}
                        <div className="bg-[#290a0f]/20 border border-[#ffb6c5]/10 rounded-2xl p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-[#94344c]" />
                                Información del Estudiante
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-[#d2a9b1]/60 block uppercase text-[10px] tracking-wider">Nombre Completo</span>
                                    <span className="font-semibold text-white">{selectedReservation?.user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-[#d2a9b1]/60 block uppercase text-[10px] tracking-wider">Correo Electrónico</span>
                                    <span className="font-semibold text-white break-all">{selectedReservation?.user?.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dates / Price details */}
                        <div className="bg-[#290a0f]/20 border border-[#ffb6c5]/10 rounded-2xl p-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#94344c]" />
                                Fechas y Monto
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-[#d2a9b1]/60 block uppercase text-[10px] tracking-wider">Inicio del Alquiler</span>
                                    <span className="font-semibold text-white">{selectedReservation && formatDate(selectedReservation.start_date)}</span>
                                </div>
                                <div>
                                    <span className="text-[#d2a9b1]/60 block uppercase text-[10px] tracking-wider">Fecha Devolución</span>
                                    <span className={`font-semibold ${selectedReservation && isOverdue(selectedReservation) ? 'text-red-400 font-bold' : 'text-white'}`}>
                                        {selectedReservation && formatDate(selectedReservation.end_date)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#d2a9b1]/60 block uppercase text-[10px] tracking-wider">Total Recaudado</span>
                                    <span className="font-extrabold text-[#ffb6c5] text-sm">S/ {Number(selectedReservation?.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Reserved items */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                <Shirt className="h-3.5 w-3.5 text-[#94344c]" />
                                Prendas en la Reserva
                            </h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                                {selectedReservation?.items?.map((item) => (
                                    <div key={item.id} className="bg-[#290a0f]/10 border border-[#ffb6c5]/10 rounded-2xl p-3 flex gap-3 text-xs items-center">
                                        <div className="w-12 h-16 rounded-lg overflow-hidden border border-[#ffb6c5]/15 bg-[#290a0f] shrink-0">
                                            <img
                                                src={item.product?.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800'}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-white truncate text-sm">{item.product?.name}</p>
                                            <div className="flex flex-wrap gap-x-2 text-[#d2a9b1]/80 mt-1">
                                                <span>Talla: <span className="font-extrabold text-[#ffb6c5]">{item.inventory?.size || 'N/A'}</span></span>
                                                {item.color && (
                                                    <>
                                                        <span>|</span>
                                                        <span>Color: <span className="font-semibold text-white">{item.color}</span></span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-[#d2a9b1]/40 mt-1 font-mono text-[10px] tracking-wide">SKU: {item.inventory?.sku}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Manual Status Select */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-[#94344c]" />
                                Cambiar Estado Manualmente
                            </h4>
                            <div className="relative">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-4 pr-10 py-3 text-white w-full focus:outline-none focus:border-[#94344c] transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="pendiente">🟡 Pendiente</option>
                                    <option value="confirmada">🔵 Confirmada</option>
                                    <option value="preparando">🟣 Preparando</option>
                                    <option value="entregada">🟢 Lista p/ Entrega</option>
                                    <option value="en_uso">🟠 En Uso</option>
                                    <option value="devuelta">🔴 Devuelta</option>
                                    <option value="rechazada">🔥 Rechazada</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                        <button
                            type="button"
                            onClick={() => {
                                setDialogOpen(false);
                                setSelectedReservation(null);
                            }}
                            className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleStatusUpdate}
                            className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>Guardar cambios</span>
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Reservations.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
