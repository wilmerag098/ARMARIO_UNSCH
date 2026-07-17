import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, HelpCircle, Check, CreditCard, QrCode, Building, Lock, AlertCircle, MapPin, Home } from 'lucide-react';

export default function Checkout({ product, accessories = [], promotion }: { product: any; accessories?: any[]; promotion?: any }) {
    const { auth } = usePage().props;
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('yape');

    const sizeParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('size') : '';
    const startParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('start') : null;
    const endParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('end') : null;
    const initialInventory = product?.inventories?.find((i: any) => i.size === sizeParam) || product?.inventories?.[0];

    const { data, setData, post, processing, errors } = useForm({
        product_id: product?.id,
        inventory_id: initialInventory?.id || '',
        start_date: startParam || new Date().toISOString().split('T')[0],
        end_date: endParam || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        name: '',
        university_id: '',
        address: '',
        email: '',
        password: '',
        accessories: [] as { product_id: number; inventory_id: number }[],
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
        post('/checkout', {
            preserveScroll: true,
            onSuccess: () => {
                setStep(4);
            }
        });
    };

    const handleNextStep1 = () => {
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

    return (
        <div className="min-h-screen bg-[#120202] text-white font-sans selection:bg-[#ffb6c5] selection:text-[#1b0308]">
            <Head title="Checkout" />

            {/* Header */}
            <header className="bg-[#1b0308] border-b border-[#3a0d16]/50 py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <Link href={`/producto/${product?.slug}`} className="text-white/70 hover:text-[#ffb6c5] transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-[#ffb6c5]">Checkout</h1>
                <button className="text-white/70 hover:text-[#ffb6c5] transition-colors">
                    <HelpCircle size={24} />
                </button>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-12 max-w-screen-lg">

                {/* Progress Bar */}
                {step < 4 && (
                    <div className="bg-[#23060c] border border-[#3a0d16] rounded-2xl p-6 mb-8 md:mb-10 shadow-lg">
                        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                            <div className="absolute top-4 left-0 w-full h-[2px] bg-[#3a0d16] -z-0"></div>

                            <div className="flex flex-col items-center gap-2 bg-[#23060c] px-4 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/20' : 'bg-[#3a0d16] text-white/50'}`}>
                                    {step > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
                                </div>
                                <span className={`text-[11px] md:text-xs font-semibold ${step >= 1 ? 'text-[#ffb6c5]' : 'text-white/50'}`}>Info. Personal</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 bg-[#23060c] px-4 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/20' : 'bg-[#3a0d16] text-white/50'}`}>
                                    {step > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
                                </div>
                                <span className={`text-[11px] md:text-xs font-semibold ${step >= 2 ? 'text-[#ffb6c5]' : 'text-white/50'}`}>Reserva</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 bg-[#23060c] px-4 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 3 ? 'bg-[#ffb6c5] text-[#1b0308] shadow-lg shadow-[#ffb6c5]/20' : 'bg-[#3a0d16] text-white/50'}`}>
                                    {step > 3 ? <Check size={16} strokeWidth={3} /> : '3'}
                                </div>
                                <span className={`text-[11px] md:text-xs font-semibold ${step >= 3 ? 'text-[#ffb6c5]' : 'text-white/50'}`}>Pago</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 w-full shadow-xl">
                            {auth.user ? (
                                <>
                                    <h2 className="text-2xl font-bold text-white mb-2">Detalles Personales</h2>
                                    <p className="text-white/60 text-sm mb-8">
                                        Por favor, verifica tu información antes de continuar.
                                    </p>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-[#ffb6c5] mb-2">Nombre Completo</label>
                                            <input type="text" value={auth.user?.name} disabled className="w-full bg-[#120202]/50 border border-[#3a0d16]/30 text-white/50 rounded-xl px-4 py-3.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#ffb6c5] mb-2">Correo Electrónico</label>
                                            <input type="email" value={auth.user?.email} disabled className="w-full bg-[#120202]/50 border border-[#3a0d16]/30 text-white/50 rounded-xl px-4 py-3.5" />
                                        </div>

                                        <div className="pt-4">
                                            <h3 className="text-[#ffb6c5] font-extrabold text-sm uppercase tracking-wider mb-4 border-b border-[#3a0d16] pb-2">
                                                FECHAS DE ALQUILER
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">FECHA DE RECOJO</label>
                                                    <input
                                                        type="date"
                                                        value={data.start_date}
                                                        onChange={e => setData('start_date', e.target.value)}
                                                        className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] transition-colors [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">FECHA DE DEVOLUCIÓN</label>
                                                    <input
                                                        type="date"
                                                        value={data.end_date}
                                                        onChange={e => setData('end_date', e.target.value)}
                                                        className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ffb6c5] transition-colors [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-white mb-2">Registro Rápido</h2>
                                    <p className="text-white/60 text-sm mb-8">
                                        Ingresa tus datos para registrarte y continuar con tu reserva.
                                    </p>

                                    <div className="space-y-5">
                                        <h3 className="text-[#facc15] font-extrabold text-sm uppercase tracking-wider mb-4 border-b border-[#3a0d16] pb-2">
                                            DATOS DEL SOLICITANTE
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">Nombre Completo</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    placeholder="Ej. Juan Pérez"
                                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors"
                                                    required
                                                />
                                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">Código Universitario</label>
                                                <input
                                                    type="text"
                                                    value={data.university_id}
                                                    onChange={e => setData('university_id', e.target.value)}
                                                    placeholder="Ej. 18234567"
                                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors"
                                                />
                                                {errors.university_id && <p className="text-red-400 text-xs mt-1">{errors.university_id}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">Dirección de Residencia</label>
                                            <input
                                                type="text"
                                                value={data.address}
                                                onChange={e => setData('address', e.target.value)}
                                                placeholder="Ej. Av. Independencia 123"
                                                className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors"
                                            />
                                            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">Correo Electrónico</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    placeholder="Ej. juan@ejemplo.com"
                                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors"
                                                    required
                                                />
                                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">Contraseña</label>
                                                <input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    placeholder="********"
                                                    className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors"
                                                    required
                                                    minLength={8}
                                                />
                                                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <h3 className="text-[#facc15] font-extrabold text-sm uppercase tracking-wider mb-4 border-b border-[#3a0d16] pb-2">
                                                FECHAS DE ALQUILER
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">FECHA DE RECOJO</label>
                                                    <input
                                                        type="date"
                                                        value={data.start_date}
                                                        onChange={e => setData('start_date', e.target.value)}
                                                        className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-white/70 uppercase mb-2">FECHA DE DEVOLUCIÓN</label>
                                                    <input
                                                        type="date"
                                                        value={data.end_date}
                                                        onChange={e => setData('end_date', e.target.value)}
                                                        className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#facc15] transition-colors [color-scheme:dark]"
                                                        required
                                                    />
                                                    {errors.end_date && <p className="text-red-400 text-xs mt-1">{errors.end_date}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="lg:w-[380px] w-full bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Resumen de Orden</h3>
                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/70">{product?.name}</span>
                                    <span className="text-white font-medium">S/ {product?.price_per_day} / día</span>
                                </div>
                            </div>
                            <button
                                onClick={handleNextStep1}
                                disabled={processing}
                                className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#ffb6c5]/20 disabled:opacity-50"
                            >
                                {processing ? 'PROCESANDO...' : (auth.user ? 'SIGUIENTE' : 'REGISTRAR Y CONTINUAR')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-xl">
                                <h2 className="text-2xl font-bold text-white mb-6">Detalles de Reserva</h2>

                                <div className="space-y-6">
                                    <div className="flex gap-4 pb-6 border-b border-[#3a0d16]">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#120202]">
                                            <img src={product?.image_url} alt={product?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-[#ffb6c5] mb-1">{product?.name}</h4>
                                                <p className="text-xs text-white/50 flex items-center gap-1 mb-2">
                                                    {product?.category?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-white">S/ {product?.price_per_day}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Talla</label>
                                        <select
                                            value={data.inventory_id}
                                            onChange={e => setData('inventory_id', e.target.value)}
                                            className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#ffb6c5] transition-colors"
                                        >
                                            <option value="" disabled>Seleccionar Talla</option>
                                            {product?.inventories?.map((inv: any) => (
                                                <option key={inv.id} value={inv.id}>Talla {inv.size}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {accessories.length > 0 && (
                                        <div className="pt-6 border-t border-[#3a0d16]/30">
                                            <h3 className="text-base font-bold text-[#ffb6c5] mb-2">¡Completa tu outfit!</h3>
                                            <p className="text-xs text-white/50 mb-4">
                                                Alquila accesorios adicionales. Si tu renta principal supera los S/ 100.00, obtienes un 15% de descuento automático en ellos.
                                            </p>
                                            
                                            {isPromoApplicable && (
                                                <div className="bg-[#ffb6c5]/10 border border-[#ffb6c5]/20 p-3 rounded-xl mb-4 text-xs text-[#ffb6c5] flex flex-col gap-1">
                                                    <span className="font-bold uppercase tracking-wider text-[10px]">¡Promoción Aplicada!</span>
                                                    <span>15% de descuento en accesorios activado (Renta principal &gt; S/ 100.00)</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-3">
                                                {accessories.map((acc: any) => {
                                                    const isChecked = data.accessories.some((item) => item.product_id === acc.id);
                                                    const availableInv = acc.inventories?.[0]; // Grab first available inventory item
                                                    
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
                                                            className={`flex items-center gap-3 p-3 bg-[#120202]/40 border rounded-xl cursor-pointer select-none transition-all ${
                                                                isChecked ? 'border-[#ffb6c5] bg-[#23060c]/20' : 'border-[#3a0d16] hover:border-[#ffb6c5]/40'
                                                            }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                                                isChecked ? 'bg-[#ffb6c5] border-[#ffb6c5] text-[#1b0308]' : 'border-white/30 text-transparent'
                                                            }`}>
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                            <div className="w-12 h-16 rounded overflow-hidden shrink-0 bg-neutral-900 border border-[#3a0d16]/30">
                                                                <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                                                                <p className="text-[10px] text-white/50">{acc.inventories?.[0] ? `Talla ${acc.inventories[0].size}` : 'Stock disponible'}</p>
                                                                <p className="text-xs font-bold text-[#ffb6c5] mt-1">S/ {parseFloat(acc.price_per_day).toFixed(2)} / día</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-[380px] w-full bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Resumen</h3>
                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-white/70">Días ({diffDays})</span>
                                    <span className="text-white font-medium">S/ {subtotal.toFixed(2)}</span>
                                </div>
                                {accessoriesSubtotal > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-white/70">Accesorios ({diffDays} d.)</span>
                                        <span className="text-white font-medium">S/ {accessoriesSubtotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-400 font-medium bg-green-500/10 p-2 rounded-lg">
                                        <span className="text-xs">Descuento (15% Accesorios)</span>
                                        <span className="text-xs">- S/ {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-white/70">Tarifa de Servicio</span>
                                    <span className="text-white font-medium">S/ {serviceFee.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="border-t border-[#3a0d16] pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-[#ffb6c5]">S/ {total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setStep(3)}
                                className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#ffb6c5]/20"
                            >
                                CONTINUAR AL PAGO
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                                <h3 className="text-xl font-bold text-[#ffb6c5] border-b border-[#3a0d16] pb-3 flex items-center gap-2">
                                    <QrCode className="h-6 w-6" />
                                    Método de Pago: Yape / Plin
                                </h3>

                                <p className="text-white/70 text-sm leading-relaxed">
                                    Escanee cualquiera de los siguientes códigos QR desde la aplicación de su banco (Yape o Plin) para realizar el pago correspondiente. Una vez efectuado, haga clic en "CONFIRMAR EL PAGO".
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {/* Yape Card */}
                                    <div className="bg-[#120202] border border-[#3a0d16] rounded-2xl p-5 flex flex-col items-center gap-4 transition-all hover:border-[#ffb6c5]/30">
                                        <span className="text-sm font-bold text-[#00d6c4] bg-[#00d6c4]/10 px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                            YAPE
                                        </span>
                                        <div className="w-48 h-48 rounded-xl overflow-hidden bg-white p-2 border-2 border-[#3a0d16]/30 flex items-center justify-center">
                                            <img
                                                src="/images/yape_qr.jpg"
                                                alt="QR Yape"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <span className="text-xs text-white/50">Escanea y yapea el monto total</span>
                                    </div>

                                    {/* Plin Card */}
                                    <div className="bg-[#120202] border border-[#3a0d16] rounded-2xl p-5 flex flex-col items-center gap-4 transition-all hover:border-[#ffb6c5]/30">
                                        <span className="text-sm font-bold text-[#00b050] bg-[#00b050]/10 px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                            PLIN
                                        </span>
                                        <div className="w-48 h-48 rounded-xl overflow-hidden bg-white p-2 border-2 border-[#3a0d16]/30 flex items-center justify-center">
                                            <img
                                                src="/images/plin_qr.jpg"
                                                alt="QR Plin"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <span className="text-xs text-white/50">Escanea y plinea desde tu app bancaria</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-[380px] w-full bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Total a Pagar</h3>

                            {discountAmount > 0 && (
                                <div className="flex justify-between items-center mb-3 text-sm text-green-400 font-medium bg-green-500/10 p-2 rounded-lg">
                                    <span>Descuento aplicado</span>
                                    <span>- S/ {discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-base font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-[#ffb6c5]">S/ {total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckoutSubmit}
                                disabled={processing}
                                className="w-full bg-[#ffb6c5] text-[#1b0308] hover:bg-[#ffc6d2] font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <Lock size={16} />
                                {processing ? 'PROCESANDO...' : 'CONFIRMAR EL PAGO...'}
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
