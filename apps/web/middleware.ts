import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/favicon.ico', '/_next']; // lo que NO se protege

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // permite recursos públicos y estáticos
    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.next();
    }

    // lee cookie 'token'
    const token = req.cookies.get('token')?.value;

    // si no hay token, redirige a /login
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // si hay token, deja pasar
    return NextResponse.next();
}

// aqui se definen qué rutas pasan por el middleware
export const config = {
    matcher: [
        '/tasks/:path*',   // protege /tasks y subrutas
        '/admin/:path*',   // protege /admin
    ],
};