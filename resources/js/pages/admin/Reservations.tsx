import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Calendar, Tag, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Reservation {
    id: number;
    order_number: string;
    start_date: string;
    end_date: string;
    total_amount: string | number;
    status: 'pendiente' | 'confirmada' | 'preparando' | 'entregada' | 'en_uso' | 'devuelta' | 'rechazada';
    user?: {
        name: string;
        email: string;
    };
    items?: Array<{
        id: number;
        price_at_time: string | number;
        subtotal: string | number;
        color?: string;
        product?: {
            name: string;
            image_url?: string;
        };
        inventory?: {
            size: string;
            sku: string;
        };
    }>;
}

interface ReservationsProps {
    reservations: Reservation[];
}

export default function Reservations({ reservations }: ReservationsProps) {
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    const handleManage = (res: Reservation) => {
        setSelectedReservation(res);
        setNewStatus(res.status);
        setDialogOpen(true);
    };

    const handleStatusUpdate = () => {
        if (selectedReservation) {
            router.put(`/admin/reservas/${selectedReservation.id}/status`, {
                status: newStatus
            }, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setSelectedReservation(null);
                }
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-900/30">
                        🟡 Pendiente
                    </span>
                );
            case 'confirmada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-900/30">
                        🔵 Confirmada
                    </span>
                );
            case 'preparando':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-400 border border-purple-900/30">
                        🟣 Preparando
                    </span>
                );
            case 'entregada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-900/30">
                        🟢 Entregada
                    </span>
                );
            case 'en_uso':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-950/80 text-orange-400 border border-orange-900/30">
                        🟠 En Uso
                    </span>
                );
            case 'devuelta':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-400 border border-teal-900/30">
                        🔴 Devuelta
                    </span>
                );
            case 'rechazada':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-900/30">
                        🔥 Rechazada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-gray-400">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Administrar Reservas" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Reservas de Prendas</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Historial completo de solicitudes, alquileres activos y devoluciones de alumnos.
                    </p>
                </div>
            </div>

            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#290a0f] text-[#d2a9b1] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Código</th>
                                <th className="px-6 py-4 font-semibold">Estudiante / Cliente</th>
                                <th className="px-6 py-4 font-semibold">Fechas</th>
                                <th className="px-6 py-4 font-semibold text-right">Total</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#290a0f] text-sm">
                            {reservations.length > 0 ? (
                                reservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-[#290a0f]/20 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-[#ffb6c5]">
                                            {res.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#fdeaea]">{res.user?.name}</div>
                                            <div className="text-xs text-[#d2a9b1]">{res.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>Inicio: <span className="font-medium text-[#fdeaea]">{res.start_date}</span></div>
                                            <div className="mt-0.5">Fin: <span className="font-medium text-[#fdeaea]">{res.end_date}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-[#fdeaea]">
                                            S/ {Number(res.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(res.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleManage(res)}
                                                    className="text-xs bg-[#571e26]/30 hover:bg-[#571e26] text-[#ffb6c5] border border-[#ffb6c5]/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                                >
                                                    Gestionar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-[#d2a9b1]">
                                        No hay reservas registradas en el sistema.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manage Reservation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-[#1c050a] border border-[#290a0f] text-[#fdeaea] rounded-3xl max-w-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#ffb6c5] flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#ffb6c5]" />
                            Gestionar Reserva
                        </DialogTitle>
                        <DialogDescription className="text-[#d2a9b1] text-sm mt-2">
                            Actualice el estado de la orden de reserva <strong>{selectedReservation?.order_number}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Info cards */}
                        <div className="bg-[#120204]/60 border border-[#290a0f] rounded-2xl p-4 text-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[#d2a9b1]">Estudiante:</span>
                                <span className="font-semibold text-white">{selectedReservation?.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#d2a9b1]">Correo:</span>
                                <span className="font-semibold text-white">{selectedReservation?.user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#d2a9b1]">Fechas:</span>
                                <span className="font-semibold text-white">
                                    {selectedReservation?.start_date} al {selectedReservation?.end_date}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#d2a9b1]">Total a pagar:</span>
                                <span className="font-bold text-[#ffb6c5]">S/ {Number(selectedReservation?.total_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Reserved items */}
                        <div className="space-y-2 mt-4">
                            <span className="block text-xs font-semibold text-[#ffb6c5] uppercase tracking-wider">
                                Prendas Reservadas
                            </span>
                            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                                {selectedReservation?.items?.map((item: any) => (
                                    <div key={item.id} className="bg-[#120204]/40 border border-[#290a0f] rounded-2xl p-3 flex gap-3 text-xs items-center">
                                        {item.product?.image_url ? (
                                            <img src={item.product.image_url} alt="" className="w-10 h-14 object-cover rounded bg-[#120204]" />
                                        ) : (
                                            <div className="w-10 h-14 bg-neutral-800 rounded flex items-center justify-center text-[#ffb6c5]">
                                                👗
                                            </div>
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <p className="font-bold text-white truncate">{item.product?.name}</p>
                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-white/60 mt-1">
                                                <span>Talla: <span className="font-semibold text-[#ffb6c5]">{item.inventory?.size || 'N/A'}</span></span>
                                                {item.color && (
                                                    <>
                                                        <span>|</span>
                                                        <span>Color: <span className="font-semibold text-[#ffb6c5]">{item.color}</span></span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-white/40 mt-1 font-mono text-[9px]">{item.inventory?.sku}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Select */}
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-[#ffb6c5] uppercase tracking-wider">
                                Estado de la Reserva
                            </label>
                            <div className="relative">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="bg-[#120204] border border-[#290a0f] rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-[#ffb6c5] transition-all text-sm appearance-none cursor-pointer pr-10"
                                >
                                    <option value="pendiente">🟡 Pendiente</option>
                                    <option value="confirmada">🔵 Confirmada</option>
                                    <option value="preparando">🟣 Preparando</option>
                                    <option value="entregada">🟢 Entregada</option>
                                    <option value="en_uso">🟠 En Uso</option>
                                    <option value="devuelta">🔴 Devuelta</option>
                                    <option value="rechazada">🔥 Rechazada</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ffb6c5] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-[#290a0f]/40">
                        <button
                            type="button"
                            onClick={() => setDialogOpen(false)}
                            className="border border-[#ffb6c5]/40 hover:border-[#ffb6c5] text-[#ffb6c5] font-semibold rounded-full py-2 px-5 transition-all text-xs tracking-wider cursor-pointer"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="button"
                            onClick={handleStatusUpdate}
                            className="bg-[#ffb6c5] hover:bg-[#ffa3b6] text-[#120202] font-bold rounded-full py-2 px-5 transition-all shadow-lg shadow-[#ffb6c5]/15 text-xs tracking-wider cursor-pointer"
                        >
                            GUARDAR
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Reservations.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
