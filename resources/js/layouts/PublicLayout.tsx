import { ReactNode, useEffect } from 'react';
import { Menu, Search, Heart, ShoppingCart, User, LogOut } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

interface PublicLayoutProps {
    children: ReactNode;
    auth?: {
        user: any;
    };
}

export default function PublicLayout({ children, auth }: PublicLayoutProps) {
    const { url } = usePage();

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
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
            {/* NAVBAR */}
            <header className="sticky top-0 z-50 w-full bg-[#1b0308] border-b border-[#3a0d16]/50 shadow-md">
                <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-8">

                    {/* Logo & Links */}
                    <div className="flex items-center gap-6 lg:gap-10">
                        <Link href="/" className="flex items-center">
                            <span className="font-bold text-xl md:text-2xl tracking-tight text-[#ffb6c5]">
                                Armario UNSCH
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link
                                href="/"
                                className={`transition-all hover:text-[#ffb6c5] ${url === '/' ? 'text-[#ffb6c5] border-b-[3px] border-[#ffb6c5] py-5' : 'text-white/80 py-5'}`}
                            >
                                Inicio
                            </Link>
                            <Link
                                href="/catalogo"
                                className={`transition-all hover:text-[#ffb6c5] ${url.startsWith('/catalogo') ? 'text-[#ffb6c5] border-b-[3px] border-[#ffb6c5] py-5' : 'text-white/80 py-5'}`}
                            >
                                Catálogo
                            </Link>
                            <Link
                                href="#"
                                className="text-white/80 transition-all hover:text-[#ffb6c5] py-5"
                            >
                                Nosotros
                            </Link>
                        </nav>
                    </div>

                    {/* Right side: Search & Icons */}
                    <div className="flex items-center gap-5">
                        {/* Search Bar */}
                        <div className="hidden lg:flex relative items-center">
                            <input
                                type="text"
                                placeholder="Buscar prendas..."
                                className="bg-[#120202] border border-[#3a0d16] text-white/90 text-sm rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-[#ffb6c5] focus:ring-1 focus:ring-[#ffb6c5] transition-all w-64 placeholder:text-white/40"
                            />
                            <Search className="absolute right-3 h-4 w-4 text-white/50 pointer-events-none" />
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-5 text-white/80 ml-2">
                            <button className="hover:text-[#ffb6c5] transition-colors" aria-label="Favoritos">
                                <Heart className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </button>
                            <button className="hover:text-[#ffb6c5] transition-colors" aria-label="Carrito">
                                <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.5} />
                            </button>
                            {auth?.user ? (
                                <>
                                    {auth.user.rol === 'admin' ? (
                                        <button
                                            onClick={() => {
                                                window.open(
                                                    '/admin/dashboard',
                                                    'AdminConsole',
                                                    'width=1400,height=900,resizable=yes,scrollbars=yes,status=yes'
                                                );
                                            }}
                                            className="hover:text-[#ffb6c5] transition-colors cursor-pointer"
                                            aria-label="Panel de Administración"
                                        >
                                            <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
                                        </button>
                                    ) : (
                                        <Link href="/perfil" className="hover:text-[#ffb6c5] transition-colors" aria-label="Perfil">
                                            <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
                                        </Link>
                                    )}
                                    <Link href="/logout" method="post" as="button" className="hover:text-[#ffb6c5] transition-colors" aria-label="Cerrar Sesión">
                                        <LogOut className="h-[22px] w-[22px]" strokeWidth={1.5} />
                                    </Link>
                                </>
                            ) : (
                                <Link href="/perfil" className="hover:text-[#ffb6c5] transition-colors" aria-label="Perfil del Cliente">
                                    <User className="h-[22px] w-[22px]" strokeWidth={1.5} />
                                </Link>
                            )}

                            {/* Mobile menu button */}
                            <button className="md:hidden hover:text-[#ffb6c5] transition-colors ml-2">
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="bg-[#1b0308] text-white/70 border-t border-[#3a0d16]/50 mt-20">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:flex-row px-4 md:px-8">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
                        <p className="text-center text-sm md:text-left leading-relaxed">
                            © {new Date().getFullYear()} Armario UNSCH. Todos los derechos reservados.
                            <br className="hidden md:inline" /> Diseñado exclusivamente para uso académico en la Universidad Nacional San Cristóbal de Huamanga.
                        </p>
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <Link href="#" className="hover:text-[#ffb6c5] transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-[#ffb6c5] transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-[#ffb6c5] transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
