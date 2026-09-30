/**
 * Pruebas de RF-02, tramo frontend (criterios 2, 3, 4 y 5).
 * El backend (criterios 1, 3, 4, 6 y 7) lo cubre backend/accounts/tests.py.
 * El fetch se mockea: acá se prueba la interfaz, no el servidor.
 * Corre con: cd frontend && npm test
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../App';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

function mockFetchOnce(status: number, body: unknown) {
    const fn = vi.fn().mockResolvedValueOnce({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
    });
    vi.stubGlobal('fetch', fn);
    return fn;
}

async function abrirFormulario() {
    render(<App />);
    const login = await screen.findByRole('button', { name: /iniciar sesión/i }, { timeout: 3000 });
    fireEvent.click(login);
    const email = (await screen.findByLabelText(/correo electrónico/i, undefined, {
        timeout: 3000,
    })) as HTMLInputElement;
    const password = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
    return { email, password };
}

function enviar() {
    const form = document.querySelector('#login-form') as HTMLFormElement;
    fireEvent.submit(form);
}

describe('RF-02 frontend', () => {
    test('criterio 2: el formulario de login esta en el chat y pide correo y contraseña', async () => {
        const { email, password } = await abrirFormulario();
        expect(document.querySelector('#login-form')).not.toBeNull();
        expect(email.type).toBe('email');
        expect(password.type).toBe('password');
    });

    test('criterio 5: vacio no llama al backend y marca los dos campos', async () => {
        const fetchFn = mockFetchOnce(200, {});
        await abrirFormulario();
        enviar();

        await waitFor(() => {
            expect(document.querySelector('[data-field="email"]')).not.toBeNull();
            expect(document.querySelector('[data-field="password"]')).not.toBeNull();
        });
        expect(fetchFn).not.toHaveBeenCalled();
    });

    test('criterio 5: correo con formato invalido no llama al backend y marca el campo', async () => {
        const fetchFn = mockFetchOnce(200, {});
        const { email, password } = await abrirFormulario();
        fireEvent.change(email, { target: { value: 'no-es-un-correo' } });
        fireEvent.change(password, { target: { value: 'algo' } });
        enviar();

        await waitFor(() => {
            const err = document.querySelector('[data-field="email"]');
            expect(err).not.toBeNull();
            expect(err?.textContent).toMatch(/formato válido/);
        });
        expect(fetchFn).not.toHaveBeenCalled();
    });

    test('criterio 3: valido muestra la confirmacion con el correo y retira el formulario', async () => {
        mockFetchOnce(200, { token: 'abc123', email: 'qa@profesionales.local' });
        const { email, password } = await abrirFormulario();
        fireEvent.change(email, { target: { value: 'qa@profesionales.local' } });
        fireEvent.change(password, { target: { value: 'Profesionales123' } });
        enviar();

        const conf = await screen.findByText(/Sesión iniciada como qa@profesionales\.local\./, undefined, {
            timeout: 3000,
        });
        expect(conf).toBeInTheDocument();
        expect(document.querySelector('#login-form')).toBeNull();
    });

    test('criterio 4: invalido muestra el mensaje generico y no confirma', async () => {
        mockFetchOnce(401, { detail: 'Credenciales no válidas.' });
        const { email, password } = await abrirFormulario();
        fireEvent.change(email, { target: { value: 'nadie@profesionales.local' } });
        fireEvent.change(password, { target: { value: 'cualquiera' } });
        enviar();

        const err = await screen.findByText('Credenciales no válidas.', undefined, { timeout: 3000 });
        expect(err).toBeInTheDocument();
        expect(document.querySelector('#login-form')).not.toBeNull();
        expect(screen.queryByText(/Sesión iniciada como/)).toBeNull();
    });

    test('fix: con sesion activa, mandar texto no repone los botones', async () => {
        mockFetchOnce(200, { token: 'abc123', email: 'qa@profesionales.local' });
        const { email, password } = await abrirFormulario();
        fireEvent.change(email, { target: { value: 'qa@profesionales.local' } });
        fireEvent.change(password, { target: { value: 'Profesionales123' } });
        enviar();
        await screen.findByText(/Sesión iniciada como qa@profesionales\.local\./, undefined, {
            timeout: 3000,
        });

        const botones = () =>
            [...document.querySelectorAll('#options-container button')] as HTMLButtonElement[];
        const mensajes = () =>
            [...document.querySelectorAll('.chat-message.bot .message-bubble')].map(
                (el) => (el.textContent ?? '').trim(),
            );

        // Saludo post-login: responde sin reponer botones.
        const decir = (texto: string) => {
            const input = document.querySelector('#chat-input') as HTMLInputElement;
            const form = document.querySelector('#chat-form') as HTMLFormElement;
            fireEvent.change(input, { target: { value: texto } });
            fireEvent.submit(form);
        };
        decir('hola');
        await waitFor(
            () =>
                expect(
                    mensajes().some((t) => t.includes('Ya iniciaste sesión como')),
                ).toBe(true),
            { timeout: 3000 },
        );
        expect(botones()).toHaveLength(0);

        // Texto genérico post-login: tampoco repone botones.
        decir('quiero sacar un turno');
        await waitFor(
            () =>
                expect(
                    mensajes().filter((t) => t.includes('Ya iniciaste sesión como')).length,
                ).toBeGreaterThanOrEqual(2),
            { timeout: 3000 },
        );
        expect(botones()).toHaveLength(0);
    });
});
