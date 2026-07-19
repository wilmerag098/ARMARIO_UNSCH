import { Head, useForm, router } from '@inertiajs/react';
import {
    CreditCard,
    TrendingUp,
    Coins,
    ShieldCheck,
    Hourglass,
    Search,
    Filter,
    ChevronDown,
    Check,
    X,
    AlertTriangle,
    DollarSign,
    Wallet,
    Banknote
} from 'lucide-react';
import React, { useState } from 'react';
import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface UserInfo {
    name: string;
    email: string;
}

interface ProductInfo {
    name: string;
    security_deposit: string | number;
}

interface ReservationItem {
    id: number;
    subtotal: string | number;
    product?: ProductInfo;
}

interface Reservation {
    id: number;
    order_number: string;
    start_date: string;
    end_date: string;
    total_amount: string | number;
    status: 'pendiente' | 'confirmada' | 'preparando' | 'entregada' | 'en_uso' | 'devuelta' | 'rechazada';
    payment_status: 'pendiente' | 'pagado';
    payment_method?: 'yape' | 'plin' | 'efectivo' | 'transferencia';
    guarantee_status: 'pendiente' | 'devuelta' | 'retenida';
    guarantee_amount: string | number;
    user?: UserInfo;
    items?: ReservationItem[];
    refund_requested?: boolean | number;
    refund_method?: string;
    refund_details?: string;
}

interface PaymentsProps {
    reservations: Reservation[];
}

export default function Payments({ reservations }: PaymentsProps) {
    const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isGuaranteeModalOpen, setIsGuaranteeModalOpen] = useState(false);
    const [guaranteeAction, setGuaranteeAction] = useState<'devuelta' | 'retenida'>('devuelta');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [payFilter, setPayFilter] = useState('all');
    const [guaranteeFilter, setGuaranteeFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [prevFilters, setPrevFilters] = useState({ searchTerm, payFilter, guaranteeFilter });

    if (searchTerm !== prevFilters.searchTerm || payFilter !== prevFilters.payFilter || guaranteeFilter !== prevFilters.guaranteeFilter) {
        setPrevFilters({ searchTerm, payFilter, guaranteeFilter });
        setCurrentPage(1);
    }

    const paymentForm = useForm({
        payment_method: 'yape',
        guarantee_amount: 0
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleOpenPayment = (res: Reservation) => {
        setSelectedRes(res);
        // Calculate recommended guarantee based on items if it is zero
        let defaultGuarantee = Number(res.guarantee_amount);

        if (defaultGuarantee === 0 && res.items) {
            defaultGuarantee = res.items.reduce((sum, item) => sum + Number(item.product?.security_deposit || 0), 0);
        }

        paymentForm.setData({
            payment_method: 'yape',
            guarantee_amount: defaultGuarantee
        });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRes) {
return;
}

        router.patch(`/admin/pagos/${selectedRes.id}/registrar`, paymentForm.data, {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setSelectedRes(null);
                showToast('Pago registrado e ingreso de garantía establecido.', 'success');
            },
            onError: () => {
                showToast('Error al registrar el pago.', 'error');
            }
        });
    };

    const handleOpenGuarantee = (res: Reservation, action: 'devuelta' | 'retenida') => {
        setSelectedRes(res);
        setGuaranteeAction(action);
        setIsGuaranteeModalOpen(true);
    };

    const handleGuaranteeSubmit = () => {
        if (!selectedRes) {
return;
}

        router.patch(`/admin/pagos/${selectedRes.id}/devolver-garantia`, {
            guarantee_status: guaranteeAction
        }, {
            onSuccess: () => {
                setIsGuaranteeModalOpen(false);
                setSelectedRes(null);
                showToast(guaranteeAction === 'devuelta' ? 'Garantía devuelta con éxito.' : 'Garantía penalizada/retenida.', 'success');
            },
            onError: () => {
                showToast('Error al procesar la devolución de la garantía.', 'error');
            }
        });
    };

    // Calculate metrics
    const totalCollected = reservations
        .filter(r => r.payment_status === 'pagado')
        .reduce((sum, r) => sum + Number(r.total_amount) - Number(r.guarantee_amount), 0);

    const pendingGuarantees = reservations
        .filter(r => r.payment_status === 'pagado' && r.guarantee_status === 'pendiente')
        .reduce((sum, r) => sum + Number(r.guarantee_amount), 0);

    const refundedGuarantees = reservations
        .filter(r => r.payment_status === 'pagado' && r.guarantee_status === 'devuelta')
        .reduce((sum, r) => sum + Number(r.guarantee_amount), 0);

    const pendingToCollect = reservations
        .filter(r => r.payment_status === 'pendiente' && r.status !== 'rechazada')
        .reduce((sum, r) => sum + Number(r.total_amount), 0);

    // Filter Logic
    const filteredReservations = reservations.filter(res => {
        const matchesSearch =
            res.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (res.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPay = payFilter === 'all' || res.payment_status === payFilter;
        const matchesGuarantee = guaranteeFilter === 'all' || res.guarantee_status === guaranteeFilter;

        return matchesSearch && matchesPay && matchesGuarantee;
    });

    const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
    const currentReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPaymentBadge = (status: string) => {
        if (status === 'pagado') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="h-3 w-3" />
                    Pagado
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Hourglass className="h-3 w-3" />
                Pendiente
            </span>
        );
    };

    const getGuaranteeBadge = (res: Reservation) => {
        if (res.status === 'pendiente' || res.status === 'rechazada') {
            return <span className="text-xs text-[#571e26]/40">-</span>;
        }

        if (res.payment_status === 'pendiente') {
            return <span className="text-xs text-[#571e26]/60">Esperando Pago</span>;
        }

        switch (res.guarantee_status) {
            case 'pendiente':
                if (res.refund_requested) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/25 animate-pulse">
                            Reembolso Solicitado
                        </span>
                    );
                }

                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        En Custodia
                    </span>
                );
            case 'devuelta':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Reembolsada
                    </span>
                );
            case 'retenida':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                        Retenida / Daño
                    </span>
                );
            default:
                return <span className="text-xs text-[#571e26]/70">{res.guarantee_status}</span>;
        }
    };

    const getMethodLabel = (method?: string) => {
        if (!method) {
return <span className="text-[#571e26]/40">-</span>;
}

        switch (method) {
            case 'yape':
                return <span className="text-xs font-bold text-sky-400 uppercase">Yape</span>;
            case 'plin':
                return <span className="text-xs font-bold text-teal-400 uppercase">Plin</span>;
            case 'efectivo':
                return <span className="text-xs font-bold text-emerald-400 uppercase">Efectivo</span>;
            case 'transferencia':
                return <span className="text-xs font-bold text-violet-400 uppercase">Trf. Bancaria</span>;
            default:
                return <span className="text-xs text-white capitalize">{method}</span>;
        }
    };

    return (
        <>
            <Head title="Control de Pagos y Garantías" />

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
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Caja y Pagos</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Control de ingresos por alquileres y administración de los depósitos de garantía reembolsables.
                    </p>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Metric 1 */}
                <div className="bg-[#1c050a] border border-[#290a0f] p-5 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-900/30 text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#d2a9b1]/60 block uppercase font-bold tracking-wider">Alquileres Recaudados</span>
                        <span className="text-xl font-extrabold text-[#fdeaea] mt-0.5 block">S/ {totalCollected.toFixed(2)}</span>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#1c050a] border border-[#290a0f] p-5 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-900/30 text-amber-400">
                        <Coins className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#d2a9b1]/60 block uppercase font-bold tracking-wider">Garantías en Custodia</span>
                        <span className="text-xl font-extrabold text-[#fdeaea] mt-0.5 block">S/ {pendingGuarantees.toFixed(2)}</span>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#1c050a] border border-[#290a0f] p-5 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-900/30 text-emerald-400">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#d2a9b1]/60 block uppercase font-bold tracking-wider">Garantías Devueltas</span>
                        <span className="text-xl font-extrabold text-[#fdeaea] mt-0.5 block">S/ {refundedGuarantees.toFixed(2)}</span>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#1c050a] border border-[#290a0f] p-5 rounded-2xl shadow-xl flex items-center gap-4">
                    <div className="bg-rose-950/60 p-3.5 rounded-xl border border-rose-900/30 text-rose-400">
                        <Hourglass className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-[#d2a9b1]/60 block uppercase font-bold tracking-wider">Pendiente por Cobrar</span>
                        <span className="text-xl font-extrabold text-[#fdeaea] mt-0.5 block">S/ {pendingToCollect.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-[#ebd7da] p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60" />
                    <input
                        type="text"
                        placeholder="Buscar por orden o alumno..."
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
                            value={payFilter}
                            onChange={(e) => setPayFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Pagos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="pagado">Pagados</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>

                    {/* Guarantee Filter */}
                    <div className="relative min-w-[170px]">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50" />
                        <select
                            value={guaranteeFilter}
                            onChange={(e) => setGuaranteeFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Todas las Garantías</option>
                            <option value="pendiente">En Custodia</option>
                            <option value="devuelta">Reembolsadas</option>
                            <option value="retenida">Retenidas/Penalizadas</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#ebd7da] text-[#571e26] bg-[#fcf8f9] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Código Orden</th>
                                <th className="px-6 py-4 font-semibold">Estudiante / Alumno</th>
                                <th className="px-6 py-4 font-semibold text-center">Método</th>
                                <th className="px-6 py-4 font-semibold text-right">Alquiler</th>
                                <th className="px-6 py-4 font-semibold text-right">Dep. Garantía</th>
                                <th className="px-6 py-4 font-semibold text-right">Total General</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado Pago</th>
                                <th className="px-6 py-4 font-semibold text-center">Garantía</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                            {filteredReservations.length > 0 ? (
                                currentReservations.map((res) => {
                                    const rawTotal = Number(res.total_amount);
                                    const rawGuarantee = Number(res.guarantee_amount);
                                    const rawRental = rawTotal - rawGuarantee;

                                    return (
                                        <tr key={res.id} className="hover:bg-[#fdf9fa] transition-colors">
                                            {/* Code */}
                                            <td className="px-6 py-4 font-mono font-bold text-[#94344c] tracking-wider">
                                                {res.order_number}
                                            </td>

                                            {/* Student */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-[#1a050a]">{res.user?.name || 'Alumno Desconocido'}</div>
                                            </td>

                                            {/* Method */}
                                            <td className="px-6 py-4 text-center">
                                                {getMethodLabel(res.payment_method)}
                                            </td>

                                            {/* Rental price */}
                                            <td className="px-6 py-4 text-right font-medium text-[#1a050a]">
                                                S/ {rawRental.toFixed(2)}
                                            </td>

                                            {/* Guarantee */}
                                            <td className="px-6 py-4 text-right font-medium text-[#94344c]">
                                                S/ {rawGuarantee.toFixed(2)}
                                            </td>

                                            {/* Total */}
                                            <td className="px-6 py-4 text-right font-extrabold text-[#1a050a]">
                                                S/ {rawTotal.toFixed(2)}
                                            </td>

                                            {/* Payment status badge */}
                                            <td className="px-6 py-4 text-center">
                                                {getPaymentBadge(res.payment_status)}
                                            </td>

                                            {/* Guarantee status badge */}
                                            <td className="px-6 py-4 text-center">
                                                {getGuaranteeBadge(res)}
                                            </td>

                                            {/* Action buttons */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Cobrar rápido */}
                                                    {res.payment_status === 'pendiente' && res.status !== 'rechazada' && (
                                                        <button
                                                            onClick={() => handleOpenPayment(res)}
                                                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-lg transition-all font-semibold cursor-pointer"
                                                            title="Registrar Pago y Garantía"
                                                        >
                                                            <Banknote className="h-3 w-3" />
                                                            Cobrar Caja
                                                        </button>
                                                    )}

                                                    {/* Devolver/Retener garantía si pagó y sigue pendiente */}
                                                    {res.payment_status === 'pagado' && res.guarantee_status === 'pendiente' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenGuarantee(res, 'devuelta')}
                                                                className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-2.5 rounded-lg transition-all font-semibold cursor-pointer"
                                                                title="Devolver depósito de garantía completo"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                                Reembolsar
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenGuarantee(res, 'retenida')}
                                                                className="inline-flex items-center gap-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-2.5 rounded-lg transition-all font-semibold cursor-pointer"
                                                                title="Retener garantía por daños en la prenda"
                                                            >
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Penalizar
                                                            </button>
                                                        </>
                                                    )}

                                                    {res.payment_status === 'pagado' && res.guarantee_status !== 'pendiente' && (
                                                        <span className="text-xs text-[#571e26]/40">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-[#571e26]/70">
                                        No hay registros de transacciones con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                    {filteredReservations.length > 0 ? (
                        currentReservations.map((res) => {
                            const rawTotal = Number(res.total_amount);
                            const rawGuarantee = Number(res.guarantee_amount);
                            const rawRental = rawTotal - rawGuarantee;

                            return (
                                <div key={res.id} className="p-5 space-y-3 hover:bg-[#fdf9fa] transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono font-bold text-[#94344c] tracking-wider text-xs">{res.order_number}</span>
                                        <div className="flex gap-1">
                                            {getMethodLabel(res.payment_method)}
                                        </div>
                                    </div>

                                    <div className="text-xs space-y-1">
                                        <div className="font-bold text-[#1a050a]">{res.user?.name || 'Alumno Desconocido'}</div>
                                    </div>

                                    <div className="bg-[#fcf8f9] px-4 py-3 rounded-2xl text-xs space-y-1.5 font-semibold text-[#571e26]">
                                        <div className="flex justify-between">
                                            <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Alquiler:</span>
                                            <span className="text-[#1a050a]">S/ {rawRental.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Dep. Garantía:</span>
                                            <span className="text-[#94344c]">S/ {rawGuarantee.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-[#ebd7da]/40 pt-1.5 flex justify-between font-bold">
                                            <span className="text-stone-400 uppercase text-[9px] tracking-wider">Total General:</span>
                                            <span className="text-[#1a050a] text-sm font-black">S/ {rawTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <div>{getPaymentBadge(res.payment_status)}</div>
                                        <div>{getGuaranteeBadge(res)}</div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#fcf8f9]/50">
                                        {/* Cobrar rápido */}
                                        {res.payment_status === 'pendiente' && res.status !== 'rechazada' && (
                                            <button
                                                onClick={() => handleOpenPayment(res)}
                                                className="inline-flex items-center justify-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 px-4 rounded-xl transition-all font-bold flex-1 cursor-pointer"
                                                title="Registrar Pago y Garantía"
                                            >
                                                <Banknote className="h-4 w-4" />
                                                Cobrar Caja
                                            </button>
                                        )}

                                        {/* Devolver/Retener garantía si pagó y sigue pendiente */}
                                        {res.payment_status === 'pagado' && res.guarantee_status === 'pendiente' && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenGuarantee(res, 'devuelta')}
                                                    className="inline-flex items-center justify-center gap-1.5 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 px-3 rounded-xl transition-all font-bold flex-1 cursor-pointer"
                                                    title="Devolver depósito de garantía completo"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    Reembolsar
                                                </button>
                                                <button
                                                    onClick={() => handleOpenGuarantee(res, 'retenida')}
                                                    className="inline-flex items-center justify-center gap-1.5 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 px-3 rounded-xl transition-all font-bold flex-1 cursor-pointer"
                                                    title="Retener garantía por daños en la prenda"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Penalizar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-[#571e26]/70 font-semibold">
                            No hay registros de transacciones con los filtros seleccionados.
                        </div>
                    )}
                </div>

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    theme="light"
                />
            </div>

            {/* REGISTER PAYMENT MODAL */}
            {isPaymentModalOpen && selectedRes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <CreditCard size={18} className="text-[#94344c]" />
                                Registrar Pago
                            </h3>
                            <button
                                onClick={() => {
                                    setIsPaymentModalOpen(false);
                                    setSelectedRes(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit}>
                            <div className="p-6 space-y-5">
                                {/* Informational details */}
                                <div className="bg-[#290a0f]/20 border border-[#ffb6c5]/10 rounded-2xl p-4 text-xs space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[#d2a9b1]">Código Orden:</span>
                                        <span className="font-mono font-bold text-white">{selectedRes.order_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#d2a9b1]">Estudiante:</span>
                                        <span className="font-semibold text-white">{selectedRes.user?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#d2a9b1]">Monto Total de Orden:</span>
                                        <span className="font-extrabold text-[#ffb6c5]">S/ {Number(selectedRes.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Método de Pago <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={paymentForm.data.payment_method}
                                            onChange={e => paymentForm.setData('payment_method', e.target.value as any)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="yape">Yape</option>
                                            <option value="plin">Plin</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia Bancaria</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Guarantee Amount Input */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Monto de Garantía a Retener (S/) <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <input
                                            type="number"
                                            value={paymentForm.data.guarantee_amount}
                                            onChange={e => paymentForm.setData('guarantee_amount', Number(e.target.value))}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all font-semibold"
                                            placeholder="50"
                                            min="0"
                                            max={selectedRes.total_amount}
                                            required
                                        />
                                    </div>
                                    <span className="text-[10px] text-[#d2a9b1]/60 block mt-1">
                                        * Este monto se descontará del total cobrado al calcular los ingresos reales y quedará custodiado como garantía reembolsable.
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPaymentModalOpen(false);
                                        setSelectedRes(null);
                                    }}
                                    className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={paymentForm.processing}>
                                    <Check className="h-4 w-4" />
                                    <span>Confirmar Pago</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PROCESS GUARANTEE REFUND / PENALTY MODAL */}
            {isGuaranteeModalOpen && selectedRes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Coins size={18} className="text-[#94344c]" />
                                {guaranteeAction === 'devuelta' ? 'Reembolsar Garantía' : 'Penalizar / Retener Garantía'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsGuaranteeModalOpen(false);
                                    setSelectedRes(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className={`flex items-center gap-4 p-4 border rounded-2xl ${
                                guaranteeAction === 'devuelta'
                                    ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400'
                                    : 'bg-red-950/20 border-red-900/35 text-red-400 animate-pulse'
                            }`}>
                                {guaranteeAction === 'devuelta' ? (
                                    <ShieldCheck size={36} className="shrink-0" />
                                ) : (
                                    <AlertTriangle size={36} className="shrink-0" />
                                )}
                                <div>
                                    <p className="font-bold text-sm">
                                        {guaranteeAction === 'devuelta' ? 'Reembolso Completo' : 'Retención de Depósito'}
                                    </p>
                                    <p className="text-xs opacity-90">
                                        Monto de Garantía en juego: <strong>S/ {Number(selectedRes.guarantee_amount).toFixed(2)}</strong>.
                                    </p>
                                </div>
                            </div>
                            {selectedRes.refund_requested && (
                                <div className="bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-2xl p-4 text-xs space-y-2 text-[#d2a9b1]">
                                    <h4 className="font-extrabold text-[#ffb6c5] uppercase tracking-wider text-[10px]">Detalles del Reembolso Solicitado:</h4>
                                    <div className="flex justify-between">
                                        <span>Método de Pago:</span>
                                        <span className="font-bold text-white uppercase">{selectedRes.refund_method}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <span>Cuenta / Número de Celular:</span>
                                        <div className="bg-black/35 rounded-xl p-2.5 font-mono text-[#fdeaea] break-all border border-white/5 whitespace-pre-wrap">
                                            {selectedRes.refund_details}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-[#d2a9b1]">
                                {guaranteeAction === 'devuelta'
                                    ? `¿Estás seguro de que deseas reembolsar los S/ ${Number(selectedRes.guarantee_amount).toFixed(2)} al alumno ${selectedRes.user?.name}? Esto confirma que la prenda regresó limpia y en perfectas condiciones.`
                                    : `¿Estás seguro de que deseas retener la garantía por daños o retrasos del estudiante ${selectedRes.user?.name}? El monto quedará registrado como penalidad cobrada.`}
                            </p>
                        </div>

                        <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsGuaranteeModalOpen(false);
                                    setSelectedRes(null);
                                }}
                                className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuaranteeSubmit}
                                className={`font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg cursor-pointer flex items-center gap-2 ${
                                    guaranteeAction === 'devuelta'
                                        ? 'bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] shadow-[#94344c]/10'
                                        : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-900/40'
                                }`}
                            >
                                <Check className="h-4 w-4" />
                                <span>Confirmar Operación</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Payments.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
