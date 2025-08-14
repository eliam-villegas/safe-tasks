'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Task = { id: number; title: string; done: boolean };
type ListResponse = { items: Task[]; total: number; page: number; limit: number };

export default function TasksPage() {
    const router = useRouter();

    const [ready, setReady] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState<string>('');
    const [msg, setMsg] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [onlyDone, setOnlyDone] = useState<null | boolean>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(5);
    const [total, setTotal] = useState<number>(0);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    useEffect(() => { setReady(true); }, []);

    const load = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(limit));
            if (search.trim()) params.set('search', search.trim());
            if (onlyDone === true) params.set('done', 'true');
            if (onlyDone === false) params.set('done', 'false');

            const url = `/api/tasks?${params.toString()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.status === 401) { router.replace('/login'); return; }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = (await res.json()) as Partial<ListResponse>;
            setTasks(Array.isArray(data.items) ? data.items : []);
            setTotal(typeof data.total === 'number' ? data.total : 0);
            setMsg('');
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error al cargar tareas');
        }
    }, [page, limit, search, onlyDone, router]);

    useEffect(() => {
        if (!ready) return;
        void load();
    }, [ready, load]);

    async function createTask() {
        if (isCreating) return;
        setIsCreating(true);
        setMsg('');
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, done: false }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setTitle('');
            await load();
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error al crear tarea');
        } finally {
            setIsCreating(false);
        }
    }

    async function toggleDone(id: number, current: boolean) {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done: !current }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error al actualizar tarea');
        }
    }

    async function deleteTask(id: number) {
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (err: unknown) {
            setMsg(err instanceof Error ? err.message : 'Error al eliminar tarea');
        }
    }

    if (!ready) return null;

    return (
        <main style={{ padding: 16 }}>
            <header style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <h1>Tareas</h1>
                {/* Logout está en QuickBar */}
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
                <button onClick={()=> setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>◀</button>
                <button onClick={()=> setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>▶</button>
            </div>

            {msg && <p style={{color:'crimson'}}>{msg}</p>}

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