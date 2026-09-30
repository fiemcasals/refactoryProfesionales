import type { ReactNode } from 'react';

/** Un mensaje del chat. */
export interface ChatMessage {
    id: number;
    sender: string;
    isUser: boolean;
    /**
     * Texto literal del mensaje.
     * - Usuario: se renderiza escapado con `{text}` (criterio 7). Nunca es HTML.
     * - Asistente: son literales propios de este repo, sin markup.
     */
    text: string;
    /**
     * Contenido con markup. Solo lo usa el saludo de bienvenida
     * (emoji + <strong> + <br>), que es un literal de este repo.
     * Cuando existe, la burbuja lo muestra en vez de `text`.
     */
    rich?: ReactNode;
    time: string;
}

/** Opción elegida en la barra de botones. */
export type ChatOption = 'login' | 'register';
