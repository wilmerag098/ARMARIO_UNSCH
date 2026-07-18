import React from 'react';
import { X, ShoppingBag, Calendar, CheckCircle2, AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: any[];
    onRemoveItem: (id: string) => void;
}

export default function CartDrawer({ 
    isOpen, 
    onClose, 
    cartItems = [], 
    onRemoveItem
}: CartDrawerProps) {
    const { auth } = usePage().props as any;

    if (!isOpen) return null;

    const hasItems = cartItems && cartItems.length > 0;
    
    // Subtotal and deposits sum
    let totalSubtotal = 0;
    let totalDeposit = 0;
    if (hasItems) {
        cartItems.forEach((item: any) => {
            const price = parseFloat(item.product?.discounted_price_per_day || item.product?.price_per_day || '0');
            const dep = parseFloat(item.product?.security_deposit || '50');
            totalSubtotal += price * (item.rentDays || 3);
            totalDeposit += dep;
        });
    }
    const grandTotal = totalSubtotal + totalDeposit;

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
                <div className="flex-1 overflow-y-auto p-6 scrollbar-none flex flex-col justify-start">
                    {!hasItems ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center my-auto">
                            <div className="w-16 h-16 rounded-full bg-[#3a0d16]/30 flex items-center justify-center mb-4 text-[#ffb6c5]">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Tu bolsa está vacía</h3>
                            <p className="text-xs text-white/50 max-w-[260px] leading-relaxed mb-6">
                                Explora nuestra colección de alta costura para encontrar el atuendo perfecto para tu evento.
                            </p>
                            <Link
                                href="/catalogo"
                                onClick={onClose}
                                className="px-6 py-3 bg-[#e28700] hover:bg-[#f59e0b] text-black font-extrabold text-xs rounded-xl tracking-wider uppercase transition-all shadow-md animate-pulse"
                            >
                                Ver Catálogo
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Items List */}
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item: any) => {
                                    const pricePerDay = parseFloat(item.product?.discounted_price_per_day || item.product?.price_per_day || '0');
                                    const itemSubtotal = pricePerDay * (item.rentDays || 3);
                                    const itemDeposit = parseFloat(item.product?.security_deposit || '50');
                                    const itemTotal = itemSubtotal + itemDeposit;

                                    return (
                                        <div key={item.id} className="flex gap-4 p-4 bg-[#1a1a1a] rounded-2xl border border-[#333333] relative group">
                                            <img 
                                                src={item.product?.image_url} 
                                                alt={item.product?.name} 
                                                className="w-16 h-24 object-cover rounded-xl border border-[#333333] shrink-0"
                                            />
                                            <div className="flex-1 flex flex-col justify-between pr-6">
                                                <div>
                                                    <h3 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className="text-[10px] text-white/55 mb-0.5">
                                                        Talla: <span className="font-bold text-white">{item.selectedSize}</span>
                                                        {item.selectedColor && <> | Color: <span className="font-bold text-white capitalize">{item.selectedColor}</span></>}
                                                    </p>
                                                    <p className="text-[10px] text-white/45 mb-2">
                                                        Renta: <span className="font-medium text-white/70">{item.startDate} al {item.endDate}</span> ({item.rentDays} {item.rentDays === 1 ? 'día' : 'días'})
                                                    </p>
                                                    {/* Cost breakdown details */}
                                                    <div className="flex flex-col gap-1 text-[10px] text-white/40 bg-white/5 p-2 rounded-xl border border-white/5">
                                                        <div className="flex justify-between">
                                                            <span>Alquiler subtotal:</span>
                                                            <span className="font-bold text-white/80">S/ {itemSubtotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Garantía Reembolsable:</span>
                                                            <span className="font-bold text-white/80">S/ {itemDeposit.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-white/5">
                                                    <span className="text-[#facc15] font-bold text-xs">
                                                        S/ {pricePerDay.toFixed(2)} <span className="text-[9px] text-white/45 font-normal">/ día</span>
                                                    </span>
                                                    <span className="text-[11px] text-white font-extrabold">
                                                        Total: S/ {itemTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="absolute top-3 right-3 text-white/40 hover:text-red-400 p-1 rounded-full hover:bg-white/5 transition-all"
                                                title="Quitar prenda"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Añadir Prenda */}
                            <Link
                                href="/catalogo"
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 p-4 mb-6 rounded-2xl border border-dashed border-[#ffb6c5]/20 bg-[#ffb6c5]/5 hover:bg-[#ffb6c5]/10 hover:border-[#ffb6c5]/40 text-[#ffb6c5] transition-all group text-sm font-bold"
                            >
                                <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span>Añadir otra prenda</span>
                            </Link>

                            {/* Booking Details placeholder */}
                            <div className="bg-[#222222] rounded-2xl p-5 mb-6 border border-[#333333]">
                                <h4 className="text-[11px] font-extrabold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Resumen de Renta
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Total Costo Alquiler</span>
                                        <span className="text-white font-medium">S/ {totalSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-1">Total Garantías Reembolsables <InfoIcon /></span>
                                        <span className="text-white font-medium">S/ {totalDeposit.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <div className="border-t border-[#333333] mt-4 pt-4 flex justify-between items-end">
                                    <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Total Estimado</span>
                                    <span className="text-2xl text-[#facc15] font-extrabold">S/ {grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Alert */}
                            <div className="flex items-start gap-3 bg-[#ffb6c5]/10 border border-[#ffb6c5]/20 p-4 rounded-xl">
                                <AlertTriangle className="w-5 h-5 text-[#ffb6c5] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#ffb6c5] leading-relaxed">
                                    Las fechas exactas de recojo y devolución se confirmarán en el siguiente paso de pago.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                {hasItems && (
                    <div className="p-6 border-t border-[#2e2e2e] bg-[#120202]">
                        <Link 
                            href={`/checkout/${cartItems[0].product?.slug}?size=${cartItems[0].selectedSize}${cartItems[0].selectedColor ? `&color=${cartItems[0].selectedColor}` : ''}&start_date=${cartItems[0].startDate}&end_date=${cartItems[0].endDate}`}
                            className="w-full bg-[#e28700] hover:bg-[#f59e0b] text-black font-extrabold text-sm px-6 py-4 rounded-xl tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Ir a pagar
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                        <button 
                            onClick={onClose}
                            className="w-full mt-4 text-xs font-bold text-white/50 hover:text-white uppercase tracking-wider transition-colors py-2"
                        >
                            Seguir Explorando
                        </button>
                    </div>
                )}
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
