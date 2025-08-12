import { NextRequest, NextResponse } from 'next/server';
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const url = new URL(req.url);
    const sp = new URLSearchParams(url.search);

    console.log('[proxy /api/tasks] IN:', url.search);

    const allowed = ['search', 'done', 'page', 'limit'];
    // elimina cualquier key no permitida
    Array.from(sp.keys()).forEach((k) => {
        if (!allowed.includes(k)) sp.delete(k);
    });

    // done: solo 'true' o 'false' (cualquier otra cosa -> delete)
    const dRaw = sp.get('done');
    if (dRaw != null) {
        const d = dRaw.toLowerCase();
        if (d === 'true' || d === 'false') sp.set('done', d);
        else sp.delete('done');
    }

    // page/limit: borra si vacío o NaN
    ['page', 'limit'].forEach((k) => {
        const v = sp.get(k);
        if (v == null) return;
        if (v.trim() === '' || Number.isNaN(Number(v))) sp.delete(k);
    });

    const qs = sp.toString() ? `?${sp.toString()}` : '';

    // 🔎 Log de lo que realmente mandaremos al backend
    console.log('[proxy /api/tasks] OUT:', qs || '(sin query)');

    const res = await fetch(`${API}/tasks${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}