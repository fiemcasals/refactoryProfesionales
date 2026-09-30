import { useState } from 'react';

/** Formulario #chat-form con el campo #chat-input. Siempre vacía el campo. */
export function ChatForm({ onSubmit }: { onSubmit: (text: string) => void }) {
    const [value, setValue] = useState('');

    return (
        <form
            className="input-form"
            id="chat-form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(value);
                setValue('');
            }}
        >
            <input
                type="text"
                id="chat-input"
                className="chat-input"
                placeholder="Escribe una consulta o selecciona una opción de arriba..."
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit" id="btn-send" className="btn-send" aria-label="Enviar mensaje">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </form>
    );
}
