'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true); setMsg('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error((await res.json().catch(()=>({}))).message || 'Error al iniciar sesión');

            const data = await res.json();
            setToken(data?.ok ? 'cookie-set-on-server' : '');
            router.push('/tasks');
        } catch (e: any) {
            setMsg(e?.message ?? 'Error inesperado');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="card w-full max-w-sm space-y-4">
                <h1 className="text-xl font-semibold">Iniciar sesión</h1>
                <form onSubmit={handleSubmit} className="grid gap-3">
                    <label className="space-y-1">
                        <span className="muted">Correo</span>
                        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                    </label>
                    <label className="space-y-1">
                        <span className="muted">Contraseña</span>
                        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                    </label>
                    <button className="btn w-full" disabled={isLoading}>
                        {isLoading ? 'Entrando…' : 'Iniciar sesión'}
                    </button>
                </form>
                {msg && <p className="text-sm text-red-600">{msg}</p>}
                <p className="text-sm">
                    ¿No tienes cuenta?{' '}
                    <a className="text-blue-600 hover:underline" href="/register">Regístrate aquí</a>
                </p>
            </div>
        </div>
    );
}