import { NextRequest, NextResponse } from 'next/server'

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(req: NextRequest){
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await req.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}