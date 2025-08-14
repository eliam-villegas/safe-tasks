'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type Me = { sub: number; email: string; role: 'admin' | 'user' };
type Status = 'loading' | 'guest' | 'user' | 'admin';

export default function QuickBar() {
    const router = useRouter();
    const pathname = usePathname();

    const [me, setMe] = useState<Me | null>(null);
    const [status, setStatus] = useState<Status>('loading');

    const refetch = useCallback(async () => {
        try {
            setStatus(s => (s === 'loading' ? s : 'loading'));
            const r = await fetch('/api/auth/me', { cache: 'no-store' });
            if (!r.ok) {
                setMe(null);
                setStatus('guest');
                return;
            }
            const data = (await r.json()) as Me;
            setMe(data);
            setStatus(data?.role === 'admin' ? 'admin' : 'user');
        } catch {
            setMe(null);
            setStatus('guest');
        }
    }, []);

    // 1) Al montar
    useEffect(() => { refetch(); }, [refetch]);

    // 2) Cada vez que cambia la ruta
    useEffect(() => { refetch(); }, [pathname, refetch]);

    // 3) Al recuperar foco de la ventana
    useEffect(() => {
        const onFocus = () => refetch();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refetch]);

    // 4) (Opcional) Escuchar evento global 'auth-changed'
    useEffect(() => {
        const h = () => refetch();
        window.addEventListener('auth-changed', h);
        return () => window.removeEventListener('auth-changed', h);
    }, [refetch]);

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        // Notifica y refresca UI
        window.dispatchEvent(new Event('auth-changed'));
        router.replace('/login');
        router.refresh();
    }

    return (
        <nav style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center' }}>
            <Link href="/">Inicio</Link>

            {(status === 'user' || status === 'admin') && <Link href="/tasks">Tareas</Link>}
            {status === 'admin' && <Link href="/admin">Panel Admin</Link>}

            <span style={{ marginLeft:'auto' }} />

            {status === 'loading' ? (
                <span style={{ opacity:.6 }}>...</span>
            ) : status === 'guest' ? (
                <>
                    <Link href="/login">Login</Link>
                    <Link href="/register">Registro</Link>
                </>
            ) : (
                <>
                    <span style={{ opacity:.7 }}>{me?.email}</span>
                    <button onClick={logout}>Cerrar sesión</button>
                </>
            )}
        </nav>
    );
}