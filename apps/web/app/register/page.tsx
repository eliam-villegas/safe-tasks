'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '../components/PasswordInput';

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
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="card w-full max-w-sm space-y-4">
                <h1 className="text-xl font-semibold">Crear cuenta</h1>
                <form onSubmit={handleSubmit} className="grid gap-3">
                    <label>
                        <span className="muted">Correo</span>
                        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                    </label>
                    <label>
                        <span className="muted">Contraseña (min 6)</span>
                        <PasswordInput className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                    </label>

                    <button className="btn w-full" type="submit" disabled={isLoading}>{isLoading ? 'Creando…' : 'Registrarme'}</button>
                </form>
                {msg && <p className="text-red-600">{msg}</p>}
            </div>
        </div>
    );
}