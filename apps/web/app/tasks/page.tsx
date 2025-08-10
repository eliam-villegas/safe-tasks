'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken } from '../../lib/auth';

type Task = { id: number; title: string; done: boolean };

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [msg, setMsg] = useState<string>('');

    async function load() {
        try {
            const token = getToken();
            if (!token) {
                router.replace('/login');
                return;
            }
            const res = await fetch('http://localhost:3001/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setTasks(data);
        } catch (e: any) {
            setMsg(e.message || 'Error al cargar tareas');
        }
    }

    useEffect(() => { load(); }, []);

    async function createTask() {
        const token = getToken();
        if (!token) return router.replace('/login');
        try {
            const res = await fetch('http://localhost:3001/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, done: false }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setTitle('');
            load();
        } catch (e: any) {
            setMsg(e.message || 'Error al crear tarea');
        }
    }

    function logout() {
        clearToken();
        router.replace('/login');
    }

    return (
        <main style={{ padding: 16 }}>
            <header style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <h1>Tareas</h1>
                <button onClick={logout}>Cerrar sesión</button>
            </header>

            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <input
                    placeholder="Nueva tarea..."
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />
                <button onClick={createTask}>Agregar</button>
            </div>

            {msg && <p style={{color:'crimson'}}>{msg}</p>}

            {tasks.length === 0 ? (
                <p>No hay tareas.</p>
            ) : (
                <ul style={{ display:'grid', gap:8, padding:0 }}>
                    {tasks.map(t => (
                        <li key={t.id} style={{ listStyle:'none', border:'1px solid #ddd', padding:8, borderRadius:8 }}>
                            <span>{t.title}</span>
                            <span style={{ marginLeft:8, opacity:.7 }}>{t.done ? '✔️' : '⏳'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
