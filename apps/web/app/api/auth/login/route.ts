import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(req: Request) {
    try {

        const body = await req.json();

        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json(err, { status: res.status });
        }

        const data = await res.json();
        const token = data?.access_token;

        if (!token) {
            return NextResponse.json({ message: "Token ausente", status: 500 });
        }

        const resp = NextResponse.json({ ok: true });

        resp.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60*60,
            secure: false, //CAMBIAR EN PRODUCCION A 'true' (https).
        });

        return resp;
    } catch {
        return NextResponse.json({ message: 'Error en login' }, { status: 500 });
    }
}