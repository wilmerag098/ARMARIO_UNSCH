import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { 
    Check, CreditCard, Lock, AlertCircle, 
    Calendar, User as UserIcon, Mail, Shield, Sparkles, 
    GraduationCap, Phone, CheckCircle2, RefreshCw, Key, Info, Tag, X, FileText,
    MapPin, Truck, ShoppingBag, Wallet, ShieldCheck, QrCode, Zap, Smartphone, KeyRound, HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

const { defaultStartDate, defaultEndDate } = (() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return { defaultStartDate: todayStr, defaultEndDate: todayStr };
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
    const [mpMethod, setMpMethod] = useState<'yape' | 'card' | 'wallet'>('yape');
    const [yapeMode, setYapeMode] = useState<'otp' | 'qr'>('otp');
    const [yapePhone, setYapePhone] = useState('');
    const [yapeApprovalCode, setYapeApprovalCode] = useState('');
    const [isPreferenceLoading, setIsPreferenceLoading] = useState(false);

    const handlePreferencePaymentSubmit = async (selectedMethod: 'mercadopago_yape' | 'mercadopago_wallet' = 'mercadopago_yape') => {
        if (!validateCheckoutForm()) {
            return;
        }

        setIsPreferenceLoading(true);

        const payload = {
            product_id: data.product_id,
            inventory_id: data.inventory_id,
            color: data.color,
            start_date: data.start_date,
            end_date: data.end_date,
            accessories: data.accessories,
            payment_method: selectedMethod,
            name: data.name || auth.user?.name || '',
            last_name: data.last_name || auth.user?.last_name || '',
            dni: data.dni || auth.user?.dni || '',
            university_id: data.university_id || auth.user?.university_id || '',
            phone: data.phone || auth.user?.phone || '',
            email: data.email || auth.user?.email || '',
            yape_phone: yapePhone,
            yape_approval_code: yapeMode === 'otp' ? yapeApprovalCode : '',
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
                        },
                        onError: (errs) => {
                            alert(Object.values(errs).join('\n') || 'Ocurrió un error al procesar el pago.');
                        },
                        onFinish: () => {
                            setIsPreferenceLoading(false);
                        }
                    });
                },
                onError: (errs) => {
                    alert(Object.values(errs).join('\n') || 'Ocurrió un error al registrar tus datos.');
                },
                onFinish: () => {
                    setIsPreferenceLoading(false);
                }
            });
        } else {
            // Usuario ya logueado
            router.post('/checkout', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    clearCart();
                },
                onError: (errs) => {
                    alert(Object.values(errs).join('\n') || 'Ocurrió un error al procesar el pago.');
                },
                onFinish: () => {
                    setIsPreferenceLoading(false);
                }
            });
        }
    };
    
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

    const calculateDaysDifference = (startStr: string, endStr: string) => {
        if (!startStr || !endStr) return 1;
        const [sY, sM, sD] = startStr.split('-').map(Number);
        const [eY, eM, eD] = endStr.split('-').map(Number);
        if (isNaN(sY) || isNaN(eY)) return 1;
        const sDate = Date.UTC(sY, sM - 1, sD);
        const eDate = Date.UTC(eY, eM - 1, eD);
        const diffMs = eDate - sDate;
        const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

        return days > 0 ? days : 1;
    };

    const getTomorrowString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tomorrow.toISOString().split('T')[0];
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const calculateTotal = () => {
        const itemsToCalculate = cartItems.length > 0 ? cartItems : [{
            product,
            selectedSize: sizeParam || 'M',
            selectedColor: colorParam || '',
            startDate: data.start_date,
            endDate: data.end_date,
            rentDays: calculateDaysDifference(data.start_date, data.end_date)
        }];

        let totalSubtotal = 0;
        let totalDeposit = 0;
        const itemBreakdowns: any[] = [];

        itemsToCalculate.forEach((item: any) => {
            const itemStart = item.startDate || data.start_date;
            const itemEnd = item.endDate || data.end_date;
            const itemDays = calculateDaysDifference(itemStart, itemEnd);
            const dailyPrice = parseFloat(item.product?.discounted_price_per_day || item.product?.price_per_day || '0');
            const itemSubtotal = dailyPrice * itemDays;

            const rawDep = parseFloat(item.product?.security_deposit);
            const itemDeposit = (!isNaN(rawDep) && rawDep > 0) ? rawDep : (dailyPrice * 0.20);

            totalSubtotal += itemSubtotal;
            totalDeposit += itemDeposit;

            itemBreakdowns.push({
                ...item,
                rentDays: itemDays,
                dailyPrice,
                itemSubtotal,
                itemDeposit,
                itemTotal: itemSubtotal + itemDeposit,
                startDateFormatted: formatDate(itemStart),
                endDateFormatted: formatDate(itemEnd)
            });
        });

        // Apply discount on accessories or main subtotal if promotion exists and subtotal > promotion min_amount
        let discountAmount = 0;
        if (promotion && totalSubtotal > parseFloat(promotion.min_amount)) {
            if (parseFloat(promotion.discount_percentage) > 0) {
                discountAmount = (totalSubtotal * parseFloat(promotion.discount_percentage)) / 100;
            }
        }

        const grandTotal = totalSubtotal + totalDeposit - discountAmount;

        return { 
            diffDays: itemBreakdowns[0]?.rentDays || calculateDaysDifference(data.start_date, data.end_date), 
            itemBreakdowns,
            subtotal: totalSubtotal, 
            garantia: totalDeposit, 
            discountAmount,
            total: grandTotal 
        };
    };

    const { diffDays, itemBreakdowns, subtotal, garantia, discountAmount, total } = calculateTotal();

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
            const currentName = data.name || auth.user?.name;
            const currentEmail = data.email || auth.user?.email;

            if (!currentName || !currentEmail) {
                alert('Por favor, ingresa tu nombre y correo electrónico.');

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

                                <div className="bg-white border border-[#f5dce0]/85 rounded-3xl p-6 shadow-sm space-y-5">
                                    
                                    <p className="text-xs font-bold text-[#4a1018] uppercase tracking-wider border-b border-[#fbf2f4] pb-3">
                                        Definir Período de Alquiler:
                                    </p>
                                    
                                    {/* Selector de Rango de Fechas (Grid de 2 Columnas idéntico a Producto) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-[#805056] font-bold uppercase tracking-wider block mb-1.5">Recojo</label>
                                            <input
                                                type="date"
                                                value={data.start_date}
                                                min={getTomorrowString()}
                                                onChange={e => {
                                                    const newStart = e.target.value;
                                                    if (new Date(newStart) > new Date(data.end_date)) {
                                                        setData(prev => ({ ...prev, start_date: newStart, end_date: newStart }));
                                                    } else {
                                                        setData('start_date', newStart);
                                                    }
                                                }}
                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-xs font-semibold [color-scheme:light] cursor-pointer"
                                                required
                                            />
                                            {errors.start_date && <p className="text-[#782331] text-xs mt-1">{errors.start_date}</p>}
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[#805056] font-bold uppercase tracking-wider block mb-1.5">Devolución</label>
                                            <input
                                                type="date"
                                                value={data.end_date}
                                                min={data.start_date || getTomorrowString()}
                                                onChange={e => setData('end_date', e.target.value)}
                                                className="w-full bg-white border border-[#f5dce0] text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#782331] focus:ring-1 focus:ring-[#782331] transition-all text-xs font-semibold [color-scheme:light] cursor-pointer"
                                                required
                                            />
                                            {errors.end_date && <p className="text-[#782331] text-xs mt-1">{errors.end_date}</p>}
                                        </div>
                                    </div>

                                    {/* Desglose Tarifario idéntico a Producto.tsx */}
                                    <div className="bg-[#fdf6f7]/60 rounded-2xl p-4 border border-[#f5dce0]/40 space-y-2.5 text-xs">
                                        <div className="flex justify-between items-center text-[#805056]">
                                            <span>Costo Alquiler ({diffDays} {diffDays === 1 ? 'día' : 'días'}: {formatDate(data.start_date)} {data.start_date === data.end_date ? '' : `al ${formatDate(data.end_date)}`})</span>
                                            <span className="text-[#4a1018] font-semibold">S/ {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#805056]">
                                            <span>Garantía Reembolsable</span>
                                            <span className="text-[#4a1018] font-semibold">S/ {garantia.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-[#f5dce0]/60">
                                            <span className="text-[#4a1018] font-bold uppercase tracking-wider text-xs">Total Estimado</span>
                                            <span className="text-[#782331] font-extrabold text-lg">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Mensaje de Error de Pago */}
                                    {errors.payment_method && (
                                        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-2.5 text-xs font-semibold select-none leading-normal">
                                            <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
                                            <span>{errors.payment_method}</span>
                                        </div>
                                    )}

                                    {/* Selector de sub-método de Pago (Yape, Tarjeta, Billetera MP) */}
                                    <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#fbf2f4] rounded-2xl border border-[#f5dce0]/80 text-[10px] md:text-[11px] font-bold shadow-inner">
                                        <button
                                            type="button"
                                            onClick={() => setMpMethod('yape')}
                                            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                                                mpMethod === 'yape'
                                                    ? 'bg-[#782331] text-white shadow-md font-extrabold scale-[1.02]'
                                                    : 'text-[#805056] hover:text-[#4a1018] hover:bg-white/50'
                                            }`}
                                        >
                                            <QrCode size={14} className={mpMethod === 'yape' ? 'text-[#ffb6c5]' : 'text-[#782331]'} />
                                            <span>Yape</span>
                                            <span className="hidden sm:inline-block text-[8px] bg-[#00D396] text-black font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-xs">
                                                QR
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMpMethod('card')}
                                            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                mpMethod === 'card'
                                                    ? 'bg-[#782331] text-white shadow-md font-extrabold scale-[1.02]'
                                                    : 'text-[#805056] hover:text-[#4a1018] hover:bg-white/50'
                                            }`}
                                        >
                                            <CreditCard size={14} className={mpMethod === 'card' ? 'text-white' : 'text-[#782331]'} />
                                            <span>Tarjeta</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMpMethod('wallet')}
                                            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                mpMethod === 'wallet'
                                                    ? 'bg-[#782331] text-white shadow-md font-extrabold scale-[1.02]'
                                                    : 'text-[#805056] hover:text-[#4a1018] hover:bg-white/50'
                                            }`}
                                        >
                                            <Wallet size={14} className={mpMethod === 'wallet' ? 'text-white' : 'text-[#782331]'} />
                                            <span>Billetera MP</span>
                                        </button>
                                    </div>

                                    {/* Renderizado condicional según sub-método elegido */}
                                    {mpMethod === 'yape' ? (
                                        <div className="pt-2 space-y-4">
                                            {/* Banner Ilustrativo de Yape Directo / QR */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-[#4c1d68] via-[#782331] to-[#8e2a39] text-white p-4.5 rounded-2xl shadow-md border border-[#9d3c56]/30">
                                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#00D396]/15 rounded-full blur-2xl pointer-events-none"></div>
                                                
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-[#00D396] text-slate-900 rounded-lg shrink-0">
                                                            <Zap size={15} className="fill-current" />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs uppercase font-extrabold tracking-wider text-white block">Yape Directo (Código de Aprobación)</span>
                                                            <span className="text-[9px] text-[#fbd5db] block font-medium">Procesamiento instantáneo en línea</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-black bg-[#00D396] text-slate-900 px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                                                        Sin Redirección
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-end pt-2 border-t border-white/10 relative z-10">
                                                    <div>
                                                        <div className="text-[9px] text-[#f5dce0]/80 font-mono tracking-widest uppercase">Monto a Yapear</div>
                                                        <div className="text-lg font-black tracking-tight text-white">S/ {total.toFixed(2)}</div>
                                                    </div>
                                                    <div className="text-right flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setYapeMode('otp')}
                                                            className={`px-2 py-1 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${yapeMode === 'otp' ? 'bg-white text-[#782331] shadow-xs' : 'bg-black/20 text-white/80 hover:bg-black/40'}`}
                                                        >
                                                            Código OTP
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setYapeMode('qr')}
                                                            className={`px-2 py-1 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${yapeMode === 'qr' ? 'bg-white text-[#782331] shadow-xs' : 'bg-black/20 text-white/80 hover:bg-black/40'}`}
                                                        >
                                                            Código QR
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {yapeMode === 'otp' ? (
                                                <div className="space-y-3 bg-[#fdf6f7] border border-[#f5dce0]/80 rounded-2xl p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-extrabold text-[#782331] flex items-center gap-1.5">
                                                            <KeyRound size={15} /> Ingresa tus Datos de Yape
                                                        </span>
                                                        <span className="text-[9px] text-[#805056] font-medium bg-white px-2 py-0.5 rounded-md border border-[#f5dce0]">
                                                            6 dígitos Yape
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[#805056] uppercase mb-1">
                                                                Celular Yape *
                                                            </label>
                                                            <div className="relative">
                                                                <Smartphone className="absolute left-3 top-2.5 text-[#782331]" size={15} />
                                                                <input
                                                                    type="tel"
                                                                    maxLength={9}
                                                                    placeholder="Ej. 987654321"
                                                                    value={yapePhone}
                                                                    onChange={(e) => setYapePhone(e.target.value.replace(/\D/g, ''))}
                                                                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-[#f5dce0] rounded-xl focus:ring-2 focus:ring-[#782331] focus:border-transparent outline-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-[#805056] uppercase mb-1">
                                                                Código de Aprobación *
                                                            </label>
                                                            <div className="relative">
                                                                <KeyRound className="absolute left-3 top-2.5 text-[#782331]" size={15} />
                                                                <input
                                                                    type="text"
                                                                    maxLength={6}
                                                                    placeholder="Ej. 123456"
                                                                    value={yapeApprovalCode}
                                                                    onChange={(e) => setYapeApprovalCode(e.target.value.replace(/\D/g, ''))}
                                                                    className="w-full pl-9 pr-3 py-2 text-xs font-extrabold font-mono tracking-widest text-[#782331] bg-white border border-[#f5dce0] rounded-xl focus:ring-2 focus:ring-[#782331] focus:border-transparent outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Guía rápida de obtención del Código de Aprobación */}
                                                    <div className="p-2.5 bg-white rounded-xl border border-[#f5dce0]/60 text-[10px] text-[#805056] space-y-1">
                                                        <div className="font-bold text-[#782331] flex items-center gap-1">
                                                            <HelpCircle size={12} /> ¿Dónde encuentro mi Código de Aprobación?
                                                        </div>
                                                        <ol className="list-decimal list-inside space-y-0.5 leading-relaxed pl-1 text-[9.5px]">
                                                            <li>Abre tu App <strong>Yape</strong> en tu celular.</li>
                                                            <li>Toca el menú <strong>☰</strong> (arriba a la izquierda).</li>
                                                            <li>Selecciona <strong>"Código de aprobación"</strong> y copia los 6 dígitos.</li>
                                                        </ol>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreferencePaymentSubmit('mercadopago_yape')}
                                                        disabled={isPreferenceLoading || !yapeApprovalCode || yapeApprovalCode.length < 6}
                                                        className="w-full bg-gradient-to-r from-[#6b1e2c] via-[#782331] to-[#8e2a39] hover:from-[#571622] hover:to-[#782331] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#782331]/25 hover:shadow-lg disabled:opacity-50 tracking-wider text-xs uppercase cursor-pointer"
                                                    >
                                                        {isPreferenceLoading ? (
                                                            <>
                                                                <RefreshCw className="animate-spin text-[#ffb6c5]" size={16} />
                                                                <span>Procesando Código de Yape...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Zap size={16} className="text-[#00D396] fill-current" />
                                                                <span>CONFIRMAR YAPEO S/ {total.toFixed(2)}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Guía Interactiva de 3 Pasos QR */}
                                                    <div className="bg-[#fdf6f7] border border-[#f5dce0]/80 rounded-2xl p-4 text-xs space-y-3">
                                                        <div className="flex items-center gap-2 text-[#782331] font-bold">
                                                            <Sparkles size={15} />
                                                            <span>¿Cómo funciona el pago con QR Yape?</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-center pt-1">
                                                            <div className="bg-white p-2.5 rounded-xl border border-[#f5dce0]/60 shadow-2xs">
                                                                <span className="block text-[10px] font-extrabold text-[#782331]">1. Haz Clic</span>
                                                                <span className="text-[9px] text-[#805056] leading-tight block mt-0.5">Inicia el pago seguro</span>
                                                            </div>
                                                            <div className="bg-white p-2.5 rounded-xl border border-[#f5dce0]/60 shadow-2xs">
                                                                <span className="block text-[10px] font-extrabold text-[#782331]">2. Escanea QR</span>
                                                                <span className="text-[9px] text-[#805056] leading-tight block mt-0.5">Desde tu app Yape</span>
                                                            </div>
                                                            <div className="bg-white p-2.5 rounded-xl border border-[#f5dce0]/60 shadow-2xs">
                                                                <span className="block text-[10px] font-extrabold text-[#782331]">3. Confirma</span>
                                                                <span className="text-[9px] text-[#805056] leading-tight block mt-0.5">Reserva inmediata</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Botón QR Yape */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreferencePaymentSubmit('mercadopago_yape')}
                                                        disabled={isPreferenceLoading}
                                                        className="w-full bg-gradient-to-r from-[#6b1e2c] via-[#782331] to-[#8e2a39] hover:from-[#571622] hover:to-[#782331] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#782331]/25 hover:shadow-lg disabled:opacity-50 tracking-wider text-xs uppercase cursor-pointer"
                                                    >
                                                        {isPreferenceLoading ? (
                                                            <>
                                                                <RefreshCw className="animate-spin text-[#ffb6c5]" size={16} />
                                                                <span>Generando QR de Yape y Redirigiendo...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <QrCode size={16} className="text-[#ffb6c5]" />
                                                                <span>PAGAR S/ {total.toFixed(2)} CON QR DE YAPE</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : mpMethod === 'card' ? (
                                        <div className="pt-2 space-y-4">
                                            {/* Tarjeta Visual Decorativa de Seguridad */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-[#4a1018] via-[#782331] to-[#8e2a39] text-white p-4.5 rounded-2xl shadow-md border border-[#a83a4c]/30">
                                                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                                
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck size={16} className="text-[#ffb6c5]" />
                                                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#fbd5db]">Pasarela Segura</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs text-white border border-white/20">
                                                        SSL 256-bit
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-end pt-1 relative z-10">
                                                    <div>
                                                        <div className="text-[9px] text-[#f5dce0]/80 font-mono tracking-widest uppercase">Monto a Autorizar</div>
                                                        <div className="text-base font-extrabold tracking-tight text-white">S/ {total.toFixed(2)}</div>
                                                    </div>
                                                    <div className="flex gap-1.5 items-center opacity-90">
                                                        <span className="text-[9px] font-mono font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded border border-white/10">
                                                            VISA • MC • AMEX
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mercado Pago Card Brick con Customización de Estilo en Vino Tinto */}
                                            <div className="relative z-10 select-none">
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
                                                                    customVariables: {
                                                                        baseColor: '#782331',
                                                                        baseColorFirstVariant: '#8e2a39',
                                                                        baseColorSecondVariant: '#5c1a25',
                                                                        outlinePrimaryColor: '#782331',
                                                                        borderRadiusMedium: '12px',
                                                                        borderRadiusLarge: '16px',
                                                                        inputFocusedBoxShadow: '0 0 0 2px rgba(120, 35, 49, 0.2)',
                                                                    }
                                                                }
                                                            },
                                                            paymentMethods: {
                                                                maxInstallments: 12,
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                                                        <RefreshCw className="animate-spin text-amber-600" size={14} />
                                                        <span>Cargando pasarela de pagos segura...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 space-y-4">
                                            <div className="bg-[#fdf6f7] border border-[#f5dce0]/80 rounded-2xl p-4 text-xs space-y-3">
                                                <div className="flex items-center gap-2 text-[#782331] font-bold">
                                                    <Sparkles size={16} />
                                                    <span>Pago Instantáneo con Mercado Pago Wallet</span>
                                                </div>
                                                <p className="text-[#805056] text-[11px] leading-relaxed">
                                                    Usa tu saldo disponible en tu cuenta de Mercado Pago o tus tarjetas guardadas sin necesidad de volver a digitar los datos.
                                                </p>
                                                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                                                    <div className="bg-[#fff] p-2 rounded-xl border border-[#f5dce0]/60">
                                                        <span className="block text-[10px] font-bold text-[#4a1018]">1. Clic</span>
                                                        <span className="text-[9px] text-[#805056]">Iniciar pago</span>
                                                    </div>
                                                    <div className="bg-[#fff] p-2 rounded-xl border border-[#f5dce0]/60">
                                                        <span className="block text-[10px] font-bold text-[#4a1018]">2. Inicia Sesión</span>
                                                        <span className="text-[9px] text-[#805056]">En Mercado Pago</span>
                                                    </div>
                                                    <div className="bg-[#fff] p-2 rounded-xl border border-[#f5dce0]/60">
                                                        <span className="block text-[10px] font-bold text-[#4a1018]">3. Confirma</span>
                                                        <span className="text-[9px] text-[#805056]">¡Y listo!</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handlePreferencePaymentSubmit('mercadopago_wallet')}
                                                disabled={isPreferenceLoading}
                                                className="w-full bg-[#782331] hover:bg-[#8e2a39] text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#782331]/20 hover:shadow-lg disabled:opacity-50 tracking-wider text-xs uppercase cursor-pointer"
                                            >
                                                {isPreferenceLoading ? (
                                                    <>
                                                        <RefreshCw className="animate-spin" size={14} />
                                                        <span>Procesando Mercado Pago...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={13} />
                                                        <span>Pagar con Mercado Pago Wallet</span>
                                                    </>
                                                )}
                                            </button>
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
