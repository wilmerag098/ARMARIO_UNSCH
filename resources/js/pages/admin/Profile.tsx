import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
    User, 
    Lock, 
    Camera, 
    Calendar, 
    Shield, 
    Settings, 
    Bell, 
    Upload, 
    Save, 
    Check, 
    X,
    UserCheck,
    Globe,
    Clock,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

export default function Profile() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState<'personal' | 'preferencias' | 'notificaciones'>('personal');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Inertia form handler for main profile updates
    const { data, setData, post, processing, errors, reset } = useForm({
        names: user?.name || '',
        lastNames: user?.last_name || '',
        dni: user?.dni || '',
        roleDetail: user?.position || 'Administrador del Sistema',
        email: user?.email || '',
        address: user?.address || '',
        phone: user?.phone || '',
        avatar: null as File | null,
        language: user?.language === 'en' ? 'Inglés' : 'Español',
        panelTheme: user?.panel_theme === 'dark' ? 'Oscuro' : 'Claro',
        timezone: user?.timezone === 'UTC' ? '(GMT+00:00) UTC' : user?.timezone === 'America/Mexico_City' ? '(GMT-06:00) México' : '(GMT-05:00) Lima',
        dateFormat: user?.date_format || 'DD/MM/YYYY',
        notifyReservations: user?.notify_reservations === undefined ? true : !!user.notify_reservations,
        notifyReturns: user?.notify_returns === undefined ? true : !!user.notify_returns,
        notifySystem: user?.notify_system === undefined ? false : !!user.notify_system,
        _method: 'PATCH'
    });

    // Separate Inertia form handler for password updates
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=571e26&color=ffb6c5&bold=true&size=128`
    );

    // Sync avatar preview if user changes
    useEffect(() => {
        if (user?.avatar) {
            setAvatarPreview(user.avatar);
        }
    }, [user?.avatar]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                showToast('Nueva foto cargada temporalmente. Guarda cambios para guardar.', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/admin/perfil', {
            forceFormData: true,
            onSuccess: () => {
                showToast('¡Perfil actualizado con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al actualizar el perfil. Por favor revise el formulario.', 'error');
            }
        });
    };

    const handleCancel = () => {
        reset();
        setAvatarPreview(
            user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=571e26&color=ffb6c5&bold=true&size=128`
        );
        showToast('Cambios descartados', 'error');
    };

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setIsPasswordModalOpen(false);
                showToast('¡Contraseña actualizada con éxito!', 'success');
            },
            onError: () => {
                showToast('Error al actualizar la contraseña. Revise los campos.', 'error');
            }
        });
    };

    return (
        <>
            <Head title="Mi Perfil - Administración" />

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

            <div className="animate-in fade-in duration-200">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a050a]">Mi Perfil</h1>
                    <p className="text-sm text-[#571e26]/80 mt-1">
                        Gestiona tu información personal y las preferencias de tu cuenta.
                    </p>
                </div>

                {/* Main responsive grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Summary Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white border border-[#ebd7da] rounded-3xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
                            {/* Accent line decoration */}
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#94344c] to-[#571e26]" />

                            {/* Avatar container */}
                            <div className="relative mt-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-[4px] border-[#fdf2f4] shadow-md bg-stone-100 flex items-center justify-center">
                                    <img 
                                        src={avatarPreview!} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=571e26&color=ffb6c5&bold=true&size=128`;
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={triggerFileInput}
                                    type="button"
                                    className="absolute bottom-1 right-1 bg-white hover:bg-[#fdf2f4] text-[#94344c] border border-[#ebd7da] p-2.5 rounded-full shadow-md transition-all duration-200 cursor-pointer"
                                    title="Cambiar foto de perfil"
                                    disabled={processing}
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* User details */}
                            <div className="text-center mt-5 w-full">
                                <h2 className="text-xl font-bold text-[#1a050a]">
                                    {data.names} {data.lastNames}
                                </h2>
                                
                                <span className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#fdf2f4] text-[#94344c] border border-[#ebd7da]">
                                    {data.roleDetail}
                                </span>
                                
                                <p className="text-sm text-[#571e26]/75 mt-3 break-all">{data.email}</p>
                            </div>

                            {/* Decorative line */}
                            <div className="w-full h-px bg-[#ebd7da]/60 my-6" />

                            {/* Metadata list */}
                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3.5">
                                    <Calendar className="h-5 w-5 text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#571e26]/50 uppercase tracking-wider">Fecha de creación</p>
                                        <p className="text-sm font-semibold text-[#1a050a] mt-0.5">
                                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : '12 de marzo de 2024'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3.5">
                                    <Clock className="h-5 w-5 text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#571e26]/50 uppercase tracking-wider">Último acceso</p>
                                        <p className="text-sm font-semibold text-[#1a050a] mt-0.5">
                                            {user?.updated_at ? new Date(user.updated_at).toLocaleString('es-PE') : '18 de junio de 2025 - 08:45 a.m.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3.5">
                                    <Shield className="h-5 w-5 text-[#94344c] shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#571e26]/50 uppercase tracking-wider">Rol</p>
                                        <p className="text-sm font-semibold text-[#1a050a] mt-0.5">Administrador del sistema</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3.5">
                                    <span className="h-5 w-5 flex items-center justify-center shrink-0">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#571e26]/50 uppercase tracking-wider">Estado de cuenta</p>
                                        <p className="text-sm font-semibold text-[#1a050a] mt-0.5">Activo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white border border-[#ebd7da] rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-[#1a050a]">Seguridad de la cuenta</h3>
                            <p className="text-xs text-[#571e26]/80 mt-1 leading-relaxed">
                                Mantén tu cuenta segura actualizando tu contraseña periódicamente.
                            </p>
                            <button 
                                type="button"
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full mt-5 border border-[#ebd7da] hover:border-[#94344c] hover:bg-[#fdf2f4] text-[#571e26] hover:text-[#94344c] font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                <Lock className="h-4 w-4" />
                                <span>Cambiar contraseña</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Tabs & Forms */}
                    <div className="lg:col-span-8 bg-white border border-[#ebd7da] rounded-3xl shadow-sm overflow-hidden">
                        
                        {/* Tabs Header - Seamless white background */}
                        <div className="flex border-b border-[#ebd7da] bg-white px-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('personal')}
                                className={`py-4 px-4 font-semibold text-sm transition-all relative border-b-2 flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'personal'
                                        ? 'border-[#94344c] text-[#94344c] font-bold'
                                        : 'border-transparent text-[#571e26]/60 hover:text-[#94344c]'
                                }`}
                            >
                                <User className="h-4 w-4" />
                                <span>Información Personal</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('preferencias')}
                                className={`py-4 px-4 font-semibold text-sm transition-all relative border-b-2 flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'preferencias'
                                        ? 'border-[#94344c] text-[#94344c] font-bold'
                                        : 'border-transparent text-[#571e26]/60 hover:text-[#94344c]'
                                }`}
                            >
                                <Settings className="h-4 w-4" />
                                <span>Preferencias</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('notificaciones')}
                                className={`py-4 px-4 font-semibold text-sm transition-all relative border-b-2 flex items-center gap-2 cursor-pointer ${
                                    activeTab === 'notificaciones'
                                        ? 'border-[#94344c] text-[#94344c] font-bold'
                                        : 'border-transparent text-[#571e26]/60 hover:text-[#94344c]'
                                }`}
                            >
                                <Bell className="h-4 w-4" />
                                <span>Notificaciones</span>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
                            
                            {/* TAB 1: INFORMACION PERSONAL */}
                            {activeTab === 'personal' && (
                                <div className="space-y-8 animate-in fade-in duration-200">
                                    {/* Personal Info Header */}
                                    <div className="flex items-center gap-3 border-b border-[#ebd7da]/60 pb-4">
                                        <User className="h-5 w-5 text-[#94344c]" />
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1a050a]">Información personal</h3>
                                            <p className="text-xs text-[#571e26]/75 mt-0.5">
                                                Actualiza tu información personal y de contacto.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Form Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label htmlFor="names" className="text-sm font-semibold text-[#571e26]/85">
                                                Nombres <span className="text-[#94344c]">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                id="names"
                                                value={data.names}
                                                onChange={(e) => setData('names', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                                required
                                            />
                                            {errors.names && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.names}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="dni" className="text-sm font-semibold text-[#571e26]/85">
                                                DNI <span className="text-[#94344c]">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                id="dni"
                                                value={data.dni}
                                                onChange={(e) => setData('dni', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                                required
                                            />
                                            {errors.dni && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.dni}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="lastNames" className="text-sm font-semibold text-[#571e26]/85">
                                                Apellidos <span className="text-[#94344c]">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                id="lastNames"
                                                value={data.lastNames}
                                                onChange={(e) => setData('lastNames', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                                required
                                            />
                                            {errors.lastNames && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.lastNames}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="roleDetail" className="text-sm font-semibold text-[#571e26]/85">
                                                Cargo
                                            </label>
                                            <input 
                                                type="text" 
                                                id="roleDetail"
                                                value={data.roleDetail}
                                                onChange={(e) => setData('roleDetail', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            />
                                            {errors.roleDetail && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.roleDetail}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="email" className="text-sm font-semibold text-[#571e26]/85">
                                                Correo electrónico <span className="text-[#94344c]">*</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                id="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                                required
                                            />
                                            {errors.email && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="address" className="text-sm font-semibold text-[#571e26]/85">
                                                Dirección
                                            </label>
                                            <input 
                                                type="text" 
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            />
                                            {errors.address && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.address}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label htmlFor="phone" className="text-sm font-semibold text-[#571e26]/85">
                                                Teléfono
                                            </label>
                                            <input 
                                                type="text" 
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl px-4 py-3 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                            />
                                            {errors.phone && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <span className="block text-sm font-semibold text-[#571e26]/85">
                                                Foto de perfil
                                            </span>
                                            <div className="flex items-center gap-3 bg-[#fdf9fa] border border-[#ebd7da] rounded-xl px-3 py-1.5 h-[46px] w-full relative">
                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="bg-white hover:bg-[#fdf2f4] border border-[#ebd7da] text-[#571e26] hover:text-[#94344c] font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
                                                    disabled={processing}
                                                >
                                                    Seleccionar archivo
                                                </button>
                                                <span className="text-[11px] text-[#571e26]/60 truncate">
                                                    {data.avatar ? data.avatar.name : 'PNG, JPG o GIF. Máx. 2MB'}
                                                </span>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </div>
                                            {errors.avatar && (
                                                <span className="text-red-500 text-xs mt-1 block">{errors.avatar}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section: Preferencias del Sistema */}
                                    <div className="space-y-6 pt-4 border-t border-[#ebd7da]/60">
                                        <div className="flex items-center gap-3 pb-2">
                                            <Settings className="h-5 w-5 text-[#94344c]" />
                                            <div>
                                                <h3 className="text-lg font-bold text-[#1a050a]">Preferencias del sistema</h3>
                                                <p className="text-xs text-[#571e26]/75 mt-0.5">
                                                    Personaliza la apariencia y comportamiento del panel.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-1.5">
                                                <label htmlFor="language" className="text-sm font-semibold text-[#571e26]/85">
                                                    Idioma
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        id="language"
                                                        value={data.language}
                                                        onChange={(e) => setData('language', e.target.value)}
                                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl pl-3 pr-10 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold appearance-none cursor-pointer"
                                                    >
                                                        <option>Español</option>
                                                        <option>Inglés</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="panelTheme" className="text-sm font-semibold text-[#571e26]/85">
                                                    Tema del panel
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        id="panelTheme"
                                                        value={data.panelTheme}
                                                        onChange={(e) => setData('panelTheme', e.target.value)}
                                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl pl-3 pr-10 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold appearance-none cursor-pointer"
                                                    >
                                                        <option>Claro</option>
                                                        <option>Oscuro</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="timezone" className="text-sm font-semibold text-[#571e26]/85">
                                                    Zona horaria
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        id="timezone"
                                                        value={data.timezone}
                                                        onChange={(e) => setData('timezone', e.target.value)}
                                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl pl-3 pr-10 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold appearance-none cursor-pointer"
                                                    >
                                                        <option>(GMT-05:00) Lima</option>
                                                        <option>(GMT-06:00) México</option>
                                                        <option>(GMT+00:00) UTC</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="dateFormat" className="text-sm font-semibold text-[#571e26]/85">
                                                    Formato de fecha
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        id="dateFormat"
                                                        value={data.dateFormat}
                                                        onChange={(e) => setData('dateFormat', e.target.value)}
                                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] hover:border-[#ebd7da]/80 rounded-xl pl-3 pr-10 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold appearance-none cursor-pointer"
                                                    >
                                                        <option>DD/MM/YYYY</option>
                                                        <option>YYYY-MM-DD</option>
                                                        <option>MM/DD/YYYY</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#571e26]/60 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: PREFERENCIAS ADICIONALES */}
                            {activeTab === 'preferencias' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-3 border-b border-[#ebd7da]/60 pb-4">
                                        <Settings className="h-5 w-5 text-[#94344c]" />
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1a050a]">Preferencias adicionales</h3>
                                            <p className="text-xs text-[#571e26]/75 mt-0.5">
                                                Ajustes avanzados para personalizar tu entorno de trabajo.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 bg-[#fcf8f9] border border-[#ebd7da]/60 rounded-2xl p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-[#1a050a]">Cierre automático de sesión</h4>
                                                <p className="text-xs text-[#571e26]/70 mt-0.5">Cerrar sesión por inactividad después de 30 minutos.</p>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                id="autoClose" 
                                                defaultChecked
                                                className="h-5 w-5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 cursor-pointer"
                                            />
                                        </div>

                                        <hr className="border-[#ebd7da]/40" />

                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-[#1a050a]">Carga perezosa de reportes</h4>
                                                <p className="text-xs text-[#571e26]/70 mt-0.5">Optimizar la carga del panel cargando gráficos bajo demanda.</p>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                id="lazyLoad"
                                                defaultChecked
                                                className="h-5 w-5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: NOTIFICACIONES */}
                            {activeTab === 'notificaciones' && (
                                <div className="space-y-6 animate-in fade-in duration-200">
                                    <div className="flex items-center gap-3 border-b border-[#ebd7da]/60 pb-4">
                                        <Bell className="h-5 w-5 text-[#94344c]" />
                                        <div>
                                            <h3 className="text-lg font-bold text-[#1a050a]">Ajustes de notificaciones</h3>
                                            <p className="text-xs text-[#571e26]/75 mt-0.5">
                                                Configura cuándo y cómo deseas recibir alertas y correos del sistema.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-[#fcf8f9] border border-[#ebd7da]/60 rounded-2xl">
                                            <div className="space-y-0.5">
                                                <span className="block text-sm font-bold text-[#1a050a]">Nuevas reservas</span>
                                                <span className="block text-xs text-[#571e26]/70">Notificar por correo cuando un estudiante registre una nueva solicitud de alquiler.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={data.notifyReservations}
                                                onChange={(e) => setData('notifyReservations', e.target.checked)}
                                                className="h-5 w-5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-[#fcf8f9] border border-[#ebd7da]/60 rounded-2xl">
                                            <div className="space-y-0.5">
                                                <span className="block text-sm font-bold text-[#1a050a]">Devoluciones atrasadas</span>
                                                <span className="block text-xs text-[#571e26]/70">Alertar inmediatamente si una prenda no es devuelta en la fecha límite establecida.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={data.notifyReturns}
                                                onChange={(e) => setData('notifyReturns', e.target.checked)}
                                                className="h-5 w-5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-[#fcf8f9] border border-[#ebd7da]/60 rounded-2xl">
                                            <div className="space-y-0.5">
                                                <span className="block text-sm font-bold text-[#1a050a]">Actualizaciones del sistema</span>
                                                <span className="block text-xs text-[#571e26]/70">Recibir alertas de actualizaciones programadas o tareas de mantenimiento.</span>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={data.notifySystem}
                                                onChange={(e) => setData('notifySystem', e.target.checked)}
                                                className="h-5 w-5 rounded border-[#ebd7da] text-[#94344c] focus:ring-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#ebd7da]/60">
                                <button 
                                    type="button" 
                                    onClick={handleCancel}
                                    className="border border-[#ebd7da] hover:border-[#94344c] hover:bg-[#fdf2f4] text-[#571e26] hover:text-[#94344c] font-semibold py-2.5 px-6 rounded-xl transition-all text-xs tracking-wider cursor-pointer"
                                    disabled={processing}
                                >
                                    Cancelar
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className="bg-[#94344c] hover:bg-[#a63f57] text-white font-bold rounded-xl py-2.5 px-6 transition-all shadow-md shadow-[#94344c]/10 flex items-center justify-center gap-2 text-xs tracking-wider cursor-pointer"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span>Guardando...</span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Guardar cambios</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white border border-[#ebd7da] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-[#ebd7da] flex justify-between items-center bg-[#fcf8f9]">
                            <h3 className="font-bold text-[#1a050a] text-lg flex items-center gap-2">
                                <Lock size={18} className="text-[#94344c]" />
                                Cambiar contraseña
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    passwordForm.reset();
                                    passwordForm.clearErrors();
                                }} 
                                className="text-[#571e26]/60 hover:text-[#94344c] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f4] cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChangeSubmit}>
                            {/* Body */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="current_password" className="text-sm font-semibold text-[#571e26]/85">
                                        Contraseña actual
                                    </label>
                                    <input 
                                        type="password" 
                                        id="current_password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                        required
                                    />
                                    {passwordForm.errors.current_password && (
                                        <span className="text-red-500 text-xs mt-1 block">{passwordForm.errors.current_password}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-sm font-semibold text-[#571e26]/85">
                                        Nueva contraseña
                                    </label>
                                    <input 
                                        type="password" 
                                        id="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                        required
                                    />
                                    {passwordForm.errors.password && (
                                        <span className="text-red-500 text-xs mt-1 block">{passwordForm.errors.password}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password_confirmation" className="text-sm font-semibold text-[#571e26]/85">
                                        Confirmar nueva contraseña
                                    </label>
                                    <input 
                                        type="password" 
                                        id="password_confirmation"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full bg-[#fdf9fa] border border-[#ebd7da] rounded-xl px-4 py-2.5 text-sm text-[#1a050a] focus:outline-none focus:border-[#94344c] focus:ring-1 focus:ring-[#94344c]/20 transition-all font-semibold"
                                        required
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <span className="text-red-500 text-xs mt-1 block">{passwordForm.errors.password_confirmation}</span>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-[#ebd7da] flex justify-end gap-3 bg-[#fcf8f9]">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        passwordForm.reset();
                                        passwordForm.clearErrors();
                                    }} 
                                    className="px-5 py-2.5 text-xs font-bold border border-[#ebd7da] hover:border-[#94344c] text-[#571e26] hover:text-[#94344c] hover:bg-[#fdf2f4] rounded-xl transition-all cursor-pointer"
                                    disabled={passwordForm.processing}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-[#94344c] hover:bg-[#a63f57] text-white font-bold text-xs px-7 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#94344c]/10 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                    disabled={passwordForm.processing}
                                >
                                    {passwordForm.processing ? (
                                        <span>Guardando...</span>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Guardar contraseña</span>
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

Profile.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
