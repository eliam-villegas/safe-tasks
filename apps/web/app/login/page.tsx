'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `HTTP ${res.status}`);
            }
            // Login ok: la API interna setea cookie httpOnly
            window.dispatchEvent(new Event('auth-changed'));
            router.replace('/tasks');
            router.refresh();
        } catch (err: unknown) {
            setMessage(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <h1>Iniciar sesión</h1>
            <form onSubmit={handleSubmit} style={{ display:'grid', gap:8, maxWidth:360 }}>
                <input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Ingresando…' : 'Ingresar'}</button>
            </form>

            <p style={{ marginTop: 12 }}>
                ¿No tienes cuenta?{' '}
                <Link href="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
                    Regístrate aquí
                </Link>
            </p>

            {message && <p style={{ color:'crimson' }}>{message}</p>}
        </div>
    );
}