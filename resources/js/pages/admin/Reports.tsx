import { Head } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Layers,
    Download,
    CheckCircle2,
    FileSpreadsheet,
    Award
} from 'lucide-react';
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface CategoryDistribution {
    name: string;
    total: number;
    percentage: number;
}

interface InventoryStatus {
    status: 'available' | 'maintenance' | 'rented' | 'damaged' | string;
    total: number;
}

interface PopularSize {
    size: string;
    total: number;
}

interface MonthlyEarning {
    month: string;
    rental_income: string | number;
    retained_guarantees: string | number;
    total_collected: string | number;
}

interface PaymentMethod {
    payment_method?: string;
    total: string | number;
    count: number;
}

interface TopStudent {
    name: string;
    email: string;
    total_rentals: number;
    total_spent: string | number;
}

interface Punctuality {
    total: number;
    on_time: number;
    overdue: number;
    on_time_percentage: number;
}

interface ReportsProps {
    categoryDistribution: CategoryDistribution[];
    inventoryStatus: InventoryStatus[];
    popularSizes: PopularSize[];
    monthlyEarnings: MonthlyEarning[];
    paymentMethods: PaymentMethod[];
    topStudents: TopStudent[];
    punctuality: Punctuality;
}

export default function Reports({
    categoryDistribution,
    inventoryStatus,
    popularSizes,
    monthlyEarnings,
    paymentMethods,
    topStudents,
    punctuality
}: ReportsProps) {
    const [activeTab, setActiveTab] = useState<'financial' | 'inventory' | 'students' | 'export'>('financial');

    // Total counts & calculations
    const totalRentalIncome = monthlyEarnings.reduce((sum, item) => sum + Number(item.rental_income), 0);
    const totalRetainedGuarantees = monthlyEarnings.reduce((sum, item) => sum + Number(item.retained_guarantees), 0);
    const totalCaja = totalRentalIncome + totalRetainedGuarantees;

    const totalInventories = inventoryStatus.reduce((sum, item) => sum + item.total, 0);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available': return 'Disponible';
            case 'maintenance': return 'En Lavandería';
            case 'rented': return 'Alquilado';
            case 'damaged': return 'Dañado / Fuera de servicio';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return '#10b981'; // Emerald
            case 'maintenance': return '#f59e0b'; // Amber
            case 'rented': return '#3b82f6'; // Blue
            case 'damaged': return '#ef4444'; // Red
            default: return '#6b7280';
        }
    };

    // CSV Downloader Utility
    const downloadCSV = (data: any[], filename: string, headers: string[]) => {
        // Build CSV Content
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(",")].concat(data.map(row => 
                Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
            )).join("\r\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportFinancialReport = () => {
        const data = monthlyEarnings.map(item => ({
            Mes: item.month,
            'Ingresos Alquiler (S/)': Number(item.rental_income).toFixed(2),
            'Garantías Retenidas (S/)': Number(item.retained_guarantees).toFixed(2),
            'Total Recaudado (S/)': Number(item.total_collected).toFixed(2)
        }));
        downloadCSV(data, 'Reporte_Financiero_Armario.csv', ['Mes', 'Ingresos Alquiler (S/)', 'Garantias Retenidas (S/)', 'Total Recaudado (S/)']);
    };

    const exportInventoryReport = () => {
        const data = categoryDistribution.map(cat => ({
            Categoría: cat.name,
            'Prendas Totales': cat.total,
            'Porcentaje (%)': cat.percentage + '%'
        }));
        downloadCSV(data, 'Reporte_Inventario_Categorias.csv', ['Categoria', 'Prendas Totales', 'Porcentaje (%)']);
    };

    const exportStudentsReport = () => {
        const data = topStudents.map(student => ({
            Estudiante: student.name,
            Correo: student.email,
            'Alquileres Totales': student.total_rentals,
            'Monto Invertido (S/)': Number(student.total_spent).toFixed(2)
        }));
        downloadCSV(data, 'Reporte_Estudiantes_Frecuentes.csv', ['Estudiante', 'Correo', 'Alquileres Totales', 'Monto Invertido (S/)']);
    };

    // Calculate chart height relative to max monthly income
    const maxEarnings = Math.max(...monthlyEarnings.map(m => Number(m.total_collected)), 1000);

    return (
        <>
            <Head title="Reportes y Estadísticas Avanzadas" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Caja & Estadísticas</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Informes ejecutivos y análisis contable del rendimiento general del Armario UNSCH.
                    </p>
                </div>
            </div>

            {/* Tab buttons */}
            <div className="flex border-b border-[#ebd7da] mb-8 overflow-x-auto gap-2">
                <button
                    onClick={() => setActiveTab('financial')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                        activeTab === 'financial'
                            ? 'border-[#94344c] text-[#94344c]'
                            : 'border-transparent text-[#8a3348]/60 hover:text-[#94344c]'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Finanzas & Caja
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                        activeTab === 'inventory'
                            ? 'border-[#94344c] text-[#94344c]'
                            : 'border-transparent text-[#8a3348]/60 hover:text-[#94344c]'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Inventario & Tallas
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('students')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                        activeTab === 'students'
                            ? 'border-[#94344c] text-[#94344c]'
                            : 'border-transparent text-[#8a3348]/60 hover:text-[#94344c]'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Estudiantes & Puntualidad
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('export')}
                    className={`pb-4 px-4 font-bold text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                        activeTab === 'export'
                            ? 'border-[#94344c] text-[#94344c]'
                            : 'border-transparent text-[#8a3348]/60 hover:text-[#94344c]'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </span>
                </button>
            </div>

            {/* TAB FINANCIAL */}
            {activeTab === 'financial' && (
                <div className="space-y-8">
                    {/* Financial KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-[#8a3348]/60 uppercase tracking-wider block">Ingresos por Alquiler</span>
                                <span className="text-2xl font-extrabold text-[#1a050a] mt-0.5 block">S/ {totalRentalIncome.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-[#8a3348]/60 uppercase tracking-wider block">Garantías Retenidas</span>
                                <span className="text-2xl font-extrabold text-[#1a050a] mt-0.5 block">S/ {totalRetainedGuarantees.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-[#8a3348]/60 uppercase tracking-wider block">Caja Total Acumulada</span>
                                <span className="text-2xl font-extrabold text-[#94344c] mt-0.5 block">S/ {totalCaja.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart Monthly Earnings */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Bar chart */}
                        <div className="lg:col-span-2 bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                            <h3 className="font-extrabold text-[#1a050a] text-sm mb-6 uppercase tracking-wider">Historial de Ingresos Mensuales</h3>
                            <div className="flex-1 w-full relative min-h-0">
                                {monthlyEarnings.length > 0 ? (
                                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                        {/* Grid lines */}
                                        <line x1="40" y1="20" x2="480" y2="20" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                                        <line x1="40" y1="70" x2="480" y2="70" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                                        <line x1="40" y1="120" x2="480" y2="120" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                                        <line x1="40" y1="160" x2="480" y2="160" stroke="#ebd7da" strokeWidth="1" />

                                        {/* Bar loop */}
                                        {monthlyEarnings.map((item, index) => {
                                            const total = Number(item.total_collected);
                                            const rental = Number(item.rental_income);
                                            const penalty = Number(item.retained_guarantees);

                                            // Heights
                                            const totalH = (total / maxEarnings) * 120;
                                            const rentalH = (rental / maxEarnings) * 120;
                                            const penaltyH = (penalty / maxEarnings) * 120;

                                            const barW = 30;
                                            const gap = (440 - (monthlyEarnings.length * barW)) / (monthlyEarnings.length + 1);
                                            const x = 40 + gap + index * (barW + gap);

                                            return (
                                                <g key={index}>
                                                    {/* Stacked Bar: Rental Income */}
                                                    <rect x={x} y={160 - rentalH} width={barW} height={rentalH} rx="2" fill="#94344c" />
                                                    {/* Stacked Bar: Retained Guarantee */}
                                                    {penaltyH > 0 && (
                                                        <rect x={x} y={160 - rentalH - penaltyH} width={barW} height={penaltyH} rx="2" fill="#f59e0b" />
                                                    )}
                                                    {/* Interactive Value Hover */}
                                                    <text x={x + 15} y={150 - totalH} fill="#1a050a" fontSize="8" fontWeight="extrabold" textAnchor="middle">
                                                        S/ {total.toFixed(0)}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-[#8a3348]/40">No hay datos suficientes para graficar</div>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-[#8a3348]/50 mt-1 pl-[45px] pr-[15px]">
                                {monthlyEarnings.map((item, idx) => (
                                    <span key={idx}>{item.month}</span>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                            <h3 className="font-extrabold text-[#1a050a] text-sm mb-6 uppercase tracking-wider">Métodos de Pago Preferidos</h3>
                            <div className="space-y-4 flex-1 overflow-y-auto">
                                {paymentMethods.length > 0 ? (
                                    paymentMethods.map((pm, idx) => {
                                        const totalAmount = Number(pm.total);
                                        const percent = totalCaja > 0 ? round((totalAmount / totalCaja) * 100) : 0;

                                        function round(num: number) {
                                            return Math.round(num * 10) / 10;
                                        }

                                        return (
                                            <div key={idx} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="capitalize text-[#1a050a]">{pm.payment_method || 'Desconocido'}</span>
                                                    <span className="text-[#8a3348] font-bold">S/ {totalAmount.toFixed(2)} ({percent}%)</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-[#fcf8f9] border border-[#ebd7da] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#94344c] to-[#ffb6c5] rounded-full"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-[#8a3348]/50 flex justify-between">
                                                    <span>Uso en caja</span>
                                                    <span>{pm.count} transacciones</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-center text-xs text-[#8a3348]/50 py-12">No hay transacciones registradas</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB INVENTORY */}
            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status of Physical items */}
                    <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                        <h3 className="font-extrabold text-[#1a050a] text-sm mb-6 uppercase tracking-wider">Estado del Inventario Físico</h3>
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f3e8ff" strokeWidth="4" />
                                    {/* Generate SVG segments dynamically */}
                                    {inventoryStatus.reduce((acc, item, index) => {
                                        const percentage = totalInventories > 0 ? (item.total / totalInventories) * 100 : 0;
                                        const offset = acc.currentOffset;
                                        acc.currentOffset += percentage;
                                        acc.segments.push(
                                            <circle
                                                key={index}
                                                cx="18" cy="18" r="15.91" fill="none"
                                                stroke={getStatusColor(item.status)}
                                                strokeWidth="4"
                                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                                strokeDashoffset={`-${offset}`}
                                            />
                                        );

                                        return acc;
                                    }, { segments: [] as React.ReactNode[], currentOffset: 0 }).segments}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-extrabold text-[#1a050a]">{totalInventories}</span>
                                    <span className="text-[10px] font-bold text-[#8a3348]/60 uppercase tracking-wider">Prendas</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs flex-grow">
                                {inventoryStatus.map((item, idx) => {
                                    const percent = totalInventories > 0 ? Math.round((item.total / totalInventories) * 100) : 0;

                                    return (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-[#8a3348]/80 font-medium">
                                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getStatusColor(item.status) }} />
                                                {getStatusLabel(item.status)}
                                            </span>
                                            <span className="font-bold text-[#1a050a]">{item.total} <span className="font-normal text-[#8a3348]/55">({percent}%)</span></span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Popular categories */}
                    <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                        <h3 className="font-extrabold text-[#1a050a] text-sm mb-6 uppercase tracking-wider">Catálogo por Categoría</h3>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                            {categoryDistribution.map((cat, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-[#1a050a]">{cat.name}</span>
                                        <span className="text-[#94344c] font-bold">{cat.total} prendas ({cat.percentage}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#fcf8f9] border border-[#ebd7da] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#94344c] rounded-full"
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular sizes */}
                    <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                        <h3 className="font-extrabold text-[#1a050a] text-sm mb-6 uppercase tracking-wider">Demanda por Talla</h3>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                            {popularSizes.map((size, idx) => {
                                const totalCount = popularSizes.reduce((s, item) => s + item.total, 0);
                                const percentage = totalCount > 0 ? Math.round((size.total / totalCount) * 100) : 0;

                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-[#1a050a] font-bold">Talla {size.size}</span>
                                            <span className="text-[#8a3348]">{size.total} reservas ({percentage}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#fcf8f9] border border-[#ebd7da] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB STUDENTS */}
            {activeTab === 'students' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Students */}
                    <div className="lg:col-span-2 bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px]">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="h-5 w-5 text-amber-500" />
                            <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Clientes Frecuentes (Top 5 Estudiantes)</h3>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-[#ebd7da] text-[#8a3348]/70 uppercase tracking-wider">
                                        <th className="py-3 font-bold">Estudiante</th>
                                        <th className="py-3 font-bold text-center">Alquileres</th>
                                        <th className="py-3 font-bold text-right">Inversión Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#fcf8f9]">
                                    {topStudents.map((student, idx) => (
                                        <tr key={idx} className="hover:bg-[#fcf8f9]/40">
                                            <td className="py-3">
                                                <div className="font-bold text-[#1a050a]">{student.name}</div>
                                                <div className="text-[10px] text-[#8a3348]/60">{student.email}</div>
                                            </td>
                                            <td className="py-3 text-center font-semibold text-[#1a050a]">{student.total_rentals} veces</td>
                                            <td className="py-3 text-right font-extrabold text-[#94344c]">S/ {Number(student.total_spent).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="block sm:hidden divide-y divide-[#fcf8f9] text-xs">
                            {topStudents.map((student, idx) => (
                                <div key={idx} className="py-3 flex justify-between items-center hover:bg-[#fcf8f9]/40">
                                    <div>
                                        <div className="font-bold text-[#1a050a]">{student.name}</div>
                                        <div className="text-[10px] text-[#8a3348]/60 mt-0.5">{student.email}</div>
                                        <div className="text-[10px] text-stone-500 font-bold mt-1 uppercase tracking-wider">{student.total_rentals} alquileres</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">Inversión</span>
                                        <span className="font-black text-[#94344c]">S/ {Number(student.total_spent).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Punctuality Indicator */}
                    <div className="bg-white border border-[#ebd7da] p-6 rounded-3xl shadow-sm flex flex-col h-[380px] justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[#94344c]">
                                <CheckCircle2 className="h-5 w-5" />
                                <h3 className="font-extrabold text-[#1a050a] text-sm uppercase tracking-wider">Tasa de Devolución</h3>
                            </div>
                            <p className="text-xs text-[#8a3348]/70 leading-relaxed">
                                Evalúa la puntualidad y comportamiento de los estudiantes al momento de retornar las prendas de vestir a los percheros del Armario.
                            </p>
                        </div>

                        {/* Circular ring indicator */}
                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f3e8ff" strokeWidth="3.5" />
                                    <circle
                                        cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3.5"
                                        strokeDasharray={`${punctuality.on_time_percentage} ${100 - punctuality.on_time_percentage}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-extrabold text-[#10b981]">{punctuality.on_time_percentage}%</span>
                                    <span className="text-[9px] font-bold text-[#8a3348]/60 uppercase">A tiempo</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#fcf8f9] border border-[#ebd7da] p-3 rounded-2xl text-[11px] space-y-1 text-[#8a3348]/85">
                            <div className="flex justify-between">
                                <span>Devoluciones Exitosas:</span>
                                <span className="font-bold text-[#1a050a]">{punctuality.on_time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Alquileres Retrasados:</span>
                                <span className="font-bold text-red-500">{punctuality.overdue}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB EXPORT */}
            {activeTab === 'export' && (
                <div className="bg-white border border-[#ebd7da] p-8 rounded-3xl shadow-sm">
                    <h3 className="font-extrabold text-[#1a050a] text-base mb-2 uppercase tracking-wider">Centro de Descarga de Datos</h3>
                    <p className="text-xs text-[#8a3348]/70 mb-8 leading-relaxed">
                        Exporte de forma instantánea archivos CSV compatibles con Microsoft Excel y Google Sheets. Esto le permitirá llevar un control externo y realizar auditorías financieras o de stock.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Box 1 */}
                        <div className="border border-[#ebd7da] bg-[#fcf8f9]/50 p-6 rounded-2xl flex flex-col justify-between h-[180px]">
                            <div className="space-y-2">
                                <div className="p-2 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <h4 className="font-extrabold text-[#1a050a] text-sm">Flujo de Caja Mensual</h4>
                                <p className="text-[10px] text-[#8a3348]/60">Historial completo de ingresos y garantías cobradas por mes.</p>
                            </div>
                            <button
                                onClick={exportFinancialReport}
                                className="w-full py-2 bg-[#94344c] hover:bg-[#a63f57] text-white font-bold text-xs rounded-xl shadow-md shadow-[#94344c]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Descargar Reporte
                            </button>
                        </div>

                        {/* Box 2 */}
                        <div className="border border-[#ebd7da] bg-[#fcf8f9]/50 p-6 rounded-2xl flex flex-col justify-between h-[180px]">
                            <div className="space-y-2">
                                <div className="p-2 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <h4 className="font-extrabold text-[#1a050a] text-sm">Inventario & Categorías</h4>
                                <p className="text-[10px] text-[#8a3348]/60">Distribución física de prendas en stock por categorías.</p>
                            </div>
                            <button
                                onClick={exportInventoryReport}
                                className="w-full py-2 bg-[#94344c] hover:bg-[#a63f57] text-white font-bold text-xs rounded-xl shadow-md shadow-[#94344c]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Descargar Reporte
                            </button>
                        </div>

                        {/* Box 3 */}
                        <div className="border border-[#ebd7da] bg-[#fcf8f9]/50 p-6 rounded-2xl flex flex-col justify-between h-[180px]">
                            <div className="space-y-2">
                                <div className="p-2 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h4 className="font-extrabold text-[#1a050a] text-sm">Estudiantes Recurrentes</h4>
                                <p className="text-[10px] text-[#8a3348]/60">Ranking de alumnos con mayor número de alquileres.</p>
                            </div>
                            <button
                                onClick={exportStudentsReport}
                                className="w-full py-2 bg-[#94344c] hover:bg-[#a63f57] text-white font-bold text-xs rounded-xl shadow-md shadow-[#94344c]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Descargar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Reports.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
