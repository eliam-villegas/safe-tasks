'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setMessage('');

        try {
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Error al iniciar sesión');
            }

            const data = await res.json();
            setToken(data.access_token);
            document.cookie = `token=${data.access_token}; Path=/; Max-Age=3600; SameSite=Lax`;

            if(typeof document !== 'undefined'){
                const el = document.activeElement as HTMLElement | null;
                el?.blur();
            }

            await new Promise((r) => setTimeout(r, 30));

            router.replace('/tasks');

        } catch (err: any) {
            const text = typeof err === 'string'
                ? err
                : (err?.message ?? 'Error inesperado');
            setMessage(String(text));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} style={{ display:'grid', gap:8, maxWidth:360 }}>
                <input
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required type="email"
                    autoComplete="username"
                />
                <input
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required type="password"
                    autoComplete="current-password"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando…' : 'Iniciar sesión'}
                </button>
            </form>
            {message && <p style={{ color: 'crimson' }}>{message}</p>}
        </div>
    );
}