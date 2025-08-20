'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Me = { email: string; role: 'user' | 'admin' } | null;

export default function QuickBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [me, setMe] = useState<Me>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (!res.ok) return setMe(null);
                const data = await res.json();
                setMe(data?.email ? { email: data.email, role: data.role } : null);
            } catch {
                setMe(null);
            }
        })();
    }, [pathname]);

    const isActive = (href: string) => pathname === href;

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/login');
    }

    return (
        <div className="w-full flex items-center gap-3">
            {/* izquierda: navegación */}
            <div className="flex items-center gap-1">
                <Link href="/" className={`navlink ${isActive('/') ? 'navlink-active' : ''}`}>Inicio</Link>
                <Link href="/tasks" className={`navlink ${isActive('/tasks') ? 'navlink-active' : ''}`}>Tareas</Link>
                {me?.role === 'admin' && (
                    <Link href="/admin" className={`navlink ${isActive('/admin') ? 'navlink-active' : ''}`}>Panel Admin</Link>
                )}
            </div>

            {/* derecha: sesión */}
            <div className="ml-auto flex items-center gap-2">
                {me ? (
                    <>
                        <span className="text-sm text-gray-500 hidden sm:inline">{me.email}</span>
                        <button className="btn-secondary" onClick={logout}>Cerrar sesión</button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className={`navlink ${isActive('/login') ? 'navlink-active' : ''}`}>Login</Link>
                        <Link href="/register" className={`navlink ${isActive('/register') ? 'navlink-active' : ''}`}>Registro</Link>
                    </>
                )}
            </div>
        </div>
    );
}