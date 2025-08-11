import { NextRequest, NextResponse } from 'next/server';
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { id } = await ctx.params;

    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const { id } = await ctx.params;

    const res = await fetch(`${API}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}