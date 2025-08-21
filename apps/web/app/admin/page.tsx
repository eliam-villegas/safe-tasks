'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminTask = {
    id: number;
    title: string;
    done: boolean;
    user?: { id: number; email: string; role: string } | null;
};

export default function AdminPage() {
    const router = useRouter();

    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [onlyDone, setOnlyDone] = useState<null | boolean>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // gatekeeping: solo admin
    useEffect(() => {
        (async () => {
            const r = await fetch('/api/auth/me', { cache: 'no-store' });
            if (!r.ok) { router.replace('/login'); return; }
            const me = await r.json();
            if (me?.role !== 'admin') router.replace('/tasks');
        })();
    }, [router]);

    const load = useCallback(async () => {
        setLoading(true);
        setMsg('');
        try {
            const sp = new URLSearchParams();
            sp.set('page', String(page));
            sp.set('limit', String(limit));
            if (search.trim()) sp.set('search', search.trim());
            if (onlyDone === true) sp.set('done', 'true');
            if (onlyDone === false) sp.set('done', 'false');

            const url = `/api/admin/tasks?${sp.toString()}`;
            const res = await fetch(url, { cache: 'no-store' });

            if (res.status === 401) { router.replace('/login'); return; }
            if (res.status === 403) { router.replace('/tasks'); return; }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const items: AdminTask[] = Array.isArray(data) ? data : (data.items ?? []);
            setTasks(items);
            setTotal(data.total ?? (Array.isArray(data) ? items.length : 0));
        } catch (e: unknown) {
            setMsg(e instanceof Error ? e.message : 'Error al cargar tareas admin');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, onlyDone, router]);

    useEffect(() => { load(); }, [load]);

    async function deleteAny(id: number) {
        if (!confirm('¿Eliminar tarea?')) return;
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: unknown) {
            setMsg(e instanceof Error ? e.message : 'Error al eliminar');
        }
    }

    async function toggleAny(id: number, current: boolean) {
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ done: !current }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await load();
        } catch (e: unknown) {
            setMsg(e instanceof Error ? e.message : 'Error al actualizar');
        }
    }

    return (
        <section className="space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Panel Admin</h1>
                    <p className="muted">Gestión de todas las tareas</p>
                </div>
            </header>

            {/* filtros */}
            <div className="card flex flex-wrap items-center gap-2">
                <input
                    className="input max-w-xs"
                    placeholder="Buscar…"
                    value={search}
                    onChange={e => { setPage(1); setSearch(e.target.value); }}
                    aria-label="Buscar por título"
                />

                <select
                    className="select"
                    value={onlyDone === null ? 'all' : (onlyDone ? 'true' : 'false')}
                    onChange={(e) => {
                        const v = e.target.value;
                        setPage(1);
                        setOnlyDone(v === 'all' ? null : v === 'true');
                    }}
                    aria-label="Filtrar por estado"
                >
                    <option value="all">Todas</option>
                    <option value="false">Pendientes</option>
                    <option value="true">Hechas</option>
                </select>

                <select
                    className="select"
                    value={limit}
                    onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                    aria-label="Items por página"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                    <span className="muted">Página {page} de {totalPages} — {total} tareas</span>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="btn-secondary px-3 py-2"
                        aria-label="Anterior"
                    >◀</button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="btn-secondary px-3 py-2"
                        aria-label="Siguiente"
                    >▶</button>
                </div>
            </div>

            {loading && <p className="muted">Cargando tareas…</p>}
            {msg && <p className="text-sm text-red-600">{msg}</p>}

            {/* tabla */}
            <div className="card overflow-auto">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                    <tr className="text-left text-sm text-gray-500">
                        <th className="py-2 pr-3">ID</th>
                        <th className="py-2 pr-3">Título</th>
                        <th className="py-2 pr-3">Usuario</th>
                        <th className="py-2 pr-3">Estado</th>
                        <th className="py-2">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map(t => (
                        <tr key={t.id} className="border-t">
                            <td className="py-2 pr-3">{t.id}</td>
                            <td className="py-2 pr-3">{t.title}</td>
                            <td className="py-2 pr-3">{t.user?.email ?? '—'}</td>
                            <td className="py-2 pr-3">
                  <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs
                    ${t.done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    {t.done ? 'Hecha' : 'Pendiente'}
                  </span>
                            </td>
                            <td className="py-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAny(t.id, t.done)}
                                        className="btn-secondary"
                                    >
                                        {t.done ? 'Marcar pendiente' : 'Marcar hecha'}
                                    </button>
                                    <button
                                        onClick={() => deleteAny(t.id)}
                                        className="btn"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!loading && tasks.length === 0) && (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                No hay tareas.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}