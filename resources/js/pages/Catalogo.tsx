import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { 
    Search, 
    Heart, 
    Gem, 
    Shirt, 
    Award, 
    Clock, 
    Grid, 
    List, 
    Calendar, 
    MessageCircle, 
    Star, 
    ChevronRight,
    SlidersHorizontal,
    CheckCircle2
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price_per_day: string | number;
    discount_percent: number;
    discounted_price_per_day: string | number;
    image_url: string;
    category_id: number;
    category?: {
        id: number;
        name: string;
    };
    inventories?: {
        id: number;
        size: string;
        status: string;
    }[];
}

interface Category {
    id: number;
    name: string;
    products_count: number;
}

interface CatalogProps {
    products: Product[];
    categories: Category[];
}

export default function Catalogo({ products, categories }: CatalogProps) {
    const { auth } = usePage().props;

    // States for filtering
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceMax, setPriceMax] = useState<number>(200);
    const [selectedSize, setSelectedSize] = useState<string>('all');
    const [selectedColor, setSelectedColor] = useState<string>('all');
    const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('popular');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Sync URL queries on mount (e.g. ?categoria=ternos)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const catQuery = params.get('categoria');
        if (catQuery) {
            const matchedCat = categories.find(c => c.name.toLowerCase() === catQuery.toLowerCase());
            if (matchedCat) {
                setSelectedCategory(String(matchedCat.id));
            }
        }
    }, [categories]);

    // Total active items
    const totalItems = products.length;

    // Mock badges & reviews mappings for UI fidelity
    const productMocks = useMemo(() => {
        return products.reduce((acc, prod, idx) => {
            const badges = ['Más alquilado', 'Nuevo', 'Popular', 'Disponible'];
            const badge = badges[idx % badges.length];
            const badgeColor = badge === 'Más alquilado' 
                ? 'bg-[#3d0d16] text-[#dfb279] border-[#dfb279]/30' 
                : (badge === 'Nuevo' ? 'bg-black text-white border-white/20' : (badge === 'Popular' ? 'bg-amber-600 text-white border-amber-700' : 'bg-emerald-600 text-white border-emerald-700'));
            
            acc[prod.id] = {
                badge,
                badgeColor,
                rating: 4 + (idx % 2),
                reviews: 5 + (idx * 3) % 25
            };
            return acc;
        }, {} as Record<number, { badge: string; badgeColor: string; rating: number; reviews: number }>);
    }, [products]);

    // Clean all filters
    const handleClearFilters = () => {
        setSelectedCategory('all');
        setPriceMax(200);
        setSelectedSize('all');
        setSelectedColor('all');
        setSelectedAvailability('all');
        setSearchQuery('');
    };

    // Filter Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search text query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(prod => 
                prod.name.toLowerCase().includes(query) || 
                (prod.category?.name && prod.category.name.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(prod => String(prod.category_id) === selectedCategory);
        }

        // Price range filter
        result = result.filter(prod => {
            const price = prod.discount_percent > 0 ? Number(prod.discounted_price_per_day) : Number(prod.price_per_day);
            return price <= priceMax;
        });

        // Size filter
        if (selectedSize !== 'all') {
            result = result.filter(prod => 
                prod.inventories?.some(inv => inv.size === selectedSize)
            );
        }

        // Availability filter
        if (selectedAvailability !== 'all') {
            result = result.filter(prod => {
                const hasAvailable = prod.inventories?.some(inv => inv.status === 'available');
                return selectedAvailability === 'available' ? hasAvailable : !hasAvailable;
            });
        }

        // Sorting
        if (sortBy === 'price_asc') {
            result.sort((a, b) => {
                const pA = a.discount_percent > 0 ? Number(a.discounted_price_per_day) : Number(a.price_per_day);
                const pB = b.discount_percent > 0 ? Number(b.discounted_price_per_day) : Number(b.price_per_day);
                return pA - pB;
            });
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => {
                const pA = a.discount_percent > 0 ? Number(a.discounted_price_per_day) : Number(a.price_per_day);
                const pB = b.discount_percent > 0 ? Number(b.discounted_price_per_day) : Number(b.price_per_day);
                return pB - pA;
            });
        }

        return result;
    }, [products, searchQuery, selectedCategory, priceMax, selectedSize, selectedAvailability, sortBy]);

    return (
        <PublicLayout auth={auth as any}>
            <Head title="Catálogo de Prendas Elegantes - Armario UNSCH" />

            <div className="bg-[#fdfbfb] min-h-screen py-10">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8">
                    
                    {/* Header: Title and benefits */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 text-left">
                        <div>
                            <h1 className="text-3xl font-serif font-black text-[#1a050a] tracking-tight">Catálogo</h1>
                            <p className="text-xs font-bold text-[#8a3348]/60 uppercase tracking-widest mt-1">
                                Mostrando {filteredProducts.length} resultados
                            </p>
                        </div>
                        {/* Upper Indicators */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#fcf8f9] border border-[#ebd7da] p-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/80 w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-[#94344c]" />
                                <span>Alquiler desde 48h</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[#94344c]" />
                                <span>Precios accesibles</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-[#94344c]" />
                                <span>Prendas premium</span>
                            </div>
                        </div>
                    </div>

                    {/* Fila superior de categorías rápidas (botones con contadores) */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 text-xs font-bold uppercase tracking-wider scrollbar-none">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-[#3d0d16] text-[#dfb279] border-[#3d0d16] shadow'
                                    : 'bg-white text-[#8a3348]/75 border-[#ebd7da] hover:bg-[#fcf8f9] hover:text-[#3d0d16]'
                            }`}
                        >
                            <span>Todos</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${selectedCategory === 'all' ? 'bg-[#dfb279]/20 text-[#dfb279]' : 'bg-[#ebd7da]/40 text-[#8a3348]/70'}`}>{totalItems}</span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(String(cat.id))}
                                className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                    selectedCategory === String(cat.id)
                                        ? 'bg-[#3d0d16] text-[#dfb279] border-[#3d0d16] shadow'
                                        : 'bg-white text-[#8a3348]/75 border-[#ebd7da] hover:bg-[#fcf8f9] hover:text-[#3d0d16]'
                                }`}
                            >
                                <span>{cat.name}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${selectedCategory === String(cat.id) ? 'bg-[#dfb279]/20 text-[#dfb279]' : 'bg-[#ebd7da]/40 text-[#8a3348]/70'}`}>{cat.products_count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* SIDEBAR DE FILTROS (Izquierda) */}
                        <div className="lg:col-span-3 bg-white border border-[#ebd7da] rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
                            <div className="flex justify-between items-center border-b border-[#ebd7da] pb-3">
                                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1a050a] flex items-center gap-2">
                                    <SlidersHorizontal size={14} className="text-[#94344c]" />
                                    Filtros
                                </h3>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer"
                                >
                                    Limpiar todo
                                </button>
                            </div>

                            {/* Categorías (Checkboxes) */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60 block">Categoría</span>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2.5 text-xs text-[#1a050a] font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategory === 'all'}
                                            onChange={() => setSelectedCategory('all')}
                                            className="h-4 w-4 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 focus:ring-offset-0 bg-[#fcf8f9]"
                                        />
                                        <span className="flex-grow">Todos</span>
                                        <span className="text-[10px] text-[#8a3348]/50 font-bold">{totalItems}</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat.id} className="flex items-center gap-2.5 text-xs text-[#1a050a] font-medium cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategory === String(cat.id)}
                                                onChange={() => setSelectedCategory(String(cat.id))}
                                                className="h-4 w-4 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 focus:ring-offset-0 bg-[#fcf8f9]"
                                            />
                                            <span className="flex-grow">{cat.name}</span>
                                            <span className="text-[10px] text-[#8a3348]/50 font-bold">{cat.products_count}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[#ebd7da]/70" />

                            {/* Rango de precio */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60 block">Rango de precio</span>
                                <div className="space-y-2">
                                    <input 
                                        type="range"
                                        min="30"
                                        max="200"
                                        value={priceMax}
                                        onChange={e => setPriceMax(Number(e.target.value))}
                                        className="w-full accent-[#94344c] cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[11px] text-[#8a3348] font-bold">
                                        <span>S/ 30</span>
                                        <span>S/ {priceMax}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#ebd7da]/70" />

                            {/* Tallas */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60 block">Talla</span>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(selectedSize === size ? 'all' : size)}
                                            className={`py-2 rounded-lg border text-[10px] font-bold transition-all text-center shrink-0 cursor-pointer ${
                                                selectedSize === size
                                                    ? 'border-[#94344c] text-[#94344c] bg-[#94344c]/10'
                                                    : 'border-[#ebd7da] text-[#8a3348]/70 hover:border-[#94344c]/45'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[#ebd7da]/70" />

                            {/* Color circles */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60 block">Color</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {[
                                        { name: 'negro', class: 'bg-black border-black' },
                                        { name: 'azul', class: 'bg-blue-900 border-blue-900' },
                                        { name: 'gris', class: 'bg-gray-500 border-gray-500' },
                                        { name: 'crema', class: 'bg-[#ebd5b3] border-[#ebd5b3]' },
                                        { name: 'vino', class: 'bg-[#571e26] border-[#571e26]' },
                                        { name: 'verde', class: 'bg-emerald-800 border-emerald-800' }
                                    ].map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(selectedColor === color.name ? 'all' : color.name)}
                                            className={`h-6.5 w-6.5 rounded-full border-2 ${color.class} ${
                                                selectedColor === color.name ? 'ring-2 ring-offset-2 ring-[#94344c]' : ''
                                            } cursor-pointer transition-all`}
                                            aria-label={`Color ${color.name}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <hr className="border-[#ebd7da]/70" />

                            {/* Disponibilidad */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a3348]/60 block">Disponibilidad</span>
                                <div className="space-y-2 text-xs font-medium text-[#1a050a]">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={selectedAvailability === 'all'}
                                            onChange={() => setSelectedAvailability('all')}
                                            className="h-4 w-4 text-[#94344c] focus:ring-0 bg-[#fcf8f9] border-[#ebd7da]"
                                        />
                                        <span>Todos</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={selectedAvailability === 'available'}
                                            onChange={() => setSelectedAvailability('available')}
                                            className="h-4 w-4 text-[#94344c] focus:ring-0 bg-[#fcf8f9] border-[#ebd7da]"
                                        />
                                        <span>Disponible</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="availability"
                                            checked={selectedAvailability === 'rented'}
                                            onChange={() => setSelectedAvailability('rented')}
                                            className="h-4 w-4 text-[#94344c] focus:ring-0 bg-[#fcf8f9] border-[#ebd7da]"
                                        />
                                        <span>No disponible</span>
                                    </label>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <div className="pt-2">
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full py-2.5 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#3d0d16]/10 text-center"
                                >
                                    Aplicar filtros
                                </button>
                            </div>
                        </div>

                        {/* PANEL PRINCIPAL (Derecha) */}
                        <div className="lg:col-span-9 space-y-6 text-left">
                            
                            {/* Barra de Ordenamiento y Cambio de Vista */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#ebd7da] px-6 py-3.5 rounded-3xl shadow-sm">
                                <div className="text-xs text-[#8a3348]/70 font-semibold uppercase tracking-wider">
                                    Ordenar por: 
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="ml-2 bg-transparent border-0 text-[#1a050a] font-extrabold focus:outline-none focus:ring-0 cursor-pointer pr-5"
                                    >
                                        <option value="popular">Más populares</option>
                                        <option value="price_asc">Precio: menor a mayor</option>
                                        <option value="price_desc">Precio: mayor a menor</option>
                                    </select>
                                </div>

                                {/* Grid / List mode toggle */}
                                <div className="flex items-center gap-2 ml-auto shrink-0">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                            viewMode === 'grid'
                                                ? 'bg-[#3d0d16] text-[#dfb279] border-[#3d0d16]'
                                                : 'bg-white border-[#ebd7da] text-[#8a3348]/70'
                                        }`}
                                        aria-label="Vista cuadrícula"
                                    >
                                        <Grid size={15} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                            viewMode === 'list'
                                                ? 'bg-[#3d0d16] text-[#dfb279] border-[#3d0d16]'
                                                : 'bg-white border-[#ebd7da] text-[#8a3348]/70'
                                        }`}
                                        aria-label="Vista lista"
                                    >
                                        <List size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Grid de Productos (Rejilla de 4 columnas en Desktop) */}
                            <div className={`grid grid-cols-1 sm:grid-cols-2 ${viewMode === 'grid' ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-6`}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((prod) => {
                                        const mock = productMocks[prod.id];
                                        
                                        // Obtener las tallas únicas disponibles del inventario real
                                        const sizes = prod.inventories 
                                            ? Array.from(new Set(prod.inventories.map(inv => inv.size))).join(', ') 
                                            : 'S, M, L';

                                        const price = parseFloat(String(prod.price_per_day)).toFixed(2);
                                        const finalPrice = prod.discount_percent > 0 
                                            ? parseFloat(String(prod.discounted_price_per_day)).toFixed(2) 
                                            : price;

                                        return (
                                            <div
                                                key={prod.id}
                                                className={`bg-white border border-[#ebd7da]/70 rounded-3xl p-4 flex ${viewMode === 'list' ? 'flex-col sm:flex-row gap-6' : 'flex-col'} shadow-sm hover:shadow-md hover:border-[#dfb279]/35 transition-all duration-300 group`}
                                            >
                                                {/* Imagen del Producto */}
                                                <div className={`relative ${viewMode === 'list' ? 'sm:w-56 shrink-0 aspect-[4/4.5]' : 'w-full aspect-[3/4.2]'} rounded-2xl overflow-hidden mb-4 bg-[#fcf8f9] border border-[#ebd7da]/40`}>
                                                    {/* Badge de estado */}
                                                    <div className={`absolute top-3 left-3 z-10 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${mock?.badgeColor}`}>
                                                        {mock?.badge}
                                                    </div>
                                                    {/* Favoritos botón */}
                                                    <button className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-white/95 text-[#94344c] hover:bg-white border border-[#ebd7da]/40 flex items-center justify-center shadow transition-all duration-200">
                                                        <Heart size={13} />
                                                    </button>
                                                    <img
                                                        src={prod.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop'}
                                                        alt={prod.name}
                                                        className="object-cover w-full h-full object-top scale-100 group-hover:scale-102 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Detalles de la prenda */}
                                                <div className="flex-grow flex flex-col justify-between space-y-2">
                                                    <div className="space-y-1">
                                                        {/* Estrellas de valoración */}
                                                        <div className="flex items-center gap-1">
                                                            <div className="flex text-amber-500">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={10} fill={i < (mock?.rating || 5) ? "currentColor" : "none"} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[9px] text-[#8a3348]/55 font-bold">({mock?.reviews})</span>
                                                        </div>

                                                        <h3 className="text-sm font-extrabold text-[#1a050a] group-hover:text-[#94344c] transition-colors leading-tight line-clamp-2">
                                                            {prod.name}
                                                        </h3>

                                                        {/* Precio */}
                                                        <div className="text-xs font-semibold text-[#8a3348]/85">
                                                            S/ {finalPrice} <span className="font-bold text-[9px] text-[#8a3348]/50 uppercase tracking-wider">/ 48h</span>
                                                        </div>

                                                        {/* Tallas disponibles */}
                                                        <div className="text-[10px] text-[#8a3348]/50 font-bold uppercase tracking-wider pt-1">
                                                            Tallas: <span className="text-[#1a050a] font-black">{sizes}</span>
                                                        </div>
                                                    </div>

                                                    {/* Botones de acción */}
                                                    <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#fcf8f9] mt-3">
                                                        <Link
                                                            href={`/producto/${prod.slug}`}
                                                            className="py-2 border border-[#ebd7da] text-[#3d0d16] hover:bg-[#fcf8f9] font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center"
                                                        >
                                                            Detalles
                                                        </Link>
                                                        <Link
                                                            href={`/producto/${prod.slug}`}
                                                            className="py-2 bg-[#3d0d16] hover:bg-[#571e26] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center cursor-pointer"
                                                        >
                                                            Alquilar
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-4 text-center py-20 text-[#8a3348]/40 bg-white border border-[#ebd7da] rounded-[2rem] p-8 flex flex-col items-center justify-center">
                                        <Shirt className="mx-auto h-12 w-12 text-[#94344c]/20 mb-4" />
                                        <h3 className="text-base font-extrabold text-[#1a050a] mb-1">No se encontraron prendas</h3>
                                        <p className="text-xs">Prueba seleccionando otras combinaciones de tallas o filtros.</p>
                                    </div>
                                )}
                            </div>

                            {/* Paginación */}
                            {filteredProducts.length > 0 && (
                                <div className="flex justify-center items-center gap-1.5 pt-6 text-xs font-bold uppercase tracking-wider text-[#8a3348]/80">
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        &lt;
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg bg-[#3d0d16] text-[#dfb279] flex items-center justify-center cursor-pointer">
                                        1
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        2
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        3
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        4
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        5
                                    </button>
                                    <span className="px-1 text-[#8a3348]/45">...</span>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        8
                                    </button>
                                    <button className="h-8.5 w-8.5 rounded-lg border border-[#ebd7da] flex items-center justify-center hover:bg-[#fcf8f9] transition-all cursor-pointer">
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTONES FLOTANTES DE CONTACTO Y CALENDARIO */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
                {/* Calendario Flotante */}
                <button 
                    className="h-12 w-12 rounded-full bg-[#1c050a] border border-[#dfb279]/35 text-[#dfb279] hover:bg-[#3d0d16] hover:text-white flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Abrir calendario"
                >
                    <Calendar size={20} />
                </button>

                {/* WhatsApp Chat Flotante */}
                <a 
                    href="https://wa.me/51999888777" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-12 bg-white border border-[#ebd7da] text-[#3d0d16] hover:bg-[#fcf8f9] rounded-full px-5 py-3.5 flex items-center gap-2 shadow-2xl transition-all hover:scale-103 active:scale-97 cursor-pointer group"
                >
                    <MessageCircle size={18} className="text-emerald-500 fill-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#3d0d16]/85 group-hover:text-[#3d0d16]">¿Necesitas ayuda?</span>
                </a>
            </div>
        </PublicLayout>
    );
}
