'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import PasswordInput from '../components/PasswordInput';

export default function ResetPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const token = sp.get('token') ?? '';
    const [pw, setPw] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setMsg('');
        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: pw }),
            });
            if (!res.ok) {
                const err = await res.json().catch(()=> ({}));
                throw new Error(err?.message || `HTTP ${res.status}`);
            }
            setMsg('Contraseña actualizada. Redirigiendo a login…');
            setTimeout(()=> router.replace('/login'), 1200);
        } catch (e:any) {
            setMsg(e?.message || 'Error');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <main className="container-page">
                <div className="card max-w-md mx-auto">
                    <p>Token ausente o inválido.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container-page">
            <div className="card space-y-4 max-w-md mx-auto">
                <h1 className="text-xl font-semibold">Restablecer contraseña</h1>
                <form onSubmit={onSubmit} className="space-y-3">
                    <PasswordInput
                        label="Nueva contraseña"
                        value={pw}
                        onChange={(e)=>setPw(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />
                    <button className="btn" disabled={loading}>
                        {loading ? 'Guardando…' : 'Cambiar contraseña'}
                    </button>
                </form>
                {msg && <p className="text-sm">{msg}</p>}
            </div>
        </main>
    );
}