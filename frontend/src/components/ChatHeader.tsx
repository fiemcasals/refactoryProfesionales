/** Cabecera de la app: marca Profesionales y estado del asistente. */
export function ChatHeader() {
    return (
        <header className="app-header" id="main-header">
            <div className="header-content">
                <div className="brand-info">
                    <div className="brand-logo" id="brand-logo">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="brand-title">Profesionales</h1>
                        <span className="brand-subtitle">Red de Salud &amp; Turnos</span>
                    </div>
                </div>
                <div className="header-status">
                    <span className="status-indicator online"></span>
                    <span className="status-text">Asistente en línea</span>
                </div>
            </div>
        </header>
    );
}
