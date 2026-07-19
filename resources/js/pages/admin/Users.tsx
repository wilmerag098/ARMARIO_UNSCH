import { Head, useForm, router } from '@inertiajs/react';
import {
    ShieldAlert,
    UserCheck,
    UserPlus,
    X,
    Check,
    Save,
    Camera,
    Eye,
    Edit2,
    Lock,
    Ban,
    CheckCircle,
    Calendar,
    Phone,
    MapPin,
    Briefcase,
    Mail,
    ChevronDown,
    Shield,
    Trash2,
    User,
    CreditCard,
    Key
} from 'lucide-react';
import React, { useState, useRef } from 'react';

import Pagination from '@/components/Pagination';
import AdminLayout from '@/layouts/AdminLayout';

interface User {
    id: number;
    name: string;
    last_name: string | null;
    dni: string | null;
    email: string;
    university_id: string | null;
    phone: string | null;
    address: string | null;
    position: string | null;
    role: 'admin' | 'user';
    status: 'active' | 'inactive' | 'suspended';
    type: 'estudiante' | 'docente' | 'personal';
    created_at: string;
    profile_photo_path: string | null;
    avatar: string | null;
    active_reservations_count?: number;
}

interface UsersProps {
    users: User[];
}

export default function Users({ users }: UsersProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const currentUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const createFileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [createAvatarPreview, setCreateAvatarPreview] = useState<string | null>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

    // Form for Creating a new Admin
    const createForm = useForm({
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

    // Form for Editing a User
    const editForm = useForm({
        names: '',
        lastNames: '',
        dni: '',
        university_id: '',
        roleDetail: '',
        email: '',
        address: '',
        phone: '',
        avatar: null as File | null,
        role: 'user' as 'admin' | 'user',
        status: 'active' as 'active' | 'inactive' | 'suspended',
        type: 'estudiante' as 'estudiante' | 'docente' | 'personal',
        password: '',
        password_confirmation: '',
        _method: 'PATCH'
    });

    // Form for Resetting Password
    const passwordResetForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            createForm.setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            editForm.setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/usuarios/admin', {
            forceFormData: true,
            onSuccess: () => {
                createForm.reset();
                setCreateAvatarPreview(null);
                setIsCreateModalOpen(false);
                showToast('¡Administrador creado con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al crear el administrador. Revise el formulario.', 'error');
            }
        });
    };

    const handleEditUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
return;
}

        editForm.post(`/admin/usuarios/${selectedUser.id}`, {
            forceFormData: true,
            onSuccess: () => {
                editForm.reset();
                setEditAvatarPreview(null);
                setIsEditModalOpen(false);
                setSelectedUser(null);
                showToast('¡Usuario actualizado con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al actualizar el usuario. Revise el formulario.', 'error');
            }
        });
    };

    const handlePasswordResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
return;
}

        passwordResetForm.patch(`/admin/usuarios/${selectedUser.id}/reset-password`, {
            onSuccess: () => {
                passwordResetForm.reset();
                setIsResetPasswordModalOpen(false);
                setSelectedUser(null);
                showToast('¡Contraseña restablecida con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al restablecer contraseña. Revise los campos.', 'error');
            }
        });
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        router.patch(`/admin/usuarios/${user.id}/status`, { status: newStatus }, {
            onSuccess: () => {
                showToast(`Usuario ${newStatus === 'active' ? 'activado' : 'suspendido'} correctamente.`, 'success');
            },
            onError: () => {
                showToast('No se pudo cambiar el estado del usuario.', 'error');
            }
        });
    };

    const handleDeleteUser = () => {
        if (!selectedUser) {
return;
}

        router.delete(`/admin/usuarios/${selectedUser.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
                showToast('¡Usuario eliminado correctamente!', 'success');
            },
            onError: () => {
                showToast('No se pudo eliminar el usuario.', 'error');
            }
        });
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            names: user.name || '',
            lastNames: user.last_name || '',
            dni: user.dni || '',
            university_id: user.university_id || '',
            roleDetail: user.position || '',
            email: user.email || '',
            address: user.address || '',
            phone: user.phone || '',
            avatar: null,
            role: user.role,
            status: user.status,
            type: user.type,
            password: '',
            password_confirmation: '',
            _method: 'PATCH'
        });
        setEditAvatarPreview(user.avatar);
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const openResetPasswordModal = (user: User) => {
        setSelectedUser(user);
        passwordResetForm.reset();
        passwordResetForm.clearErrors();
        setIsResetPasswordModalOpen(true);
    };

    const openDetailModal = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
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
                    <h1 className="text-3xl font-bold tracking-tight text-[#6b0b23]">Usuarios Registrados</h1>
                    <p className="text-sm text-[#8a3348] mt-1">
                        Control de accesos, roles, estados y reservas de la comunidad universitaria.
                    </p>
                </div>
                <button
                    onClick={() => {
                        createForm.clearErrors();
                        createForm.reset();
                        setCreateAvatarPreview(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-[#94344c]/10 transition-all text-sm tracking-wider cursor-pointer"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Nuevo administrador</span>
                </button>
            </div>

            <div className="bg-white border border-[#ebd7da] rounded-2xl overflow-hidden shadow-sm">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#ebd7da] text-[#571e26] bg-[#fcf8f9] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Usuario</th>
                                <th className="px-6 py-4 font-semibold">Código / DNI</th>
                                <th className="px-6 py-4 font-semibold text-center">Rol</th>
                                <th className="px-6 py-4 font-semibold text-center">Reservas Activas</th>
                                <th className="px-6 py-4 font-semibold text-center">Estado</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                            {users.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#fdf9fa] transition-colors">
                                        {/* Avatar & Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ebd7da] bg-[#faf6f7] flex items-center justify-center shrink-0">
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
                                                    <div className="font-semibold text-[#1a050a] flex items-center gap-1.5">
                                                        <span>{user.name} {user.last_name || ''}</span>
                                                    </div>
                                                    <div className="text-xs text-[#571e26]/75">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* DNI / Univ ID */}
                                        <td className="px-6 py-4 font-mono text-[#1a050a]">
                                            {user.university_id || user.dni || '-'}
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4 text-center">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                    Administrador
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fdf2f4] text-[#94344c] border border-[#ebd7da]">
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    Estudiante
                                                </span>
                                            )}
                                        </td>

                                        {/* Active Reservations Count */}
                                        <td className="px-6 py-4 text-center font-semibold text-[#1a050a]">
                                            {user.active_reservations_count !== undefined ? (
                                                user.active_reservations_count > 0 ? (
                                                    <span className="inline-flex items-center justify-center bg-[#94344c]/10 border border-[#94344c]/20 text-[#94344c] px-2 py-0.5 rounded-full text-xs">
                                                        {user.active_reservations_count} activas
                                                    </span>
                                                ) : (
                                                    <span className="text-[#571e26]/50 text-xs">Ninguna</span>
                                                )
                                            ) : (
                                                '-'
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            {user.status === 'active' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Activo
                                                </span>
                                            )}
                                            {user.status === 'inactive' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200">
                                                    Inactivo
                                                </span>
                                            )}
                                            {user.status === 'suspended' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                                    Suspendido
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openDetailModal(user)}
                                                    className="p-1.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Ver ficha completa"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Modificar usuario"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openResetPasswordModal(user)}
                                                    className="p-1.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Restablecer contraseña"
                                                >
                                                    <Lock className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center ${user.status === 'active'
                                                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                                        }`}
                                                    title={user.status === 'active' ? 'Suspender cuenta' : 'Activar cuenta'}
                                                >
                                                    {user.status === 'active' ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(user)}
                                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-[#571e26]/75">
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-[#f3e8ea] text-sm text-[#290a0f]">
                    {users.length > 0 ? (
                        currentUsers.map((user) => (
                            <div key={user.id} className="p-5 space-y-3 hover:bg-[#fdf9fa] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ebd7da] bg-[#faf6f7] flex items-center justify-center shrink-0">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=571e26&color=ffb6c5&bold=true`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=571e26&color=ffb6c5&bold=true`;
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-grow text-left">
                                        <div className="font-bold text-[#1a050a] leading-tight">{user.name} {user.last_name || ''}</div>
                                        <div className="text-stone-500 text-[11px] truncate mt-0.5">{user.email}</div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fdf2f4] text-[#94344c] border border-[#ebd7da]">
                                                Estud.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#fcf8f9] px-4 py-3 rounded-2xl text-xs space-y-1.5 font-semibold text-[#571e26]">
                                    <div className="flex justify-between">
                                        <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Código / DNI:</span>
                                        <span className="text-[#1a050a] font-mono">{user.university_id || user.dni || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Reservas Activas:</span>
                                        <span>
                                            {user.active_reservations_count !== undefined ? (
                                                user.active_reservations_count > 0 ? (
                                                    <span className="font-bold text-[#94344c]">{user.active_reservations_count} activas</span>
                                                ) : (
                                                    <span className="text-stone-400">Ninguna</span>
                                                )
                                            ) : (
                                                '-'
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Estado Cuenta:</span>
                                        <span>
                                            {user.status === 'active' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.25 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Activo
                                                </span>
                                            )}
                                            {user.status === 'inactive' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.25 rounded-md text-[9px] font-black uppercase bg-stone-50 text-stone-700 border border-stone-200">
                                                    Inactivo
                                                </span>
                                            )}
                                            {user.status === 'suspended' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.25 rounded-md text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                    Suspendido
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#fcf8f9]/50">
                                    <button
                                        onClick={() => openDetailModal(user)}
                                        className="p-2.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center"
                                        title="Ver ficha completa"
                                    >
                                        <Eye className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="p-2.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center"
                                        title="Modificar usuario"
                                    >
                                        <Edit2 className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                        onClick={() => openResetPasswordModal(user)}
                                        className="p-2.5 bg-[#fdf2f4] hover:bg-[#f3e8ea] text-[#94344c] border border-[#ebd7da] rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center"
                                        title="Restablecer contraseña"
                                    >
                                        <Lock className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        className={`p-2.5 border rounded-xl transition-all cursor-pointer flex items-center justify-center ${user.status === 'active'
                                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                        title={user.status === 'active' ? 'Suspender cuenta' : 'Activar cuenta'}
                                    >
                                        {user.status === 'active' ? <Ban className="h-4.5 w-4.5" /> : <CheckCircle className="h-4.5 w-4.5" />}
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(user)}
                                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center flex-1"
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-[#571e26]/70 font-semibold">
                            No hay usuarios registrados.
                        </div>
                    )}
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
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <UserPlus size={18} className="text-[#94344c]" />
                                Nuevo administrador
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    createForm.reset();
                                    setCreateAvatarPreview(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdminSubmit}>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Avatar */}
                                <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#290a0f]/20 p-4 border border-[#ffb6c5]/10 rounded-2xl">
                                    <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffb6c5]/25 bg-[#290a0f] flex items-center justify-center shrink-0">
                                        {createAvatarPreview ? (
                                            <img src={createAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="h-8 w-8 text-[#d2a9b1]/60" />
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        <span className="block text-xs font-bold uppercase tracking-wider text-[#ffb6c5]">Foto de perfil</span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => createFileInputRef.current?.click()}
                                                className="bg-[#290a0f] hover:bg-[#571e26] border border-[#ffb6c5]/15 text-[#fdeaea] font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Camera size={14} />
                                                <span>Subir foto</span>
                                            </button>
                                            <span className="text-[11px] text-[#d2a9b1]/75">Recomendado: PNG o JPG de máx. 2MB</span>
                                        </div>
                                        <input
                                            type="file"
                                            ref={createFileInputRef}
                                            onChange={handleCreateFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {createForm.errors.avatar && (
                                            <span className="text-red-400 text-xs mt-1 block">{createForm.errors.avatar}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Sección Datos Personales */}
                                    <div className="col-span-1 md:col-span-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-[#94344c]" />
                                            Información Personal
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Nombres <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.names} onChange={e => createForm.setData('names', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Nombres completos" required />
                                        </div>
                                        {createForm.errors.names && <span className="text-red-400 text-xs block mt-1">{createForm.errors.names}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Apellidos <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.lastNames} onChange={e => createForm.setData('lastNames', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Apellidos completos" required />
                                        </div>
                                        {createForm.errors.lastNames && <span className="text-red-400 text-xs block mt-1">{createForm.errors.lastNames}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">DNI <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.dni} onChange={e => createForm.setData('dni', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Número de DNI" required />
                                        </div>
                                        {createForm.errors.dni && <span className="text-red-400 text-xs block mt-1">{createForm.errors.dni}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Cargo</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.roleDetail} onChange={e => createForm.setData('roleDetail', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Ej. Administrador General" />
                                        </div>
                                    </div>

                                    {/* Sección Contacto */}
                                    <div className="col-span-1 md:col-span-2 pt-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-[#94344c]" />
                                            Información de Contacto
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Correo electrónico <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="email" value={createForm.data.email} onChange={e => createForm.setData('email', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="ejemplo@dominio.com" required />
                                        </div>
                                        {createForm.errors.email && <span className="text-red-400 text-xs block mt-1">{createForm.errors.email}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.phone} onChange={e => createForm.setData('phone', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Ej. 987654321" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Dirección</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={createForm.data.address} onChange={e => createForm.setData('address', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Dirección domiciliaria" />
                                        </div>
                                    </div>

                                    {/* Sección Seguridad */}
                                    <div className="col-span-1 md:col-span-2 pt-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <Lock className="h-3.5 w-3.5 text-[#94344c]" />
                                            Seguridad
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Contraseña <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="password" value={createForm.data.password} onChange={e => createForm.setData('password', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Mínimo 8 caracteres" required />
                                        </div>
                                        {createForm.errors.password && <span className="text-red-400 text-xs block mt-1">{createForm.errors.password}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Confirmar contraseña <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="password" value={createForm.data.password_confirmation} onChange={e => createForm.setData('password_confirmation', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Repita la contraseña" required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button type="button" onClick={() => {
 setIsCreateModalOpen(false); createForm.reset(); setCreateAvatarPreview(null); 
}} className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer" disabled={createForm.processing}>Cancelar</button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={createForm.processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar administrador</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* EDIT MODAL */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Edit2 size={18} className="text-[#94344c]" />
                                Modificar usuario: {selectedUser.name} {selectedUser.last_name || ''}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    editForm.reset();
                                    setSelectedUser(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditUserSubmit}>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Avatar */}
                                <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#290a0f]/20 p-4 border border-[#ffb6c5]/10 rounded-2xl">
                                    <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffb6c5]/25 bg-[#290a0f] flex items-center justify-center shrink-0">
                                        {editAvatarPreview ? (
                                            <img src={editAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="h-8 w-8 text-[#d2a9b1]/60" />
                                        )}
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        <span className="block text-xs font-bold uppercase tracking-wider text-[#ffb6c5]">Foto de perfil</span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => editFileInputRef.current?.click()}
                                                className="bg-[#290a0f] hover:bg-[#571e26] border border-[#ffb6c5]/15 text-[#fdeaea] font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Camera size={14} />
                                                <span>Subir foto</span>
                                            </button>
                                            <span className="text-[11px] text-[#d2a9b1]/75">Recomendado: PNG o JPG de máx. 2MB</span>
                                        </div>
                                        <input
                                            type="file"
                                            ref={editFileInputRef}
                                            onChange={handleEditFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {editForm.errors.avatar && (
                                            <span className="text-red-400 text-xs mt-1 block">{editForm.errors.avatar}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Sección Datos Personales */}
                                    <div className="col-span-1 md:col-span-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-[#94344c]" />
                                            Información Personal
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Nombres <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={editForm.data.names} onChange={e => editForm.setData('names', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Nombres completos" required />
                                        </div>
                                        {editForm.errors.names && <span className="text-red-400 text-xs block mt-1">{editForm.errors.names}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Apellidos <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={editForm.data.lastNames} onChange={e => editForm.setData('lastNames', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Apellidos completos" required />
                                        </div>
                                        {editForm.errors.lastNames && <span className="text-red-400 text-xs block mt-1">{editForm.errors.lastNames}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">DNI <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={editForm.data.dni} onChange={e => editForm.setData('dni', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Número de DNI" required />
                                        </div>
                                        {editForm.errors.dni && <span className="text-red-400 text-xs block mt-1">{editForm.errors.dni}</span>}
                                    </div>

                                    {editForm.data.role === 'admin' ? (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Cargo</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                                <input type="text" value={editForm.data.roleDetail} onChange={e => editForm.setData('roleDetail', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Ej. Administrador General" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Código Universitario</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                                <input type="text" value={editForm.data.university_id} onChange={e => editForm.setData('university_id', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Código de estudiante" />
                                            </div>
                                            {editForm.errors.university_id && <span className="text-red-400 text-xs block mt-1">{editForm.errors.university_id}</span>}
                                        </div>
                                    )}

                                    {/* Sección Contacto */}
                                    <div className="col-span-1 md:col-span-2 pt-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-[#94344c]" />
                                            Información de Contacto
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Correo electrónico <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="ejemplo@dominio.com" required />
                                        </div>
                                        {editForm.errors.email && <span className="text-red-400 text-xs block mt-1">{editForm.errors.email}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Teléfono</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={editForm.data.phone} onChange={e => editForm.setData('phone', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Ej. 987654321" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Dirección</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="text" value={editForm.data.address} onChange={e => editForm.setData('address', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20" placeholder="Dirección domiciliaria" />
                                        </div>
                                    </div>

                                    {/* Sección Configuración */}
                                    <div className="col-span-1 md:col-span-2 pt-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5 text-[#94344c]" />
                                            Configuración de Cuenta
                                        </h4>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Rol <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <select id="role" value={editForm.data.role} onChange={e => editForm.setData('role', e.target.value as 'admin' | 'user')} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all appearance-none cursor-pointer">
                                                <option value="user">Cliente / Estudiante</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1] pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Tipo de usuario <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <select id="type" value={editForm.data.type} onChange={e => editForm.setData('type', e.target.value as 'estudiante' | 'docente' | 'personal')} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all appearance-none cursor-pointer">
                                                <option value="estudiante">Estudiante</option>
                                                <option value="docente">Docente</option>
                                                <option value="personal">Personal administrativo</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1] pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Estado <span className="text-[#94344c]">*</span></label>
                                        <div className="relative">
                                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <select id="status" value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value as 'active' | 'inactive' | 'suspended')} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all appearance-none cursor-pointer">
                                                <option value="active">Activo</option>
                                                <option value="inactive">Inactivo</option>
                                                <option value="suspended">Suspendido</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1] pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Sección Seguridad */}
                                    <div className="col-span-1 md:col-span-2 pt-2 mb-1">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffb6c5] flex items-center gap-1.5">
                                            <Lock className="h-3.5 w-3.5 text-[#94344c]" />
                                            Cambiar Contraseña (Opcional)
                                        </h4>
                                        <p className="text-[11px] text-[#d2a9b1]/70 mt-0.5">
                                            Deja estos campos vacíos si no deseas modificar la contraseña del usuario.
                                        </p>
                                        <div className="h-px bg-gradient-to-r from-[#94344c]/30 to-transparent mt-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Nueva contraseña</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="password" value={editForm.data.password} onChange={e => editForm.setData('password', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20 font-semibold" placeholder="Mínimo 8 caracteres" />
                                        </div>
                                        {editForm.errors.password && <span className="text-red-400 text-xs block mt-1">{editForm.errors.password}</span>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Confirmar nueva contraseña</label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                            <input type="password" value={editForm.data.password_confirmation} onChange={e => editForm.setData('password_confirmation', e.target.value)} className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20 font-semibold" placeholder="Repita la clave" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button type="button" onClick={() => {
 setIsEditModalOpen(false); editForm.reset(); setSelectedUser(null); 
}} className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer" disabled={editForm.processing}>Cancelar</button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={editForm.processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar cambios</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RESET PASSWORD MODAL */}
            {isResetPasswordModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Lock size={18} className="text-[#94344c]" />
                                Restablecer contraseña
                            </h3>
                            <button
                                onClick={() => {
                                    setIsResetPasswordModalOpen(false);
                                    passwordResetForm.reset();
                                    setSelectedUser(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordResetSubmit}>
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-[#d2a9b1] leading-relaxed mb-4">
                                    Establece una nueva clave de acceso para el usuario <strong>{selectedUser.name} {selectedUser.last_name || ''}</strong>.
                                </p>

                                <div className="space-y-1.5">
                                    <label htmlFor="pass" className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Nueva contraseña <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <input
                                            type="password"
                                            id="pass"
                                            value={passwordResetForm.data.password}
                                            onChange={(e) => passwordResetForm.setData('password', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20 font-semibold"
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                        />
                                    </div>
                                    {passwordResetForm.errors.password && (
                                        <span className="text-red-400 text-xs mt-1 block">{passwordResetForm.errors.password}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="pass_conf" className="text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">Confirmar contraseña <span className="text-[#94344c]">*</span></label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d2a9b1]/40" />
                                        <input
                                            type="password"
                                            id="pass_conf"
                                            value={passwordResetForm.data.password_confirmation}
                                            onChange={(e) => passwordResetForm.setData('password_confirmation', e.target.value)}
                                            className="w-full bg-[#290a0f]/40 border border-[#ffb6c5]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#fdeaea] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all placeholder-[#d2a9b1]/20 font-semibold"
                                            placeholder="Repita la clave"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                                <button type="button" onClick={() => {
 setIsResetPasswordModalOpen(false); passwordResetForm.reset(); setSelectedUser(null); 
}} className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer" disabled={passwordResetForm.processing}>Cancelar</button>
                                <button type="submit" className="bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2" disabled={passwordResetForm.processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Guardar contraseña</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <ShieldAlert size={18} className="text-[#94344c]" />
                                Eliminar usuario
                            </h3>
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 bg-red-950/20 p-4 border border-red-900/35 rounded-2xl text-red-400">
                                <ShieldAlert size={36} className="shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">Advertencia: Acción irreversible</p>
                                    <p className="text-xs text-red-300/80">
                                        Esta acción eliminará de forma permanente al usuario y todos sus registros asociados de la base de datos.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-[#d2a9b1]">
                                ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.name} {selectedUser.last_name || ''}</strong>?
                            </p>
                        </div>

                        <div className="p-5 border-t border-[#290a0f] flex justify-end gap-3 bg-[#290a0f]/40">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="px-5 py-2.5 text-xs font-bold border border-[#ffb6c5]/15 hover:border-[#94344c] text-[#d2a9b1] hover:text-[#ffb6c5] hover:bg-[#290a0f] rounded-xl transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteUser}
                                className="bg-[#94344c] hover:bg-red-700 text-[#fdeaea] font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 cursor-pointer flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Eliminar definitivamente</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL (Ficha de usuario) */}
            {isDetailModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/40">
                            <h3 className="font-bold text-[#ffb6c5] text-lg flex items-center gap-2">
                                <Shield size={18} className="text-[#94344c]" />
                                Ficha del usuario
                            </h3>
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="text-[#d2a9b1] hover:text-[#ffb6c5] transition-colors p-1.5 rounded-lg hover:bg-[#290a0f] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">

                            {/* Profile Header */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bg-[#290a0f]/20 p-4 border border-[#ffb6c5]/10 rounded-2xl">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffb6c5]/25 bg-[#290a0f] flex items-center justify-center shrink-0">
                                    <img
                                        src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=571e26&color=ffb6c5&bold=true`}
                                        alt={selectedUser.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold text-[#fdeaea]">{selectedUser.name} {selectedUser.last_name || ''}</h4>
                                    <p className="text-xs text-[#ffb6c5] font-semibold uppercase bg-[#94344c]/20 border border-[#94344c]/30 px-2 py-0.5 rounded inline-block">
                                        {selectedUser.position || (selectedUser.role === 'admin' ? 'Administrador' : 'Estudiante')}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2.5 text-[#d2a9b1]">
                                    <Briefcase size={16} className="text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#d2a9b1]/50 tracking-wider">Código / DNI</p>
                                        <p className="font-mono text-[#fdeaea]">{selectedUser.university_id || selectedUser.dni || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-[#d2a9b1]">
                                    <Mail size={16} className="text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#d2a9b1]/50 tracking-wider">Correo</p>
                                        <p className="text-[#fdeaea] break-all">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-[#d2a9b1]">
                                    <Phone size={16} className="text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#d2a9b1]/50 tracking-wider">Teléfono</p>
                                        <p className="text-[#fdeaea]">{selectedUser.phone || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-[#d2a9b1]">
                                    <Calendar size={16} className="text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#d2a9b1]/50 tracking-wider">Fecha de registro</p>
                                        <p className="text-[#fdeaea]">
                                            {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 text-[#d2a9b1] sm:col-span-2">
                                    <MapPin size={16} className="text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#d2a9b1]/50 tracking-wider">Dirección</p>
                                        <p className="text-[#fdeaea]">{selectedUser.address || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reservas info */}
                            <div className="bg-[#290a0f]/20 border border-[#ffb6c5]/10 rounded-2xl p-4 flex justify-between items-center text-sm">
                                <div>
                                    <span className="block text-[#ffb6c5] font-semibold">Reservas activas en posesión</span>
                                    <span className="text-xs text-[#d2a9b1]">Prendas alquiladas pendientes de devolución.</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-[#ffb6c5]">
                                        {selectedUser.active_reservations_count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-[#290a0f] flex justify-end bg-[#290a0f]/40">
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="px-6 py-2.5 text-xs font-bold bg-[#94344c] hover:bg-[#a63f57] text-[#fdeaea] rounded-xl transition-all cursor-pointer shadow-lg shadow-[#94344c]/10"
                            >
                                Cerrar ficha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Users.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
