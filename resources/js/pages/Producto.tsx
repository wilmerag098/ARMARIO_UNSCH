import { Head, Link, usePage, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Heart, Star, ShieldCheck, Lock, Sparkles, Scissors, X, ChevronDown, ChevronUp, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';

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

export default function Producto({ product, relatedProducts = [] }: { product: any; relatedProducts?: any[] }) {
    const { auth } = usePage().props;

    // Zoom state
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZoomed, setIsZoomed] = useState(false);

    // Swipe state
    const [touchStart, setTouchStart] = useState<number | null>(null);

    // Date range helper functions
    const getTomorrowString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getThreeDaysLaterString = () => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date.toISOString().split('T')[0];
    };

    // Date states
    const [startDate, setStartDate] = useState(getTomorrowString());
    const [endDate, setEndDate] = useState(getThreeDaysLaterString());

    const getDaysDifference = (start: string, end: string) => {
        const s = new Date(start);
        const e = new Date(end);
        const diff = e.getTime() - s.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 1;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const rentDays = getDaysDifference(startDate, endDate);
    const pricePerDay = product?.discount_percent > 0
        ? parseFloat(product?.discounted_price_per_day || '0')
        : parseFloat(product?.price_per_day || '0');

    const handleToggleFav = (productId: number) => {
        if (!auth?.user) {
            router.get('/login');
            return;
        }
        router.post(`/favoritos/toggle/${productId}`, {}, {
            preserveScroll: true
        });
    };

    // 1. Dynamic gallery images based on product upload or category fallback
    const getGalleryImages = () => {
        const mainImg = product?.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop';
        if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images;
        }
        if (product?.category?.slug === 'vestidos') {
            return [
                mainImg,
                'https://images.unsplash.com/photo-1566162200922-56cc44640875?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop'
            ];
        } else {
            return [
                mainImg,
                'https://images.unsplash.com/photo-1594938298596-128a306dc957?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1598808503746-f34c53b29ef3?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop'
            ];
        }
    };

    const galleryImages = getGalleryImages();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const selectedImage = galleryImages[activeImageIndex];

    // 2. Sizes state and dynamic availability check
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    const [selectedSize, setSelectedSize] = useState(() => {
        const firstAvailable = product?.inventories?.find((i: any) => i.status === 'available');
        return firstAvailable ? firstAvailable.size : (product?.inventories?.[0]?.size || 'M');
    });
    const [selectedColor, setSelectedColor] = useState<string>('');

    const getInventoryForSize = (size: string) => {
        return product?.inventories?.find((i: any) => i.size === size);
    };

    const getSizeStatus = (size: string) => {
        return getInventoryForSize(size)?.status || 'unavailable';
    };

    const sizeStatus = getInventoryForSize(selectedSize)?.status || 'unavailable';
    const isAvailable = sizeStatus === 'available';

    // 3. Specifications details state
    const [showSpecs, setShowSpecs] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Dynamic specs from product
    const specsData = product?.specifications || [];

    // Zoom mouse event handlers
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    // Mobile swipe touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (diff > 50) {
            // Swipe Left -> Next Image
            setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
        } else if (diff < -50) {
            // Swipe Right -> Prev Image
            setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
        }
        setTouchStart(null);
    };

    return (
        <PublicLayout auth={auth}>
            <Head title={`${product?.name || 'Prenda'} - Detalle`} />

            <div className="w-full min-h-screen py-12 bg-[#fdfbfb]">
                <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">

                    {/* Main Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

                        {/* LEFT COLUMN: Vertical Carousel & Main Image (7 Columns) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row gap-4 items-start">

                                {/* Vertical Thumbnail List */}
                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-20 shrink-0 overflow-x-auto md:overflow-x-visible py-2 md:py-0 scrollbar-none order-2 md:order-1">
                                    {galleryImages.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border bg-white shrink-0 transition-all ${idx === activeImageIndex ? 'border-[#3d0d16] ring-2 ring-[#3d0d16]/10 scale-95' : 'border-[#ebd7da] hover:border-[#3d0d16]/55'}`}
                                        >
                                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover object-top" />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Active Image Container */}
                                <div
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onMouseMove={handleMouseMove}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    className="flex-1 w-full aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-[#ebd7da] relative order-1 md:order-2 shadow-sm group cursor-zoom-in"
                                >
                                    <img
                                        src={selectedImage}
                                        alt={product?.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-300 pointer-events-none"
                                        style={{
                                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                            transform: isZoomed ? 'scale(1.8)' : 'scale(1)'
                                        }}
                                    />

                                    {/* Discount badge */}
                                    {product?.discount_percent > 0 && (
                                        <div className="absolute top-4 right-16 bg-red-600 text-white text-xs font-black px-3 py-2 rounded-lg shadow z-10 flex items-center justify-center">
                                            -{product.discount_percent}%
                                        </div>
                                    )}

                                    {/* Heart Button */}
                                    <button
                                        onClick={() => handleToggleFav(product.id)}
                                        className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${auth?.user && (auth.user as any).favorite_product_ids?.includes(product.id)
                                            ? 'text-[#94344c]'
                                            : 'text-slate-500 hover:text-[#94344c]'
                                            }`}
                                    >
                                        <Heart size={18} fill={auth?.user && (auth.user as any).favorite_product_ids?.includes(product.id) ? "#94344c" : "none"} />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Spec Button */}
                            <div>
                                <button
                                    onClick={() => setShowSpecs(!showSpecs)}
                                    className="w-full md:w-auto bg-[#3d0d16] hover:bg-[#52131f] text-white border border-[#3d0d16] font-bold text-xs py-4 px-8 rounded-2xl flex items-center justify-center gap-2 tracking-wider shadow transition-all"
                                >
                                    {showSpecs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {showSpecs ? 'OCULTAR ESPECIFICACIONES' : 'VER MÁS ESPECIFICACIONES'}
                                </button>

                                {/* Collapsible Specs Container */}
                                {showSpecs && (
                                    <div className="mt-6 border border-[#ebd7da] rounded-3xl bg-white p-6 md:p-8 max-h-[600px] overflow-y-auto scrollbar-thin transition-all animate-fadeIn space-y-8">

                                        {/* A) Información Adicional */}
                                        <div>
                                            <h3 className="text-[#1a050a] text-lg font-bold mb-3 flex items-center gap-2">
                                                <Info size={18} className="text-[#8a3348]" />
                                                Información Adicional
                                            </h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">
                                                Esta indumentaria pertenece a la Colección Protocolar de Alquiler de la Universidad Nacional de San Cristóbal de Huamanga. Diseñada exclusivamente con insumos de alta costura para conferencias, tesis de maestría y eventos ceremoniales solemnes. Se solicita a los usuarios cuidar la integridad del tejido y evitar contacto con perfumes fuertes.
                                            </p>
                                        </div>

                                        {/* B) Especificaciones */}
                                        <div>
                                            <h3 className="text-[#1a050a] text-lg font-bold mb-4">Especificaciones de la Prenda</h3>
                                            <div className="border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                                                {specsData.map((spec: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className={`grid grid-cols-2 gap-4 px-6 py-4 text-sm border-b border-[#ebd7da] last:border-b-0 ${index % 2 === 0 ? 'bg-[#fdfbfb]' : 'bg-white'}`}
                                                    >
                                                        <span className="font-bold text-[#1a050a]">{spec.label}</span>
                                                        <span className="text-slate-600">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Detail Info Card (5 Columns) */}
                        <div className="lg:col-span-5 bg-[#62152D] border border-[#62152D] rounded-3xl p-6 md:p-8 relative shadow-sm">

                            {/* Close Button back to catalog */}
                            <Link
                                href="/catalogo"
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-full transition-all"
                                title="Volver al Catálogo"
                            >
                                <X size={18} />
                            </Link>

                            {/* Availability Badge */}
                            <div className="mb-6 flex">
                                {isAvailable ? (
                                    <span className="text-[#10b981] bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                        <CheckCircle2 size={13} />
                                        DISPONIBLE PARA RESERVA
                                    </span>
                                ) : (
                                    <span className="text-[#ef4444] bg-red-50 border border-red-200 text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                        <AlertTriangle size={13} />
                                        OCUPADO
                                    </span>
                                )}
                            </div>

                            {/* Product Title */}
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight pr-8">
                                {product?.name || 'Prenda'}
                            </h1>

                            {/* Description */}
                            <p className="text-white/70 text-sm leading-relaxed mb-6">
                                {product?.description || 'Terno de gala estilo smoking ideal para graduaciones y ceremonias importantes. Incluye saco, pantalón y humita.'}
                            </p>

                            {/* Especificaciones Title */}
                            <h3 className="text-[#facc15] font-extrabold text-sm tracking-wider uppercase mb-3">
                                ESPECIFICACIONES:
                            </h3>

                            {/* Bordered Size Selector Box */}
                            <div className="bg-[#952F57] border border-[#333333] rounded-2xl p-5 mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
                                        Seleccionar Talla:
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-xs text-[#ffb6c5] hover:text-white font-bold underline transition-colors"
                                    >
                                        Guía de tallas
                                    </button>
                                </div>

                                {/* Dynamic Size Pills */}
                                <div className="flex gap-2 mb-4">
                                    {sizes.map((size) => {
                                        const status = getSizeStatus(size);
                                        const exists = status !== 'unavailable';
                                        const isSizeActive = status === 'available';
                                        const isSelected = size === selectedSize;

                                        return (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-11 h-11 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center relative ${isSelected
                                                    ? 'bg-[#facc15] border-[#facc15] text-black scale-95 shadow-md shadow-[#facc15]/10'
                                                    : isSizeActive
                                                        ? 'bg-[#1a1a1a] border-[#333333] text-white/80 hover:border-white/50 hover:text-white'
                                                        : exists
                                                            ? 'bg-[#1a1a1a] border-[#5c1319]/40 text-red-400/50 hover:border-red-400/80'
                                                            : 'bg-black/20 border-white/5 text-white/20 cursor-not-allowed line-through'
                                                    }`}
                                                disabled={!exists}
                                                title={!exists ? 'Talla no fabricada' : isSizeActive ? 'Disponible' : 'Ocupado'}
                                            >
                                                <span>{size}</span>
                                                {/* Mini dot for occupied/available */}
                                                {exists && (
                                                    <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSizeActive ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`}></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Dynamic Size Status Label */}
                                <p className="text-[11px] text-white/60 leading-none">
                                    {sizeStatus === 'available' && (
                                        <span className="text-[#10b981] font-semibold">✓ Talla {selectedSize} está disponible para entrega inmediata.</span>
                                    )}
                                    {sizeStatus === 'maintenance' && (
                                        <span className="text-[#fb7185] font-semibold">⚠ Talla {selectedSize} se encuentra ocupada temporalmente.</span>
                                    )}
                                    {sizeStatus === 'unavailable' && (
                                        <span className="text-white/40">Talla {selectedSize} no está en el catálogo de inventario.</span>
                                    )}
                                </p>
                            </div>

                            {/* Optional Color Selector Box */}
                            {product?.colors && product.colors.length > 0 && (
                                <div className="bg-[#952F57] border border-[#333333] rounded-2xl p-5 mb-8">
                                    <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">
                                        Seleccionar Color
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color: string) => {
                                            const isSelected = color === selectedColor;
                                            const hex = colorHexMap[color.toLowerCase().trim()] || '#7c2d12';

                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(isSelected ? '' : color)}
                                                    className={`w-9 h-9 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border-2 ${isSelected
                                                        ? 'border-[#facc15] scale-110 shadow-lg shadow-[#facc15]/30'
                                                        : 'border-transparent hover:border-[#ebd7da]/60 hover:scale-105'
                                                        }`}
                                                    title={color.charAt(0).toUpperCase() + color.slice(1)}
                                                    style={{ backgroundColor: hex }}
                                                >
                                                    {isSelected && (
                                                        <span className={`w-2.5 h-2.5 rounded-full ${color.toLowerCase() === 'blanco' || color.toLowerCase() === 'beige'
                                                            ? 'bg-black'
                                                            : 'bg-white'
                                                            }`} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedColor && (
                                        <p className="text-[10px] text-white/40 mt-3">
                                            Color seleccionado: <span className="font-bold text-white">{selectedColor}</span> (Haz clic de nuevo para deseleccionar).
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Selector de Rango de Fechas de Renta */}
                            <div className="bg-[#952F57] border border-[#333333] rounded-2xl p-5 mb-6">
                                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">
                                    Definir Período de Alquiler:
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">Recojo</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            min={getTomorrowString()}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                if (new Date(e.target.value) >= new Date(endDate)) {
                                                    const nextDay = new Date(e.target.value);
                                                    nextDay.setDate(nextDay.getDate() + 3);
                                                    setEndDate(nextDay.toISOString().split('T')[0]);
                                                }
                                            }}
                                            className="w-full bg-[#CA668B] border border-[#333333] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#dfb279] transition-all cursor-pointer font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/45 font-bold uppercase tracking-wider block mb-1.5">Devolución</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                            }}
                                            className="w-full bg-[#CA668B] border border-[#333333] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#dfb279] transition-all cursor-pointer font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Desglose Tarifario */}
                                <div className="mt-4 pt-4 border-t border-[#333333] space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Costo Alquiler ({rentDays} {rentDays === 1 ? 'día' : 'días'}: {formatDate(startDate)} al {formatDate(endDate)})</span>
                                        <span className="text-white font-semibold">S/ {(pricePerDay * rentDays).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Garantía Reembolsable</span>
                                        <span className="text-white font-semibold">S/ {parseFloat(product?.security_deposit || '50').toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-[#333333]/50">
                                        <span className="text-white font-bold uppercase tracking-wider">Total Estimado</span>
                                        <span className="text-[#facc15] font-extrabold">S/ {((pricePerDay * rentDays) + parseFloat(product?.security_deposit || '50')).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider Line */}
                            <div className="border-t border-[#2e2e2e] my-4"></div>

                            {/* Price & Action Section */}
                            <div className="flex justify-between items-center mt-6">
                                <div>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">PRECIO DE RENTA</p>
                                    {product?.discount_percent > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white/40 line-through mb-1">
                                                S/ {parseFloat(product?.price_per_day || 0).toFixed(2)}
                                            </span>
                                            <p className="text-[26px] font-extrabold text-[#facc15] leading-none">
                                                S/ {parseFloat(product?.discounted_price_per_day || 0).toFixed(2)}
                                                <span className="text-[11px] font-normal text-white/60"> / día</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-[26px] font-extrabold text-[#facc15] leading-none">
                                            S/ {parseFloat(product?.price_per_day || 0).toFixed(2)}
                                            <span className="text-[11px] font-normal text-white/60"> / día</span>
                                        </p>
                                    )}
                                </div>

                                {/* Action Button */}
                                {isAvailable ? (
                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="bg-[#e28700] hover:bg-[#f59e0b] text-black font-extrabold text-xs px-6 py-4 rounded-xl tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        RESERVAR PRENDA
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="bg-[#222222] border border-[#333333] text-white/30 font-bold text-xs px-6 py-4 rounded-xl tracking-wider cursor-not-allowed"
                                    >
                                        NO DISPONIBLE
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Related Options Section */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <div className="mt-16 border-t border-[#3a0d16] pt-12">
                            <h2 className="text-2xl font-bold text-white mb-8">Otras opciones para tu evento</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProd: any) => {
                                    const relatedPrice = parseFloat(relatedProd.price_per_day).toFixed(2);
                                    const relatedFinalPrice = relatedProd.discount_percent > 0
                                        ? parseFloat(relatedProd.discounted_price_per_day).toFixed(2)
                                        : relatedPrice;

                                    return (
                                        <Link
                                            key={relatedProd.id}
                                            href={`/producto/${relatedProd.slug}`}
                                            className="group cursor-pointer block"
                                        >
                                            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#1f050b] border border-[#3a0d16] mb-3 relative">
                                                {relatedProd.discount_percent > 0 && (
                                                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow z-10">
                                                        -{relatedProd.discount_percent}%
                                                    </span>
                                                )}
                                                <img
                                                    src={relatedProd.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'}
                                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                                    alt={relatedProd.name}
                                                />
                                            </div>
                                            <h3 className="text-[#ffb6c5] font-semibold text-sm mb-1 group-hover:underline truncate">{relatedProd.name}</h3>
                                            <p className="text-white/70 text-xs font-medium">
                                                S/ {relatedFinalPrice} <span className="text-[10px] text-white/40">/ día</span>
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para Guía de Tallas */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[#1b0308]/95 border border-[#3e1315] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative scrollbar-thin shadow-2xl">

                        {/* Close button inside modal */}
                        <button
                            onClick={() => setShowSizeGuide(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                            title="Cerrar Guía de Tallas"
                        >
                            <X size={18} />
                        </button>

                        <h3 className="text-white text-xl font-bold mb-6 text-center">Guía de Tallas</h3>

                        {/* Diagrams & Text */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="flex justify-center bg-black/30 p-4 rounded-3xl border border-[#3e1315]">
                                <svg className="w-40 h-72 text-[#ffb6c5]" viewBox="0 0 100 180" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    {/* Silueta Cabeza */}
                                    <circle cx="50" cy="20" r="10" />
                                    {/* Cuello */}
                                    <path d="M47 30 L47 34 M53 30 L53 34" />
                                    {/* Hombros */}
                                    <path d="M32 38 L68 38" />
                                    {/* Torso / Saco */}
                                    <path d="M32 38 L36 90 L64 90 L68 38 Z" />
                                    {/* Línea central del saco y solapas */}
                                    <path d="M50 38 L50 90" strokeDasharray="2,2" />
                                    <path d="M32 38 L50 60 L68 38" strokeWidth="1.5" />
                                    {/* Brazos */}
                                    <path d="M32 38 L26 80" />
                                    <path d="M68 38 L74 80" />
                                    {/* Pantalón */}
                                    <path d="M36 90 L38 165 L48 165 L50 110 L52 110 L62 165 L64 165 L64 90 Z" />

                                    {/* Líneas de guía de medida */}
                                    {/* Pecho */}
                                    <path d="M28 50 L72 50" stroke="#facc15" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="50" y="47" fill="#facc15" fontSize="5" fontWeight="bold" textAnchor="middle">PECHO</text>

                                    {/* Cintura */}
                                    <path d="M30 75 L70 75" stroke="#facc15" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="50" y="72" fill="#facc15" fontSize="5" fontWeight="bold" textAnchor="middle">CINTURA</text>

                                    {/* Cadera */}
                                    <path d="M31 98 L69 98" stroke="#facc15" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="50" y="95" fill="#facc15" fontSize="5" fontWeight="bold" textAnchor="middle">CADERA</text>

                                    {/* Hombros ancho */}
                                    <path d="M32 32 L68 32" stroke="#facc15" strokeWidth="1" strokeDasharray="3,3" />
                                    <text x="50" y="29" fill="#facc15" fontSize="5" fontWeight="bold" textAnchor="middle">HOMBROS</text>
                                </svg>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[#ffb6c5] font-extrabold text-sm uppercase tracking-wider">¿Cómo medir tu cuerpo?</h4>
                                <ul className="space-y-3 text-xs text-white/80 list-decimal pl-4">
                                    <li><strong>HOMBROS:</strong> Mide la distancia de hombro a hombro por la espalda horizontalmente.</li>
                                    <li><strong>PECHO:</strong> Mide la parte más ancha del pecho manteniendo la huincha horizontal.</li>
                                    <li><strong>CINTURA:</strong> Mide alrededor del punto medio de tu cintura (sobre el ombligo).</li>
                                    <li><strong>CADERA:</strong> Mide la parte más ancha de los glúteos de pie.</li>
                                    <li><strong>MANGAS:</strong> Mide desde la punta del hombro hasta el hueso de la muñeca.</li>
                                    <li><strong>CUELLO:</strong> Mide alrededor del cuello horizontalmente.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Size Tables */}
                        <div className="space-y-6">
                            {/* Table Tops */}
                            <div>
                                <h5 className="text-[#facc15] font-bold text-xs uppercase tracking-widest mb-3">Talla Guía Tops (Sacos / Vestidos)</h5>
                                <div className="overflow-x-auto rounded-xl border border-[#3e1315]">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-[#2a0c0e] text-white">
                                                <th className="p-3 font-bold border-b border-[#3e1315]">TALLAS</th>
                                                <th className="p-3 border-b border-[#3e1315]">HOMBROS (cm)</th>
                                                <th className="p-3 border-b border-[#3e1315]">PECHOS (cm)</th>
                                                <th className="p-3 border-b border-[#3e1315]">CINTURA (cm)</th>
                                                <th className="p-3 border-b border-[#3e1315]">CADERA (cm)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white/80">
                                            <tr className="border-b border-[#3e1315]/50 bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">S</td>
                                                <td className="p-3">45</td>
                                                <td className="p-3">92 - 95</td>
                                                <td className="p-3">74 - 77</td>
                                                <td className="p-3">96 - 99</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50">
                                                <td className="p-3 font-bold text-white">M</td>
                                                <td className="p-3">46</td>
                                                <td className="p-3">98 - 101</td>
                                                <td className="p-3">80 - 83</td>
                                                <td className="p-3">102 - 105</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50 bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">L</td>
                                                <td className="p-3">47</td>
                                                <td className="p-3">104 - 107</td>
                                                <td className="p-3">86 - 89</td>
                                                <td className="p-3">108 - 111</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50">
                                                <td className="p-3 font-bold text-white">XL</td>
                                                <td className="p-3">48</td>
                                                <td className="p-3">110 - 112</td>
                                                <td className="p-3">92 - 95</td>
                                                <td className="p-3">114 - 117</td>
                                            </tr>
                                            <tr className="bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">XXL</td>
                                                <td className="p-3">49</td>
                                                <td className="p-3">116 - 119</td>
                                                <td className="p-3">98 - 101</td>
                                                <td className="p-3">120 - 123</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Table Bottom */}
                            <div>
                                <h5 className="text-[#facc15] font-bold text-xs uppercase tracking-widest mb-3">Talla Guía Bottom (Pantalones)</h5>
                                <div className="overflow-x-auto rounded-xl border border-[#3e1315]">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-[#2a0c0e] text-white">
                                                <th className="p-3 font-bold border-b border-[#3e1315]">USA</th>
                                                <th className="p-3 border-b border-[#3e1315]">CINTURA (cm)</th>
                                                <th className="p-3 border-b border-[#3e1315]">CADERA (cm)</th>
                                                <th className="p-3 border-b border-[#3e1315]">MUSLO (cm)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white/80">
                                            <tr className="border-b border-[#3e1315]/50 bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">30</td>
                                                <td className="p-3">80 - 82</td>
                                                <td className="p-3">94 - 96</td>
                                                <td className="p-3">56 - 57</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50">
                                                <td className="p-3 font-bold text-white">32</td>
                                                <td className="p-3">84 - 86</td>
                                                <td className="p-3">98 - 100</td>
                                                <td className="p-3">58 - 59</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50 bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">34</td>
                                                <td className="p-3">88 - 90</td>
                                                <td className="p-3">102 - 104</td>
                                                <td className="p-3">60 - 61</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50">
                                                <td className="p-3 font-bold text-white">36</td>
                                                <td className="p-3">92 - 94</td>
                                                <td className="p-3">106 - 108</td>
                                                <td className="p-3">62 - 63</td>
                                            </tr>
                                            <tr className="border-b border-[#3e1315]/50 bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">38</td>
                                                <td className="p-3">96 - 98</td>
                                                <td className="p-3">110 - 112</td>
                                                <td className="p-3">64 - 65</td>
                                            </tr>
                                            <tr className="bg-[#1b0308]/40">
                                                <td className="p-3 font-bold text-white">40</td>
                                                <td className="p-3">100 - 102</td>
                                                <td className="p-3">114 - 116</td>
                                                <td className="p-3">66 - 67</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                product={product}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                rentDays={rentDays}
                startDate={startDate}
                endDate={endDate}
            />
        </PublicLayout>
    );
}
