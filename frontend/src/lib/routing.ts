/** Los cuatro casos del enrutado de texto libre (RF-01 criterio 6). */
export type Route = 'greeting' | 'login' | 'register' | 'generic';

/**
 * Enruta el texto libre a uno de los cuatro casos.
 * Reglas idénticas a las de app.js: se evalúan en este orden.
 */
export function routeText(text: string): Route {
    const lower = text.toLowerCase();
    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('inicio')) {
        return 'greeting';
    }
    if (lower.includes('login') || lower.includes('iniciar')) {
        return 'login';
    }
    if (lower.includes('registro') || lower.includes('registrar')) {
        return 'register';
    }
    return 'generic';
}
