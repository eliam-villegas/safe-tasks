'use client';

import Link from "next/link";

export default function HomePage() {
    return (
        <main className="container-page">
            {/* Héroe */}
            <section className="text-center py-20">
                <h1 className="text-4xl font-bold mb-4">
                    SafeTasks — Gestiona tus tareas fácilmente
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Una aplicación sencilla y segura para organizar tu día a día.
                    Administra tus pendientes, mantén el control y accede desde cualquier parte.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/login" className="btn">
                        Empezar ahora
                    </Link>
                    <Link href="/tasks" className="btn-secondary">
                        Ver mis tareas
                    </Link>
                </div>
            </section>

            {/* Imagen / screenshot */}
            <section className="mt-12 flex justify-center">
                <div className="rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl">
                    <img
                        src="/screenshot.png"
                        alt="Vista previa de SafeTasks"
                        className="w-full"
                    />
                </div>
            </section>

            {/* CTA adicional */}
            <section className="mt-20 text-center">
                <h2 className="text-2xl font-semibold mb-4">¿Listo para organizar tu día?</h2>
                <Link href="/login" className="btn">
                    Crear una cuenta
                </Link>
            </section>
        </main>
    );
}