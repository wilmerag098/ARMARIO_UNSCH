import React from 'react';
import { X, ShoppingBag, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    selectedSize: string;
}

export default function CartDrawer({ isOpen, onClose, product, selectedSize }: CartDrawerProps) {
    const { auth } = usePage().props as any;

    if (!isOpen) return null;

    // Simulate 3 days reservation for the total price placeholder
    const days = 3; 
    const pricePerDay = parseFloat(product?.discounted_price_per_day || product?.price_per_day || '0');
    const deposit = parseFloat(product?.security_deposit || '0');
    const total = (pricePerDay * days) + deposit;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-[#120202] border-l border-[#3a0d16] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#2e2e2e]">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-[#facc15]" />
                        <h2 className="text-white font-extrabold tracking-widest uppercase text-sm">Reserva Actual</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                    {/* Item */}
                    <div className="flex gap-4 p-4 bg-[#1a1a1a] rounded-2xl border border-[#333333] mb-6">
                        <img 
                            src={product?.image_url} 
                            alt={product?.name} 
                            className="w-20 h-28 object-cover rounded-xl border border-[#333333]"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight">
                                    {product?.name}
                                </h3>
                                <p className="text-xs text-white/50 mb-2">
                                    Talla seleccionada: <span className="font-bold text-white">{selectedSize}</span>
                                </p>
                            </div>
                            <p className="text-[#facc15] font-extrabold text-lg">
                                S/ {pricePerDay.toFixed(2)} <span className="text-[10px] text-white/40 font-normal uppercase">/ día</span>
                            </p>
                        </div>
                    </div>

                    {/* Booking Details placeholder */}
                    <div className="bg-[#222222] rounded-2xl p-5 mb-6 border border-[#333333]">
                        <h4 className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Detalles de Renta
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Días de renta (Ejemplo)</span>
                                <span className="text-white font-medium">{days} días</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60">Subtotal ({days} días)</span>
                                <span className="text-white font-medium">S/ {(pricePerDay * days).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/60 flex items-center gap-1">Garantía <InfoIcon /></span>
                                <span className="text-white font-medium">S/ {deposit.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-[#333333] mt-4 pt-4 flex justify-between items-end">
                            <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Total Estimado</span>
                            <span className="text-2xl text-[#facc15] font-extrabold">S/ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Alert */}
                    <div className="flex items-start gap-3 bg-[#ffb6c5]/10 border border-[#ffb6c5]/20 p-4 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-[#ffb6c5] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#ffb6c5] leading-relaxed">
                            Las fechas exactas de recojo y devolución se confirmarán en el siguiente paso de pago.
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-[#2e2e2e] bg-[#120202]">
                    <Link 
                        href={`/checkout/${product?.slug}?size=${selectedSize}`}
                        className="w-full bg-[#e28700] hover:bg-[#f59e0b] text-black font-extrabold text-sm px-6 py-4 rounded-xl tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        CONTINUAR AL CHECKOUT
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button 
                        onClick={onClose}
                        className="w-full mt-4 text-xs font-bold text-white/50 hover:text-white uppercase tracking-wider transition-colors py-2"
                    >
                        Seguir Explorando
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoIcon() {
    return (
        <span className="group relative inline-block cursor-help">
            <CheckCircle2 className="w-3 h-3 text-white/40 group-hover:text-[#ffb6c5]" />
        </span>
    );
}
