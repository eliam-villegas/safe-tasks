'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
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
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${res.status}`);
            }
            setMsg('Registro exitoso. Redirigiendo a login…');
            router.push('/login');
        } catch (e: any) {
            setMsg(e?.message ?? 'Error al registrar');
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