import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { 
    Check, CreditCard, Lock, AlertCircle, 
    Calendar, User as UserIcon, Mail, Shield, Sparkles, 
    GraduationCap, Phone, CheckCircle2, RefreshCw, Key, Info, Tag, X, FileText,
    MapPin, Truck, ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';

const { defaultStartDate, defaultEndDate } = (() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysLater = new Date(today.getTime() + 86400000 * 3);
    const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0];

    return { defaultStartDate: todayStr, defaultEndDate: threeDaysLaterStr };
})();

export default function Checkout({ 
    product, 
    accessories = [], 
    promotion, 
    mercadopago_public_key 
}: { 
    product: any; 
    accessories?: any[]; 
    promotion?: any; 
    mercadopago_public_key: string 
}) {
    const { auth } = usePage().props as any;
    
    // Auth Mode: 'register' or 'login' for non-logged in users
    const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
    const [mpMethod, setMpMethod] = useState<'card' | 'wallet'>('card');
    
    // Login form local state
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
    const [loginProcessing, setLoginProcessing] = useState(false);

    // Initial query params
    const sizeParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('size') : '';
    const colorParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('color') : '';
    const startParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('start') : null;
    const endParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('end') : null;
    
    const initialInventory = product?.inventories?.find((i: any) => i.size === sizeParam && i.status === 'available') 
        || product?.inventories?.find((i: any) => i.status === 'available') 
        || product?.inventories?.[0];

    // Leer full cart items de localStorage
    const initialCart = typeof window !== 'undefined' ? (() => {
        const stored = localStorage.getItem('armario_rental_cart');

        if (stored) {
            try {
                return JSON.parse(stored) || [];
            } catch {
                return [];
            }
        }

        return [];
    })() : [];

    const firstCartItem = initialCart[0];
    const mainInvId = firstCartItem ? (firstCartItem.product?.inventories?.find((i: any) => i.size === firstCartItem.selectedSize && i.status === 'available')?.id 
        || firstCartItem.product?.inventories?.[0]?.id || '') : (initialInventory?.id || '');

    const initialProduct_id = firstCartItem ? firstCartItem.product.id : (product?.id || '');
    const initialColor = firstCartItem ? (firstCartItem.selectedColor || '') : (colorParam || '');
    const initialStartDate = firstCartItem ? (firstCartItem.startDate || (startParam || defaultStartDate)) : (startParam || defaultStartDate);
    const initialEndDate = firstCartItem ? (firstCartItem.endDate || (endParam || defaultEndDate)) : (endParam || defaultEndDate);

    const initialAccessories = initialCart.slice(1).map((item: any) => {
        const invId = item.product?.inventories?.find((i: any) => i.size === item.selectedSize && i.status === 'available')?.id 
            || item.product?.inventories?.[0]?.id || '';

        return {
            product_id: item.product.id,
            inventory_id: invId
        };
    });

    // Si ya inició sesión, se pre-rellenan sus datos, de lo contrario empiezan vacíos
    const { data, setData, processing, errors } = useForm({
        product_id: initialProduct_id,
        inventory_id: mainInvId,
        color: initialColor,
        start_date: initialStartDate,
        end_date: initialEndDate,
        name: auth.user?.name || '',
        last_name: auth.user?.last_name || '',
        dni: auth.user?.dni || '',
        university_id: auth.user?.university_id || '',
        phone: auth.user?.phone || '',
        email: auth.user?.email || '',
        password: '',
        accessories: initialAccessories,
        payment_method: 'mercadopago',
        payment_reference: '',
        delivery_method: 'pickup', // Recojo en tienda por defecto
    });

    const cartItems = initialCart;

    // Sincronizar datos de usuario logueado en caso cambie el estado auth (ej. tras login/registro)
    useEffect(() => {
        if (auth.user) {
            setData(prev => ({
                ...prev,
                name: auth.user.name || '',
                last_name: auth.user.last_name || '',
                dni: auth.user.dni || '',
                university_id: auth.user.university_id || '',
                phone: auth.user.phone || '',
                email: auth.user.email || '',
            }));
        }
    }, [auth.user, setData]);

    const calculateTotal = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = isNaN(start.getTime()) || isNaN(end.getTime()) ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        let mainPrice = parseFloat(product?.discounted_price_per_day || product?.price_per_day) || 0;
        let mainGarantia = parseFloat(product?.security_deposit) || (mainPrice * 0.20);
        
        if (cartItems.length > 0) {
            const firstItem = cartItems[0];
            mainPrice = parseFloat(firstItem.product?.discounted_price_per_day || firstItem.product?.price_per_day) || 0;
            mainGarantia = parseFloat(firstItem.product?.security_deposit) || (mainPrice * 0.20);
        }

        const mainSubtotal = mainPrice * diffDays;

        let accessoriesSubtotal = 0;
        let accessoriesGarantia = 0;

        if (cartItems.length > 1) {
            // Calculate using localStorage cart items
            cartItems.slice(1).forEach((item: any) => {
                const accPrice = parseFloat(item.product?.discounted_price_per_day || item.product?.price_per_day) || 0;
                const accSub = accPrice * diffDays;
                let accDep = parseFloat(item.product?.security_deposit);

                if (isNaN(accDep) || accDep <= 0) {
                    accDep = accPrice * 0.20;
                }

                accessoriesSubtotal += accSub;
                accessoriesGarantia += accDep;
            });
        } else {
            // Fallback to data.accessories checklist (for standalone checkout)
            data.accessories.forEach((item) => {
                const acc = accessories.find((a) => a.id === item.product_id);

                if (acc) {
                    const accPrice = parseFloat(acc?.discounted_price_per_day || acc?.price_per_day) || 0;
                    const accSub = accPrice * diffDays;
                    let accDep = parseFloat(acc?.security_deposit);

                    if (isNaN(accDep) || accDep <= 0) {
                        accDep = accPrice * 0.20;
                    }

                    accessoriesSubtotal += accSub;
                    accessoriesGarantia += accDep;
                }
            });
        }

        // Apply discount on accessories if main garment rent subtotal > promotion min_amount
        let discountAmount = 0;
        const isPromoApplicable = promotion && (mainSubtotal > parseFloat(promotion.min_amount));

        if (isPromoApplicable && accessoriesSubtotal > 0) {
            discountAmount = accessoriesSubtotal * (parseFloat(promotion.discount_percentage) / 100);
        }

        const totalGarantia = mainGarantia + accessoriesGarantia;
        const subtotal = mainSubtotal + accessoriesSubtotal - discountAmount;
        const total = subtotal + totalGarantia;

        return { 
            diffDays, 
            subtotal, 
            garantia: totalGarantia, 
            total 
        };
    };

    const { diffDays, subtotal, garantia, total } = calculateTotal();

    const clearCart = () => {
        localStorage.removeItem('armario_rental_cart');
        window.dispatchEvent(new CustomEvent('cart-changed'));
    };

    // Inicializar el SDK de Mercado Pago
    useEffect(() => {
        if (mercadopago_public_key) {
            initMercadoPago(mercadopago_public_key, { locale: 'es-PE' });
        }
    }, [mercadopago_public_key]);

    const validateCheckoutForm = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert('Por favor, ingresa fechas válidas para el alquiler.');

            return false;
        }

        if (end < start) {
            alert('La fecha de devolución debe ser posterior o igual a la de recogida.');

            return false;
        }

        if (!data.inventory_id) {
            alert('Por favor, selecciona una talla antes de continuar.');

            return false;
        }

        if (!auth.user) {
            if (authMode === 'register') {
                if (!data.name || !data.last_name || !data.dni || !data.university_id || !data.phone || !data.email || !data.password) {
                    alert('Por favor, completa todos los campos de datos personales y contraseña para registrarte.');

                    return false;
                }
            } else {
                alert('Por favor, inicia sesión primero usando el formulario correspondiente.');

                return false;
            }
        } else {
            if (!data.name || !data.last_name || !data.dni || !data.university_id || !data.phone || !data.email) {
                alert('Por favor, completa todos los campos de datos personales obligatorios.');

                return false;
            }
        }

        return true;
    };

    const handleCardPaymentSubmit = async (cardFormData: any) => {
        if (!validateCheckoutForm()) {
            throw new Error('Formulario de reserva incompleto');
        }

        const payload = {
            product_id: data.product_id,
            inventory_id: data.inventory_id,
            color: data.color,
            start_date: data.start_date,
            end_date: data.end_date,
            accessories: data.accessories,
            payment_method: 'mercadopago_card',
            payment_token: cardFormData.token,
            payment_method_id: cardFormData.payment_method_id,
            installments: cardFormData.installments,
            issuer_id: cardFormData.issuer_id,
            name: data.name,
            last_name: data.last_name,
            dni: data.dni,
            university_id: data.university_id,
            phone: data.phone,
            email: data.email,
        };

        if (!auth.user) {
            // Registrar primero
            router.post('/checkout/register', {
                name: data.name,
                last_name: data.last_name,
                dni: data.dni,
                university_id: data.university_id,
                phone: data.phone,
                email: data.email,
                password: data.password
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Una vez registrado e iniciado sesión automáticamente, enviar el checkout
                    router.post('/checkout', payload, {
                        preserveScroll: true,
                        onSuccess: () => {
                            clearCart();
                        }
                    });
                }
            });
        } else {
            // Usuario ya logueado
            router.post('/checkout', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    clearCart();
                }
            });
        }
    };

    const handleWalletPaymentSubmit = async () => {
        if (!validateCheckoutForm()) {
            return;
        }

        const payload = {
            product_id: data.product_id,
            inventory_id: data.inventory_id,
            color: data.color,
            start_date: data.start_date,
            end_date: data.end_date,
            accessories: data.accessories,
            payment_method: 'mercadopago_wallet',
            name: data.name,
            last_name: data.last_name,
            dni: data.dni,
            university_id: data.university_id,
            phone: data.phone,
            email: data.email,
        };

        if (!auth.user) {
            // Registrar primero
            router.post('/checkout/register', {
                name: data.name,
                last_name: data.last_name,
                dni: data.dni,
                university_id: data.university_id,
                phone: data.phone,
                email: data.email,
                password: data.password
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Una vez registrado e iniciado sesión automáticamente, enviar el checkout
                    router.post('/checkout', payload, {
                        preserveScroll: true,
                        onSuccess: () => {
                            clearCart();
                        }
                    });
                }
            });
        } else {
            // Usuario ya logueado
            router.post('/checkout', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    clearCart();
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
            },
            onError: (err) => {
                setLoginProcessing(false);
                setLoginErrors(err);
            }
        });
    };

    // Prepare items list for visual checkout breakdown
    const displayItems = cartItems.length > 0 ? cartItems : [{
        product,
        selectedSize: sizeParam,
        selectedColor: colorParam,
        startDate: data.start_date,
        endDate: data.end_date,
        rentDays: diffDays
    }];

    return (
        <div className="min-h-screen bg-[#fdfafb] text-slate-800 font-sans selection:bg-[#ffb6c5] selection:text-[#1b0308] relative overflow-hidden flex items-center justify-center">
            <Head title="Completa tu Reserva | Armario UNSCH" />

            {/* Fondo simulando la tienda con un sutil tinte vino */}
            <div className="absolute inset-0 bg-[#fbf2f4] filter blur-md scale-105 opacity-60"></div>

            {/* Contenedor Backdrop Modal con tinte vino tinto */}
            <div className="fixed inset-0 bg-[#2b080c]/60 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6">
                
                {/* Caja de Diálogo Emergente (Modal) */}
                <div className="bg-[#fffcfd] w-full max-w-5xl rounded-[28px] shadow-2xl border border-[#f5dce0]/80 overflow-hidden relative my-auto animate-in fade-in zoom-in duration-200 flex flex-col max-h-[96vh] md:max-h-[92vh]">
                    
                    {/* Botón Cerrar (X) que redirige al producto */}
                    <Link 
                        href={`/producto/${product?.slug}`} 
                        className="absolute top-4 right-4 p-2 text-[#805056] hover:text-[#4a1018] bg-white hover:bg-[#fbf2f4] rounded-full border border-[#f5dce0]/80 shadow-sm transition-all z-20 cursor-pointer"
                        title="Cerrar y volver al producto"
                    >
                        <X size={18} />
                    </Link>

                    {/* Header del Modal con paleta vino tinto claro */}
                    <header className="bg-white border-b border-[#f5dce0]/80 px-6 py-4 flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-[#782331]/5 rounded-xl text-[#782331]">
                            <CreditCard size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] tracking-[0.2em] font-extrabold text-[#805056] uppercase">Armario UNSCH</span>
                            <h1 className="text-base font-extrabold text-[#4a1018] tracking-wide">Completar Alquiler</h1>
                        </div>
                    </header>

                    {/* Contenido Desplazable del Modal */}
                    <div className="overflow-y-auto p-6 md:p-8 flex-1">
                        {/* Two-Column Responsive Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column (Forms) */}
                            <div className="lg:col-span-8 w-full space-y-6">
                                
                                {/* Card 1: Datos Personales */}
                                <div className="bg-white border border-[#f5dce0]/60 rounded-3xl p-6 md:p-8 shadow-sm">
                                    
                                    {auth.user ? (
                                        /* USUARIO REGISTRADO */
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2.5 pb-4 border-b border-[#fbf2f4]">
                                                <div className="p-2 bg-[#782331]/5 rounded-xl text-[#782331]">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-[#4a1018] leading-tight font-serif">Datos personales</h2>
                                                    <p className="text-[#805056] text-xs">Información asociada a tu cuenta activa</p>
                                                </div>
                                            </div>

                                            <div className="bg-[#fdf6f7] border border-[#f5dce0]/40 p-4 rounded-2xl flex items-center gap-3">
                                                <CheckCircle2 className="text-[#782331] shrink-0" size={18} />
                                                <p className="text-xs text-[#805056] font-medium">
                                                    Sesión activa como <span className="font-bold text-[#4a1018]">{auth.user?.name} {auth.user?.last_name || ''}</span>. No necesitas rellenar tus datos nuevamente.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80">
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">Nombres</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs">{auth.user?.name || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">Apellidos</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs">{auth.user?.last_name || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">DNI</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs font-mono">{auth.user?.dni || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">Código estudiante</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs">{auth.user?.university_id || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">Teléfono</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs font-mono">{auth.user?.phone || '-'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider">Correo electrónico</span>
                                                    <span className="text-slate-800 font-semibold text-sm block bg-white border border-slate-200/50 rounded-xl px-4 py-2.5 shadow-xs">{auth.user?.email || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* USUARIO NO REGISTRADO (TABS REGISTRO / LOGIN) */
                                        <div className="space-y-6">
                                            <div className="flex border-b border-[#f5dce0] pb-px mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setAuthMode('register')}
                                                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                                                        authMode === 'register'
                                                            ? 'border-[#782331] text-[#782331] bg-[#782331]/5'
                                                            : 'border-transparent text-[#805056] hover:text-[#4a1018]'
                                                    }`}
                                                >
                                                    <Sparkles size={16} />
                                                    Registro Rápido
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAuthMode('login')}
                                                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                                                        authMode === 'login'
                                                            ? 'border-[#782331] text-[#782331] bg-[#782331]/5'
                                                            : 'border-transparent text-[#805056] hover:text-[#4a1018]'
                                                    }`}
                                                >
                                                    <Key size={16} />
                                                    Iniciar Sesión
                                                </button>
                                            </div>

                                            {authMode === 'register' ? (
                                                /* FORMULARIO DE REGISTRO */
                                                <div className="space-y-5">
                                                    <div className="flex items-center gap-2 bg-[#782331]/5 p-3 rounded-2xl text-[11px] text-[#782331] border border-[#782331]/10">
                                                        <Info size={16} className="shrink-0" />
                                                        <span>Crea tu cuenta de estudiante. La contraseña que elijas te servirá para tus próximas visitas.</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Nombres</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <UserIcon size={15} />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.name}
                                                                    onChange={e => setData('name', e.target.value)}
                                                                    placeholder="Ej. Juan Manuel"
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.name && <p className="text-[#782331] text-xs mt-1">{errors.name}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Apellidos</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <UserIcon size={15} />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.last_name}
                                                                    onChange={e => setData('last_name', e.target.value)}
                                                                    placeholder="Ej. Pérez Quispe"
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.last_name && <p className="text-[#782331] text-xs mt-1">{errors.last_name}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">DNI</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <FileText size={15} />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.dni}
                                                                    onChange={e => setData('dni', e.target.value.replace(/\D/g, ''))}
                                                                    placeholder="8 dígitos"
                                                                    maxLength={8}
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm font-mono"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.dni && <p className="text-[#782331] text-xs mt-1">{errors.dni}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Código estudiante</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <GraduationCap size={15} />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.university_id}
                                                                    onChange={e => setData('university_id', e.target.value)}
                                                                    placeholder="Ej. 18234567"
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.university_id && <p className="text-[#782331] text-xs mt-1">{errors.university_id}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Teléfono</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <Phone size={15} />
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={data.phone}
                                                                    onChange={e => setData('phone', e.target.value.replace(/\D/g, ''))}
                                                                    placeholder="9 dígitos"
                                                                    maxLength={9}
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm font-mono"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.phone && <p className="text-[#782331] text-xs mt-1">{errors.phone}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Correo</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                    <Mail size={15} />
                                                                </span>
                                                                <input
                                                                    type="email"
                                                                    value={data.email}
                                                                    onChange={e => setData('email', e.target.value)}
                                                                    placeholder="correo@ejemplo.com"
                                                                    className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                    required
                                                                />
                                                            </div>
                                                            {errors.email && <p className="text-[#782331] text-xs mt-1">{errors.email}</p>}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Contraseña para iniciar sesión</label>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#805056]/60">
                                                                <Lock size={15} />
                                                            </span>
                                                            <input
                                                                type="password"
                                                                value={data.password}
                                                                onChange={e => setData('password', e.target.value)}
                                                                placeholder="Crea una contraseña segura (mín. 8 caracteres)"
                                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                required
                                                                minLength={8}
                                                            />
                                                        </div>
                                                        {errors.password && <p className="text-[#782331] text-xs mt-1">{errors.password}</p>}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* FORMULARIO DE INICIO DE SESIÓN */
                                                <form onSubmit={handleLoginSubmit} className="space-y-5">
                                                    <div className="flex items-center gap-2 mb-2 text-[#805056]">
                                                        <Lock size={15} />
                                                        <span className="text-xs font-semibold">Ingresa tus credenciales para acceder</span>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Correo Electrónico</label>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#805056]/60">
                                                                <Mail size={16} />
                                                            </span>
                                                            <input
                                                                type="email"
                                                                value={loginData.email}
                                                                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                                                placeholder="correo@ejemplo.com"
                                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        {loginErrors.email && <p className="text-[#782331] text-xs mt-1">{loginErrors.email}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold text-[#805056] uppercase tracking-wider mb-2">Contraseña</label>
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#805056]/60">
                                                                <Lock size={16} />
                                                            </span>
                                                            <input
                                                                type="password"
                                                                value={loginData.password}
                                                                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                                                placeholder="********"
                                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        {loginErrors.password && <p className="text-[#782331] text-xs mt-1">{loginErrors.password}</p>}
                                                    </div>

                                                    <div className="pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loginProcessing}
                                                            className="w-full bg-[#782331] text-white hover:bg-[#8e2a39] font-bold py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                                                        >
                                                            {loginProcessing ? (
                                                                <>
                                                                    <RefreshCw className="animate-spin" size={14} />
                                                                    Iniciando Sesión...
                                                                </>
                                                            ) : 'INICIAR SESIÓN Y CONTINUAR'}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: Método de Entrega */}
                                <div className="bg-white border border-[#f5dce0]/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2.5 pb-4 border-b border-[#fbf2f4]">
                                        <div className="p-2 bg-[#782331]/5 rounded-xl text-[#782331]">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-[#4a1018] leading-tight font-serif">Método de entrega</h2>
                                            <p className="text-[#805056] text-xs">Elige cómo deseas recibir tu prenda</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Opción: Recojo en Tienda (Seleccionado por defecto) */}
                                        <div className="border-2 border-[#782331] bg-[#782331]/5 rounded-2xl p-4 flex flex-col justify-between cursor-pointer relative transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-[#782331]/10 rounded-xl text-[#782331]">
                                                        <ShoppingBag size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-[#4a1018] text-sm">Recojo en Tienda</h4>
                                                        <p className="text-[#805056] text-[10px] mt-0.5 font-medium">Gratuito • Listo para recoger</p>
                                                    </div>
                                                </div>
                                                <div className="bg-[#782331] text-white p-1 rounded-full">
                                                    <Check size={12} className="stroke-[3]" />
                                                </div>
                                            </div>
                                            <div className="mt-4 text-[11px] text-[#805056]/90 border-t border-[#782331]/10 pt-3 space-y-1">
                                                <p className="font-bold text-[#4a1018]">Dirección UNSCH:</p>
                                                <p>Oficina de Armario UNSCH, Ciudad Universitaria, Ayacucho</p>
                                                <p className="font-medium text-[#782331]/80">Lun a Vie: 8:00 AM - 6:00 PM</p>
                                            </div>
                                        </div>

                                        {/* Opción: Envío a Domicilio (No disponible) */}
                                        <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 flex flex-col justify-between opacity-60 cursor-not-allowed select-none relative">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-slate-200 rounded-xl text-slate-500">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-600 text-sm">Envío a Domicilio</h4>
                                                        <p className="text-slate-400 text-[10px] mt-0.5">No disponible para alquileres</p>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">No disp.</span>
                                            </div>
                                            <div className="mt-4 text-[11px] text-slate-400 border-t border-slate-200/50 pt-3">
                                                <p>Por políticas del servicio, el retiro y la devolución de prendas de vestir se realizan exclusivamente de forma presencial en el campus.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Sticky Order Summary Card) */}
                            <div className="lg:col-span-4 w-full lg:sticky lg:top-24 space-y-6">
                                
                                {/* Prendas y Accesorios Seleccionados */}
                                <div className="bg-white border border-[#f5dce0]/80 rounded-3xl p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-[#fbf2f4]">
                                        <Tag size={16} className="text-[#782331]" />
                                        <span className="text-xs font-bold text-[#805056] uppercase tracking-wider">Detalles de la Reserva</span>
                                    </div>
                                    
                                    <div className="space-y-4 divide-y divide-[#fbf2f4]">
                                        {displayItems.map((item: any, index: number) => {
                                            const pricePerDay = parseFloat(item.product?.discounted_price_per_day || item.product?.price_per_day || '0');
                                            const itemSubtotal = pricePerDay * diffDays;
                                            let itemDeposit = parseFloat(item.product?.security_deposit);

                                            if (isNaN(itemDeposit) || itemDeposit <= 0) {
                                                itemDeposit = pricePerDay * 0.20;
                                            }

                                            return (
                                                <div key={item.id || index} className={`flex gap-4 ${index > 0 ? 'pt-4' : ''}`}>
                                                    <div className="w-14 h-18 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                        <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="font-extrabold text-slate-900 text-xs truncate">{item.product?.name}</h4>
                                                            <p className="text-[9px] text-[#805056] capitalize">{item.product?.category?.name}</p>
                                                            
                                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                                {item.selectedSize && (
                                                                    <span className="text-[8px] font-bold text-[#782331] bg-[#782331]/5 px-1.5 py-0.5 rounded border border-[#782331]/10">
                                                                        Talla: {item.selectedSize}
                                                                    </span>
                                                                )}
                                                                {item.selectedColor && (
                                                                    <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 capitalize">
                                                                        Color: {item.selectedColor}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center text-[10px] text-[#805056] mt-2 pt-1.5 border-t border-dashed border-[#fbf2f4]">
                                                            <span>Renta: S/ {itemSubtotal.toFixed(2)}</span>
                                                            <span className="font-semibold">Garantía: S/ {itemDeposit.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white border border-[#f5dce0]/85 rounded-3xl p-6 shadow-sm space-y-6">
                                    
                                    <h3 className="text-base font-extrabold text-[#4a1018] tracking-wide border-b border-[#fbf2f4] pb-4 font-serif">
                                        Resumen de Alquiler
                                    </h3>
                                    
                                    {/* Selector de Fechas en el Resumen */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <Calendar size={12} className="text-[#782331]" />
                                                Fecha de Recojo
                                            </label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={e => setData('start_date', e.target.value)}
                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-xs font-semibold [color-scheme:light]"
                                                required
                                            />
                                            {errors.start_date && <p className="text-[#782331] text-xs mt-1">{errors.start_date}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-[#805056] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                <Calendar size={12} className="text-[#782331]" />
                                                Fecha de Devolución
                                            </label>
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                min={data.start_date || new Date().toISOString().split('T')[0]}
                                                onChange={e => setData('end_date', e.target.value)}
                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-xs font-semibold [color-scheme:light]"
                                                required
                                            />
                                            {errors.end_date && <p className="text-[#782331] text-xs mt-1">{errors.end_date}</p>}
                                        </div>
                                    </div>

                                    {/* Desglose de Precios */}
                                    <div className="bg-[#fdf6f7]/60 rounded-2xl p-4 border border-[#f5dce0]/40 space-y-3.5 text-xs">
                                        <div className="flex justify-between items-center text-[#805056] font-medium">
                                            <span>Días de renta</span>
                                            <span className="text-[#4a1018] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#f5dce0]/80 shadow-sm">
                                                {diffDays} {diffDays === 1 ? 'día' : 'días'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-2 border-t border-[#fbf2f4]">
                                            <span className="text-[#805056]">Subtotal ({diffDays} días)</span>
                                            <span className="text-[#4a1018] font-bold">S/ {subtotal.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#805056] flex items-center gap-1">
                                                Garantía Reembolsable
                                            </span>
                                            <span className="text-[#4a1018] font-bold">S/ {garantia.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Sección del Total */}
                                    <div className="border-t border-[#fbf2f4] pt-5">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-[10px] text-[#805056] font-bold uppercase tracking-wider">Monto Total</span>
                                                <div className="text-[9px] text-[#805056]/60 font-medium mt-0.5">Incluye reembolso de garantía</div>
                                            </div>
                                            <span className="text-2xl font-extrabold text-[#782331] tracking-tight">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Mensaje de Error de Pago */}
                                    {errors.payment_method && (
                                        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-xs font-semibold select-none leading-normal">
                                            <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
                                            <span>{errors.payment_method}</span>
                                        </div>
                                    )}

                                    {/* Selector de sub-método de Mercado Pago */}
                                    <div className="flex gap-2 p-1.5 bg-[#fbf2f4] rounded-2xl border border-[#f5dce0]/65 text-[11px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setMpMethod('card')}
                                            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                                                mpMethod === 'card'
                                                    ? 'bg-[#782331] text-white shadow-sm font-extrabold'
                                                    : 'text-[#805056] hover:text-[#4a1018]'
                                            }`}
                                        >
                                            Tarjeta Crédito/Débito
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMpMethod('wallet')}
                                            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                                                mpMethod === 'wallet'
                                                    ? 'bg-[#782331] text-white shadow-sm font-extrabold'
                                                    : 'text-[#805056] hover:text-[#4a1018]'
                                            }`}
                                        >
                                            Billetera Mercado Pago
                                        </button>
                                    </div>

                                    {/* Renderizado condicional según sub-método elegido */}
                                    {mpMethod === 'card' ? (
                                        <div className="pt-2 relative z-10 select-none">
                                            {mercadopago_public_key ? (
                                                <CardPayment
                                                    initialization={{
                                                        amount: total,
                                                        payer: {
                                                            email: data.email || auth.user?.email || '',
                                                        }
                                                    }}
                                                    onSubmit={handleCardPaymentSubmit}
                                                    onError={(error) => {
                                                        console.error('Error en el Brick de Mercado Pago:', error);
                                                    }}
                                                    customization={{
                                                        visual: {
                                                            style: {
                                                                theme: 'flat',
                                                            }
                                                        },
                                                        paymentMethods: {
                                                            maxInstallments: 12,
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold text-center">
                                                    Cargando pasarela de pagos segura...
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={handleWalletPaymentSubmit}
                                                disabled={processing}
                                                className="w-full bg-[#782331] hover:bg-[#8e2a39] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#782331]/20 hover:shadow-lg disabled:opacity-50 tracking-wider text-xs uppercase cursor-pointer"
                                            >
                                                {processing ? (
                                                    <>
                                                        <RefreshCw className="animate-spin" size={14} />
                                                        <span>Procesando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={13} />
                                                        <span>Pagar con Mercado Pago Wallet</span>
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-[10px] text-[#805056]/80 text-center mt-2.5 leading-normal">
                                                Te redirigiremos a Mercado Pago de forma segura para ingresar con tu cuenta (e-mail de comprador) y autorizar el pago con tu saldo ficticio.
                                            </p>
                                        </div>
                                    )}

                                    {/* Distintivos de Confianza */}
                                    <div className="pt-4 border-t border-[#fbf2f4] flex flex-col items-[#805056] justify-center gap-2 text-[10px] text-[#805056]/80 font-medium">
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Shield size={12} className="text-[#782331]" />
                                            <span>Alquiler protegido por reglamento UNSCH</span>
                                        </div>
                                        <div className="flex items-center gap-1 justify-center">
                                            <Lock size={10} />
                                            <span>Transacción encriptada SSL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
