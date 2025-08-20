import { NextRequest, NextResponse } from 'next/server';
const API = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // { token, newPassword }
        const res = await fetch(`${API}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}