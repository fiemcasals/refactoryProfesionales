import type { ChatOption } from '../types';

/**
 * Barra #options-container. El contenedor existe siempre; los botones
 * aparecen y desaparecen según el flujo (criterios 3, 4 y 5).
 */
export function OptionsBar({
    visible,
    onSelect,
}: {
    visible: boolean;
    onSelect: (option: ChatOption) => void;
}) {
    return (
        <div className="quick-actions-bar" id="options-container">
            {visible && (
                <>
                    <button
                        id="btn-login"
                        className="action-btn-pill primary-filled"
                        type="button"
                        onClick={() => onSelect('login')}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Iniciar Sesión
                    </button>
                    <button
                        id="btn-register"
                        className="action-btn-pill"
                        type="button"
                        onClick={() => onSelect('register')}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Registrarse
                    </button>
                </>
            )}
        </div>
    );
}
