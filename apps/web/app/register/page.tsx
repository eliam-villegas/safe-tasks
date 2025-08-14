'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [msg, setMsg] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setMsg('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { message?: string };
                throw new Error(err?.message ?? `HTTP ${res.status}`);
            }
            setMsg('Registro exitoso. Redirigiendo…');
            router.replace('/login');
            router.refresh();
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <h1>Crear cuenta</h1>
            <form onSubmit={handleSubmit} style={{ display:'grid', gap:8, maxWidth:360 }}>
                <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Contraseña (min 6)" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button type="submit" disabled={isLoading}>{isLoading ? 'Creando…' : 'Registrarme'}</button>
            </form>
            {msg && <p style={{ color:'crimson' }}>{msg}</p>}
        </div>
    );
}