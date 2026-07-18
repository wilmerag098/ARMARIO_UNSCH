import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, HelpCircle, Check, CreditCard, QrCode, Lock, AlertCircle, Calendar, User as UserIcon, Mail, Shield, Sparkles } from 'lucide-react';

const colorHexMap: Record<string, string> = {
    'azul marino': '#0f172a',
    'negro': '#000000',
    'blanco': '#ffffff',
    'gris': '#64748b',
    'rojo': '#ef4444',
    'vino': '#571e26',
    'azul': '#3b82f6',
    'dorado': '#dfb279',
    'beige': '#f5f5dc',
    'verde': '#22c55e',
    'rosa': '#ec4899',
    'lila': '#d8b4fe'
};

export default function Checkout({ product, accessories = [], promotion }: { product: any; accessories?: any[]; promotion?: any }) {
    const { auth } = usePage().props;
    const [step, setStep] = useState(1);
    
    // Auth Mode: 'register' or 'login' for non-logged in users
    const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
    
    // Login form local state
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
    const [loginProcessing, setLoginProcessing] = useState(false);

    const sizeParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('size') : '';
    const colorParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('color') : '';
    const startParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('start') : null;
    const endParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('end') : null;
    
    // Find initial inventory matching query param or default to first available
    const initialInventory = product?.inventories?.find((i: any) => i.size === sizeParam && i.status === 'available') 
        || product?.inventories?.find((i: any) => i.status === 'available') 
        || product?.inventories?.[0];

    const { data, setData, post, processing, errors } = useForm({
        product_id: product?.id,
        inventory_id: initialInventory?.id || '',
        color: colorParam || '',
        start_date: startParam || new Date().toISOString().split('T')[0],
        end_date: endParam || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        name: '',
        university_id: '',
        address: '',
        email: '',
        password: '',
        accessories: [] as { product_id: number; inventory_id: number }[],
        payment_method: 'yape',
        payment_reference: '',
    });

    const calculateTotal = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = isNaN(start.getTime()) || isNaN(end.getTime()) ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const mainPrice = parseFloat(product?.discounted_price_per_day || product?.price_per_day) || 0;
        const mainSubtotal = mainPrice * diffDays;

        let accessoriesSubtotal = 0;
        data.accessories.forEach((item) => {
            const acc = accessories.find((a) => a.id === item.product_id);
            if (acc) {
                const accPrice = parseFloat(acc?.discounted_price_per_day || acc?.price_per_day) || 0;
                accessoriesSubtotal += accPrice * diffDays;
            }
        });

        let discountAmount = 0;
        const isPromoApplicable = promotion && (mainSubtotal > parseFloat(promotion.min_amount));
        if (isPromoApplicable && accessoriesSubtotal > 0) {
            discountAmount = accessoriesSubtotal * (parseFloat(promotion.discount_percentage) / 100);
        }

        const serviceFee = 15;
        const total = mainSubtotal + accessoriesSubtotal - discountAmount + serviceFee;

        return { 
            diffDays, 
            subtotal: mainSubtotal, 
            accessoriesSubtotal, 
            discountAmount, 
            isPromoApplicable,
            serviceFee, 
            total 
        };
    };

    const { diffDays, subtotal, accessoriesSubtotal, discountAmount, isPromoApplicable, serviceFee, total } = calculateTotal();

    const handleCheckoutSubmit = () => {
        if (!data.payment_reference || data.payment_reference.length < 8) {
            alert('Por favor, ingresa un código de operación válido de al menos 8 dígitos.');
            return;
        }
        post('/checkout', {
            preserveScroll: true,
            onSuccess: () => {
                // Controller handles redirect to dashboard/profile
            }
        });
    };

    const handleNextStep1 = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert('Por favor, ingresa fechas válidas para el alquiler.');
            return;
        }
        if (end < start) {
            alert('La fecha de devolución debe ser posterior o igual a la de recogida.');
            return;
        }

        if (auth.user) {
            setStep(2);
        } else {
            post('/checkout/register', {
                preserveScroll: true,
                onSuccess: () => {
                    setStep(2);
                }
            });
        }
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginProcessing(true);
        setLoginErrors({});
        
        router.post('/login', loginData, {
            preserveScroll: true,
            onSuccess: () => {
                setLoginProcessing(false);
                setStep(2);
            },
            onError: (err) => {
                setLoginProcessing(false);
                setLoginErrors(err);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0c0204] text-white font-sans selection:bg-[#ffb6c5] selection:text-[#1b0308] pb-16">
            <Head title="Completa tu Reserva | Armario UNSCH" />

            {/* Premium Sticky Header */}
            <header className="bg-[#150306]/95 backdrop-blur-md border-b border-[#320a12]/80 py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-black/40">
                <Link href={`/producto/${product?.slug}`} className="text-white/70 hover:text-[#ffb6c5] transition-colors flex items-center gap-2 text-sm font-semibold">
                    <ArrowLeft size={20} />
                    <span className="hidden md:inline">Volver al producto</span>
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] tracking-[0.2em] font-bold text-white/40 uppercase">Armario UNSCH</span>
                    <h1 className="text-lg font-extrabold text-[#ffb6c5] tracking-wide">Proceso de Checkout</h1>
                </div>
                <button className="text-white/40 hover:text-[#ffb6c5] transition-colors">
                    <HelpCircle size={20} />
                </button>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-screen-xl">
                
                {/* Visual Progress Steps Bar */}
                <div className="bg-[#180509]/80 border border-[#3e121b]/60 rounded-3xl p-5 mb-8 md:mb-10 max-w-3xl mx-auto shadow-md">
                    <div className="flex items-center justify-between relative px-2">
                        {/* Connecting track */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#3e121b] -translate-y-1/2 z-0"></div>
                        <div 
                            className="absolute top-1/2 left-0 h-[2px] bg-[#ffb6c5] -translate-y-1/2 z-0 transition-all duration-500 shadow-glow" 
                            style={{ width: step === 1 ? '16%' : step === 2 ? '50%' : '84%' }}
                        ></div>

                        {/* Step 1 */}
                        <button 
                            type="button"
                            onClick={() => step > 1 && setStep(1)}
                            className="flex flex-col items-center gap-2 bg-[#180509] px-3 z-10 focus:outline-none"
                        >
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 1 
                                    ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/25 border-2 border-[#ffb6c5] scale-105' 
                                    : 'bg-[#290910] text-white/40 border-2 border-[#3e121b]'
                            }`}>
                                {step > 1 ? <Check size={18} strokeWidth={3} /> : '01'}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase ${step >= 1 ? 'text-[#ffb6c5]' : 'text-white/40'}`}>Info. Personal</span>
                        </button>

                        {/* Step 2 */}
                        <button 
                            type="button"
                            onClick={() => step > 2 && setStep(2)}
                            className="flex flex-col items-center gap-2 bg-[#180509] px-3 z-10 focus:outline-none"
                        >
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 2 
                                    ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/25 border-2 border-[#ffb6c5] scale-105' 
                                    : 'bg-[#290910] text-white/40 border-2 border-[#3e121b]'
                            }`}>
                                {step > 2 ? <Check size={18} strokeWidth={3} /> : '02'}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase ${step >= 2 ? 'text-[#ffb6c5]' : 'text-white/40'}`}>Configurar Reserva</span>
                        </button>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center gap-2 bg-[#180509] px-3 z-10">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                step >= 3 
                                    ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/25 border-2 border-[#ffb6c5] scale-105' 
                                    : 'bg-[#290910] text-white/40 border-2 border-[#3e121b]'
                            }`}>
                                03
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase ${step >= 3 ? 'text-[#ffb6c5]' : 'text-white/40'}`}>Validar Pago</span>
                        </div>
                    </div>
                </div>

                {/* Two-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column (Forms & Selection) */}
                    <div className="lg:col-span-8 w-full space-y-6">
                        
                        {/* STEP 1: Personal Info & Dates */}
                        {step === 1 && (
                            <div className="bg-[#180509]/90 border border-[#3e121b]/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#ffb6c5]"></div>
                                
                                {auth.user ? (
                                    /* Authenticated User View */
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[#ffb6c5]/10 rounded-xl text-[#ffb6c5]">
                                                <UserIcon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-extrabold text-white tracking-wide">Detalles Personales</h2>
                                                <p className="text-white/50 text-xs">Información de la cuenta activa</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0e0204]/40 p-4 rounded-2xl border border-[#3e121b]/30">
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#ffb6c5] uppercase tracking-wider mb-1">Nombre Completo</label>
                                                <div className="text-white/90 text-sm font-semibold">{auth.user?.name}</div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-[#ffb6c5] uppercase tracking-wider mb-1">Correo Electrónico</label>
                                                <div className="text-white/90 text-sm font-semibold truncate">{auth.user?.email}</div>
                                            </div>
                                        </div>

                                        {/* Date selection for authenticated users */}
                                        <div className="pt-6 border-t border-[#3e121b]/40">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar size={18} className="text-[#ffb6c5]" />
                                                <h3 className="text-sm font-bold text-[#ffb6c5] uppercase tracking-wider">Fechas del Alquiler</h3>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Fecha de Recojo</label>
                                                    <input
                                                        type="date"
                                                        value={data.start_date}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        onChange={e => setData('start_date', e.target.value)}
                                                        className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Fecha de Devolución</label>
                                                    <input
                                                        type="date"
                                                        value={data.end_date}
                                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                                        onChange={e => setData('end_date', e.target.value)}
                                                        className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Non-Authenticated: Register or Login Forms */
                                    <div className="space-y-6">
                                        <div className="flex border-b border-[#3e121b] mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setAuthMode('register')}
                                                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                                                    authMode === 'register'
                                                        ? 'border-[#ffb6c5] text-[#ffb6c5]'
                                                        : 'border-transparent text-white/40 hover:text-white'
                                                }`}
                                            >
                                                Registro Rápido
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAuthMode('login')}
                                                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                                                    authMode === 'login'
                                                        ? 'border-[#ffb6c5] text-[#ffb6c5]'
                                                        : 'border-transparent text-white/40 hover:text-white'
                                                }`}
                                            >
                                                Iniciar Sesión
                                            </button>
                                        </div>

                                        {authMode === 'register' ? (
                                            /* Registration form inputs */
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles size={16} className="text-[#ffb6c5]" />
                                                    <span className="text-xs font-bold text-[#ffb6c5] uppercase tracking-wider">Completa tus datos para registrarte</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Nombre Completo</label>
                                                        <input
                                                            type="text"
                                                            value={data.name}
                                                            onChange={e => setData('name', e.target.value)}
                                                            placeholder="Ej. Juan Pérez"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                            required
                                                        />
                                                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Código Universitario</label>
                                                        <input
                                                            type="text"
                                                            value={data.university_id}
                                                            onChange={e => setData('university_id', e.target.value)}
                                                            placeholder="Ej. 18234567"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                        />
                                                        {errors.university_id && <p className="text-red-400 text-xs mt-1">{errors.university_id}</p>}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Dirección de Residencia</label>
                                                    <input
                                                        type="text"
                                                        value={data.address}
                                                        onChange={e => setData('address', e.target.value)}
                                                        placeholder="Ej. Av. Independencia 123"
                                                        className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                    />
                                                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Correo Electrónico</label>
                                                        <input
                                                            type="email"
                                                            value={data.email}
                                                            onChange={e => setData('email', e.target.value)}
                                                            placeholder="Ej. juan@ejemplo.com"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                            required
                                                        />
                                                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Contraseña</label>
                                                        <input
                                                            type="password"
                                                            value={data.password}
                                                            onChange={e => setData('password', e.target.value)}
                                                            placeholder="********"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                            required
                                                            minLength={8}
                                                        />
                                                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Login Form */
                                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield size={16} className="text-[#ffb6c5]" />
                                                    <span className="text-xs font-bold text-[#ffb6c5] uppercase tracking-wider">Ingresa tus credenciales para acceder</span>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Correo Electrónico</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                                                            <Mail size={16} />
                                                        </span>
                                                        <input
                                                            type="email"
                                                            value={loginData.email}
                                                            onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                                            placeholder="juan@ejemplo.com"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    {loginErrors.email && <p className="text-red-400 text-xs mt-1">{loginErrors.email}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Contraseña</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                                                            <Lock size={16} />
                                                        </span>
                                                        <input
                                                            type="password"
                                                            value={loginData.password}
                                                            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                                            placeholder="********"
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    {loginErrors.password && <p className="text-red-400 text-xs mt-1">{loginErrors.password}</p>}
                                                </div>

                                                <div className="pt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={loginProcessing}
                                                        className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-3.5 rounded-xl transition-all shadow-md shadow-[#ffb6c5]/10 disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {loginProcessing ? 'AUTENTICANDO...' : 'INICIAR SESIÓN Y CONTINUAR'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Shared Rental Dates (always visible on register/unauth mode) */}
                                        {authMode === 'register' && (
                                            <div className="pt-6 border-t border-[#3e121b]/40">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Calendar size={18} className="text-[#ffb6c5]" />
                                                    <h3 className="text-sm font-bold text-[#ffb6c5] uppercase tracking-wider">Fechas del Alquiler</h3>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Fecha de Recojo</label>
                                                        <input
                                                            type="date"
                                                            value={data.start_date}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            onChange={e => setData('start_date', e.target.value)}
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all [color-scheme:dark]"
                                                            required
                                                        />
                                                        {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Fecha de Devolución</label>
                                                        <input
                                                            type="date"
                                                            value={data.end_date}
                                                            min={data.start_date || new Date().toISOString().split('T')[0]}
                                                            onChange={e => setData('end_date', e.target.value)}
                                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all [color-scheme:dark]"
                                                            required
                                                        />
                                                        {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Configure Rent Details (Sizes, Colors, Accessories) */}
                        {step === 2 && (
                            <div className="bg-[#180509]/90 border border-[#3e121b]/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-8">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#ffb6c5]"></div>
                                
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white mb-1">Detalles de Renta</h2>
                                    <p className="text-white/50 text-xs">Personaliza tu prenda y añade complementos</p>
                                </div>

                                {/* Main product visual summary */}
                                <div className="flex gap-5 pb-6 border-b border-[#3e121b]/40">
                                    <div className="w-20 h-24 rounded-2xl overflow-hidden bg-[#0c0204] border border-[#3e121b]/60 shrink-0">
                                        <img src={product?.image_url} alt={product?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <span className="text-[9px] font-bold text-[#ffb6c5]/70 bg-[#ffb6c5]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{product?.category?.name}</span>
                                            <h4 className="font-extrabold text-white text-base mt-1.5">{product?.name}</h4>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-white/40 text-xs">Tarifa diaria</span>
                                            <span className="font-extrabold text-[#ffb6c5] text-lg">S/ {parseFloat(product?.discounted_price_per_day || product?.price_per_day).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Size Selector */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">Talla Seleccionada</label>
                                    <div className="flex flex-wrap gap-3">
                                        {product?.inventories?.map((inv: any) => {
                                            const isSelected = data.inventory_id === inv.id;
                                            const isAvailable = inv.status === 'available';
                                            return (
                                                <button
                                                    key={inv.id}
                                                    type="button"
                                                    disabled={!isAvailable}
                                                    onClick={() => setData('inventory_id', inv.id)}
                                                    className={`px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all flex flex-col items-center justify-center min-w-[80px] select-none ${
                                                        isSelected
                                                            ? 'bg-[#ffb6c5] text-[#1b0308] border-[#ffb6c5] shadow-lg shadow-[#ffb6c5]/20 scale-[1.03]'
                                                            : isAvailable
                                                            ? 'bg-[#0e0204]/60 border-[#3e121b] text-white/80 hover:border-[#ffb6c5]/50 hover:bg-[#150306]'
                                                            : 'bg-[#0c0204]/20 border-[#3e121b]/20 text-white/30 cursor-not-allowed line-through relative overflow-hidden'
                                                    }`}
                                                >
                                                    <span>Talla {inv.size}</span>
                                                    <span className={`text-[9px] font-semibold mt-1 ${isSelected ? 'text-[#1b0308]/75' : isAvailable ? 'text-green-400/80' : 'text-red-400/60'}`}>
                                                        {isAvailable ? 'Disponible' : 'Agotado'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.inventory_id && <p className="text-red-400 text-xs mt-1.5">{errors.inventory_id}</p>}
                                </div>

                                {/* Interactive Color Selector */}
                                {product?.colors && product.colors.length > 0 && (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">Color (Opcional)</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setData('color', '')}
                                                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                                                    data.color === ''
                                                        ? 'bg-[#ffb6c5] text-[#1b0308] border-[#ffb6c5] shadow-md shadow-[#ffb6c5]/15'
                                                        : 'bg-[#0e0204]/60 border-[#3e121b] text-white/80 hover:border-[#ffb6c5]/50 hover:bg-[#150306]'
                                                }`}
                                            >
                                                Sin color específico
                                            </button>
                                            {product.colors.map((color: string) => {
                                                const cleanColor = color.trim().toLowerCase();
                                                const hexColor = colorHexMap[cleanColor] || '#ffffff';
                                                const isSelected = data.color === color;
                                                const isWhite = hexColor === '#ffffff';
                                                return (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setData('color', color)}
                                                        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-bold transition-all select-none ${
                                                            isSelected
                                                                ? 'border-[#ffb6c5] bg-[#290910] text-[#ffb6c5] shadow-lg shadow-[#ffb6c5]/10 scale-[1.02]'
                                                                : 'border-[#3e121b] bg-[#0e0204]/60 text-white/80 hover:border-[#ffb6c5]/40 hover:bg-[#150306]'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-4 h-4 rounded-full border shadow-inner ${isWhite ? 'border-white/40' : 'border-white/10'}`}
                                                            style={{ backgroundColor: hexColor }}
                                                        />
                                                        <span className="capitalize">{color}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Accessories selection redesigned */}
                                {accessories.length > 0 && (
                                    <div className="pt-6 border-t border-[#3e121b]/40 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-[#ffb6c5]">¡Completa tu Outfit!</h3>
                                            <p className="text-xs text-white/50">
                                                Añade accesorios adicionales. Si tu reserva de prenda supera los S/ 100.00, recibirás un **15% de descuento** automático en ellos.
                                            </p>
                                        </div>
                                        
                                        {isPromoApplicable && (
                                            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl text-xs text-emerald-400 flex items-center gap-2.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                                                <span><strong>¡Descuento activado!</strong> 15% de descuento en accesorios aplicable.</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            {accessories.map((acc: any) => {
                                                const isChecked = data.accessories.some((item) => item.product_id === acc.id);
                                                const availableInv = acc.inventories?.[0];
                                                
                                                const handleCheckboxChange = () => {
                                                    if (isChecked) {
                                                        setData('accessories', data.accessories.filter((item) => item.product_id !== acc.id));
                                                    } else if (availableInv) {
                                                        setData('accessories', [...data.accessories, { product_id: acc.id, inventory_id: availableInv.id }]);
                                                    }
                                                };

                                                return (
                                                    <div 
                                                        key={acc.id} 
                                                        onClick={handleCheckboxChange}
                                                        className={`flex items-center gap-3.5 p-3.5 bg-[#0e0204]/40 border rounded-2xl cursor-pointer select-none transition-all duration-300 ${
                                                            isChecked 
                                                                ? 'border-[#ffb6c5] bg-[#290910]/40 shadow-glow shadow-[#ffb6c5]/5 scale-[1.01]' 
                                                                : 'border-[#3e121b] hover:border-[#ffb6c5]/40 hover:bg-[#150306]/30'
                                                        }`}
                                                    >
                                                        <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                                                            isChecked ? 'bg-[#ffb6c5] border-[#ffb6c5] text-[#1b0308]' : 'border-white/20 text-transparent'
                                                        }`}>
                                                            <Check size={14} strokeWidth={3} />
                                                        </div>
                                                        <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0c0204] border border-[#3e121b]/40">
                                                            <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover animate-fade-in" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                                                            <p className="text-[10px] text-white/40 mt-0.5">{acc.inventories?.[0] ? `Talla ${acc.inventories[0].size}` : 'Stock disponible'}</p>
                                                            <p className="text-xs font-extrabold text-[#ffb6c5] mt-1.5">S/ {parseFloat(acc.price_per_day).toFixed(2)} / día</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: Payment Code Validation */}
                        {step === 3 && (
                            <div className="bg-[#180509]/90 border border-[#3e121b]/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-6">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#ffb6c5]"></div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#ffb6c5]/10 rounded-xl text-[#ffb6c5]">
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-white tracking-wide">Validar Pago</h2>
                                        <p className="text-white/50 text-xs">Paga mediante Yape o Plin y registra el código de operación</p>
                                    </div>
                                </div>

                                <p className="text-white/70 text-sm leading-relaxed">
                                    Escanea el código QR de tu preferencia desde la aplicación de tu banco o billetera móvil. Transfiere el monto total y luego ingresa los 8 dígitos del código de operación.
                                </p>

                                {/* Payment Tab Selector */}
                                <div className="flex gap-4 p-1.5 bg-[#0e0204] rounded-2xl border border-[#3e121b]/50">
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'yape')}
                                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                            data.payment_method === 'yape'
                                                ? 'bg-[#00d6c4]/15 border border-[#00d6c4]/45 text-[#00d6c4] shadow-md shadow-[#00d6c4]/5'
                                                : 'text-white/50 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#00d6c4]" />
                                        YAPE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('payment_method', 'plin')}
                                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                            data.payment_method === 'plin'
                                                ? 'bg-[#00b050]/15 border border-[#00b050]/45 text-[#00b050] shadow-md shadow-[#00b050]/5'
                                                : 'text-white/50 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#00b050]" />
                                        PLIN
                                    </button>
                                </div>

                                {/* QR Card Display */}
                                <div className="bg-[#0e0204]/70 border border-[#3e121b]/60 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 max-w-sm mx-auto shadow-inner">
                                    <div className="text-center">
                                        <span className={`text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full text-xs uppercase ${
                                            data.payment_method === 'yape' ? 'bg-[#00d6c4]/10 text-[#00d6c4]' : 'bg-[#00b050]/10 text-[#00b050]'
                                        }`}>
                                            Pagar con {data.payment_method}
                                        </span>
                                    </div>
                                    
                                    <div className="w-56 h-56 rounded-2xl overflow-hidden bg-white p-2.5 border-4 border-[#3e121b]/40 flex items-center justify-center shadow-lg shadow-black/80">
                                        <img
                                            src={data.payment_method === 'yape' ? '/images/yape_qr.jpg' : '/images/plin_qr.jpg'}
                                            alt={`QR ${data.payment_method}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="text-xs text-white/40 text-center font-medium">Escanea y yapea/plinea el monto exacto</span>
                                </div>

                                {/* Operation Code Input */}
                                <div className="pt-4 border-t border-[#3e121b]/40 space-y-3">
                                    <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">Código de Operación (8 dígitos)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={8}
                                            value={data.payment_reference}
                                            onChange={e => setData('payment_reference', e.target.value.replace(/\D/g, ''))}
                                            placeholder="Ingresa los 8 dígitos"
                                            className="w-full bg-[#0e0204] border border-[#3e121b] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] text-center text-lg font-extrabold tracking-widest transition-all"
                                            required
                                        />
                                    </div>
                                    {errors.payment_reference && <p className="text-red-400 text-xs mt-1">{errors.payment_reference}</p>}
                                    <p className="text-[10px] text-white/40 text-center">Este código es necesario para que el administrador verifique tu depósito de garantía y pago de renta.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (Sticky Order Summary Card) */}
                    <div className="lg:col-span-4 w-full sticky top-24">
                        <div className="bg-[#180509]/95 border-2 border-[#3e121b] rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-6">
                            
                            {/* Glowing brand accents */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb6c5]/2 rounded-full blur-3xl pointer-events-none"></div>

                            <h3 className="text-xl font-extrabold text-white tracking-wide border-b border-[#3e121b]/60 pb-4">Resumen de Alquiler</h3>
                            
                            {/* Selected item brief */}
                            <div className="bg-[#0e0204]/60 p-4 rounded-2xl border border-[#3e121b]/30 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60 font-medium">Prenda</span>
                                    <span className="text-white font-bold truncate max-w-[180px]">{product?.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60 font-medium">Duración</span>
                                    <span className="text-white font-bold">{diffDays} {diffDays === 1 ? 'día' : 'días'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-white/40 pt-2 border-t border-[#3e121b]/20">
                                    <span>Del: {data.start_date}</span>
                                    <span>Al: {data.end_date}</span>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="space-y-3.5 text-sm pt-2">
                                <div className="flex justify-between">
                                    <span className="text-white/50">Subtotal Prenda</span>
                                    <span className="text-white font-bold">S/ {subtotal.toFixed(2)}</span>
                                </div>
                                
                                {accessoriesSubtotal > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Accesorios ({diffDays} d.)</span>
                                        <span className="text-white font-bold">S/ {accessoriesSubtotal.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                                        <span className="text-xs">Descuento Accesorios</span>
                                        <span className="text-xs">- S/ {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between">
                                    <span className="text-white/50">Tarifa de Servicio</span>
                                    <span className="text-white font-bold">S/ {serviceFee.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Total section */}
                            <div className="border-t border-[#3e121b]/60 pt-5">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Monto Total</span>
                                        <div className="text-[10px] text-white/30 font-medium mt-0.5">Incluye depósito de garantía</div>
                                    </div>
                                    <span className="text-3xl font-extrabold text-[#ffb6c5] tracking-tight">S/ {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Contextual CTA Button */}
                            <div className="pt-2">
                                {step === 1 && (
                                    <button
                                        type="button"
                                        onClick={handleNextStep1}
                                        disabled={processing}
                                        className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-[#ffb6c5]/20 disabled:opacity-50 tracking-wider text-xs uppercase"
                                    >
                                        {processing ? 'Procesando...' : (auth.user ? 'Configurar Alquiler' : 'Registrar y Continuar')}
                                    </button>
                                )}

                                {step === 2 && (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!data.inventory_id) {
                                                    alert('Por favor, selecciona una talla antes de continuar.');
                                                    return;
                                                }
                                                setStep(3);
                                            }}
                                            className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-[#ffb6c5]/20 tracking-wider text-xs uppercase"
                                        >
                                            Continuar al Pago
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-full bg-transparent text-white/60 hover:text-white font-bold py-2 text-xs transition-colors"
                                        >
                                            Atrás
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCheckoutSubmit}
                                            disabled={processing || !data.payment_reference}
                                            className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ffb6c5]/20 disabled:opacity-50 disabled:shadow-none tracking-wider text-xs uppercase"
                                        >
                                            <Lock size={14} />
                                            {processing ? 'Verificando...' : 'Confirmar Reserva'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="w-full bg-transparent text-white/60 hover:text-white font-bold py-2 text-xs transition-colors"
                                        >
                                            Atrás
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="pt-4 border-t border-[#3e121b]/20 flex items-center justify-center gap-2.5 text-[10px] text-white/40 font-medium">
                                <Lock size={12} className="text-[#ffb6c5]/70" />
                                <span>Alquiler protegido por reglamento UNSCH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
