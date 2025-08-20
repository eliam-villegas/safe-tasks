import { Suspense } from 'react';
import ResetForm from './ResetForm';

export default function ResetPage() {
    return (
        <main className="container-page">
            <Suspense fallback={<div className="card max-w-md mx-auto">Cargando…</div>}>
                <ResetForm />
            </Suspense>
        </main>
    );
}