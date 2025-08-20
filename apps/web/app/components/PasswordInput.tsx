'use client';
import { useState } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

export default function PasswordInput({ label, ...rest }: Props) {
    const [show, setShow] = useState(false);
    return (
        <label className="block w-full">
            {label && <span className="muted block mb-1">{label}</span>}
            <div className="relative">
                <input
                    {...rest}
                    type={show ? 'text' : 'password'}
                    className={`input pr-10 ${rest.className ?? ''}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                    {show ? '👁️' : '🙈'}
                </button>
            </div>
        </label>
    );
}