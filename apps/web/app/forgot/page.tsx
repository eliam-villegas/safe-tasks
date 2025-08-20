'use client';
import { useState } from 'react';

export default function ForgotPage() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return;
        setLoading(true); setMsg('');
        try {
            const res = await fetch('/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setSent(true);
            // En dev podemos mostrar el enlace de reseteo que devuelve el backend:
            if (data?.resetLink) setMsg(`(Dev) Link: ${data.resetLink}`);
        } catch {
            setMsg('Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="container-page">
            <div className="card space-y-4 max-w-md mx-auto">
                <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
                {sent ? (
                    <p className="text-sm">
                        Si el email existe, te enviamos un enlace para restablecer tu contraseña.
                    </p>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-3">
                        <label className="block">
                            <span className="muted block mb-1">Correo</span>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                            />
                        </label>
                        <button className="btn" disabled={loading}>
                            {loading ? 'Enviando…' : 'Enviar enlace'}
                        </button>
                    </form>
                )}
                {msg && <p className="text-xs text-gray-500">{msg}</p>}
            </div>
        </main>
    );
}