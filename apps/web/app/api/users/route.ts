import { NextRequest } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function requireApiBase() {
    if (!API_BASE) {
        throw new Error('NEXT_PUBLIC_API_URL no está definida en el entorno.');
    }
    return API_BASE;
}

export async function POST(req: NextRequest) {
    const base = requireApiBase();
    const body = await req.json();

    const res = await fetch(`${base}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    // Reenvía el status real del backend
    const text = await res.text();
    return new Response(text, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    });
}