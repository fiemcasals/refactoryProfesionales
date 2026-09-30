import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Sin StrictMode a propósito: el flujo de bienvenida corre por timers y el
// doble-montaje de StrictMode duplicaría el saludo. Ver scrumDocs/entregas/RF-06.md.
createRoot(document.getElementById('root')!).render(<App />);
