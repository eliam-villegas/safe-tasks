'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Me = { email: string; role: 'user' | 'admin' } | null;

export default function QuickBar() {
    const [me, setMe] = useState<Me>(null);
    const [ready, setReady] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (!cancelled) {
                    if (res.ok) {
                        const data = await res.json().catch(() => ({}));
                        setMe(data?.email ? data : null);
                    } else {
                        setMe(null);
                    }
                }
            } catch {
                if (!cancelled) setMe(null);
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => { cancelled = true; };
    }, [pathname]);

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        setMe(null);
        router.replace('/login');
    }

    const navLink = (href: string, label: string) => {
        const active = pathname === href;
        return (
            <Link
                href={href}
                className={`navlink ${active ? 'navlink-active' : ''}`}
            >
                {label}
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
            <nav className="container-page flex items-center justify-between py-2">
                <div className="flex items-center gap-1">
                    {navLink('/', 'Inicio')}
                    {me && navLink('/tasks', 'Tareas')}
                    {me?.role === 'admin' && navLink('/admin', 'Panel Admin')}
                    {!me && navLink('/login', 'Login')}
                    {!me && navLink('/register', 'Registrarse')}
                    {!me && navLink('/forgot', 'Recuperar')}
                </div>

                <div className="flex items-center gap-3">
                    {me && <span className="muted">{me.email}</span>}
                    {me && (
                        <button onClick={logout} className="btn-secondary">
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </nav>
            {!ready && <div className="h-px bg-transparent" />}
        </header>
    );
}