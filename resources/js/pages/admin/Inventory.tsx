import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Plus,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    XCircle,
    Search,
    Filter,
    Trash2,
    Edit2,
    Save,
    X,
    Check,
    ChevronDown,
    Hash,
    Tag,
    Shirt,
    Info,
    RefreshCw
} from 'lucide-react';
import Pagination from '@/components/Pagination';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    image_url: string;
    category?: Category;
}

interface InventoryItem {
    id: number;
    size: string;
    sku: string;
    status: 'available' | 'maintenance' | 'rented' | 'damaged';
    product_id: number;
    product?: Product;
}

interface InventoryProps {
    inventories: InventoryItem[];
    products: Product[];
}

export default function Inventory({ inventories, products }: InventoryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sizeFilter, setSizeFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, sizeFilter]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const createForm = useForm({
        product_id: '',
        size: '',
        sku: '',
        status: 'available' as 'available' | 'maintenance' | 'rented' | 'damaged'
    });

    const editForm = useForm({
        product_id: '',
        size: '',
        sku: '',
        status: 'available' as 'available' | 'maintenance' | 'rented' | 'damaged'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCreateSKU = () => {
        const generated = generateSKU(createForm.data.product_id, createForm.data.size);
        if (generated) {
            createForm.setData('sku', generated);
            showToast('SKU generado automáticamente', 'success');
        } else {
            showToast('Seleccione producto y talla primero', 'error');
        }
    };

    const handleEditSKU = () => {
        const generated = generateSKU(editForm.data.product_id, editForm.data.size);
        if (generated) {
            editForm.setData('sku', generated);
            showToast('SKU generado automáticamente', 'success');
        } else {
            showToast('Seleccione producto y talla primero', 'error');
        }
    };

    const generateSKU = (productId: string, size: string) => {
        const prod = products.find(p => p.id.toString() === productId);
        if (!prod || !size) return null;

        // Take first 3 letters of name and remove non-letters
        const prefix = prod.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const sizeCode = size.toUpperCase();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${sizeCode}-${randNum}`;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/inventario', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
                showToast('Ejemplar físico agregado al inventario.', 'success');
            },
            onError: () => {
                showToast('Error al agregar el ejemplar. Revise el formulario.', 'error');
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        editForm.put(`/admin/inventario/${selectedItem.id}`, {
            onSuccess: () => {
                editForm.reset();
                setIsEditModalOpen(false);
                setSelectedItem(null);
                showToast('Ejemplar físico actualizado con éxito.', 'success');
            },
            onError: () => {
                showToast('Error al actualizar el ejemplar. Revise el formulario.', 'error');
            }
        });
    };

    const handleUpdateStatus = (item: InventoryItem, newStatus: 'available' | 'maintenance' | 'rented' | 'damaged') => {
        router.patch(`/admin/inventario/${item.id}/status`, { status: newStatus }, {
            onSuccess: () => {
                showToast(`Estado cambiado a ${newStatus === 'available' ? 'Disponible' : newStatus === 'maintenance' ? 'Lavandería' : newStatus === 'damaged' ? 'Dañado' : 'Alquilado'}.`, 'success');
            },
            onError: () => {
                showToast('No se pudo cambiar el estado de la prenda.', 'error');
            }
        });
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        router.delete(`/admin/inventario/${selectedItem.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
                showToast('Ejemplar eliminado definitivamente.', 'success');
            },
            onError: () => {
                showToast('No se pudo eliminar el ejemplar del inventario.', 'error');
            }
        });
    };

    const openEditModal = (item: InventoryItem) => {
        setSelectedItem(item);
        editForm.setData({
            product_id: item.product_id.toString(),
            size: item.size,
            sku: item.sku,
            status: item.status
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    // Filter Logic
    const filteredInventories = inventories.filter((item) => {
        const matchesSearch =
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesSize = sizeFilter === 'all' || item.size === sizeFilter;

        return matchesSearch && matchesStatus && matchesSize;
    });

    const totalPages = Math.ceil(filteredInventories.length / itemsPerPage);
    const currentInventories = filteredInventories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Disponible
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        <AlertTriangle className="h-3 w-3" />
                        Lavandería / Limpieza
                    </span>
                );
            case 'rented':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <HelpCircle className="h-3 w-3" />
                        Alquilado
                    </span>
                );
            case 'damaged':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                        <XCircle className="h-3 w-3" />
                        Dañado / Fuera de servicio
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Administrar Inventario Físico" />

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#571e26] border-2 border-[#ffb6c5]/35 text-white px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#94344c] p-1.5 rounded-lg text-white">
                        <Check className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-2 text-white/50 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Inventario Físico</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Control individual de las unidades físicas por talla, SKU y estado. Gestiona el flujo de lavado y reparación.
                    </p>
                </div>
                <button
                    onClick={() => {
                        createForm.reset();
                        setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-[#94344c]/10 transition-all text-sm tracking-wider cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    <span>Agregar ejemplar</span>
                </button>
            </div>

            {/* Filters bar */}
            <div className="bg-white border border-[#ebd7da] p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60" />
                    <input
                        type="text"
                        placeholder="Buscar por SKU o prenda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1a050a] placeholder-[#571e26]/35 focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* Status filter */}
                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="available">Disponible</option>
                            <option value="maintenance">Lavandería</option>
                            <option value="rented">Alquilado</option>
                            <option value="damaged">Dañado</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>

                    {/* Size Filter */}
                    <div className="relative min-w-[110px]">
                        <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50" />
                        <select
                            value={sizeFilter}
                            onChange={(e) => setSizeFilter(e.target.value)}
                            className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl pl-9 pr-8 py-2 text-xs text-[#571e26] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">Todas Tallas</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#571e26]/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#ebd7da] text-[#571e26] bg-[#fcf8f9] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Prenda</th>
                                <th className="px-6 py-4 font-semibold">SKU Único</th>
                                <th className="px-6 py-4 font-semibold text-center">Talla</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                            {filteredInventories.length > 0 ? (
                                currentInventories.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#fdf9fa] transition-colors">
                                        {/* Prenda Info with Thumb */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#ebd7da] bg-[#faf6f7] flex items-center justify-center shrink-0">
                                                    <img
                                                        src={item.product?.image_url || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800'}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#1a050a]">{item.product?.name || 'Prenda Desconocida'}</div>
                                                    <div className="text-xs text-[#571e26]/70">{item.product?.category?.name || 'Sin Categoría'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SKU */}
                                        <td className="px-6 py-4 font-mono font-semibold text-[#94344c] tracking-wider">
                                            {item.sku}
                                        </td>

                                        {/* Talla */}
                                        <td className="px-6 py-4 text-center font-extrabold text-[#1a050a]">
                                            {item.size}
                                        </td>

                                        {/* Estado Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(item.status)}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Botón rápido Lavandería -> Disponible */}
                                                {item.status === 'maintenance' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item, 'available')}
                                                        className="inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-lg transition-all cursor-pointer font-semibold"
                                                        title="Confirmar Limpieza"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                        Listo
                                                    </button>
                                                )}

                                                {/* Botón rápido Disponible -> Dañado */}
                                                {item.status === 'available' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item, 'damaged')}
                                                        className="inline-flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-1.5 px-3 rounded-lg transition-all cursor-pointer font-semibold"
                                                        title="Reportar Daño"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Reportar Daño
                                                    </button>
                                                )}

                                                {/* Botón rápido Dañado -> Lavandería */}
                                                {item.status === 'damaged' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item, 'maintenance')}
                                                        className="inline-flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 py-1.5 px-3 rounded-lg transition-all cursor-pointer font-semibold"
                                                        title="Enviar a Mantenimiento"
                                                    >
                                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                                        Reparar
                                                    </button>
                                                )}

                                                {/* Botón Modificar */}
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-1.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Modificar item"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>

                                                {/* Botón Eliminar */}
                                                <button
                                                    onClick={() => openDeleteModal(item)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Eliminar item"
                                                    disabled={item.status === 'rented'}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#571e26]/75">
                                        No se encontraron ejemplares físicos con los filtros seleccionados.
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

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Plus size={18} className="text-[#94344c]" />
                                Agregar Ejemplar Físico
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div className="p-6 space-y-5">
                                {/* Producto Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Prenda / Producto <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={createForm.data.product_id}
                                            onChange={e => createForm.setData('product_id', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Seleccione una prenda...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {createForm.errors.product_id && <span className="text-red-400 text-xs block mt-1">{createForm.errors.product_id}</span>}
                                </div>

                                {/* Talla Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Talla <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={createForm.data.size}
                                            onChange={e => createForm.setData('size', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Seleccione la talla...</option>
                                            <option value="XS">XS (Extra Chica)</option>
                                            <option value="S">S (Chica)</option>
                                            <option value="M">M (Mediana)</option>
                                            <option value="L">L (Grande)</option>
                                            <option value="XL">XL (Extra Grande)</option>
                                            <option value="XXL">XXL (Doble Extra Grande)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {createForm.errors.size && <span className="text-red-400 text-xs block mt-1">{createForm.errors.size}</span>}
                                </div>

                                {/* SKU Field with Auto Generate Button */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Código SKU Único <span className="text-[#94344c]">*</span></label>
                                        <button
                                            type="button"
                                            onClick={handleCreateSKU}
                                            className="text-xs text-[#ffb6c5] hover:text-[#94344c] transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                                        >
                                            <RefreshCw size={12} />
                                            Autogenerar SKU
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <input
                                            type="text"
                                            value={createForm.data.sku}
                                            onChange={e => createForm.setData('sku', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all font-mono uppercase"
                                            placeholder="Ej. TER-M-4893"
                                            required
                                        />
                                    </div>
                                    {createForm.errors.sku && <span className="text-red-400 text-xs block mt-1">{createForm.errors.sku}</span>}
                                </div>

                                {/* Estado Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Estado Inicial <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={createForm.data.status}
                                            onChange={e => createForm.setData('status', e.target.value as any)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="available">Disponible</option>
                                            <option value="maintenance">En Lavandería</option>
                                            <option value="damaged">Dañado / Fuera de servicio</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {createForm.errors.status && <span className="text-red-400 text-xs block mt-1">{createForm.errors.status}</span>}
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer">Cancelar</button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={createForm.processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Agregar item</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Edit2 size={18} className="text-[#94344c]" />
                                Modificar Ejemplar
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedItem(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="p-6 space-y-5">
                                {/* Producto Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Prenda / Producto <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={editForm.data.product_id}
                                            onChange={e => editForm.setData('product_id', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {editForm.errors.product_id && <span className="text-red-400 text-xs block mt-1">{editForm.errors.product_id}</span>}
                                </div>

                                {/* Talla Selection */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Talla <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={editForm.data.size}
                                            onChange={e => editForm.setData('size', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="XS">XS (Extra Chica)</option>
                                            <option value="S">S (Chica)</option>
                                            <option value="M">M (Mediana)</option>
                                            <option value="L">L (Grande)</option>
                                            <option value="XL">XL (Extra Grande)</option>
                                            <option value="XXL">XXL (Doble Extra Grande)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {editForm.errors.size && <span className="text-red-400 text-xs block mt-1">{editForm.errors.size}</span>}
                                </div>

                                {/* SKU Field with Auto Generate Button */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Código SKU Único <span className="text-[#94344c]">*</span></label>
                                        <button
                                            type="button"
                                            onClick={handleEditSKU}
                                            className="text-xs text-[#ffb6c5] hover:text-[#94344c] transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                                        >
                                            <RefreshCw size={12} />
                                            Re-generar SKU
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <input
                                            type="text"
                                            value={editForm.data.sku}
                                            onChange={e => editForm.setData('sku', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all font-mono uppercase"
                                            placeholder="Ej. TER-M-4893"
                                            required
                                        />
                                    </div>
                                    {editForm.errors.sku && <span className="text-red-400 text-xs block mt-1">{editForm.errors.sku}</span>}
                                </div>

                                {/* Estado Field */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Estado <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <select
                                            value={editForm.data.status}
                                            onChange={e => editForm.setData('status', e.target.value as any)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] transition-all appearance-none cursor-pointer"
                                            required
                                            disabled={editForm.data.status === 'rented'}
                                        >
                                            <option value="available">Disponible</option>
                                            <option value="maintenance">En Lavandería</option>
                                            <option value="rented" disabled>Alquilado (Manejado por Reservas)</option>
                                            <option value="damaged">Dañado / Fuera de servicio</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/50 pointer-events-none" />
                                    </div>
                                    {editForm.errors.status && <span className="text-red-400 text-xs block mt-1">{editForm.errors.status}</span>}
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedItem(null);
                                    }}
                                    className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={editForm.processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar cambios</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <AlertTriangle size={18} className="text-[#94344c]" />
                                Eliminar Ejemplar
                            </h3>
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedItem(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 bg-red-950/20 p-4 border border-red-900/35 rounded-2xl text-red-400">
                                <AlertTriangle size={36} className="shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Advertencia: Acción irreversible</p>
                                    <p className="text-xs text-red-300/80">
                                        Eliminarás permanentemente el ejemplar físico de la prenda <strong>{selectedItem.product?.name}</strong> con SKU <strong>{selectedItem.sku}</strong>.
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-[#d2a9b1]">
                                ¿Estás seguro de que deseas eliminar este ejemplar del inventario de forma definitiva?
                            </p>
                        </div>

                        <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedItem(null);
                                }}
                                className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteSubmit}
                                className="bg-[#94344c] hover:bg-red-750 text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Eliminar definitivamente</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Inventory.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
