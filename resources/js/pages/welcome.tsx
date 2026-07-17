import { Head, Link, usePage } from '@inertiajs/react';
import { 
    GraduationCap, 
    Presentation, 
    PartyPopper, 
    MonitorPlay, 
    Plus, 
    Calendar 
} from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Welcome({ products }: { products: any[] }) {
    const { auth } = usePage().props;

    return (
        <PublicLayout auth={auth}>
            <Head title="Inicio" />
            
            {/* HERO SECTION */}
            <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden">
                {/* Background image overlay mock (since it's a dark reddish gradient in the image) */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background z-0"></div>
                <div 
                    className="absolute inset-0 opacity-20 z-[-1]"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-16 tracking-tight">
                        ¿Para qué evento necesitas tu outfit?
                    </h1>
                    
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        {/* Option 1 */}
                        <div className="flex flex-col items-center gap-4 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground group-hover:bg-primary transition-colors duration-300">
                                <GraduationCap size={28} />
                            </div>
                            <span className="text-sm font-medium text-white/90">Graduación</span>
                        </div>

                        {/* Option 2 */}
                        <div className="flex flex-col items-center gap-4 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground group-hover:bg-primary transition-colors duration-300">
                                <Presentation size={28} />
                            </div>
                            <span className="text-sm font-medium text-white/90">Sustentación</span>
                        </div>

                        {/* Option 3 */}
                        <div className="flex flex-col items-center gap-4 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground group-hover:bg-primary transition-colors duration-300">
                                <PartyPopper size={28} />
                            </div>
                            <span className="text-sm font-medium text-white/90">Evento Formal</span>
                        </div>

                        {/* Option 4 */}
                        <div className="flex flex-col items-center gap-4 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground group-hover:bg-primary transition-colors duration-300">
                                <MonitorPlay size={28} />
                            </div>
                            <span className="text-sm font-medium text-white/90">Exposición</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUTFITS DESTACADOS */}
            <section className="container mx-auto px-4 md:px-8 py-16">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Outfits Destacados
                    </h2>
                    <Link href="/catalogo" className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1">
                        Ver todos <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products && products.length > 0 ? (
                        products.map((prod) => {
                            const isAvailable = prod.inventories && prod.inventories.some((inv: any) => inv.status === 'available');
                            return (
                                <div key={prod.id} className="bg-[#1f050b] rounded-2xl p-4 flex flex-col group border border-[#3a0d16] hover:border-[#ffb6c5]/30 transition-all duration-300">
                                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-[#120202]">
                                        <div className={`absolute top-3 left-3 z-10 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${isAvailable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                            {isAvailable ? 'DISPONIBLE' : 'RESERVADO'}
                                        </div>
                                        {prod.discount_percent > 0 && (
                                            <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md border border-red-700">
                                                -{prod.discount_percent}%
                                            </div>
                                        )}
                                        <img 
                                            src={prod.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'} 
                                            alt={prod.name}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ffb6c5] transition-colors">{prod.name}</h3>
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {prod.inventories?.map((inv: any) => (
                                            <span key={inv.id} className="text-[10px] border border-[#ffb6c5]/20 text-[#ffb6c5] px-2 py-0.5 rounded-md font-medium uppercase">
                                                Talla {inv.size}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#3a0d16]/30">
                                        <div className="text-white/80">
                                            {prod.discount_percent > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/40 line-through">S/ {parseFloat(prod.price_per_day).toFixed(2)}</span>
                                                    <div>
                                                        <span className="font-extrabold text-[#facc15] text-lg">S/ {parseFloat(prod.discounted_price_per_day).toFixed(2)}</span> <span className="text-xs text-white/50">/día</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="font-extrabold text-[#facc15] text-lg">S/ {parseFloat(prod.price_per_day).toFixed(2)}</span> <span className="text-xs text-white/50">/día</span>
                                                </div>
                                            )}
                                        </div>
                                        <Link 
                                            href={`/producto/${prod.slug}`} 
                                            className="w-10 h-10 rounded-full bg-[#ffb6c5]/10 border border-[#ffb6c5]/20 flex items-center justify-center text-[#ffb6c5] hover:bg-[#ffb6c5] hover:text-[#1b0308] transition-all"
                                        >
                                            <Plus size={20} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center text-white/50 py-10">No hay outfits destacados registrados.</div>
                    )}
                </div>
            </section>

            {/* INFO SECTION */}
            <section className="container mx-auto px-4 md:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="border border-border/30 rounded-xl p-8 bg-card/30 flex flex-col">
                        <h3 className="text-primary-foreground/90 font-medium tracking-wide mb-4">USO ACADÉMICO</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Beneficios económicos preferenciales orientados estrictamente a estudiantes y docentes de la UNSCH.
                        </p>
                    </div>
                    <div className="border border-border/30 rounded-xl p-8 bg-card/30 flex flex-col">
                        <h3 className="text-primary-foreground/90 font-medium tracking-wide mb-4">CONTROL DE CALIDAD</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Todas las prendas pasan por un riguroso proceso de tintorería y mantenimiento antes de su entrega.
                        </p>
                    </div>
                    <div className="border border-border/30 rounded-xl p-8 bg-card/30 flex flex-col">
                        <h3 className="text-primary-foreground/90 font-medium tracking-wide mb-4">RESERVA EFICIENTE</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Consulte disponibilidad en tiempo real y recoja su indumentaria asignada directamente en el campus.
                        </p>
                    </div>
                </div>

                {/* CALL TO ACTION */}
                <div className="max-w-3xl mx-auto border border-border/30 rounded-2xl p-12 bg-card/80 text-center flex flex-col items-center shadow-lg">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        ¿Listo para destacar?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                        Explora nuestro catálogo completo y reserva con anticipación para asegurar disponibilidad.
                    </p>
                    <Link 
                        href="/catalogo" 
                        className="bg-[#f4a3b4] text-[#4a1523] hover:bg-[#ffb6c5] transition-colors font-bold text-sm tracking-wide px-8 py-4 rounded-full"
                    >
                        ENCUENTRA TU OUTFIT PERFECTO
                    </Link>
                </div>
            </section>

        </PublicLayout>
    );
}
