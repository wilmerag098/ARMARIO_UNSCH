import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <div className="w-full min-h-screen bg-white">
            {children}
        </div>
    );
}
