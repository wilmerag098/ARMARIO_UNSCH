import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    ShieldAlert, 
    UserCheck, 
    UserPlus, 
    X, 
    Check, 
    Save, 
    Camera 
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    last_name: string | null;
    email: string;
    university_id: string | null;
    phone: string | null;
    role: 'admin' | 'user';
    created_at: string;
    profile_photo_path: string | null;
    avatar: string | null;
}

interface UsersProps {
    users: User[];
}

export default function Users({ users }: UsersProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Form structure using useForm
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        names: '',
        lastNames: '',
        dni: '',
        roleDetail: '',
        email: '',
        address: '',
        phone: '',
        avatar: null as File | null,
        password: '',
        password_confirmation: '',
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/admin/usuarios/admin', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setAvatarPreview(null);
                setIsModalOpen(false);
                showToast('¡Administrador creado con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al crear el administrador. Revise el formulario.', 'error');
            }
        });
    };

    return (
        <>
            <Head title="Administrar Usuarios" />

            {/* Toast Notification Alert */}
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
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Usuarios Registrados</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Control de accesos y roles de la comunidad universitaria.
                    </p>
                </div>
                <button
                    onClick={() => {
                        clearErrors();
                        reset();
                        setAvatarPreview(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-[#94344c]/10 transition-all text-sm tracking-wider cursor-pointer"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Nuevo administrador</span>
                </button>
            </div>

            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#290a0f] text-[#d2a9b1] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Nombre</th>
                                <th className="px-6 py-4 font-semibold">Código Univ. / DNI</th>
                                <th className="px-6 py-4 font-semibold">Teléfono</th>
                                <th className="px-6 py-4 font-semibold text-center">Rol</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#290a0f] text-sm">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#290a0f]/20 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ffb6c5]/20 bg-[#290a0f] flex items-center justify-center shrink-0">
                                                <img 
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=571e26&color=ffb6c5&bold=true`} 
                                                    alt={user.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=571e26&color=ffb6c5&bold=true`;
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[#fdeaea]">{user.name} {user.last_name || ''}</div>
                                                <div className="text-xs text-[#d2a9b1]">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[#fdeaea]">
                                            {user.university_id || user.dni || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-[#d2a9b1]">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-900/30">
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#290a0f] text-[#ffb6c5] border border-[#ffb6c5]/10">
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    Estudiante
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-xs bg-[#571e26]/30 hover:bg-[#571e26] text-[#ffb6c5] border border-[#ffb6c5]/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                                                Modificar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-[#d2a9b1]">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Administrator Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <UserPlus size={18} className="text-[#94344c]" />
                                Nuevo administrador
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    reset();
                                    setAvatarPreview(null);
                                }} 
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin}>
                            {/* Body (Scrollable for smaller screens) */}
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                
                                {/* Photo upload & preview row */}
                                <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#290a0f]/20 p-4 border border-[#ffb6c5]/10 rounded-2xl">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffb6c5]/25 bg-[#290a0f] flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="h-8 w-8 text-[#d2a9b1]" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-1">
                                        <span className="block text-sm font-semibold text-[#ffb6c5]">Foto de perfil</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={triggerFileInput}
                                                className="bg-[#290a0f] hover:bg-[#571e26] border border-[#ffb6c5]/15 text-[#fdeaea] font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                                                disabled={processing}
                                            >
                                                Seleccionar archivo
                                            </button>
                                            <span className="text-[11px] text-[#d2a9b1]">PNG, JPG o GIF. Máx. 2MB</span>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {errors.avatar && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.avatar}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label htmlFor="names" className="text-sm font-semibold text-[#d2a9b1]">
                                            Nombres <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="names"
                                            value={data.names}
                                            onChange={(e) => setData('names', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Simon Walter"
                                            required
                                        />
                                        {errors.names && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.names}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="dni" className="text-sm font-semibold text-[#d2a9b1]">
                                            DNI <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="dni"
                                            value={data.dni}
                                            onChange={(e) => setData('dni', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="12345678"
                                            required
                                        />
                                        {errors.dni && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.dni}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="lastNames" className="text-sm font-semibold text-[#d2a9b1]">
                                            Apellidos <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="lastNames"
                                            value={data.lastNames}
                                            onChange={(e) => setData('lastNames', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Cisnero Reyes"
                                            required
                                        />
                                        {errors.lastNames && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.lastNames}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="roleDetail" className="text-sm font-semibold text-[#d2a9b1]">
                                            Cargo
                                        </label>
                                        <input 
                                            type="text" 
                                            id="roleDetail"
                                            value={data.roleDetail}
                                            onChange={(e) => setData('roleDetail', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Administrador del Sistema"
                                        />
                                        {errors.roleDetail && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.roleDetail}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="text-sm font-semibold text-[#d2a9b1]">
                                            Correo electrónico <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="email" 
                                            id="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="simoncisneros07@gmail.com"
                                            required
                                        />
                                        {errors.email && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="address" className="text-sm font-semibold text-[#d2a9b1]">
                                            Dirección
                                        </label>
                                        <input 
                                            type="text" 
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Universidad Nacional de San Cristóbal de Huamanga"
                                        />
                                        {errors.address && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.address}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-sm font-semibold text-[#d2a9b1]">
                                            Teléfono
                                        </label>
                                        <input 
                                            type="text" 
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="+51 966 123 456"
                                        />
                                        {errors.phone && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        {/* Blank space to balance grid */}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="password" className="text-sm font-semibold text-[#d2a9b1]">
                                            Contraseña <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="password" 
                                            id="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Mín. 8 caracteres"
                                            required
                                        />
                                        {errors.password && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.password}</span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="password_confirmation" className="text-sm font-semibold text-[#d2a9b1]">
                                            Confirmar contraseña <span className="text-[#94344c]">*</span>
                                        </label>
                                        <input 
                                            type="password" 
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full bg-[#290a0f] border border-[#ffb6c5]/15 rounded-xl px-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            placeholder="Repita la contraseña"
                                            required
                                        />
                                        {errors.password_confirmation && (
                                            <span className="text-red-400 text-xs mt-1 block">{errors.password_confirmation}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        reset();
                                        setAvatarPreview(null);
                                    }} 
                                    className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span>Guardando...</span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Guardar administrador</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Users.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
