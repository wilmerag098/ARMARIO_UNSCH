import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    TrendingUp,
    AlertTriangle,
    ShoppingBag,
    Users,
    Shirt,
    Plus,
    CreditCard,
    Check,
    Info,
    UserPlus,
    ChevronDown
} from 'lucide-react';
import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ComponentType<any>;
    iconBgColor: string;
    iconColor: string;
    trend?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, iconBgColor, iconColor, trend }) => {
    return (
        <div className="bg-white border border-[#ebd7da] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between min-h-[120px]">
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${iconBgColor} ${iconColor} shrink-0`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <span className="text-[11px] font-bold text-[#8a3348]/60 uppercase tracking-wider block">
                        {title}
                    </span>
                    <span className="text-2xl font-extrabold text-[#1a050a] mt-1 block">
                        {value}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-[#8a3348]/70">
                        {trend !== undefined && (
                            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                                <TrendingUp className="h-3 w-3" />
                                {trend > 0 ? `↑ ${trend}%` : `${trend}%`}
                            </span>
                        )}
                        <span>{subtext}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DashboardProps {
    metrics: {
        totalReservations: number;
        totalEarnings: string | number;
        totalProducts: number;
        totalUsers: number;
        trends: {
            reservations: number;
            earnings: number;
            users: number;
        };
    };
    recentReservations: Array<{
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
            product?: {
                name: string;
                image_url?: string;
            }
        }>;
    }>;
    topProducts: Array<{
        id: number;
        name: string;
        image_url?: string;
        rentals_count: number;
    }>;
    reservationsByStatus: {
        pendiente: number;
        confirmada: number;
        preparando: number;
        entregada: number;
        en_uso: number;
        devuelta: number;
        rechazada: number;
    };
    dailyEarnings: Array<{ name: string; ingresos: number }>;
    alerts: Array<{
        type: 'warning' | 'info' | 'success' | 'user';
        title: string;
        description: string;
        time: string;
    }>;
}

export default function Dashboard({
    metrics,
    recentReservations,
    topProducts,
    reservationsByStatus,
    dailyEarnings,
    alerts
}: DashboardProps) {
    const formattedEarnings = Number(metrics.totalEarnings).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'entregada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Entregado
                    </span>
                );
            case 'en_uso':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        En camino
                    </span>
                );
            case 'confirmada':
            case 'preparando':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                        Reservado
                    </span>
                );
            case 'pendiente':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        Pendiente
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {status}
                    </span>
                );
        }
    };

    // Doughnut chart calculation
    const totalStatusCount = Object.values(reservationsByStatus).reduce((a, b) => a + b, 0);
    const deliveredCount = (reservationsByStatus.devuelta || 0) + (reservationsByStatus.entregada || 0);
    const inUseCount = reservationsByStatus.en_uso || 0;
    const reservedCount = (reservationsByStatus.confirmada || 0) + (reservationsByStatus.preparando || 0);
    const pendingCount = reservationsByStatus.pendiente || 0;

    const delPercent = totalStatusCount > 0 ? round((deliveredCount / totalStatusCount) * 100) : 34.1;
    const usePercent = totalStatusCount > 0 ? round((inUseCount / totalStatusCount) * 100) : 21.2;
    const resPercent = totalStatusCount > 0 ? round((reservedCount / totalStatusCount) * 100) : 24.2;
    const penPercent = totalStatusCount > 0 ? round((pendingCount / totalStatusCount) * 100) : 20.5;

    function round(num: number) {
        return Math.round(num * 10) / 10;
    }

    // SVG coordinates calculator for main line chart
    const maxEarnings = Math.max(...dailyEarnings.map(d => d.ingresos), 1000);
    const yMax = Math.ceil(maxEarnings / 5000) * 5000; // Round up to nearest 5k

    const chartPoints = dailyEarnings.map((d, index) => {
        const x = 50 + (index * 70); // 7 points spread across 500px width
        const y = 180 - (d.ingresos / yMax * 140); // Max height 140px, bottom at 180px

        return { x, y };
    });

    const linePath = chartPoints.reduce((path, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');

    const areaPath = chartPoints.length > 0 
        ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} 180 L ${chartPoints[0].x} 180 Z` 
        : '';

    return (
        <>
            <Head title="Panel de Administración - Armario UNSCH" />

            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Ingresos Totales"
                    value={`S/ ${formattedEarnings}`}
                    subtext="vs semana anterior"
                    trend={metrics.trends.earnings}
                    icon={ShoppingBag}
                    iconBgColor="bg-[#f3e8ff]"
                    iconColor="text-purple-600"
                />
                <MetricCard
                    title="Alquileres"
                    value={metrics.totalReservations}
                    subtext="vs semana anterior"
                    trend={metrics.trends.reservations}
                    icon={ShoppingBag}
                    iconBgColor="bg-amber-100"
                    iconColor="text-amber-600"
                />
                <MetricCard
                    title="Clientes Nuevos"
                    value={metrics.totalUsers}
                    subtext="vs semana anterior"
                    trend={metrics.trends.users}
                    icon={Users}
                    iconBgColor="bg-emerald-100"
                    iconColor="text-emerald-600"
                />
                <MetricCard
                    title="Productos"
                    value={metrics.totalProducts}
                    subtext="En catálogo"
                    icon={Shirt}
                    iconBgColor="bg-rose-100"
                    iconColor="text-rose-600"
                />
            </div>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Ingresos por Semana Line Chart */}
                <div className="lg:col-span-6 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[400px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-[#1a050a]">
                            Ingresos por semana
                        </h2>
                        <div className="relative">
                            <select className="bg-[#fcf8f9] border border-[#ebd7da] rounded-xl text-xs font-semibold px-3 py-1.5 pr-8 appearance-none focus:outline-none cursor-pointer">
                                <option>Esta semana</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a3348]/60 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex-1 w-full relative min-h-0">
                        <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="40" y1="30" x2="480" y2="30" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="40" y1="65" x2="480" y2="65" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="40" y1="100" x2="480" y2="100" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="40" y1="135" x2="480" y2="135" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="40" y1="170" x2="480" y2="170" stroke="#f3e8ff" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="40" y1="180" x2="480" y2="180" stroke="#ebd7da" strokeWidth="1" />

                            {/* Y-Axis Labels */}
                            <text x="35" y="34" fill="#8a3348" fillOpacity="0.6" fontSize="9" textAnchor="end">S/ {(yMax/1000).toFixed(0)}k</text>
                            <text x="35" y="74" fill="#8a3348" fillOpacity="0.6" fontSize="9" textAnchor="end">S/ {(yMax * 4/6/1000).toFixed(0)}k</text>
                            <text x="35" y="114" fill="#8a3348" fillOpacity="0.6" fontSize="9" textAnchor="end">S/ {(yMax * 3/6/1000).toFixed(0)}k</text>
                            <text x="35" y="154" fill="#8a3348" fillOpacity="0.6" fontSize="9" textAnchor="end">S/ {(yMax * 1/6/1000).toFixed(0)}k</text>
                            <text x="35" y="184" fill="#8a3348" fillOpacity="0.6" fontSize="9" textAnchor="end">S/ 0</text>

                            {/* Gradient Area under line */}
                            <defs>
                                <linearGradient id="yellowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {areaPath && <path d={areaPath} fill="url(#yellowAreaGrad)" />}

                            {/* Line path */}
                            {linePath && (
                                <path 
                                    d={linePath} 
                                    fill="none" 
                                    stroke="#f59e0b" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                />
                            )}

                            {/* Nodes */}
                            {chartPoints.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
                                    {/* Tooltip on the last node (like peak) */}
                                    {i === chartPoints.length - 1 && (
                                        <g transform={`translate(${p.x - 30}, ${p.y - 25})`}>
                                            <rect x="0" y="0" width="60" height="18" rx="4" fill="#1a050a" />
                                            <text x="30" y="12" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                                                S/ {dailyEarnings[i].ingresos.toFixed(0)}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            ))}
                        </svg>

                        {/* X-Axis labels */}
                        <div className="flex justify-between text-[10px] font-semibold text-[#8a3348]/60 mt-1 pl-[45px] pr-[15px]">
                            {dailyEarnings.map((d, index) => (
                                <span key={index}>{d.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alquileres Recientes */}
                <div className="lg:col-span-3 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[400px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-[#1a050a]">
                            Alquileres recientes
                        </h2>
                        <Link href="/admin/reservas" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                            Ver todos
                        </Link>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {recentReservations.length > 0 ? (
                            recentReservations.map((res) => {
                                const mainItem = res.items?.[0];

                                return (
                                    <div key={res.id} className="flex items-center justify-between gap-3 text-xs border-b border-[#fcf8f9] pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <img
                                                src={mainItem?.product?.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800'}
                                                alt=""
                                                className="w-10 h-10 object-cover rounded-xl shrink-0 bg-[#290a0f]"
                                            />
                                            <div className="min-w-0">
                                                <p className="font-mono text-[10px] font-bold text-[#8a3348]">{res.order_number}</p>
                                                <p className="font-extrabold text-[#1a050a] truncate">{mainItem?.product?.name || 'Prenda'}</p>
                                                <p className="text-[10px] text-[#8a3348]/60 truncate">{res.user?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] text-[#8a3348]/60 block mb-1">
                                                {res.start_date.split('-')[2]}/{res.start_date.split('-')[1]}
                                            </span>
                                            {getStatusBadge(res.status)}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-[#8a3348]/50 text-center py-10">No hay reservas recientes</p>
                        )}
                    </div>
                </div>

                {/* Productos Más Alquilados */}
                <div className="lg:col-span-3 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[400px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-[#1a050a]">
                            Productos más alquilados
                        </h2>
                        <Link href="/admin/productos" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                            Ver todos
                        </Link>
                    </div>

                    <div className="flex-1 space-y-3.5 overflow-y-auto">
                        {topProducts.map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                        src={p.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800'}
                                        alt=""
                                        className="w-10 h-10 object-cover rounded-xl shrink-0 bg-[#290a0f]"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-extrabold text-[#1a050a] truncate">{p.name}</p>
                                        <p className="text-[10px] text-[#8a3348]/60 mt-0.5">{p.rentals_count} alquileres</p>
                                    </div>
                                </div>
                                <span className="h-6 w-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                                    {idx + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Alquileres por Estado Doughnut */}
                <div className="lg:col-span-4 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[300px] shadow-sm">
                    <h2 className="text-base font-extrabold text-[#1a050a] mb-5">
                        Alquileres por estado
                    </h2>
                    <div className="flex items-center justify-between gap-4 flex-1">
                        {/* SVG Rosca */}
                        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                {/* Base circles */}
                                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f3e8ff" strokeWidth="3" />
                                
                                {/* Entregado Segment (Green) */}
                                <circle 
                                    cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3" 
                                    strokeDasharray={`${delPercent} ${100 - delPercent}`}
                                    strokeDashoffset="0"
                                />

                                {/* En uso / Alquilado Segment (Yellow) */}
                                <circle 
                                    cx="18" cy="18" r="15.91" fill="none" stroke="#f59e0b" strokeWidth="3" 
                                    strokeDasharray={`${usePercent} ${100 - usePercent}`}
                                    strokeDashoffset={`-${delPercent}`}
                                />

                                {/* Reservado Segment (Blue) */}
                                <circle 
                                    cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="3" 
                                    strokeDasharray={`${resPercent} ${100 - resPercent}`}
                                    strokeDashoffset={`-${delPercent + usePercent}`}
                                />

                                {/* Pendiente Segment (Pink) */}
                                <circle 
                                    cx="18" cy="18" r="15.91" fill="none" stroke="#ec4899" strokeWidth="3" 
                                    strokeDasharray={`${penPercent} ${100 - penPercent}`}
                                    strokeDashoffset={`-${delPercent + usePercent + resPercent}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-[#1a050a]">{totalStatusCount}</span>
                                <span className="text-[10px] font-bold text-[#8a3348]/60 uppercase tracking-wider">Total</span>
                            </div>
                        </div>

                        {/* Leyenda */}
                        <div className="space-y-2 text-xs flex-1">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[#8a3348]/80 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shrink-0" />
                                    Entregado
                                </span>
                                <span className="font-extrabold text-[#1a050a]">{deliveredCount} <span className="font-normal text-[#8a3348]/60">({delPercent}%)</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[#8a3348]/80 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                                    En camino
                                </span>
                                <span className="font-extrabold text-[#1a050a]">{inUseCount} <span className="font-normal text-[#8a3348]/60">({usePercent}%)</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[#8a3348]/80 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] shrink-0" />
                                    Reservado
                                </span>
                                <span className="font-extrabold text-[#1a050a]">{reservedCount} <span className="font-normal text-[#8a3348]/60">({resPercent}%)</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[#8a3348]/80 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899] shrink-0" />
                                    Pendiente
                                </span>
                                <span className="font-extrabold text-[#1a050a]">{pendingCount} <span className="font-normal text-[#8a3348]/60">({penPercent}%)</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="lg:col-span-4 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[300px] shadow-sm">
                    <h2 className="text-base font-extrabold text-[#1a050a] mb-5">
                        Acciones rápidas
                    </h2>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <Link 
                            href="/admin/reservas"
                            className="bg-amber-50 hover:bg-amber-100/70 border border-amber-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all"
                        >
                            <div className="p-2.5 rounded-full bg-amber-100 text-amber-600 transition-transform group-hover:scale-110">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-amber-800 mt-2">Nuevo Alquiler</span>
                        </Link>
                        
                        <Link 
                            href="/admin/productos"
                            className="bg-violet-50 hover:bg-violet-100/70 border border-violet-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all"
                        >
                            <div className="p-2.5 rounded-full bg-violet-100 text-violet-600 transition-transform group-hover:scale-110">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-violet-800 mt-2">Agregar Producto</span>
                        </Link>

                        <Link 
                            href="/admin/pagos"
                            className="bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all"
                        >
                            <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-800 mt-2">Registrar Pago</span>
                        </Link>

                        <Link 
                            href="/admin/reservas"
                            className="bg-sky-50 hover:bg-sky-100/70 border border-sky-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center group transition-all"
                        >
                            <div className="p-2.5 rounded-full bg-sky-100 text-sky-600 transition-transform group-hover:scale-110">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-sky-800 mt-2">Ver Calendario</span>
                        </Link>
                    </div>
                </div>

                {/* Alertas y Notificaciones */}
                <div className="lg:col-span-4 bg-white border border-[#ebd7da] rounded-3xl p-6 flex flex-col h-[300px] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-[#1a050a]">
                            Alertas y notificaciones
                        </h2>
                        <Link href="/admin/reportes" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                            Ver todas
                        </Link>
                    </div>

                    <div className="flex-1 space-y-3.5 overflow-y-auto">
                        {alerts.map((al, idx) => {
                            let iconBg = 'bg-amber-100 text-amber-600';
                            let icon = <AlertTriangle className="h-4 w-4" />;
                            
                            if (al.type === 'info') {
                                iconBg = 'bg-sky-100 text-sky-600';
                                icon = <Info className="h-4 w-4" />;
                            } else if (al.type === 'success') {
                                iconBg = 'bg-emerald-100 text-emerald-600';
                                icon = <Check className="h-4 w-4" />;
                            } else if (al.type === 'user') {
                                iconBg = 'bg-purple-100 text-purple-600';
                                icon = <UserPlus className="h-4 w-4" />;
                            }

                            return (
                                <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <div className={`p-2 rounded-full ${iconBg} shrink-0 mt-0.5`}>
                                            {icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-extrabold text-[#1a050a] leading-snug">{al.title}</p>
                                            <p className="text-[10px] text-[#8a3348]/60 mt-0.5 leading-snug">{al.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[#8a3348]/40 shrink-0 mt-0.5 font-medium">
                                        {al.time}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
