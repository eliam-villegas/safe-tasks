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
            <header className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-semibold">Tareas</h1>
            </header>
            {msg && (
                <p className="mb-3 text-sm text-red-600">{msg}</p>
            )}

            <div className="card space-y-3 mb-4">
                <label className="block">
                    <span className="muted block mb-1">Nueva tarea</span>
                    <input
                        className="input"
                        placeholder="Escribe un título…"
                        value={title}
                        onChange={(e)=>setTitle(e.target.value)}
                    />
                </label>
                <div className="flex gap-2 justify-end">
                    <button onClick={createTask} disabled={isCreating} className="btn">
                        {isCreating ? 'Agregando…' : 'Agregar'}
                    </button>
                </div>
            </div>

            <div className="card flex flex-wrap items-center gap-3 mb-4">
                <input
                    className="input max-w-xs"
                    placeholder="Buscar por título…"
                    value={search}
                    onChange={(e)=> { setPage(1); setSearch(e.target.value); }}
                />

                <select
                    className="select"
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
                    className="select"
                    value={limit}
                    onChange={(e)=> { setPage(1); setLimit(Number(e.target.value)); }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                    <span className="muted">Página {page} de {totalPages} — {total} tareas</span>
                    <button
                        onClick={()=> setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="btn-secondary px-3 py-2 rounded"
                    >
                        ◀
                    </button>
                    <button
                        onClick={()=> setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="btn-secondary px-3 py-2 rounded"
                    >
                        ▶
                    </button>
                </div>
            </div>

            {msg && <p className="text-red-600">{msg}</p>}

            {tasks.length === 0 ? (
                <div className="card text-center text-gray-600">
                    <div className="text-3xl mb-2">✓</div>
                    <p>No hay tareas. Crea la primera arriba.</p>
                </div>
            ) : (
                <ul className="grid gap-2">
                    {tasks.map(t => (
                        <li
                            key={t.id}
                            className="bg-white rounded-xl border p-3 flex items-center justify-between"
                        >
                            <div>
                                <strong className="font-medium">{t.title}</strong>
                                <span className={`ml-2 text-sm ${t.done ? 'text-green-600' : 'text-amber-600'}`}>
                                    {t.done ? '✔ Hecha' : '⏳ Pendiente'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleDone(t.id, t.done)}
                                    className="btn-secondary"
                                >
                                    {t.done ? 'Marcar pendiente' : 'Marcar hecha'}
                                </button>
                                <button
                                    onClick={() => deleteTask(t.id)}
                                    className="btn"
                                >
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