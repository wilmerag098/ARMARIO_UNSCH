import { ReactNode, useEffect, useState } from 'react';
import { 
    Menu, 
    Search, 
    Heart, 
    ShoppingBag, 
    User, 
    LogOut, 
    ChevronDown, 
    X,
    Facebook,
    Instagram,
    Smartphone,
    MessageCircle,
    Clock,
    MapPin,
    Mail,
    Phone
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

interface PublicLayoutProps {
    children: ReactNode;
    auth?: {
        user: any;
    };
}

export default function PublicLayout({ children, auth }: PublicLayoutProps) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('open_admin_popup') === '1') {
            const popup = window.open(
                '/admin/dashboard',
                'AdminConsole',
                'width=1400,height=900,resizable=yes,scrollbars=yes,status=yes'
            );
            if (popup) {
                popup.focus();
            }
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl || '/');
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#fdfbfb] text-[#1a050a] flex flex-col font-sans selection:bg-[#94344c] selection:text-white">
            
            {/* HEADER COMPLETO */}
            <header className="sticky top-0 z-50 w-full flex flex-col shadow-md">
                
                {/* NIVEL 1: HEADER SUPERIOR (Buscador y Acciones) */}
                <div className="w-full bg-[#3d0d16] text-[#fdeaea] border-b border-[#571e26] py-3">
                    <div className="container mx-auto max-w-screen-xl px-4 md:px-8 flex items-center justify-between gap-4">
                        
                        {/* Logo Institucional */}
                        <Link href="/" className="flex items-center gap-3.5 shrink-0">
                            {/* Isotipo: Escudo Dorado */}
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#dfb279] to-[#c19a6b] flex items-center justify-center text-[#3d0d16] shadow-md border border-[#dfb279]/30">
                                <span className="font-serif font-black text-xl tracking-tighter">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-serif font-black text-lg md:text-xl tracking-wide uppercase text-white leading-none">
                                    Armario <span className="text-[#dfb279]">Unsch</span>
                                </span>
                                <span className="text-[8.5px] uppercase tracking-[0.25em] font-extrabold text-[#dfb279]/85 mt-0.5 leading-none">
                                    Viste tu mejor versión
                                </span>
                            </div>
                        </Link>

                        {/* Buscador Central */}
                        <div className="hidden md:flex relative flex-1 max-w-lg mx-6 items-center">
                            <input
                                type="text"
                                placeholder="Buscar prendas, categorías..."
                                className="w-full bg-white border border-[#ebd7da]/40 text-[#1a050a] text-xs rounded-full pl-5 pr-11 py-2.5 focus:outline-none focus:border-[#dfb279] focus:ring-2 focus:ring-[#dfb279]/20 transition-all font-semibold placeholder:text-[#1a050a]/40"
                            />
                            <div className="absolute right-1 p-1.5 rounded-full bg-[#3d0d16] text-white cursor-pointer hover:bg-[#571e26] transition-colors">
                                <Search className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        {/* Acciones Rápidas (Favoritos, Carrito, Mi Cuenta) */}
                        <div className="flex items-center gap-6 text-[#fdeaea]/90">
                            
                            {/* Favoritos */}
                            <button className="hidden sm:flex flex-col items-center hover:text-[#dfb279] transition-colors group cursor-pointer">
                                <div className="relative">
                                    <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
                                </div>
                                <span className="text-[10px] font-bold text-[#dfb279]/80 group-hover:text-[#dfb279] mt-0.5 uppercase tracking-wider">Favoritos</span>
                            </button>

                            {/* Carrito */}
                            <button className="flex flex-col items-center hover:text-[#dfb279] transition-colors group cursor-pointer relative">
                                <div className="relative">
                                    <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
                                    {/* Badge Carrito */}
                                    <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-[#dfb279] text-[#3d0d16] rounded-full text-[9px] font-black flex items-center justify-center shadow border border-white">
                                        1
                                    </span>
                                </div>
                                <span className="hidden sm:inline text-[10px] font-bold text-[#dfb279]/80 group-hover:text-[#dfb279] mt-0.5 uppercase tracking-wider">Carrito</span>
                            </button>

                            <div className="hidden sm:block h-6 w-px bg-[#ebd7da]/20" />

                            {/* Mi Cuenta (Dropdown) */}
                            <div className="relative">
                                {auth?.user ? (
                                    <button 
                                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                        className="flex items-center gap-2.5 hover:text-[#dfb279] transition-colors cursor-pointer group focus:outline-none"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-[#dfb279]/20 border border-[#dfb279]/30 flex items-center justify-center text-[#dfb279]">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="hidden lg:inline text-xs font-bold text-[#fdeaea]/90">{auth.user.name.split(' ')[0]}</span>
                                        <ChevronDown className={`h-3 w-3 text-[#dfb279] transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link 
                                        href="/perfil" 
                                        className="flex items-center gap-2 hover:text-[#dfb279] transition-colors cursor-pointer group"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-[#dfb279]/20 border border-[#dfb279]/30 flex items-center justify-center text-[#dfb279]">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-[#dfb279]/90 hidden md:inline">Mi cuenta</span>
                                        <ChevronDown className="h-3.5 w-3.5 text-[#dfb279] hidden md:inline" />
                                    </Link>
                                )}

                                {/* Account Dropdown Menu */}
                                {isAccountDropdownOpen && auth?.user && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsAccountDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-48 bg-[#1c050a] border border-[#290a0f] rounded-xl shadow-2xl py-2.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                                            <div className="px-4 py-2 border-b border-[#290a0f] text-xs text-[#d2a9b1]">
                                                Rol: <span className="font-extrabold uppercase text-[#dfb279]">{auth.user.rol === 'admin' ? 'Administrador' : 'Estudiante'}</span>
                                            </div>
                                            {auth.user.rol === 'admin' && (
                                                <button
                                                    onClick={() => {
                                                        setIsAccountDropdownOpen(false);
                                                        window.open(
                                                            '/admin/dashboard',
                                                            'AdminConsole',
                                                            'width=1400,height=900,resizable=yes,scrollbars=yes,status=yes'
                                                        );
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors cursor-pointer"
                                                >
                                                    <User className="h-4 w-4" />
                                                    Ver Panel Admin
                                                </button>
                                            )}
                                            <Link
                                                href="/perfil"
                                                onClick={() => setIsAccountDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors"
                                            >
                                                <User className="h-4 w-4" />
                                                Mi Perfil
                                            </Link>
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                onClick={() => setIsAccountDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-[#290a0f]/40 transition-colors text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Cerrar Sesión
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile menu toggle */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden hover:text-[#dfb279] transition-colors cursor-pointer"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* NIVEL 2: BARRA DE NAVEGACIÓN HORIZONTAL */}
                <div className="w-full bg-[#1c050a] text-white border-b-2 border-[#dfb279] hidden md:block py-3">
                    <div className="container mx-auto max-w-screen-xl px-4 md:px-8 flex justify-center">
                        <nav className="flex items-center gap-10 text-xs font-bold uppercase tracking-wider text-[#d2a9b1]">
                            <Link
                                href="/"
                                className={`transition-all hover:text-[#dfb279] ${url === '/' ? 'text-white border-b-2 border-[#dfb279] pb-1' : ''}`}
                            >
                                Inicio
                            </Link>
                            <Link
                                href="/catalogo"
                                className={`transition-all hover:text-[#dfb279] ${url.startsWith('/catalogo') ? 'text-white border-b-2 border-[#dfb279] pb-1' : ''}`}
                            >
                                Catálogo
                            </Link>

                            {/* Categorías (Dropdown menu) */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                                    className="flex items-center gap-1 hover:text-[#dfb279] transition-all cursor-pointer focus:outline-none"
                                >
                                    Categorías
                                    <ChevronDown className={`h-3 w-3 text-[#dfb279] transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isCategoriesDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsCategoriesDropdownOpen(false)} />
                                        <div className="absolute left-0 mt-3.5 w-44 bg-[#160407] border border-[#290a0f] rounded-xl shadow-2xl py-2.5 z-40 text-left normal-case animate-in fade-in slide-in-from-top-2 duration-150">
                                            <Link href="/catalogo?categoria=ternos" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Ternos</Link>
                                            <Link href="/catalogo?categoria=vestidos" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Vestidos</Link>
                                            <Link href="/catalogo?categoria=graduacion" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Graduación</Link>
                                            <Link href="/catalogo?categoria=trajes-presentacion" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Trajes de presentación</Link>
                                            <Link href="/catalogo?categoria=accesorios" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Accesorios</Link>
                                            <Link href="/catalogo?categoria=ropa-formal" onClick={() => setIsCategoriesDropdownOpen(false)} className="block px-4 py-2 text-xs text-[#d2a9b1] hover:text-white hover:bg-[#290a0f]/40 transition-colors">Ropa formal</Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link
                                href="/perfil?tab=reservas"
                                className="transition-all hover:text-[#dfb279]"
                            >
                                Mis reservas
                            </Link>
                            <Link
                                href="#funcionamiento"
                                className="transition-all hover:text-[#dfb279]"
                            >
                                Cómo funciona
                            </Link>
                            <Link
                                href="#nosotros"
                                className="transition-all hover:text-[#dfb279]"
                            >
                                Nosotros
                            </Link>
                            <Link
                                href="#contacto"
                                className="transition-all hover:text-[#dfb279]"
                            >
                                Contacto
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-[#1c050a] flex flex-col p-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8 border-b border-[#290a0f] pb-4">
                            <span className="font-serif font-black text-[#dfb279] text-lg uppercase tracking-wider">Menú de Navegación</span>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-white hover:text-[#dfb279] transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-5 text-sm font-bold uppercase tracking-wider text-[#d2a9b1] mb-8">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Inicio</Link>
                            <Link href="/catalogo" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Catálogo</Link>
                            <Link href="/perfil?tab=reservas" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Mis reservas</Link>
                            <Link href="/perfil" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Mi Cuenta</Link>
                            <Link href="#funcionamiento" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Cómo funciona</Link>
                            <Link href="#nosotros" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Nosotros</Link>
                            <Link href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-1">Contacto</Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* CUERPO PRINCIPAL DE PÁGINAS */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* FOOTER PREMIUM */}
            <footer className="bg-[#1c050a] text-[#d2a9b1] border-t-2 border-[#dfb279] mt-20">
                <div className="container mx-auto max-w-screen-xl px-4 md:px-8 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
                        
                        {/* Columna 1: Logo & Redes */}
                        <div className="lg:col-span-4 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#dfb279] to-[#c19a6b] flex items-center justify-center text-[#3d0d16] font-serif font-black text-lg border border-[#dfb279]/30">
                                    A
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif font-black text-base uppercase text-white leading-none">
                                        Armario <span className="text-[#dfb279]">Unsch</span>
                                    </span>
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#dfb279]/85 mt-0.5 leading-none">
                                        Viste tu mejor versión
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-[#d2a9b1]/75 leading-relaxed max-w-sm">
                                Alquila prendas elegantes y premium para tus eventos universitarios, graduaciones y exposiciones académicas.
                            </p>
                            {/* Social Icons */}
                            <div className="flex gap-3 pt-2">
                                <a href="#" className="h-8.5 w-8.5 rounded-full bg-[#290a0f] hover:bg-[#94344c] hover:text-white border border-[#dfb279]/15 flex items-center justify-center transition-all">
                                    <Facebook size={15} />
                                </a>
                                <a href="#" className="h-8.5 w-8.5 rounded-full bg-[#290a0f] hover:bg-[#94344c] hover:text-white border border-[#dfb279]/15 flex items-center justify-center transition-all">
                                    <Instagram size={15} />
                                </a>
                                <a href="#" className="h-8.5 w-8.5 rounded-full bg-[#290a0f] hover:bg-[#94344c] hover:text-white border border-[#dfb279]/15 flex items-center justify-center transition-all">
                                    <Smartphone size={15} />
                                </a>
                                <a href="#" className="h-8.5 w-8.5 rounded-full bg-[#290a0f] hover:bg-[#94344c] hover:text-white border border-[#dfb279]/15 flex items-center justify-center transition-all">
                                    <MessageCircle size={15} />
                                </a>
                            </div>
                        </div>

                        {/* Columna 2: Enlaces rápidos */}
                        <div className="lg:col-span-2 space-y-4">
                            <h4 className="font-bold text-[#dfb279] text-xs uppercase tracking-wider">Enlaces rápidos</h4>
                            <ul className="space-y-2 text-xs font-semibold">
                                <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                                <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link></li>
                                <li><Link href="/catalogo" className="hover:text-white transition-colors">Categorías</Link></li>
                                <li><Link href="/perfil?tab=reservas" className="hover:text-white transition-colors">Mis reservas</Link></li>
                                <li><Link href="#funcionamiento" className="hover:text-white transition-colors">Cómo funciona</Link></li>
                                <li><Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                            </ul>
                        </div>

                        {/* Columna 3: Información legal */}
                        <div className="lg:col-span-2 space-y-4">
                            <h4 className="font-bold text-[#dfb279] text-xs uppercase tracking-wider">Información</h4>
                            <ul className="space-y-2 text-xs font-semibold">
                                <li><Link href="#nosotros" className="hover:text-white transition-colors">Sobre nosotros</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Políticas de privacidad</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
                            </ul>
                        </div>

                        {/* Columna 4: Contacto */}
                        <div className="lg:col-span-4 space-y-4 text-xs font-semibold">
                            <h4 className="font-bold text-[#dfb279] text-xs uppercase tracking-wider">Contacto & Sede</h4>
                            <div className="space-y-3.5">
                                <div className="flex gap-2.5 items-start">
                                    <Phone className="h-4 w-4 text-[#dfb279] shrink-0" />
                                    <span>+51 999 888 777</span>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                    <Mail className="h-4 w-4 text-[#dfb279] shrink-0" />
                                    <span>hola@armariounsch.pe</span>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                    <MapPin className="h-4 w-4 text-[#dfb279] shrink-0" />
                                    <span>Campus Universitario UNSCH, Ayacucho</span>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                    <Clock className="h-4 w-4 text-[#dfb279] shrink-0" />
                                    <div className="flex flex-col gap-1 text-[11px] text-[#d2a9b1]/75">
                                        <span className="font-bold text-white uppercase tracking-wide">Horario de atención:</span>
                                        <span>Lunes a Viernes: 8:00 am - 8:00 pm</span>
                                        <span>Sábados y Domingos: 9:00 am - 6:00 pm</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-[#290a0f] mb-6" />

                    {/* Footer Bottom copyright */}
                    <div className="text-center text-[11px] text-[#d2a9b1]/60">
                        <p>© {new Date().getFullYear()} ARMARIOUNSCH. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
