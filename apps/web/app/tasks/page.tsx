'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken } from '../../lib/auth';

type Task = { id: number; title: string; done: boolean };

export default function TasksPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [msg, setMsg] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // Evita render hasta comprobar token en cliente
        const has = !!getToken();
        if (!has) {
            router.replace('/login');
            return;
        }
        setReady(true);
    }, [router]);

    // Carga datos solo cuando ready=true
    useEffect(() => {
        if (!ready) return;
        load();
    }, [ready]);


    async function load() {
        try {
            const token = getToken();
            if (!token) return router.replace('/login');
            const res = await fetch('http://localhost:3001/tasks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setTasks(await res.json());
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al cargar tareas');
            setMsg(String(text));
        }
    }

    async function createTask() {
        const token = getToken();
        if (!token) return router.replace('/login');
        if (isCreating) return;          // <- evita dobles clicks
        setIsCreating(true);
        setMsg('');

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
            await load();
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al crear tareas');
            setMsg(String(text));
        } finally {
            setIsCreating(false);
        }
    }

    async function toggleDone(id: number, current: boolean) {
        const token = getToken();
        if (!token) return router.replace('/login');
        try {
            const res = await fetch(`http://localhost:3001/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ done: !current }), // invierte el estado
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al actualizar tarea');
            setMsg(String(text));
        }
    }

    async function deleteTask(id: number) {
        const token = getToken();
        if (!token) return router.replace('/login');
        try {
            const res = await fetch(`http://localhost:3001/tasks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al eliminar tarea');
            setMsg(String(text));
        }
    }

    function logout() {
        clearToken();
        document.cookie = "token=; Max-Age=0; Path=/; SameSite=Lax"
        if(typeof document !== 'undefined'){
            const el = document.activeElement as HTMLElement | null;
            el?.blur();
        }
        setTimeout(() => router.replace("/login"), 30);
    }

    if(!ready) return null;

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
                <button onClick={createTask} disabled={isCreating}>
                    {isCreating ? 'Agregando…' : 'Agregar'}
                </button>
            </div>

            {msg && <p style={{color:'crimson'}}>{msg}</p>}

            {/* aquí abajo luego metemos los botones PATCH/DELETE */}
            {tasks.length === 0 ? (
                <p>No hay tareas.</p>
            ) : (
                <ul style={{ display:'grid', gap:8, padding:0 }}>
                    {tasks.map(t => (
                        <li key={t.id} style={{ listStyle:'none', border:'1px solid #ddd', padding:8, borderRadius:8, display:'flex', gap:8, alignItems:'center', justifyContent:'space-between' }}>
                            <div>
                                <strong>{t.title}</strong>
                                <span style={{ marginLeft:8, opacity:.7 }}>{t.done ? '✔️ Hecha' : '⏳ Pendiente'}</span>
                            </div>
                            <div style={{ display:'flex', gap:8 }}>
                                <button onClick={() => toggleDone(t.id, t.done)}>
                                    {t.done ? 'Marcar pendiente' : 'Marcar hecha'}
                                </button>
                                <button onClick={() => deleteTask(t.id)}>
                                    Eliminar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
