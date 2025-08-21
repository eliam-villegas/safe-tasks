'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '../../lib/auth';
import PasswordInput from "../components/PasswordInput"
import Link from "next/link";

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
        <div className="container-page">
            <div className="card max-w-md mx-auto space-y-4">
                <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <label className="block">
                        <span className="muted block mb-1">Correo</span>
                        <input
                            className="input"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            type="email"
                        />
                    </label>

                    <label className="block">
                        <span className="muted block mb-1">Contraseña</span>
                        <PasswordInput
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            type="password"
                        />
                    </label>

                    <button type="submit" className="btn w-full" disabled={isLoading}>
                        {isLoading ? 'Entrando…' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="flex items-center justify-between text-sm">
                    <Link href="/register" className="text-blue-600 hover:underline">
                        ¿No tienes cuenta? Regístrate aquí
                    </Link>
                    <Link href="/forgot" className="text-blue-600 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {msg && <p className="text-red-600 text-sm">{msg}</p>}
            </div>
        </div>
    );
}

