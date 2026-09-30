/**
 * Cliente HTTP del backend Django. La base sale de VITE_API_URL
 * (por defecto, el servidor local de desarrollo).
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** El backend respondió 401: mensaje genérico, sin distinguir (criterio 4). */
export class InvalidCredentials extends Error {
    constructor() {
        super('Credenciales no válidas.');
        this.name = 'InvalidCredentials';
    }
}

export interface Session {
    token: string;
    email: string;
}

/** POST /api/auth/login/. Devuelve la sesión o lanza InvalidCredentials. */
export async function login(email: string, password: string): Promise<Session> {
    const r = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (r.status === 401) throw new InvalidCredentials();
    if (!r.ok) throw new Error(`Error del servidor (${r.status}).`);
    const body = (await r.json()) as { token?: string; email?: string };
    if (!body.token || !body.email) throw new Error('Respuesta inválida del servidor.');
    return { token: body.token, email: body.email };
}
