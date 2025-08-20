import type { Metadata } from "next";
import "./globals.css";
import QuickBar from "./components/QuickBar";

export const metadata: Metadata = {
    title: "SafeTasks",
    description: "Gestor de tareas con roles",
    robots:{ index: false, follow: false},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body className="bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
            <nav className="container-page flex items-center justify-between py-2">
                <div className="flex-1">
                    <QuickBar />
                </div>
            </nav>
        </header>
        <main className="container-page">{children}</main>
        </body>
        </html>
    );
}

