import type { ReactNode } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

/** Los tres puntos animados mientras el asistente "escribe". */
export function TypingIndicator() {
    return (
        <div id="typing-indicator" className="typing-indicator" aria-hidden="true">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
        </div>
    );
}

/** Área de mensajes #messages-list. `children` es el formulario de auth (RF-02). */
export function MessageList({
    messages,
    typing,
    children,
}: {
    messages: ChatMessage[];
    typing: boolean;
    children?: ReactNode;
}) {
    return (
        <div className="messages-area" id="messages-list" role="log" aria-live="polite">
            {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
            ))}
            {typing && <TypingIndicator />}
            {children}
        </div>
    );
}
