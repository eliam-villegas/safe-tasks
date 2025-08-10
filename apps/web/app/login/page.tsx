'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from "../../lib/auth"

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const data = await res.json();
            const token = data.access_token;

            setToken(token);
            router.push('/tasks');

        } else {
            const err = await res.json().catch(() => ({}));
            setMessage(err.message || 'Error al iniciar sesión');
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
                />
                <input
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required type="password"
                />
                <button type="submit">Iniciar sesión</button>
            </form>
            {message && <p style={{color:'crimson'}}>{message}</p>}
        </div>
    );
}
