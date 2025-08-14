'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminTask = {
    id: number;
    title: string;
    done: boolean;
    user: { id: number; email: string; role: string };
};

export default function AdminPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<AdminTask[]>([]);
    const [msg, setMsg] = useState('');
    const [search, setSearch] = useState('');
    const [onlyDone, setOnlyDone] = useState<null | boolean>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Verifica rol admin
    useEffect(() => {
        (async () => {
            const r = await fetch('/api/auth/me');
            if (!r.ok) { router.replace('/login'); return; }
            const me = await r.json();
            if (!me?.role || me.role !== 'admin') {
                router.replace('/tasks'); // no admin -> fuera
            }
        })();
    }, [router]);

    useEffect(() => { load(); }, [page, limit, search, onlyDone]);

    async function load() {
        try {
            const sp = new URLSearchParams();
            sp.set('page', String(page));
            sp.set('limit', String(limit));
            if (search.trim()) sp.set('search', search.trim());
            if (onlyDone === true) sp.set('done', 'true');
            if (onlyDone === false) sp.set('done', 'false');

            const url = `/api/admin/tasks?${sp.toString()}`;
            const res = await fetch(url);
            console.log('[admin] GET', url, res.status);

            if (res.status === 401) { router.replace('/login'); return; }
            if (res.status === 403) { router.replace('/tasks'); return; }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json().catch(() => ({}));
            console.log('[admin] data', data);

            const items = Array.isArray(data) ? data : (data.items ?? []);
            setTasks(items);
            setTotal(data.total ?? (Array.isArray(data) ? items.length : 0));
        } catch (e: any) {
            setMsg(e?.message ?? 'Error al cargar tareas admin');
        }
    }

    async function toggleAny(id: number, current: boolean) {
        const res = await fetch(`/api/admin/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ done: !current }),
        });
        if (!res.ok) { setMsg(`HTTP ${res.status}`); return; }
        await load();
    }

    async function deleteAny(id: number) {
        const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
        if (!res.ok) { setMsg(`HTTP ${res.status}`); return; }
        await load();
    }

    return (
        <main style={{ padding: 16 }}>
            <h1>Panel Admin — Tareas</h1>

            <div style={{ display:'flex', gap:8, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
                <input placeholder="Buscar…" value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} />
                <select value={onlyDone === null ? 'all' : (onlyDone ? 'true' : 'false')}
                        onChange={e => { const v = e.target.value; setPage(1); setOnlyDone(v === 'all' ? null : v === 'true'); }}>
                    <option value="all">Todas</option>
                    <option value="false">Pendientes</option>
                    <option value="true">Hechas</option>
                </select>
                <select value={limit} onChange={e => { setPage(1); setLimit(Number(e.target.value)); }}>
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                </select>
                <span style={{ marginLeft:'auto' }}>Página {page} de {Math.max(1, Math.ceil(total/limit))} — {total} tareas</span>
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}>◀</button>
                <button onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(total/limit)), p+1))}
                        disabled={page >= Math.max(1, Math.ceil(total/limit))}>▶</button>
            </div>

            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
            <p style={{ opacity: .7, margin: '8px 0' }}>
                Mostrando {tasks.length} de {total} tareas
            </p>

            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                <tr>
                    <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Título</th>
                    <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Estado</th>
                    <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Usuario</th>
                    <th style={{ textAlign:'left', borderBottom:'1px solid #ddd' }}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map(t => (
                    <tr key={t.id}>
                        <td style={{ padding:'6px 0' }}>{t.title}</td>
                        <td>{t.done ? 'Hecha' : 'Pendiente'}</td>
                        <td>{t.user?.email ?? '—'}{t.user?.role ? ` (${t.user.role})` : ''}</td>
                        <td>
                            <button onClick={() => toggleAny(t.id, t.done)} style={{ marginRight: 8 }}>
                                {t.done ? 'Marcar pendiente' : 'Marcar hecha'}
                            </button>
                            <button onClick={() => deleteAny(t.id)}>
                                Eliminar
                            </button>
                        </td>

                    </tr>
                ))}
                {tasks.length === 0 && (
                    <tr><td colSpan={4} style={{ padding:8, opacity:.7 }}>No hay tareas.</td></tr>
                )}
                </tbody>
            </table>
        </main>
    );
}