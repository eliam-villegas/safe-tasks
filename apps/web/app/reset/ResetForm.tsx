'use client';

import { useState, Suspense, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PasswordInput from '../components/PasswordInput';

export default function ResetForm() {
    const router = useRouter();
    const sp = useSearchParams();
    const token = sp.get('token') || '';

    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [msg, setMsg] = useState('');
    const [isPending, startTransition] = useTransition();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMsg('');

        if (!token) {
            setMsg('Token ausente o inválido.');
            return;
        }
        if (pwd.length < 6) {
            setMsg('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (pwd !== pwd2) {
            setMsg('Las contraseñas no coinciden.');
            return;
        }

        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: pwd }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

            setMsg('Contraseña actualizada. Redirigiendo a login…');
            startTransition(() => router.replace('/login'));
        } catch (err: any) {
            setMsg(err.message || 'Error al resetear contraseña');
        }
    }

    return (
        <form onSubmit={onSubmit} className="card space-y-4 max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">Restablecer contraseña</h1>

            {!token && (
                <p className="text-red-600">
                    Token ausente o inválido. Repite el proceso de “¿Olvidaste tu contraseña?”.
                </p>
            )}

            <div>
                <label className="block mb-1 muted">Nueva contraseña</label>
                <PasswordInput value={pwd} onChange={e => setPwd(e.target.value)} />
            </div>

            <div>
                <label className="block mb-1 muted">Confirmar contraseña</label>
                <PasswordInput value={pwd2} onChange={e => setPwd2(e.target.value)} />
            </div>

            {msg && <p className="text-sm text-red-600">{msg}</p>}

            <button className="btn" disabled={isPending || !token}>
                {isPending ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
        </form>
    );
}