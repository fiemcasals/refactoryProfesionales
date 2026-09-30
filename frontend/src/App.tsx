import { useChat } from './hooks/useChat';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { OptionsBar } from './components/OptionsBar';
import { ChatForm } from './components/ChatForm';
import { LoginForm } from './components/LoginForm';
import './styles/tokens.css';
import './styles/chat.css';
import './styles/auth.css';

/**
 * RF-06: interfaz de chat y bienvenida sobre React + Vite.
 * Reproduce el flujo de RF-01 (app.js) con los mismos ids, textos y tiempos.
 */
export default function App() {
    const { messages, typing, optionsVisible, loginFormVisible, selectOption, submitText, confirmLogin } =
        useChat();

    return (
        <div className="app-viewport">
            <ChatHeader />
            <main className="chat-wrapper">
                <div className="chat-card" id="chat-container">
                    <MessageList messages={messages} typing={typing}>
                        {loginFormVisible && <LoginForm onSuccess={confirmLogin} />}
                    </MessageList>
                    <OptionsBar visible={optionsVisible} onSelect={selectOption} />
                    <footer className="chat-footer">
                        <ChatForm onSubmit={submitText} />
                    </footer>
                </div>
            </main>
        </div>
    );
}
