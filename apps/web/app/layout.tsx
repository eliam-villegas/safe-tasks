import type { Metadata } from "next";
import "./globals.css";
import QuickBar from "./components/QuickBar";

export const metadata: Metadata = {

    title: "SafeTasks",
    description: "Organiza tus tareas de forma segura",
    robots: { index: false, follow: false }

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body className="bg-gray-50 text-gray-900">
        <QuickBar />
        <main className="container-page">{children}</main>
        </body>
        </html>
    );
}