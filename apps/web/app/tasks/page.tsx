'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Task = { id: number; title: string; done: boolean };

export default function TasksPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [msg, setMsg] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [onlyDone, setOnlyDone] = useState<null | boolean>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    useEffect(() => {
        setReady(true);
    }, []);

    useEffect(() => {
        load();
    }, [page, limit, search, onlyDone]);

    async function load() {
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(limit));
            if (search.trim()) params.set('search', search.trim());
            if (onlyDone === true) params.set('done', 'true');
            if (onlyDone === false) params.set('done', 'false');

            const url = `/api/tasks?${params.toString()}`;
            const res = await fetch(url);
            console.log('[load] GET', url, res.status);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json(); // { items, total, page, limit }
            console.log('[load] data', data);

            setTasks(data.items ?? []);
            setTotal(data.total ?? 0);
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al cargar tareas');
            setMsg(String(text));
        }
    }

    async function createTask() {
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
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
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: any) {
            const text = typeof e === 'string' ? e : (e?.message ?? 'Error al eliminar tarea');
            setMsg(String(text));
        }
    }

    async function logout() {
        await fetch("/api/auth/logout",
            { method: 'POST' });
        router.replace('/login');
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

            <div style={{ display:'flex', gap:8, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
                <input
                    placeholder="Buscar por título…"
                    value={search}
                    onChange={(e)=> { setPage(1); setSearch(e.target.value); }}
                    style={{ padding:6 }}
                />
                <select
                    value={onlyDone === null ? 'all' : (onlyDone ? 'true' : 'false')}
                    onChange={(e) => {
                        const v = e.target.value;
                        setPage(1);
                        setOnlyDone(v === 'all' ? null : v === 'true');
                    }}
                >
                    <option value="all">Todas</option>
                    <option value="false">Pendientes</option>
                    <option value="true">Hechas</option>
                </select>

                <select
                    value={limit}
                    onChange={(e)=> { setPage(1); setLimit(Number(e.target.value)); }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <span style={{ marginLeft:'auto' }}>
                    Página {page} de {totalPages} — {total} tareas
                </span>

                <button
                    onClick={()=> setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                >
                    ◀ Anterior
                </button>
                <button
                    onClick={()=> setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    Siguiente ▶
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
