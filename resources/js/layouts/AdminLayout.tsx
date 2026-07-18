import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Shirt, 
    Layers, 
    Calendar, 
    Users, 
    BarChart3, 
    Settings, 
    Menu, 
    X, 
    Bell, 
    HelpCircle, 
    LogOut, 
    User as UserIcon,
    ChevronDown,
    CreditCard,
    AlertTriangle,
    Check,
    BookOpen,
    Phone
} from 'lucide-react';

interface SidebarItemProps {
    href: string;
    icon: React.ComponentType<any>;
    title: string;
    active: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, title, active, onClick }) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active 
                    ? 'bg-[#571e26] text-[#ffb6c5] shadow-lg shadow-[#571e26]/30 font-medium border-l-[3px] border-[#ffb6c5]' 
                    : 'text-[#d2a9b1] hover:text-[#fdeaea] hover:bg-[#290a0f]/40'
            }`}
        >
            <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#ffb6c5]' : 'text-[#d2a9b1]'}`} />
            <span>{title}</span>
        </Link>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const adminNotifications = (props as any).adminNotifications || [];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>(adminNotifications);

    // Sincronizar las notificaciones cuando los props cambien
    React.useEffect(() => {
        if ((props as any).adminNotifications) {
            setNotifications((props as any).adminNotifications);
        }
    }, [(props as any).adminNotifications]);

    // Sincronización automática de datos en segundo plano (cada 15 segundos)
    React.useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                preserveScroll: true,
                preserveState: true
            } as any);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const navItems = [
        { href: '/admin/dashboard', icon: LayoutGrid, title: 'Vista General' },
        { href: '/admin/productos', icon: Shirt, title: 'Productos' },
        { href: '/admin/inventario', icon: Layers, title: 'Inventario' },
        { href: '/admin/reservas', icon: Calendar, title: 'Reservas' },
        { href: '/admin/pagos', icon: CreditCard, title: 'Pagos' },
        { href: '/admin/usuarios', icon: Users, title: 'Usuarios' },
        { href: '/admin/reportes', icon: BarChart3, title: 'Reportes' },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-[#fcf8f9] text-[#1a050a] flex">
            {/* SIDEBAR - DESKTOP */}
            <aside className="hidden md:flex flex-col w-64 bg-[#160407] border-r border-[#290a0f] fixed inset-y-0 left-0 z-30">
                {/* Brand / Logo */}
                <div className="h-20 flex flex-col justify-center px-6 border-b border-[#290a0f]">
                    <span className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-[#ffb6c5]">
                            Armario UNSCH
                        </span>
                        <span className="text-xs text-[#d2a9b1]">
                            Consola de Administración
                        </span>
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            title={item.title}
                            active={url.startsWith(item.href)}
                        />
                    ))}
                </nav>

                {/* Sidebar Footer / Settings */}
                <div className="p-4 border-t border-[#290a0f] space-y-2">
                    <SidebarItem
                        href="/admin/configuracion"
                        icon={Settings}
                        title="Configuración"
                        active={url.startsWith('/admin/configuracion')}
                    />
                </div>
            </aside>

            {/* MOBILE SIDEBAR (Drawer) */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}
            <aside 
                className={`fixed inset-y-0 left-0 w-64 bg-[#160407] border-r border-[#290a0f] z-50 transform transition-transform duration-300 md:hidden flex flex-col ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Mobile Sidebar Brand & Close */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-[#290a0f]">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-[#ffb6c5]">
                            Armario UNSCH
                        </span>
                        <span className="text-xs text-[#d2a9b1]">
                            Consola de Administración
                        </span>
                    </div>
                    <button 
                        onClick={closeMobileMenu}
                        className="p-1 rounded-lg text-[#d2a9b1] hover:text-[#fdeaea] hover:bg-[#290a0f]/40"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            title={item.title}
                            active={url.startsWith(item.href)}
                            onClick={closeMobileMenu}
                        />
                    ))}
                </nav>

                {/* Mobile Footer / Settings */}
                <div className="p-4 border-t border-[#290a0f]">
                    <SidebarItem
                        href="/admin/configuracion"
                        icon={Settings}
                        title="Configuración"
                        active={url.startsWith('/admin/configuracion')}
                        onClick={closeMobileMenu}
                    />
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col md:pl-64 min-w-0 bg-[#fcf8f9]">
                {/* NAVBAR */}
                <header className="h-20 bg-white border-b border-[#ebd7da] sticky top-0 z-20 flex items-center justify-between px-6">
                    {/* Mobile Toggle Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-xl text-[#571e26] hover:text-[#ff94ac] hover:bg-[#ebd7da]/40 md:hidden transition-all duration-200"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navbar Controls (Notifications, Help, Profile) */}
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    setIsProfileDropdownOpen(false);
                                }}
                                className="p-2.5 rounded-xl text-[#571e26] hover:text-[#94344c] hover:bg-[#ebd7da]/40 transition-all duration-200 relative focus:outline-none cursor-pointer"
                                aria-label="Notificaciones"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 h-4 w-4 bg-red-500 rounded-full ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-30" 
                                        onClick={() => setIsNotificationsOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 bg-[#160407] border border-[#290a0f] rounded-2xl shadow-2xl py-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/20">
                                            <span className="text-xs font-bold text-[#ffb6c5] uppercase tracking-wider">Avisos Recientes</span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] text-[#ffb6c5]/70 hover:text-[#ffb6c5] flex items-center gap-1 cursor-pointer font-bold"
                                                >
                                                    <Check size={11} />
                                                    Marcar leídas
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-64 overflow-y-auto divide-y divide-[#290a0f]/50">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <Link
                                                        key={n.id}
                                                        href={n.link}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            setIsNotificationsOpen(false);
                                                        }}
                                                        className={`block px-4 py-3 hover:bg-[#290a0f]/30 transition-colors text-xs text-left ${!n.read ? 'bg-[#290a0f]/15' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start gap-1">
                                                            <span className="font-bold text-white flex items-center gap-1.5">
                                                                {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
                                                                {n.title}
                                                            </span>
                                                            <span className="text-[9px] text-[#d2a9b1]/40 shrink-0">{n.time}</span>
                                                        </div>
                                                        <p className="text-[#d2a9b1]/75 mt-0.5 leading-snug">{n.desc}</p>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-xs text-[#d2a9b1]/40">No hay notificaciones</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Help */}
                        <button 
                            onClick={() => {
                                setIsHelpOpen(true);
                                setIsNotificationsOpen(false);
                                setIsProfileDropdownOpen(false);
                            }}
                            className="p-2.5 rounded-xl text-[#571e26] hover:text-[#94344c] hover:bg-[#ebd7da]/40 transition-all duration-200 focus:outline-none cursor-pointer"
                            aria-label="Ayuda"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </button>

                        <div className="h-8 w-px bg-[#ebd7da]" />

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#ebd7da]/40 transition-all duration-200 focus:outline-none"
                            >
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=571e26&color=ffb6c5&bold=true`}
                                    alt={user?.name || 'Administrador'}
                                    className="h-9 w-9 rounded-full object-cover border border-[#571e26]"
                                />
                                <span className="hidden sm:inline text-sm font-semibold text-[#571e26] pr-1">
                                    {user?.name || 'Administrador'}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-[#571e26] transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-30" 
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-[#160407] border border-[#290a0f] rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-3 border-b border-[#290a0f]">
                                            <p className="text-xs text-[#d2a9b1]">Conectado como</p>
                                            <p className="text-sm font-semibold text-[#fdeaea] truncate mt-0.5">{user?.name || 'Admin'}</p>
                                            <p className="text-xs text-[#d2a9b1] truncate mt-0.5">{user?.email || 'admin@unsch.edu.pe'}</p>
                                        </div>
                                        <Link 
                                            href="/admin/perfil"
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#d2a9b1] hover:text-[#fdeaea] hover:bg-[#290a0f]/40 transition-colors"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <UserIcon className="h-4 w-4" />
                                            <span>Mi Perfil de Usuario</span>
                                        </Link>
                                        <Link 
                                            href="/logout" 
                                            method="post" 
                                            as="button"
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#290a0f]/40 transition-colors text-left"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Cerrar Sesión</span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT VIEWPORT */}
                <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Help Modal */}
            {isHelpOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
                    <div className="bg-[#1c050a] border border-[#ffb6c5]/25 text-[#fdeaea] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#290a0f] flex justify-between items-center bg-[#290a0f]/20">
                            <span className="font-extrabold text-sm uppercase tracking-wider text-[#ffb6c5]">Centro de Ayuda & Soporte</span>
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="text-[#d2a9b1] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-left">
                            {/* FAQ Item 1 */}
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#ffb6c5] flex items-center gap-1.5">
                                    <BookOpen size={16} />
                                    ¿Cómo funciona el flujo de devolución?
                                </h4>
                                <p className="text-xs text-[#d2a9b1]/80 leading-relaxed">
                                    Al devolver una prenda, esta pasa automáticamente a <strong>"En Lavandería"</strong> (mantenimiento). Una vez lavada y lista para reusar, debes ir a la sección <strong>Inventario</strong> y hacer clic en el botón <strong>"Listo"</strong> para volver a colocarla como <strong>"Disponible"</strong> en percheros.
                                </p>
                            </div>
                            
                            {/* FAQ Item 2 */}
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#ffb6c5] flex items-center gap-1.5">
                                    <AlertTriangle size={16} />
                                    ¿Cómo se gestiona el depósito de garantía?
                                </h4>
                                <p className="text-xs text-[#d2a9b1]/80 leading-relaxed">
                                    En la sección <strong>Pagos</strong>, verás el saldo en custodia. Si el estudiante devuelve la prenda a tiempo y en excelente estado, haz clic en <strong>"Reembolsar"</strong>. Si presenta roturas, manchas o demoras graves, haz clic en <strong>"Penalizar"</strong> para retener la garantía.
                                </p>
                            </div>

                            {/* FAQ Item 3 */}
                            <div className="space-y-1.5">
                                <h4 className="font-bold text-sm text-[#ffb6c5] flex items-center gap-1.5">
                                    <Shirt size={16} />
                                    ¿Cómo se generan los códigos SKU?
                                </h4>
                                <p className="text-xs text-[#d2a9b1]/80 leading-relaxed">
                                    En la sección <strong>Inventario</strong>, al crear o editar prendas, puedes usar el botón <strong>"Autogenerar SKU"</strong>. Este creará un código único combinando el nombre del producto, la talla y un número aleatorio de seguridad.
                                </p>
                            </div>

                            <hr className="border-[#290a0f]" />

                            {/* Contact Support */}
                            <div className="bg-[#290a0f]/20 border border-[#290a0f] p-4 rounded-2xl space-y-2">
                                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Phone size={14} className="text-[#ffb6c5]" />
                                    Soporte de Plataforma TI
                                </h4>
                                <p className="text-[11px] text-[#d2a9b1]/75 leading-relaxed">
                                    Para resolver fallos técnicos en el servidor, registrar nuevos administradores globales o reportar caídas de la base de datos:
                                </p>
                                <div className="text-[11px] font-semibold text-[#ffb6c5] flex flex-col gap-0.5">
                                    <span>Correo: soporte.armario@unsch.edu.pe</span>
                                    <span>Atención física: Oficina TI - Pabellón de Administración</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
