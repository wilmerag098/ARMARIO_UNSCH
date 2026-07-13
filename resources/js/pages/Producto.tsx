import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Heart, Star, ShieldCheck, Lock, Sparkles, Scissors, X, ChevronDown, ChevronUp, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';

export default function Producto({ product }: { product: any }) {
    const { auth } = usePage().props;
    
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

    return (
        <PublicLayout auth={auth}>
            <Head title={`${product?.name || 'Prenda'} - Detalle`} />
            
            <div 
                className="w-full min-h-screen py-12 transition-all duration-500"
                style={{ background: 'radial-gradient(circle at bottom, #4a0c13 0%, #120202 80%)' }}
            >
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
                                            className={`w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border bg-[#120202] shrink-0 transition-all ${idx === activeImageIndex ? 'border-[#ffb6c5] ring-2 ring-[#ffb6c5]/20 scale-95' : 'border-[#3a0d16] hover:border-[#ffb6c5]/50'}`}
                                        >
                                            <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover object-top" />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Active Image Container */}
                                <div className="flex-1 w-full aspect-[3/4] rounded-3xl overflow-hidden bg-[#120202] border border-[#3e1315] relative order-1 md:order-2 shadow-2xl group">
                                    <img 
                                        src={selectedImage} 
                                        alt={product?.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    />
                                    
                                    {/* Cyber Wow Badge */}
                                    <div className="absolute top-4 left-4 bg-[#137333] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md border border-[#137333]">
                                        CYBER WOW
                                    </div>

                                    {/* Heart Button */}
                                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-[#ffb6c5] hover:scale-110 active:scale-95 transition-all">
                                        <Heart size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Spec Button */}
                            <div>
                                <button 
                                    onClick={() => setShowSpecs(!showSpecs)}
                                    className="w-full md:w-auto bg-[#2a0c0e] hover:bg-[#3a0d16] text-[#ffb6c5] border border-[#3e1315] font-bold text-xs py-4 px-8 rounded-2xl flex items-center justify-center gap-2 tracking-wider shadow-lg transition-all"
                                >
                                    {showSpecs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {showSpecs ? 'OCULTAR ESPECIFICACIONES' : 'VER MÁS ESPECIFICACIONES'}
                                </button>
                                
                                {/* Collapsible Specs Container */}
                                {showSpecs && (
                                    <div className="mt-6 border border-[#3e1315] rounded-3xl bg-[#1b0308]/90 p-6 md:p-8 max-h-[600px] overflow-y-auto scrollbar-thin transition-all animate-fadeIn space-y-8">
                                        
                                        {/* A) Información Adicional */}
                                        <div>
                                            <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                                                <Info size={18} className="text-[#ffb6c5]" />
                                                Información Adicional
                                            </h3>
                                            <p className="text-white/75 text-sm leading-relaxed">
                                                Esta indumentaria pertenece a la Colección Protocolar de Alquiler de la Universidad Nacional de San Cristóbal de Huamanga. Diseñada exclusivamente con insumos de alta costura para conferencias, tesis de maestría y eventos ceremoniales solemnes. Se solicita a los usuarios cuidar la integridad del tejido y evitar contacto con perfumes fuertes.
                                            </p>
                                        </div>

                                        {/* B) Especificaciones */}
                                        <div>
                                            <h3 className="text-white text-lg font-bold mb-4">Especificaciones de la Prenda</h3>
                                            <div className="border border-[#3e1315] rounded-2xl overflow-hidden shadow-inner">
                                                {specsData.map((spec: any, index: number) => (
                                                    <div 
                                                        key={index}
                                                        className={`grid grid-cols-2 gap-4 px-6 py-4 text-sm border-b border-[#3e1315] last:border-b-0 ${index % 2 === 0 ? 'bg-[#280c0f]/40' : 'bg-[#1b0308]/60'}`}
                                                    >
                                                        <span className="font-bold text-white">{spec.label}</span>
                                                        <span className="text-white/80">{spec.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Detail Info Card (5 Columns) */}
                        <div className="lg:col-span-5 bg-[#171717] border border-[#2e2e2e] rounded-3xl p-6 md:p-8 relative shadow-2xl">
                            
                            {/* Close Button back to catalog */}
                            <Link 
                                href="/catalogo" 
                                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-full transition-all"
                                title="Volver al Catálogo"
                            >
                                <X size={18} />
                            </Link>

                            {/* Availability Badge */}
                            <div className="mb-6 flex">
                                {isAvailable ? (
                                    <span className="text-[#10b981] bg-[#0c2117] border border-[#135c38] text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5">
                                        <CheckCircle2 size={13} />
                                        DISPONIBLE PARA RESERVA
                                    </span>
                                ) : (
                                    <span className="text-[#fb7185] bg-[#270e10] border border-[#5c1319] text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-md flex items-center gap-1.5">
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
                             <div className="bg-[#222222] border border-[#333333] rounded-2xl p-5 mb-8">
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
                                                className={`w-11 h-11 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center relative ${
                                                    isSelected 
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

                            {/* Divider Line */}
                            <div className="border-t border-[#2e2e2e] my-4"></div>

                            {/* Price & Action Section */}
                            <div className="flex justify-between items-center mt-6">
                                <div>
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">PRECIO DE RENTA</p>
                                    <p className="text-[26px] font-extrabold text-[#facc15] leading-none">
                                        S/ {parseFloat(product?.price_per_day || 0).toFixed(2)}
                                        <span className="text-[11px] font-normal text-white/60"> / día</span>
                                    </p>
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
                    <div className="mt-16 border-t border-[#3a0d16] pt-12">
                        <h2 className="text-2xl font-bold text-white mb-8">Otras opciones para tu evento</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Related items */}
                            <div className="group cursor-pointer">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#1f050b] border border-[#3a0d16] mb-3">
                                    <img src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Option" />
                                </div>
                                <h3 className="text-[#ffb6c5] font-semibold text-sm mb-1 group-hover:underline">Smoking Imperial Navy</h3>
                                <p className="text-white/70 text-xs">S/ 80.00 / día</p>
                            </div>
                            <div className="group cursor-pointer">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#1f050b] border border-[#3a0d16] mb-3">
                                    <img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Option" />
                                </div>
                                <h3 className="text-[#ffb6c5] font-semibold text-sm mb-1 group-hover:underline">Vestido Noche Classic</h3>
                                <p className="text-white/70 text-xs">S/ 60.00 / día</p>
                            </div>
                            <div className="group cursor-pointer">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#1f050b] border border-[#3a0d16] mb-3">
                                    <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Option" />
                                </div>
                                <h3 className="text-[#ffb6c5] font-semibold text-sm mb-1 group-hover:underline">Traje Slim Fit Slate</h3>
                                <p className="text-white/70 text-xs">S/ 75.00 / día</p>
                            </div>
                            <div className="group cursor-pointer">
                                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#1f050b] border border-[#3a0d16] mb-3">
                                    <img src="https://images.unsplash.com/photo-1566162200922-56cc44640875?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Option" />
                                </div>
                                <h3 className="text-[#ffb6c5] font-semibold text-sm mb-1 group-hover:underline">Cocktail Dress Blush</h3>
                                <p className="text-white/70 text-xs">S/ 55.00 / día</p>
                            </div>
                        </div>
                    </div>
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
                                <img
                                    src="/images/figura-hombre.webp"
                                    alt="Guía de medidas corporales"
                                    className="w-48 h-72 object-contain"
                                />
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
            />
        </PublicLayout>
    );
}
