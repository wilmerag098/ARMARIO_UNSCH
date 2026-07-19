import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    GraduationCap, 
    Shirt,
    Award,
    Gem,
    Star,
    CheckCircle2,
    Gift,
    ChevronRight,
    ArrowRight,
    MapPin,
    CalendarDays,
    Heart,
    Eye
} from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';

interface Product {
    id: number;
    name: string;
    slug: string;
    price_per_day: string | number;
    discount_percent: number;
    discounted_price_per_day: string | number;
    image_url: string;
    category?: {
        name: string;
    };
    inventories?: {
        id: number;
        size: string;
        status: string;
    }[];
}

interface WelcomeProps {
    products: Product[];
}

export default function Welcome({ products }: WelcomeProps) {
    const { auth } = usePage().props;
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleToggleFav = (productId: number) => {
        if (!auth?.user) {
            router.get('/login');

            return;
        }

        router.post(`/favoritos/toggle/${productId}`, {}, {
            preserveScroll: true
        });
    };

    // Categorías con íconos específicos
    const categories = [
        { name: 'Ternos', icon: Shirt, desc: 'Ver colección', href: '/catalogo?categoria=ternos' },
        { name: 'Vestidos', icon: Shirt, desc: 'Ver colección', href: '/catalogo?categoria=vestidos' },
        { name: 'Graduación', icon: GraduationCap, desc: 'Ver colección', href: '/catalogo?categoria=graduacion' },
        { name: 'Trajes de presentación', icon: Award, desc: 'Ver colección', href: '/catalogo?categoria=trajes-presentacion' },
        { name: 'Accesorios', icon: Gem, desc: 'Ver colección', href: '/catalogo?categoria=accesorios' },
        { name: 'Ropa formal', icon: Award, desc: 'Ver colección', href: '/catalogo?categoria=ropa-formal' },
    ];

    // Datos estáticos para calificaciones y badges
    const mockData = [
        { badge: 'Más alquilado', badgeColor: 'bg-[#3d0d16] text-[#dfb279] border-[#dfb279]/30', rating: 5, reviews: 24 },
        { badge: 'Nuevo', badgeColor: 'bg-black text-white border-white/20', rating: 4, reviews: 18 },
        { badge: 'Popular', badgeColor: 'bg-amber-600 text-white border-amber-700', rating: 5, reviews: 12 },
        { badge: 'Nuevo', badgeColor: 'bg-black text-white border-white/20', rating: 4, reviews: 9 },
        { badge: 'Más alquilado', badgeColor: 'bg-[#3d0d16] text-[#dfb279] border-[#dfb279]/30', rating: 5, reviews: 16 },
        { badge: 'Popular', badgeColor: 'bg-amber-600 text-white border-amber-700', rating: 4, reviews: 7 }
    ];

    // Testimonios de clientes
    const testimonials = [
        {
            text: "Excelente servicio y prendas de primera. Me salvaron para mi sustentación, super recomendado.",
            author: "Diego Alarcón",
            avatar: "https://ui-avatars.com/api/?name=Diego+Alarcon&background=571e26&color=ffb6c5&bold=true"
        },
        {
            text: "Vestidos hermosos y en perfecto estado. El proceso de alquiler muy fácil y rápido.",
            author: "María Fernanda",
            avatar: "https://ui-avatars.com/api/?name=Maria+Fernanda&background=571e26&color=ffb6c5&bold=true"
        },
        {
            text: "La entrega dentro de la UNSCH es muy conveniente. Volveré a alquilar sin duda.",
            author: "Carlos Huamán",
            avatar: "https://ui-avatars.com/api/?name=Carlos+Huaman&background=571e26&color=ffb6c5&bold=true"
        },
        {
            text: "Ternos de excelente calidad a precios accesibles. 100% recomendado.",
            author: "Valeria Quispe",
            avatar: "https://ui-avatars.com/api/?name=Valeria+Quispe&background=571e26&color=ffb6c5&bold=true"
        }
    ];

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Alquiler de Ropa Elegante - Armario UNSCH" />

            {/* SECCIÓN HERO */}
            <section className="relative w-full bg-[#1c050a] text-[#fdeaea] overflow-hidden pt-12 pb-24 md:pb-32">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    
                    {/* Columna Izquierda: Información de Texto */}
                    <div className="lg:col-span-7 space-y-8 text-left">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-tight text-white tracking-tight">
                                Alquila elegancia <br />
                                <span className="italic font-normal text-[#dfb279] font-serif">para cada ocasión</span>
                            </h1>
                            <p className="text-base md:text-lg text-[#d2a9b1]/80 max-w-xl font-medium leading-relaxed">
                                Ternos, vestidos y trajes de presentación para tus eventos universitarios, graduaciones y ceremonias protocolares.
                            </p>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link 
                                href="/catalogo"
                                className="border-2 border-[#dfb279] text-[#dfb279] hover:bg-[#dfb279] hover:text-[#1c050a] transition-all font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl cursor-pointer"
                            >
                                Ver catálogo
                            </Link>
                            <Link 
                                href="/catalogo"
                                className="bg-[#dfb279] hover:bg-[#e6c192] text-[#3d0d16] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#dfb279]/10 cursor-pointer"
                            >
                                <span>Alquilar ahora</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <hr className="border-[#290a0f] pt-2" />

                        {/* Características en la base del hero */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[11px] font-bold uppercase tracking-wider text-[#d2a9b1]/75">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#290a0f] text-[#dfb279] border border-[#dfb279]/15">
                                    <MapPin size={15} />
                                </div>
                                <span className="leading-snug">Entrega y recojo dentro de la UNSCH</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#290a0f] text-[#dfb279] border border-[#dfb279]/15">
                                    <CheckCircle2 size={15} />
                                </div>
                                <span className="leading-snug">Precios accesibles y sin costos ocultos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#290a0f] text-[#dfb279] border border-[#dfb279]/15">
                                    <Award size={15} />
                                </div>
                                <span className="leading-snug">Prendas premium de alta calidad</span>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Imagen del Hero */}
                    <div className="lg:col-span-5 relative hidden lg:block">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border-2 border-[#dfb279]/20 shadow-2xl relative">
                            {/* Overlay de color */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c050a]/40 to-transparent z-10" />
                            <img 
                                src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=1200&auto=format&fit=crop" 
                                alt="Modelos Elegantes en Vestidos y Trajes UNSCH"
                                className="object-cover w-full h-full object-top scale-100 hover:scale-102 transition-transform duration-700"
                            />
                        </div>
                        {/* Indicadores de Carrusel */}
                        <div className="absolute -bottom-6 right-6 flex gap-2 z-20">
                            <span className="h-2 w-2 rounded-full bg-[#dfb279]" />
                            <span className="h-2 w-2 rounded-full bg-[#ebd7da]/30" />
                            <span className="h-2 w-2 rounded-full bg-[#ebd7da]/30" />
                            <span className="h-2 w-2 rounded-full bg-[#ebd7da]/30" />
                        </div>
                    </div>
                </div>
            </section>

            {/* BUSCADOR DE DISPONIBILIDAD FLOTANTE */}
            <div className="container mx-auto max-w-screen-xl px-4 md:px-8 relative z-20 -mt-12 lg:-mt-14">
                <div className="bg-white border border-[#ebd7da] p-6 rounded-[2rem] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Indicador de título */}
                    <div className="lg:col-span-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#fcf8f9] text-[#94344c] border border-[#ebd7da] flex items-center justify-center shrink-0">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-extrabold text-[#1a050a] text-sm leading-tight">¿Cuando es tu evento?</h3>
                            <p className="text-[10px] text-[#8a3348]/60 uppercase tracking-wider font-extrabold mt-0.5">Busca disponibilidad en segundos</p>
                        </div>
                    </div>

                    {/* Selector de Fechas */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        {/* Fecha de uso */}
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60">Fecha de uso</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-3 py-2 text-xs font-bold text-[#1a050a] focus:outline-none focus:border-[#94344c]"
                            />
                        </div>

                        {/* Fecha de devolución */}
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60">Fecha de devolución</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[#fcf8f9] border border-[#ebd7da] rounded-xl px-3 py-2 text-xs font-bold text-[#1a050a] focus:outline-none focus:border-[#94344c]"
                            />
                        </div>

                        {/* Botón de envío */}
                        <div className="pt-5 md:pt-4">
                            <Link 
                                href={startDate && endDate ? `/catalogo?start_date=${startDate}&end_date=${endDate}` : '/catalogo'}
                                className="w-full py-2.5 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#3d0d16]/10 flex items-center justify-center cursor-pointer"
                            >
                                Buscar disponibilidad
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN EXPLORA POR CATEGORÍAS */}
            <section className="container mx-auto max-w-screen-xl px-4 md:px-8 py-16 text-left">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-black text-[#1a050a]">
                            Explora por categorías
                        </h2>
                        <div className="h-1 w-12 bg-[#dfb279] mt-2 rounded-full" />
                    </div>
                    <Link href="/catalogo" className="text-xs font-bold text-[#94344c] hover:text-[#a63f57] transition-all flex items-center gap-1 uppercase tracking-wider">
                        Ver todas <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, idx) => {
                        const IconComponent = cat.icon;

                        return (
                            <Link 
                                key={idx} 
                                href={cat.href}
                                className="bg-[#fdfcfc] border border-[#ebd7da]/70 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#dfb279]/35 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#fcf8f9] text-[#94344c] border border-[#ebd7da] flex items-center justify-center mb-4 group-hover:bg-[#94344c] group-hover:text-white transition-all duration-300">
                                    <IconComponent size={20} />
                                </div>
                                <span className="text-xs font-extrabold text-[#1a050a] group-hover:text-[#94344c] transition-colors line-clamp-1">{cat.name}</span>
                                <span className="text-[10px] text-[#8a3348]/55 font-bold uppercase tracking-wider mt-1">{cat.desc}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* SECCIÓN PRENDAS DESTACADAS */}
            <section className="container mx-auto max-w-screen-xl px-4 md:px-8 py-8 text-left">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-black text-[#1a050a]">
                            Prendas destacadas
                        </h2>
                        <div className="h-1 w-12 bg-[#dfb279] mt-2 rounded-full" />
                    </div>
                    <Link href="/catalogo" className="text-xs font-bold text-[#94344c] hover:text-[#a63f57] transition-all flex items-center gap-1 uppercase tracking-wider">
                        Ver todas <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products && products.length > 0 ? (
                        products.slice(0, 6).map((prod, idx) => {
                            const mock = mockData[idx % mockData.length];
                            
                            // Formateo del precio por día (o por 48h)
                            const price = parseFloat(String(prod.price_per_day)).toFixed(2);
                            const finalPrice = prod.discount_percent > 0 
                                ? parseFloat(String(prod.discounted_price_per_day)).toFixed(2) 
                                : price;

                            return (
                                <div 
                                    key={prod.id} 
                                    className="bg-white border border-[#ebd7da]/70 rounded-[2rem] p-4 flex flex-col shadow-sm hover:shadow-md hover:border-[#dfb279]/35 transition-all duration-300 group"
                                >
                                    {/* Imagen con Badges */}
                                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-4 bg-[#fcf8f9] border border-[#ebd7da]/40">
                                        {/* Status Badge */}
                                        <div className={`absolute top-3.5 left-3.5 z-10 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${mock.badgeColor}`}>
                                            {mock.badge}
                                        </div>
                                        {/* Favoritos botón */}
                                        <button 
                                            onClick={() => handleToggleFav(prod.id)}
                                            className={`absolute top-3.5 right-3.5 z-10 h-8 w-8 rounded-full flex items-center justify-center shadow transition-all duration-200 border cursor-pointer ${
                                                auth?.user && (auth.user as any).favorite_product_ids?.includes(prod.id)
                                                    ? 'bg-[#94344c] text-white border-[#94344c]' 
                                                    : 'bg-white/90 text-[#94344c] hover:bg-white border-[#ebd7da]/40'
                                            }`}
                                        >
                                            <Heart className="h-4 w-4" fill={auth?.user && (auth.user as any).favorite_product_ids?.includes(prod.id) ? "currentColor" : "none"} />
                                        </button>
                                        <img 
                                            src={prod.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'} 
                                            alt={prod.name}
                                            className="object-cover w-full h-full object-top group-hover:scale-102 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Info Prenda */}
                                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1">
                                            {/* Calificación en estrellas */}
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-amber-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={11} fill={i < mock.rating ? "currentColor" : "none"} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-[#8a3348]/50 font-bold">({mock.reviews})</span>
                                            </div>
                                            
                                            <h3 className="text-base font-extrabold text-[#1a050a] group-hover:text-[#94344c] transition-colors leading-tight line-clamp-1">
                                                {prod.name}
                                            </h3>
                                            
                                            {/* Precio */}
                                            <div className="text-xs font-semibold text-[#8a3348]/80 pt-0.5">
                                                S/ {finalPrice} <span className="font-bold text-[10px] text-[#8a3348]/50 uppercase tracking-wider">/ 48h</span>
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#fcf8f9] mt-4">
                                            <Link 
                                                href={`/producto/${prod.slug}`}
                                                className="py-2 border border-[#ebd7da] text-[#3d0d16] hover:bg-[#fcf8f9] font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                                            >
                                                <Eye size={12} />
                                                Detalles
                                            </Link>
                                            <Link 
                                                href={`/producto/${prod.slug}`}
                                                className="py-2 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                                            >
                                                Alquilar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center text-[#8a3348]/40 py-16">No hay prendas destacadas disponibles.</div>
                    )}
                </div>
            </section>

            {/* SECCIÓN BENEFICIOS: ¿Por qué elegir ARMARIOUNSCH? */}
            <section id="funcionamiento" className="container mx-auto max-w-screen-xl px-4 md:px-8 py-16 text-left">
                <div className="bg-[#fcf8f9] border border-[#ebd7da] rounded-[2.5rem] p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Título */}
                        <div className="lg:col-span-4 space-y-3">
                            <h2 className="text-2xl md:text-3xl font-serif font-black text-[#1a050a] leading-tight">
                                ¿Por qué elegir <br />
                                <span className="text-[#94344c]">ARMARIOUNSCH?</span>
                            </h2>
                            <p className="text-xs text-[#8a3348]/60 font-semibold leading-relaxed max-w-xs">
                                Soluciones de vestuario institucional de alta gama diseñadas por y para estudiantes.
                            </p>
                        </div>
                        {/* Grid Beneficios */}
                        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#1a050a] flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-lg bg-[#dfb279]/20 text-[#c19a6b] flex items-center justify-center font-extrabold text-xs shrink-0">1</span>
                                    Entrega en la UNSCH
                                </h4>
                                <p className="text-xs text-[#8a3348]/70 leading-relaxed pl-8">
                                    Ahorra tiempo y costos de transporte. Entregamos y recibimos las prendas directamente dentro del campus.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#1a050a] flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-lg bg-[#dfb279]/20 text-[#c19a6b] flex items-center justify-center font-extrabold text-xs shrink-0">2</span>
                                    Flexibilidad total
                                </h4>
                                <p className="text-xs text-[#8a3348]/70 leading-relaxed pl-8">
                                    Alquila por las horas o días necesarios para tus exposiciones, congresos o fiestas de graduación.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#1a050a] flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-lg bg-[#dfb279]/20 text-[#c19a6b] flex items-center justify-center font-extrabold text-xs shrink-0">3</span>
                                    Limpieza incluida
                                </h4>
                                <p className="text-xs text-[#8a3348]/70 leading-relaxed pl-8">
                                    No te preocupes por el lavado. Todas nuestras prendas se entregan desinfectadas y en percheros impecables.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#1a050a] flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-lg bg-[#dfb279]/20 text-[#c19a6b] flex items-center justify-center font-extrabold text-xs shrink-0">4</span>
                                    Soporte 24/7
                                </h4>
                                <p className="text-xs text-[#8a3348]/70 leading-relaxed pl-8">
                                    Resolvemos cualquier inconveniente con tallas, reservas o retrasos a través de nuestro soporte técnico activo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BANNER PROMOCIONAL 10% */}
            <section className="container mx-auto max-w-screen-xl px-4 md:px-8 py-6 text-left">
                <div className="bg-[#3d0d16] border border-[#571e26] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[#3d0d16]/10">
                    <div className="flex items-center gap-4.5">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 text-[#dfb279] flex items-center justify-center shrink-0">
                            <Gift size={24} />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-white text-base leading-tight">¿Es tu primera vez?</h3>
                            <p className="text-xs text-[#d2a9b1]/80 mt-0.5">Obtén un <strong className="text-[#dfb279]">10% de descuento</strong> en tu primer alquiler en la plataforma.</p>
                        </div>
                    </div>
                    <Link 
                        href="/perfil"
                        className="bg-white hover:bg-[#fdeaea] text-[#3d0d16] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                        <span>Registrarme ahora</span>
                        <ChevronRight size={14} />
                    </Link>
                </div>
            </section>

            {/* SECCIÓN TESTIMONIOS */}
            <section id="nosotros" className="container mx-auto max-w-screen-xl px-4 md:px-8 py-16 text-left">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-serif font-black text-[#1a050a]">
                            Lo que dicen nuestros clientes
                        </h2>
                        <div className="h-1 w-12 bg-[#dfb279] mt-2 rounded-full" />
                    </div>
                    <Link href="#" className="text-xs font-bold text-[#94344c] hover:text-[#a63f57] transition-all flex items-center gap-1 uppercase tracking-wider">
                        Ver todas las reseñas <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((test, idx) => (
                        <div 
                            key={idx} 
                            className="bg-[#fdfcfc] border border-[#ebd7da]/70 p-6 rounded-3xl flex flex-col justify-between h-[190px] shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="space-y-3">
                                {/* Comillas y Texto */}
                                <span className="font-serif font-black text-2xl text-[#94344c] leading-none block">“</span>
                                <p className="text-[11px] text-[#8a3348]/85 leading-relaxed italic line-clamp-3">
                                    {test.text}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 border-t border-[#fcf8f9] pt-3">
                                <img 
                                    src={test.avatar} 
                                    alt={test.author} 
                                    className="h-8 w-8 rounded-full border border-[#ebd7da]"
                                />
                                <div className="text-left leading-none">
                                    <span className="text-[10px] font-bold text-[#1a050a] block">{test.author}</span>
                                    {/* Estrellas */}
                                    <div className="flex text-amber-500 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={8} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
