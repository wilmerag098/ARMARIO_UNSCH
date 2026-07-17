import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Calendar, Heart, ShoppingBag, Lock, Gem, Shirt, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Catalogo({ products, categories }: { products: any[], categories: any[] }) {
    const { auth } = usePage().props;

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSize, setSelectedSize] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const filteredProducts = useMemo(() => {
        return products?.filter((prod) => {
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const matchesName = prod.name?.toLowerCase().includes(query);
                const matchesDesc = prod.description?.toLowerCase().includes(query);
                if (!matchesName && !matchesDesc) return false;
            }
            if (selectedCategory !== 'all') {
                if (String(prod.category_id) !== String(selectedCategory)) return false;
            }
            if (selectedSize !== 'all') {
                const hasSize = prod.inventories?.some((inv: any) => inv.size === selectedSize);
                if (!hasSize) return false;
            }
            return true;
        }) || [];
    }, [products, searchQuery, selectedCategory, selectedSize]);

    return (
        <PublicLayout auth={auth}>
            <Head title="Catálogo" />
            
            <div 
                className="w-full min-h-screen py-12 transition-all duration-500"
                style={{ background: 'radial-gradient(circle at bottom, #4a0c13 0%, #120202 80%)' }}
            >
                <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
                    {/* Header Title */}
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-[2px] w-12 bg-[#ffb6c5]"></div>
                            <span className="text-[#ffb6c5] text-xs font-bold tracking-widest uppercase">
                                EXCLUSIVIDAD ACADÉMICA
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-light text-[#ffb6c5] mb-4">
                            CATÁLOGO <span className="font-bold text-white">DISPONIBLE</span>
                        </h1>
                        <p className="text-white/70 text-sm md:text-base max-w-2xl">
                            Selecciona tu fecha para ver disponibilidad en tiempo real de nuestra indumentaria protocolar de gala.
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-12">
                        {/* Fecha del Evento */}
                        <div className="lg:col-span-3 bg-[#23060c] border border-[#3a0d16] rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Fecha del Evento</h3>
                                <Calendar className="h-4 w-4 text-[#ffb6c5]" />
                            </div>
                            <input 
                                type="date" 
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffb6c5] transition-colors [color-scheme:dark]"
                            />
                            <p className="text-[9px] text-[#ffb6c5]/60 mt-2 uppercase tracking-wider">
                                Stock disponible
                            </p>
                        </div>

                        {/* Buscar */}
                        <div className="lg:col-span-3 bg-[#23060c] border border-[#3a0d16] rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Buscar Prenda</h3>
                                <Search className="h-4 w-4 text-[#ffb6c5]" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffb6c5] transition-colors"
                            />
                            <p className="text-[9px] text-white/40 mt-2 uppercase tracking-wider">
                                Búsqueda interactiva
                            </p>
                        </div>

                        {/* Filtrar por Estilo */}
                        <div className="lg:col-span-3 bg-[#23060c] border border-[#3a0d16] rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Categoría</h3>
                                <Shirt className="h-4 w-4 text-[#ffb6c5]" />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-[#120202] border border-[#3a0d16] text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffb6c5] transition-colors"
                            >
                                <option value="all">Todas las categorías</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-[9px] text-white/40 mt-2 uppercase tracking-wider">
                                Estilo de indumentaria
                            </p>
                        </div>

                        {/* Tu Talla */}
                        <div className="lg:col-span-3 bg-[#23060c] border border-[#3a0d16] rounded-xl p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wider">Tu Talla</h3>
                                <Gem className="h-4 w-4 text-[#ffb6c5]" />
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => setSelectedSize('all')}
                                    className={`flex-grow py-2 rounded-lg border text-[10px] font-bold transition-all ${selectedSize === 'all' ? 'border-[#ffb6c5] text-[#ffb6c5] bg-[#ffb6c5]/15' : 'border-[#3a0d16] text-white/60 hover:border-[#ffb6c5]/40 hover:text-white'}`}
                                >
                                    Todo
                                </button>
                                {['S', 'M', 'L', 'XL'].map((talla) => (
                                    <button 
                                        key={talla}
                                        onClick={() => setSelectedSize(talla)}
                                        className={`w-8 py-2 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center ${selectedSize === talla ? 'border-[#ffb6c5] text-[#ffb6c5] bg-[#ffb6c5]/15' : 'border-[#3a0d16] text-white/60 hover:border-[#ffb6c5]/40 hover:text-white'}`}
                                    >
                                        {talla}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] text-white/40 mt-2 uppercase tracking-wider">
                                Medida corporal
                            </p>
                        </div>
                    </div>

                    {/* Título y Filtros */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-[#3a0d16] pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Prendas Disponibles</h2>
                            <p className="text-white/50 text-sm">Mostrando {filteredProducts.length} de {products?.length || 0} prendas</p>
                        </div>
                        {(selectedCategory !== 'all' || selectedSize !== 'all' || searchQuery !== '') && (
                            <button 
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setSelectedSize('all');
                                    setSearchQuery('');
                                }}
                                className="text-xs text-[#ffb6c5] hover:underline transition-all uppercase tracking-wider font-bold"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>

                    {/* Grid de Productos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => {
                                const firstInventory = product.inventories && product.inventories.length > 0 ? product.inventories[0] : null;
                                const isAvailable = product.inventories && product.inventories.some((inv: any) => inv.status === 'available');
                                const displaySize = firstInventory ? firstInventory.size : 'M';

                                return (
                                    <div 
                                        key={product.id} 
                                        className="bg-[#2a0c0e] border border-[#3e1315] rounded-3xl overflow-hidden shadow-2xl hover:border-[#ffb6c5]/20 transition-all duration-300 group flex flex-col h-full"
                                    >
                                        {/* Image Area */}
                                        <div className="relative aspect-[4/4.5] overflow-hidden bg-[#120202]">
                                            {product.discount_percent > 0 && (
                                                <div className="absolute top-4 right-4 bg-red-600 text-white text-[11px] font-black px-2.5 py-1.5 rounded-lg shadow-md border border-red-700 z-10">
                                                    -{product.discount_percent}%
                                                </div>
                                            )}
                                            <img 
                                                src={product.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 group-hover:blur-[3px] transition-all duration-500" 
                                            />
                                            
                                            {/* Hover Overlay 'VER DETALLES' */}
                                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Link 
                                                    href={`/producto/${product.slug}`} 
                                                    className="bg-[#facc15] hover:bg-[#eab308] text-black font-extrabold text-xs px-8 py-3 rounded-full tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                                >
                                                    VER DETALLES
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Text Info Area */}
                                        <div className="p-6 flex flex-col flex-grow bg-[#240a0c]">
                                            {/* Title and Status Badge */}
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <h3 className="text-[17px] font-bold text-white leading-snug flex-grow group-hover:text-[#ffb6c5] transition-colors">
                                                    {product.name}
                                                </h3>
                                                
                                                {/* Status Badge */}
                                                {isAvailable ? (
                                                    <span className="shrink-0 text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                                                        DISPONIBLE
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 text-[#fb7185] bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">
                                                        OCUPADO
                                                    </span>
                                                )}
                                            </div>

                                            {/* Size Info */}
                                            <p className="text-xs text-[#d2a9b1]/70 mb-4 font-medium uppercase tracking-wide">
                                                TALLA: <span className="text-white font-bold">{displaySize}</span>
                                            </p>

                                            {/* Divider Line */}
                                            <div className="border-t border-[#3e1315] my-2"></div>

                                            {/* Price & Action Section */}
                                            <div className="flex justify-between items-center mt-4">
                                                <div>
                                                    <p className="text-[10px] text-[#d2a9b1]/50 font-bold uppercase tracking-wider mb-1">PRECIO</p>
                                                    {product.discount_percent > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] text-white/40 line-through mb-0.5">
                                                                S/ {parseFloat(product.price_per_day).toFixed(2)}
                                                            </span>
                                                            <p className="text-[20px] font-extrabold text-[#facc15] leading-none">
                                                                S/ {parseFloat(product.discounted_price_per_day).toFixed(2)}
                                                                <span className="text-[11px] font-normal text-white/60"> / día</span>
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[20px] font-extrabold text-[#facc15]">
                                                            S/ {parseFloat(product.price_per_day).toFixed(2)}
                                                            <span className="text-[11px] font-normal text-white/60"> / día</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                {isAvailable ? (
                                                    <Link 
                                                        href={`/producto/${product.slug}`} 
                                                        className="bg-[#e28700] hover:bg-[#f59e0b] text-black font-extrabold text-xs px-6 py-3 rounded-xl tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                    >
                                                        RENTAR
                                                    </Link>
                                                ) : (
                                                    <button 
                                                        disabled 
                                                        className="bg-[#1b0507] border border-[#3e1315] text-white/30 font-bold text-xs px-6 py-3 rounded-xl tracking-wider cursor-not-allowed"
                                                    >
                                                        NO DISP.
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-3 text-center py-20 text-white/50 bg-[#1f050b] rounded-3xl border border-[#3a0d16] p-8 flex flex-col items-center justify-center">
                                <Shirt className="mx-auto h-12 w-12 text-[#ffb6c5]/25 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-1">No se encontraron prendas</h3>
                                <p className="text-sm">Prueba ajustando tus filtros de búsqueda.</p>
                            </div>
                        )}
                    </div>

                    {/* Banner Footer */}
                    <div className="bg-[#23060c] border border-[#3a0d16] rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
                        <div className="flex-1 text-center lg:text-left">
                            <h3 className="text-2xl font-light text-white mb-3">Completa tu outfit</h3>
                            <p className="text-white/70 text-sm mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                No olvides los accesorios. Por rentas mayores a S/ 150.00 obtén un 20% de descuento en joyería y calzado.
                            </p>
                            <div className="flex gap-3 justify-center lg:justify-start">
                                <button className="border border-[#ffb6c5]/40 text-[#ffb6c5] hover:bg-[#ffb6c5]/10 text-xs font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
                                    <Gem size={15} />
                                    Joyas
                                </button>
                                <button className="border border-[#ffb6c5]/40 text-[#ffb6c5] hover:bg-[#ffb6c5]/10 text-xs font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
                                    <Shirt size={15} />
                                    Corbatas
                                </button>
                            </div>
                        </div>
                        <div>
                            <button className="border border-[#ffb6c5] text-[#ffb6c5] hover:bg-[#ffb6c5] hover:text-[#1b0308] font-bold text-xs px-8 py-4 rounded-full transition-colors whitespace-nowrap shadow-lg shadow-[#ffb6c5]/10">
                                VER ACCESORIOS
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
