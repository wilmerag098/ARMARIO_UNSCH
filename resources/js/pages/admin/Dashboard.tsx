import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    Calendar, 
    TrendingUp, 
    AlertTriangle, 
    ShoppingBag, 
    Download, 
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ComponentType<any>;
    trendType?: 'up' | 'warning' | 'normal';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, trendType = 'normal' }) => {
    let cardBorder = 'border-[#290a0f]';
    let iconBg = 'bg-[#290a0f]/40 text-[#ffb6c5]';
    let subtextColor = 'text-[#d2a9b1]';

    if (trendType === 'warning') {
        cardBorder = 'border-red-900/40 hover:border-red-800/60 shadow-lg shadow-red-950/10';
        iconBg = 'bg-red-950/50 text-red-400 border border-red-900/30';
        subtextColor = 'text-red-300';
    } else if (trendType === 'up') {
        iconBg = 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30';
    }

    return (
        <div className={`bg-[#1c050a] border ${cardBorder} rounded-2xl p-6 transition-all duration-300 hover:border-[#94344c]/40 hover:shadow-xl hover:shadow-[#1c050a]/40 flex flex-col justify-between min-h-[150px]`}>
            <div className="flex items-start justify-between w-full">
                <span className="text-xs font-semibold text-[#d2a9b1] uppercase tracking-wider">
                    {title}
                </span>
                <div className={`p-2.5 rounded-xl ${iconBg}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-[#fdeaea]">
                    {value}
                </span>
                <div className="flex items-center gap-1 mt-2">
                    {trendType === 'up' && (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    )}
                    {trendType === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-xs ${subtextColor}`}>
                        {subtext}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
    metrics: {
        totalReservations: number;
        totalEarnings: string | number;
        overdueReturns: number;
        activeRentals: number;
    };
    recentReservations: Array<{
        id: number;
        order_number: string;
        start_date: string;
        end_date: string;
        total_amount: string | number;
        status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
        user?: {
            name: string;
            email: string;
        };
        items?: Array<{
            product?: {
                name: string;
            }
        }>;
    }>;
    reservationsChart: Array<{ name: string; reservas: number }>;
    earningsChart: Array<{ name: string; ingresos: number }>;
}

export default function Dashboard({ metrics, recentReservations, reservationsChart, earningsChart }: DashboardProps) {
    const formattedEarnings = Number(metrics.totalEarnings).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Helper to get status badge classes
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-900/30">
                        Completado
                    </span>
                );
            case 'confirmed':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-900/30">
                        En Alquiler
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-400 border border-amber-900/30">
                        Pendiente
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-950/80 text-red-400 border border-red-900/30">
                        Cancelado
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
            <Head title="Consola de Administración" />
            
            {/* Header / Welcoming */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#fdeaea]">
                        Vista General
                    </h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Bienvenido de nuevo. Estos son los últimos datos de Armario UNSCH.
                    </p>
                </div>
                <button className="bg-[#ffb6c5] hover:bg-[#ffa3b6] text-[#120202] font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#ffb6c5]/10 shrink-0">
                    <Download className="h-4.5 w-4.5" />
                    <span>EXPORTAR REPORTE</span>
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total de Reservas"
                    value={metrics.totalReservations > 0 ? metrics.totalReservations.toLocaleString('es-PE') : "0"}
                    subtext="+12% vs el mes pasado"
                    icon={Calendar}
                    trendType="up"
                />
                <MetricCard
                    title="Ingresos"
                    value={`S/ ${formattedEarnings}`}
                    subtext="+8% vs el mes pasado"
                    icon={TrendingUp}
                    trendType="up"
                />
                <MetricCard
                    title="Devoluciones Atrasadas"
                    value={metrics.overdueReturns}
                    subtext="Requiere atención inmediata"
                    icon={AlertTriangle}
                    trendType={metrics.overdueReturns > 0 ? "warning" : "normal"}
                />
                <MetricCard
                    title="Alquileres Activos"
                    value={metrics.activeRentals}
                    subtext="Actualmente en uso"
                    icon={ShoppingBag}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart 1: Reservas en el tiempo */}
                <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl p-6 flex flex-col h-[380px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold text-[#d2a9b1] uppercase tracking-wider">
                            Reservas en el tiempo
                        </h2>
                        <button className="text-[#d2a9b1] hover:text-[#fdeaea] p-1.5 rounded-lg hover:bg-[#290a0f]/40">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                    {/* SVG Line/Bar Chart (Fiel a la imagen) */}
                    <div className="flex-1 w-full relative min-h-0">
                        <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="180" x2="500" y2="180" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="60" x2="500" y2="60" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />
                            
                            {/* Bars in background (like in screenshot) */}
                            <rect x="35" y="150" width="30" height="30" rx="3" fill="#571e26" fillOpacity="0.4" />
                            <rect x="105" y="130" width="30" height="50" rx="3" fill="#571e26" fillOpacity="0.4" />
                            <rect x="175" y="110" width="30" height="70" rx="3" fill="#571e26" fillOpacity="0.4" />
                            <rect x="245" y="80" width="30" height="100" rx="3" fill="#94344c" fillOpacity="0.6" />
                            <rect x="315" y="120" width="30" height="60" rx="3" fill="#571e26" fillOpacity="0.4" />
                            <rect x="385" y="95" width="30" height="85" rx="3" fill="#571e26" fillOpacity="0.4" />
                            <rect x="455" y="65" width="30" height="115" rx="3" fill="#571e26" fillOpacity="0.4" />

                            {/* Gradient Area under line */}
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffb6c5" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#94344c" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            <path 
                                d="M 50 160 Q 120 170 190 120 T 260 145 T 380 50 T 470 110 L 470 180 L 50 180 Z" 
                                fill="url(#lineGrad)" 
                            />

                            {/* Fluid Line */}
                            <path 
                                d="M 50 160 Q 120 170 190 120 T 260 145 T 380 50 T 470 110" 
                                fill="none" 
                                stroke="#ffb6c5" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                            />

                            {/* "Pico" marker */}
                            <circle cx="260" cy="145" r="5" fill="#ffb6c5" />
                            <g transform="translate(235, 115)">
                                <rect x="0" y="0" width="45" height="20" rx="4" fill="#ffb6c5" />
                                <text x="22.5" y="14" fill="#120202" fontSize="9" fontWeight="bold" textAnchor="middle">Pico</text>
                            </g>
                        </svg>

                        {/* Chart Labels */}
                        <div className="flex justify-between text-[11px] text-[#d2a9b1] mt-2 px-6">
                            {reservationsChart.map((c, i) => (
                                <span key={i}>{c.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart 2: Crecimiento de ingresos */}
                <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl p-6 flex flex-col h-[380px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold text-[#d2a9b1] uppercase tracking-wider">
                            Crecimiento de Ingresos
                        </h2>
                        <button className="text-[#d2a9b1] hover:text-[#fdeaea] p-1.5 rounded-lg hover:bg-[#290a0f]/40">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                    {/* SVG Bar Chart with highlights (Fiel a la imagen) */}
                    <div className="flex-1 w-full relative min-h-0">
                        <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="0" y1="180" x2="500" y2="180" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="60" x2="500" y2="60" stroke="#290a0f" strokeWidth="1" strokeDasharray="3 3" />

                            {/* Bar Chart Columns */}
                            {/* Bar 1 */}
                            <rect x="50" y="120" width="35" height="60" rx="4" fill="#571e26" fillOpacity="0.7" />
                            {/* Bar 2 */}
                            <rect x="130" y="90" width="35" height="90" rx="4" fill="#94344c" fillOpacity="0.7" />
                            {/* Bar 3 */}
                            <rect x="210" y="70" width="35" height="110" rx="4" fill="#94344c" fillOpacity="0.7" />
                            {/* Bar 4 */}
                            <rect x="290" y="100" width="35" height="80" rx="4" fill="#571e26" fillOpacity="0.7" />
                            {/* Bar 5 */}
                            <rect x="370" y="60" width="35" height="120" rx="4" fill="#94344c" fillOpacity="0.7" />
                            {/* Bar 6 Highlighted (like in screenshot Q4) */}
                            <rect x="450" y="30" width="35" height="150" rx="4" fill="#ffb6c5" />

                            {/* Q4 Badge over the highlighted bar */}
                            <g transform="translate(450, 5)">
                                <rect x="0" y="0" width="35" height="18" rx="4" fill="#ffb6c5" />
                                <text x="17.5" y="12" fill="#120202" fontSize="9" fontWeight="bold" textAnchor="middle">Q4</text>
                            </g>
                        </svg>

                        {/* Chart Labels */}
                        <div className="flex justify-between text-[11px] text-[#d2a9b1] mt-2 px-8">
                            {earningsChart.map((c, i) => (
                                <span key={i}>{c.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Table Section: Reservas Recientes */}
            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-[#290a0f] flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#d2a9b1] uppercase tracking-wider">
                        Reservas Recientes
                    </h2>
                    <Link 
                        href="/admin/reservas" 
                        className="text-[#ffb6c5] hover:text-[#ffa3b6] text-xs font-semibold hover:underline flex items-center gap-1 transition-all"
                    >
                        Ver Todo
                    </Link>
                </div>
                
                {/* Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#290a0f] text-[#d2a9b1] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Código</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Fechas</th>
                                <th className="px-6 py-4 font-semibold text-right">Monto</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#290a0f] text-sm">
                            {recentReservations.length > 0 ? (
                                recentReservations.map((reservation) => (
                                    <tr key={reservation.id} className="hover:bg-[#290a0f]/20 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-[#ffb6c5]">
                                            {reservation.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#fdeaea]">
                                                {reservation.user?.name || 'Cliente'}
                                            </div>
                                            <div className="text-xs text-[#d2a9b1]">
                                                {reservation.user?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div>Desde: <span className="text-[#fdeaea] font-medium">{reservation.start_date}</span></div>
                                            <div className="mt-0.5">Hasta: <span className="text-[#fdeaea] font-medium">{reservation.end_date}</span></div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-[#fdeaea]">
                                            S/ {Number(reservation.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(reservation.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/admin/reservas`}
                                                className="text-xs bg-[#571e26]/50 hover:bg-[#571e26] text-[#ffb6c5] border border-[#ffb6c5]/20 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-[#d2a9b1]">
                                        No hay reservas registradas.
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

// Assign AdminLayout layout wrapper to Dashboard
Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
