import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface InventoryItem {
    id: number;
    size: string;
    sku: string;
    status: 'available' | 'maintenance' | 'rented';
    product?: {
        name: string;
    };
}

interface InventoryProps {
    inventories: InventoryItem[];
}

export default function Inventory({ inventories }: InventoryProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-900/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Disponible
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-900/30">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Mantenimiento
                    </span>
                );
            case 'rented':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-900/30">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Alquilado
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-400">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Administrar Inventario" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Inventario físico</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Control individual de las unidades físicas por talla, SKU y estado.
                    </p>
                </div>
                <button className="bg-[#ffb6c5] hover:bg-[#ffa3b6] text-[#120202] font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#ffb6c5]/10 shrink-0">
                    <Plus className="h-5 w-5" />
                    <span>AGREGAR ITEM</span>
                </button>
            </div>

            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#290a0f] text-[#d2a9b1] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">SKU</th>
                                <th className="px-6 py-4 font-semibold">Producto</th>
                                <th className="px-6 py-4 font-semibold text-center">Talla</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#290a0f] text-sm">
                            {inventories.length > 0 ? (
                                inventories.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#290a0f]/20 transition-colors">
                                        <td className="px-6 py-4 font-mono font-semibold text-[#ffb6c5]">
                                            {item.sku}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-[#fdeaea]">
                                            {item.product?.name || 'Producto Desconocido'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-[#fdeaea]">
                                            {item.size}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-xs bg-[#571e26]/30 hover:bg-[#571e26] text-[#ffb6c5] border border-[#ffb6c5]/10 px-3 py-1.5 rounded-lg transition-all">
                                                Modificar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#d2a9b1]">
                                        No hay unidades registradas en inventario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Inventory.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
