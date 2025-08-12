import { NextRequest, NextResponse } from 'next/server';
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

    const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}