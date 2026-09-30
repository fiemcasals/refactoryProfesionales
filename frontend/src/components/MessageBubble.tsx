import type { ChatMessage } from '../types';

/**
 * Una burbuja del chat.
 * El texto del usuario se renderiza como `{text}`: React lo escapa,
 * así que una cadena con HTML se muestra literal y no ejecuta nada
 * (criterio 7). Solo el saludo usa `rich`, que es un literal propio.
 */
export function MessageBubble({ message }: { message: ChatMessage }) {
    return (
        <div className={`chat-message ${message.isUser ? 'user' : 'bot'}`}>
            <span className="message-sender">{message.sender}</span>
            <div className="message-bubble">{message.rich ?? message.text}</div>
            <span className="message-time">{message.time}</span>
        </div>
    );
}
