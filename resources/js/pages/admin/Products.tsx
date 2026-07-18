import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Tag, Image, ChevronDown, Check, ArrowLeft, Upload, Loader2, X, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Pagination from '@/components/Pagination';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price_per_day: string | number;
    security_deposit: string | number;
    image_url: string;
    inventories_count?: number;
    category_id: number;
    category?: {
        id: number;
        name: string;
    };
    images?: string[];
    inventories?: {
        id: number;
        size: string;
        sku: string;
        status: string;
    }[];
    status: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductsProps {
    products: Product[];
    categories: Category[];
}

export default function Products({ products, categories }: ProductsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };
    
    const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null]);
    const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        category_id: '',
        price_per_day: '',
        security_deposit: '',
        description: '',
        sizes: [] as string[],
        colors: [] as string[],
        quantities: {} as Record<string, number>,
        images: [null, null, null, null, null] as (File | null)[],
        existing_images: [null, null, null, null, null] as (string | null)[],
        primary_image_index: 0,
        status: 'active',
        _method: 'POST',
    });

    const handleSizeToggle = (size: string) => {
        if (data.sizes.includes(size)) {
            const nextSizes = data.sizes.filter((s) => s !== size);
            const nextQuantities = { ...data.quantities };
            delete nextQuantities[size];
            setData({
                ...data,
                sizes: nextSizes,
                quantities: nextQuantities
            });
        } else {
            setData({
                ...data,
                sizes: [...data.sizes, size],
                quantities: { ...data.quantities, [size]: 1 }
            });
        }
    };

    const handleImageSlotChange = (index: number, file: File | null) => {
        const newImages = [...data.images];
        newImages[index] = file;
        setData('images', newImages);

        const newExisting = [...data.existing_images];
        newExisting[index] = null;
        setData('existing_images', newExisting);

        const newPreviews = [...imagePreviews];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews[index] = reader.result as string;
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        } else {
            newPreviews[index] = null;
            setImagePreviews(newPreviews);
            
            // Recalculate primary index if we deleted the primary image
            if (data.primary_image_index === index) {
                const firstAvailableNew = newImages.findIndex((img) => img !== null);
                const firstAvailableExist = newExisting.findIndex((img) => img !== null);
                
                if (firstAvailableNew !== -1) {
                    setData('primary_image_index', firstAvailableNew);
                } else if (firstAvailableExist !== -1) {
                    setData('primary_image_index', firstAvailableExist);
                } else {
                    setData('primary_image_index', 0);
                }
            }
        }
    };

    const handleEdit = (product: Product) => {
        setIsEditing(true);
        setEditingProduct(product);
        
        // Populate existing images
        const existingImgs: (string | null)[] = [...(product.images || [])];
        if (existingImgs.length === 0 && product.image_url) {
            existingImgs.push(product.image_url);
        }
        while (existingImgs.length < 5) {
            existingImgs.push(null);
        }
        
        // Populate previews
        const previews: (string | null)[] = [...(product.images || [])];
        if (previews.length === 0 && product.image_url) {
            previews.push(product.image_url);
        }
        while (previews.length < 5) {
            previews.push(null);
        }
        setImagePreviews(previews);

        // Find primary index
        const primaryIndex = product.images ? product.images.indexOf(product.image_url) : 0;

        // Get sizes from inventories
        const sizes = product.inventories ? product.inventories.map((inv: any) => inv.size) : [];
        const uniqueSizes = Array.from(new Set(sizes));

        // Get quantities per size from inventories
        const quantities: Record<string, number> = {};
        product.inventories?.forEach((inv: any) => {
            quantities[inv.size] = (quantities[inv.size] || 0) + 1;
        });

        setData({
            name: product.name,
            category_id: String(product.category_id),
            price_per_day: String(product.price_per_day),
            security_deposit: String(product.security_deposit),
            description: product.description || '',
            sizes: uniqueSizes,
            colors: (product as any).colors || [],
            quantities: quantities,
            images: [null, null, null, null, null],
            existing_images: existingImgs,
            primary_image_index: primaryIndex !== -1 ? primaryIndex : 0,
            status: product.status || 'active',
            _method: 'PUT',
        });

        setShowAddForm(true);
    };

    const triggerDelete = (product: Product) => {
        setProductToDelete(product);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(`/admin/productos/${productToDelete.id}`, {
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setProductToDelete(null);
                    showToast('¡Prenda eliminada con éxito!', 'success');
                },
                onError: () => {
                    showToast('Error al eliminar la prenda.', 'error');
                }
            });
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing && editingProduct 
            ? `/admin/productos/${editingProduct.id}` 
            : '/admin/productos';
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreviews([null, null, null, null, null]);
                setShowAddForm(false);
                setIsEditing(false);
                setEditingProduct(null);
                showToast(isEditing ? '¡Prenda actualizada con éxito!' : '¡Prenda registrada con éxito!', 'success');
            },
            onError: (err) => {
                console.error(err);
                showToast('Error al guardar la prenda. Revise los campos obligatorios.', 'error');
            }
        });
    };

    const handleCancel = () => {
        reset();
        setImagePreviews([null, null, null, null, null]);
        setShowAddForm(false);
        setIsEditing(false);
        setEditingProduct(null);
    };

    return (
        <>
            <Head title="Administrar Productos" />

            {!showAddForm ? (
                /* PRODUCTS LIST (LIGHT THEME) */
                <div className="animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-[#1a050a]">Productos</h1>
                            <p className="text-sm text-[#571e26]/80 mt-1">
                                Ver y administrar el catálogo de prendas académicas y de etiqueta.
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setEditingProduct(null);
                                reset();
                                setImagePreviews([null, null, null, null, null]);
                                setShowAddForm(true);
                            }}
                            className="bg-[#94344c] hover:bg-[#a63f57] text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#94344c]/10 shrink-0 cursor-pointer"
                        >
                            <Plus className="h-5 w-5" />
                            <span>NUEVO PRODUCTO</span>
                        </button>
                    </div>

                    <div className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#ebd7da] text-[#571e26] bg-[#fcf8f9] text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-bold">Prenda</th>
                                        <th className="px-6 py-4 font-bold">Categoría</th>
                                        <th className="px-6 py-4 font-bold text-right">Precio/Día</th>
                                        <th className="px-6 py-4 font-bold text-right">Garantía</th>
                                        <th className="px-6 py-4 font-bold text-center">Unidades</th>
                                        <th className="px-6 py-4 font-bold text-center">Estado</th>
                                        <th className="px-6 py-4 font-bold text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                                    {products.length > 0 ? (
                                        currentProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-[#fdf9fa] transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-4">
                                                    {product.image_url ? (
                                                        <img 
                                                            src={product.image_url} 
                                                            alt={product.name} 
                                                            className="w-12 h-12 object-cover rounded-lg border border-[#ebd7da] bg-[#faf6f7]"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=100';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-[#f3e8ea] flex items-center justify-center text-[#94344c]">
                                                            <Tag className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-[#1a050a]">{product.name}</div>
                                                        <div className="text-xs text-[#571e26]/75 truncate max-w-xs">{product.description || 'Sin descripción'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fdf2f4] text-[#94344c] border border-[#ebd7da]">
                                                        {product.category?.name || 'Sin Categoría'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-[#1a050a]">
                                                    S/ {Number(product.price_per_day).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-[#571e26]/85">
                                                    S/ {Number(product.security_deposit).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-[#1a050a]">
                                                    {product.inventories_count ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {product.status === 'active' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleEdit(product)}
                                                            className="text-xs bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button 
                                                            onClick={() => triggerDelete(product)}
                                                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center"
                                                            title="Eliminar prenda"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-[#571e26]/70">
                                                No hay productos registrados en esta consola.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            theme="light"
                        />
                    </div>
                </div>
            ) : (
                /* ADD PRODUCT PANEL (DARK THEME - IDENTICAL TO REFERENCE IMAGE) */
                <div className="max-w-4xl mx-auto animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-3">
                        <button 
                            onClick={handleCancel}
                            className="p-2 rounded-xl text-[#571e26] hover:bg-[#ebd7da]/40 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a050a]">
                                Añadir Nueva Prenda
                            </h1>
                            <p className="text-xs md:text-sm text-[#571e26]/80 mt-0.5">
                                Complete los detalles a continuación para registrar una nueva prenda en el catálogo de alquileres. Los campos con asterisco (*) son obligatorios.
                            </p>
                        </div>
                    </div>

                    {/* Dark Burgundy Card Panel */}
                    <div className="bg-[#350e18] rounded-3xl p-6 md:p-8 border border-[#571e26] shadow-2xl text-[#fdeaea]">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Side: Image Selector */}
                                <div className="md:col-span-5 flex flex-col">
                                    <span className="block text-sm font-semibold mb-2.5 text-[#ffb6c5]">
                                        Imágenes de la Prenda (Máx. 5, una principal) *
                                    </span>
                                    
                                    {/* Main active image preview */}
                                    <div 
                                        className="h-64 flex flex-col items-center justify-center border-2 border-[#571e26] rounded-2xl bg-[#1e0509] relative overflow-hidden group"
                                    >
                                        {imagePreviews[data.primary_image_index] ? (
                                            <img 
                                                src={imagePreviews[data.primary_image_index]!} 
                                                alt="Vista previa principal" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="space-y-2 text-center p-4">
                                                <Image className="h-8 w-8 text-[#ffb6c5]/50 mx-auto" />
                                                <span className="text-xs text-[#d2a9b1] block">Ninguna imagen seleccionada como principal</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-[#ffb6c5] text-[10px] px-2 py-1 rounded-full font-bold">
                                            PRINCIPAL
                                        </div>
                                    </div>

                                    {/* 5 slots grid */}
                                    <div className="grid grid-cols-5 gap-2 mt-3">
                                        {[0, 1, 2, 3, 4].map((index) => {
                                            const preview = imagePreviews[index];
                                            const isPrimary = data.primary_image_index === index;
                                            return (
                                                <div 
                                                    key={index}
                                                    className={`aspect-square rounded-xl border-2 relative overflow-hidden bg-[#1e0509] flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                        isPrimary 
                                                            ? 'border-[#ffb6c5] ring-2 ring-[#ffb6c5]/20' 
                                                            : preview 
                                                                ? 'border-[#571e26] hover:border-[#ffb6c5]/50' 
                                                                : 'border-dashed border-[#571e26] hover:border-[#ffb6c5]'
                                                    }`}
                                                    onClick={(e) => {
                                                        if ((e.target as HTMLElement).closest('.action-btn')) return;
                                                        fileRefs.current[index]?.click();
                                                    }}
                                                >
                                                    {preview ? (
                                                        <>
                                                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    className="action-btn p-1 bg-[#ffb6c5] text-[#120202] rounded-full hover:bg-white transition-colors"
                                                                    title="Establecer como principal"
                                                                    onClick={() => setData('primary_image_index', index)}
                                                                >
                                                                    <Check className="h-3 w-3 font-bold" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="action-btn p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
                                                                    title="Eliminar"
                                                                    onClick={() => handleImageSlotChange(index, null)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            {isPrimary && (
                                                                <span className="absolute top-0.5 left-0.5 bg-[#ffb6c5] text-[#120202] text-[8px] font-bold px-1 rounded uppercase tracking-wider scale-90 origin-top-left shadow">
                                                                    P
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center text-[#d2a9b1]/60 hover:text-[#ffb6c5]">
                                                            <Plus className="h-4 w-4" />
                                                            <span className="text-[8px] mt-0.5 font-semibold">Subir</span>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        ref={(el) => { fileRefs.current[index] = el; }} 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageSlotChange(index, file);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.images && (
                                        <span className="text-red-400 text-xs mt-2 block">{errors.images}</span>
                                    )}
                                </div>

                                {/* Right Side: Inputs Fields */}
                                <div className="md:col-span-7 space-y-4">
                                    {/* Nombre de la prenda */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="block text-sm font-semibold text-[#ffb6c5]">
                                            Nombre de la prenda *
                                        </label>
                                        <input 
                                            type="text" 
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ej. Terno Azul Marino Corte Italiano"
                                            className="bg-[#1e0509] border border-[#571e26] rounded-xl px-4 py-3 text-white placeholder-stone-500 w-full focus:outline-none focus:border-[#ffb6c5] transition-all text-sm"
                                            required
                                        />
                                        {errors.name && (
                                            <span className="text-red-400 text-xs block">{errors.name}</span>
                                        )}
                                    </div>

                                    {/* Categoria */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="category" className="block text-sm font-semibold text-[#ffb6c5]">
                                            Categoría *
                                        </label>
                                        <div className="relative">
                                            <select 
                                                id="category"
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                className="bg-[#1e0509] border border-[#571e26] rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-[#ffb6c5] transition-all text-sm appearance-none cursor-pointer pr-10"
                                                required
                                            >
                                                <option value="" disabled className="text-stone-500 bg-[#1e0509]">
                                                    Seleccione una categoría
                                                </option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id} className="bg-[#1e0509] text-white">
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ffb6c5] pointer-events-none" />
                                        </div>
                                        {errors.category_id && (
                                            <span className="text-red-400 text-xs block">{errors.category_id}</span>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="status" className="block text-sm font-semibold text-[#ffb6c5]">
                                            Estado *
                                        </label>
                                        <div className="relative">
                                            <select 
                                                id="status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="bg-[#1e0509] border border-[#571e26] rounded-xl px-4 py-3 text-white w-full focus:outline-none focus:border-[#ffb6c5] transition-all text-sm appearance-none cursor-pointer pr-10"
                                                required
                                            >
                                                <option value="active" className="bg-[#1e0509] text-white">
                                                    Activo
                                                </option>
                                                <option value="inactive" className="bg-[#1e0509] text-white">
                                                    Inactivo
                                                </option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ffb6c5] pointer-events-none" />
                                        </div>
                                        {errors.status && (
                                            <span className="text-red-400 text-xs block">{errors.status}</span>
                                        )}
                                    </div>

                                    {/* Tallas disponibles */}
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <span className="block text-sm font-semibold text-[#ffb6c5]">
                                                Tallas Disponibles
                                            </span>
                                            <div className="flex flex-wrap gap-3">
                                                {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                                                    const isSelected = data.sizes.includes(size);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={size}
                                                            onClick={() => handleSizeToggle(size)}
                                                            className={`h-10 w-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer ${
                                                                isSelected 
                                                                    ? 'bg-[#ffb6c5] text-[#120202] shadow-md shadow-[#ffb6c5]/20 scale-105' 
                                                                    : 'bg-[#1e0509] border border-[#571e26] text-[#ffb6c5] hover:border-[#ffb6c5]'
                                                            }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {errors.sizes && (
                                                <span className="text-red-400 text-xs block">{errors.sizes}</span>
                                            )}
                                        </div>

                                        {/* Cantidades por talla */}
                                        {data.sizes.length > 0 && (
                                            <div className="bg-[#1e0509]/30 border border-[#571e26]/30 rounded-2xl p-4 space-y-3">
                                                <span className="block text-xs font-bold uppercase tracking-wider text-[#ffb6c5]">
                                                    Cantidad por Talla (Stock de Prendas)
                                                </span>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {data.sizes.map((size) => (
                                                        <div key={size} className="flex items-center justify-between bg-[#1a0407] border border-[#571e26]/50 rounded-xl px-3 py-2">
                                                            <span className="text-xs font-bold text-white">Talla {size}</span>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={data.quantities[size] || 1}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    setData('quantities', {
                                                                        ...data.quantities,
                                                                        [size]: val < 1 ? 1 : val
                                                                    });
                                                                }}
                                                                className="w-14 bg-[#120202] border border-[#571e26]/60 rounded-lg px-1.5 py-1 text-center text-white focus:outline-none focus:border-[#ffb6c5] text-xs font-semibold"
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {errors.quantities && (
                                                    <span className="text-red-400 text-xs block">{errors.quantities}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Precios (Alquiler y Garantia) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label htmlFor="price" className="block text-sm font-semibold text-[#ffb6c5]">
                                                Precio de Alquiler *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffb6c5] font-semibold text-sm">
                                                    S/
                                                </span>
                                                <input 
                                                    type="number" 
                                                    id="price"
                                                    value={data.price_per_day}
                                                    onChange={(e) => {
                                                        const price = e.target.value;
                                                        setData((prev) => ({
                                                            ...prev,
                                                            price_per_day: price,
                                                            security_deposit: price ? (Number(price) * 0.20).toFixed(2) : '',
                                                        }));
                                                    }}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    className="bg-[#1e0509] border border-[#571e26] rounded-xl pl-10 pr-4 py-3 text-white w-full focus:outline-none focus:border-[#ffb6c5] transition-all text-sm"
                                                    required
                                                />
                                            </div>
                                            {errors.price_per_day && (
                                                <span className="text-red-400 text-xs block">{errors.price_per_day}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="deposit" className="block text-sm font-semibold text-[#ffb6c5]">
                                                Depósito de Garantía (20%)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffb6c5]/60 font-semibold text-sm">
                                                    S/
                                                </span>
                                                <input 
                                                    type="number" 
                                                    id="deposit"
                                                    value={data.security_deposit}
                                                    readOnly
                                                    className="bg-[#1e0509]/50 border border-[#571e26] rounded-xl pl-10 pr-4 py-3 text-white/60 w-full focus:outline-none cursor-not-allowed text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {errors.security_deposit && (
                                                <span className="text-red-400 text-xs block">{errors.security_deposit}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colores disponibles */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-[#ffb6c5]">
                                    Colores Disponibles (Opcional)
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        id="new-color-input"
                                        placeholder="Ej. Negro, Azul, Rojo (Presione Enter para añadir)"
                                        className="bg-[#1e0509] border border-[#571e26] rounded-xl px-4 py-3 text-white placeholder-stone-500 flex-grow focus:outline-none focus:border-[#ffb6c5] transition-all text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const target = e.target as HTMLInputElement;
                                                const val = target.value.trim();
                                                if (val && !data.colors.includes(val)) {
                                                    setData('colors', [...data.colors, val]);
                                                    target.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('new-color-input') as HTMLInputElement;
                                            const val = input?.value.trim();
                                            if (val && !data.colors.includes(val)) {
                                                setData('colors', [...data.colors, val]);
                                                input.value = '';
                                            }
                                        }}
                                        className="bg-[#571e26] hover:bg-[#ffb6c5] hover:text-[#120202] text-[#ffb6c5] font-bold px-4 rounded-xl border border-[#571e26] transition-all text-xs cursor-pointer"
                                    >
                                        Añadir
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {data.colors && data.colors.map((color) => (
                                        <span 
                                            key={color} 
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#571e26] text-white border border-[#ebd7da]/10 shadow-sm"
                                        >
                                            {color}
                                            <button
                                                type="button"
                                                onClick={() => setData('colors', data.colors.filter((c) => c !== color))}
                                                className="text-white/60 hover:text-red-400 font-bold hover:scale-110 transition-all cursor-pointer"
                                                title={`Eliminar ${color}`}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    {(!data.colors || data.colors.length === 0) && (
                                        <span className="text-xs text-[#ffb6c5]/50 italic">Ningún color añadido. La selección será libre para el cliente.</span>
                                    )}
                                </div>
                                {errors.colors && (
                                    <span className="text-red-400 text-xs block">{errors.colors}</span>
                                )}
                            </div>

                            {/* Descripcion */}
                            <div className="space-y-1.5">
                                <label htmlFor="description" className="block text-sm font-semibold text-[#ffb6c5]">
                                    Descripción
                                </label>
                                <textarea 
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Detalles de la prenda, materiales, condiciones especiales..."
                                    className="bg-[#1e0509] border border-[#571e26] rounded-xl px-4 py-3 text-white placeholder-stone-500 w-full h-28 focus:outline-none focus:border-[#ffb6c5] transition-all text-sm resize-none"
                                />
                                {errors.description && (
                                    <span className="text-red-400 text-xs block">{errors.description}</span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#571e26]/30">
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className="border border-[#ffb6c5]/40 hover:border-[#ffb6c5] text-[#ffb6c5] font-semibold rounded-full py-2.5 px-6 transition-all text-xs tracking-wider cursor-pointer"
                                >
                                    CANCELAR
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-[#ffb6c5] hover:bg-[#ffa3b6] text-[#120202] font-bold rounded-full py-2.5 px-6 transition-all shadow-lg shadow-[#ffb6c5]/15 flex items-center justify-center gap-2 text-xs tracking-wider cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>GUARDANDO...</span>
                                        </>
                                    ) : (
                                        <span>{isEditing ? 'GUARDAR CAMBIOS' : 'GUARDAR PRODUCTO'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="bg-[#350e18] border border-[#571e26] text-[#fdeaea] rounded-3xl max-w-md shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#ffb6c5] flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-400" />
                            ¿Eliminar Prenda?
                        </DialogTitle>
                        <DialogDescription className="text-[#d2a9b1] text-sm mt-2">
                            ¿Está seguro de que desea eliminar la prenda <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer y eliminará todos los registros de inventario asociados.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#571e26]/30">
                        <button
                            type="button"
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="border border-[#ffb6c5]/40 hover:border-[#ffb6c5] text-[#ffb6c5] font-semibold rounded-full py-2 px-5 transition-all text-xs tracking-wider cursor-pointer"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-full py-2 px-5 transition-all shadow-lg shadow-red-600/20 text-xs tracking-wider cursor-pointer"
                        >
                            ELIMINAR
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toast Notification Alert */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-[#e6fcf5] border-[#c3fae8] text-[#0ca678]' 
                        : 'bg-[#fff5f5] border-[#ffe3e3] text-[#c92a2a]'
                }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-[#0ca678]" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-[#c92a2a]" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}
        </>
    );
}

Products.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
