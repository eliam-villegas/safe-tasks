'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

export default function ForgotPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setMsg('');

        const fd = new FormData(formRef.current!);
        const email = String(fd.get('email') ?? '').trim();

        try {
            const res = await fetch('/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }), // <- clave exacta
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message ?? 'Error');

            setSent(true);

            // En dev puedes mostrar el enlace que devuelve el backend:
            if (data?.resetLink) setMsg(`(Dev) Link: ${data.resetLink}`);
        } catch (err: any) {
            setMsg(err?.message ?? 'Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="container-page">
            <div className="card space-y-4 max-w-md mx-auto">
                <h1 className="text-xl font-semibold">Recuperar contraseña</h1>

                {sent ? (
                    <div className="space-y-2">
                        <p className="text-sm">
                            Si el correo existe, te enviamos un enlace para restablecer tu contraseña.
                            Revisa tu bandeja de entrada y/o spam.
                        </p>
                        {msg && <p className="text-xs text-gray-500">{msg}</p>}
                        <div className="pt-1">
                            <Link className="btn-secondary" href="/login">Volver a iniciar sesión</Link>
                        </div>
                    </div>
                ) : (
                    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
                        <label className="block">
                            <span className="muted block mb-1">Correo</span>
                            <input
                                className="input"
                                type="email"
                                name="email"              // <- importante para FormData/autocompletado
                                autoComplete="email"
                                placeholder="tu@correo.com"
                                required
                            />
                        </label>

                        <div className="flex items-center justify-between">
                            <Link href="/login" className="muted hover:underline">
                                ← Volver a login
                            </Link>
                            <button className="btn" disabled={loading}>
                                {loading ? 'Enviando…' : 'Enviar enlace'}
                            </button>
                        </div>

                        {msg && <p className="text-xs text-gray-500">{msg}</p>}
                    </form>
                )}
            </div>
        </main>
    );
}