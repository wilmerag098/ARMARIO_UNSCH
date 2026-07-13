import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ShieldAlert, UserCheck } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    university_id: string | null;
    phone: string | null;
    role: 'admin' | 'user';
    created_at: string;
}

interface UsersProps {
    users: User[];
}

export default function Users({ users }: UsersProps) {
    return (
        <>
            <Head title="Administrar Usuarios" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#fdeaea]">Usuarios Registrados</h1>
                    <p className="text-sm text-[#d2a9b1] mt-1">
                        Control de accesos y roles de la comunidad universitaria.
                    </p>
                </div>
            </div>

            <div className="bg-[#1c050a] border border-[#290a0f] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#290a0f] text-[#d2a9b1] text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Nombre</th>
                                <th className="px-6 py-4 font-semibold">Código Univ.</th>
                                <th className="px-6 py-4 font-semibold">Teléfono</th>
                                <th className="px-6 py-4 font-semibold text-center">Rol</th>
                                <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#290a0f] text-sm">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#290a0f]/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-[#fdeaea]">{user.name}</div>
                                            <div className="text-xs text-[#d2a9b1]">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[#fdeaea]">
                                            {user.university_id || '-'}
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
                                            <button className="text-xs bg-[#571e26]/30 hover:bg-[#571e26] text-[#ffb6c5] border border-[#ffb6c5]/10 px-3 py-1.5 rounded-lg transition-all">
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
        </>
    );
}

Users.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
