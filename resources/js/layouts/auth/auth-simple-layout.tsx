import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#120202] text-white p-6 md:p-10 selection:bg-[#ffb6c5] selection:text-[#1b0308]">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-2 flex items-center justify-center">
                                <span className="font-serif italic text-3xl md:text-4xl text-[#ffb6c5] tracking-tight">
                                    Armario UNSCH
                                </span>
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold text-white">{title}</h1>
                            <p className="text-center text-sm text-white/60">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-[#1f050b] border border-[#3a0d16] rounded-2xl p-6 md:p-8 shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
