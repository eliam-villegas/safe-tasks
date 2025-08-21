import { NextRequest, NextResponse } from 'next/server';

const API =
    (process.env.API_URL || process.env.NEXT_PUBLIC_API || '').replace(/\/+$/, '');

export async function POST(req: NextRequest) {
    if (!API.startsWith('http')) {
        return NextResponse.json(
            { message: 'API base no configurada en el servidor' },
            { status: 500 },
        );
    }

    const body = await req.text(); // passtrough exacto
    const upstream = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        // Opcional: timeout/con cache
        // next: { revalidate: 0 },
    });

    // Retorna tal cual (status y body)
    const text = await upstream.text();
    const contentType =
        upstream.headers.get('content-type') || 'application/json';

    return new NextResponse(text, {
        status: upstream.status,
        headers: { 'content-type': contentType },
    });
}