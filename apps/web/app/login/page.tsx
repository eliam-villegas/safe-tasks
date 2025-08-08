'use client';
import { useState } from 'react';

export default function LoginPage() {
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
            localStorage.setItem('access_token', token);
            setMessage(`Login exitoso. Token: ${data.access_token}`);

            const taskRes = await fetch('http://localhost:3001/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (taskRes.ok) {
                const tasks = await taskRes.json();
                console.log("Tareas del usuario:", tasks);
                setMessage(`Login exitoso. Se encontraron ${tasks.length} tareas`);
            }
            else {
                setMessage("Login exitoso, pero ocurrio un error al obtener las tareas.")
            }

        } else {
            const err = await res.json();
            setMessage(err.message || 'Error al iniciar sesión');
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                />
                <br />
                <input
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                />
                <br />
                <button type="submit">Iniciar sesión</button>
            </form>
            <p>{message}</p>
        </div>
    );
}
