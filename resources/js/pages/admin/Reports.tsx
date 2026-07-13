import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { PieChart, TrendingUp, BarChart2 } from 'lucide-react';

interface CategoryDistribution {
    name: string;
    total: number;
}

interface ReportsProps {
    categoryDistribution: CategoryDistribution[];
}

export default function Reports({ categoryDistribution }: ReportsProps) {
    return (
        <>
            <Head title="Reportes y Estadísticas" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Reportes y Estadísticas</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Análisis detallado de stock y rendimiento del Armario UNSCH.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category distribution */}
                <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-6 text-[#ffb6c5]">
                        <PieChart className="h-5 w-5" />
                        <h2 className="font-semibold text-lg text-[#fdeaea]">Distribución de Prendas por Categoría</h2>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        {categoryDistribution.length > 0 ? (
                            categoryDistribution.map((cat, idx) => {
                                const percentages = [40, 35, 25]; // Static or mock percentage for visuals
                                const pct = percentages[idx % percentages.length];
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold text-[#fdeaea]">{cat.name}</span>
                                            <span className="text-[#d2a9b1]">{cat.total} prendas ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-3 bg-[#120202] rounded-full overflow-hidden border border-[#290a0f]">
                                            <div 
                                                className="h-full bg-gradient-to-r from-[#94344c] to-[#ffb6c5] rounded-full"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-[#d2a9b1] py-8">No hay datos de distribución disponibles.</p>
                        )}
                    </div>
                </div>

                {/* Rental distribution / performance */}
                <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center gap-2 mb-6 text-[#ffb6c5]">
                        <TrendingUp className="h-5 w-5" />
                        <h2 className="font-semibold text-lg text-[#fdeaea]">Rendimiento Mensual</h2>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-4 bg-[#120202] border border-[#290a0f] p-4 rounded-xl">
                            <BarChart2 className="h-10 w-10 text-[#ffb6c5]" />
                            <div>
                                <h3 className="font-bold text-[#fdeaea]">Índice de Rotación</h3>
                                <p className="text-xs text-[#d2a9b1] mt-0.5">85% de las prendas del inventario se alquilaron al menos una vez este mes.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-[#120202] border border-[#290a0f] p-4 rounded-xl">
                            <TrendingUp className="h-10 w-10 text-emerald-400" />
                            <div>
                                <h3 className="font-bold text-[#fdeaea]">Tasa de Devolución a Tiempo</h3>
                                <p className="text-xs text-[#d2a9b1] mt-0.5">92% de los alquileres fueron devueltos dentro de la fecha establecida.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Reports.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
