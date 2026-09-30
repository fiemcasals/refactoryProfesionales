/**
 * Pruebas de RF-06 — Reimplementar la interfaz de chat sobre React + Vite.
 * Cada test corresponde a una condición de aprobación de REQ-1790685849827.
 * Las 8 condiciones son las de RF-01, verificables igual en React porque
 * se preservaron los ids del DOM, los textos y los tiempos.
 * Corre con: cd frontend && npm test  (vitest run)
 */
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as fs from 'node:fs';
import * as path from 'node:path';
import App from '../App';

afterEach(() => cleanup());

function botReplies(container: HTMLElement): string[] {
    return [...container.querySelectorAll('.chat-message.bot .message-bubble')].map(
        (el) => (el.textContent ?? '').trim(),
    );
}

function userMessages(container: HTMLElement): string[] {
    return [...container.querySelectorAll('.chat-message.user .message-bubble')].map(
        (el) => (el.textContent ?? '').trim(),
    );
}

function optionButtons(container: HTMLElement): HTMLButtonElement[] {
    return [...container.querySelectorAll('#options-container button')] as HTMLButtonElement[];
}

function submit(container: HTMLElement, text: string) {
    const input = container.querySelector('#chat-input') as HTMLInputElement;
    const form = container.querySelector('#chat-form') as HTMLFormElement;
    fireEvent.change(input, { target: { value: text } });
    fireEvent.submit(form);
}

describe('RF-06', () => {
    test('criterio 1: al cargar la raiz se renderiza la interfaz de chat completa', () => {
        const { container } = render(<App />);

        expect(container.querySelector('.brand-title')?.textContent?.trim()).toMatch(
            /Profesionales/,
        );
        expect(container.querySelector('.status-text')?.textContent?.trim()).toMatch(
            /Asistente en línea/,
        );
        expect(container.querySelector('#messages-list')).not.toBeNull();
        expect(container.querySelector('#options-container')).not.toBeNull();
        expect(container.querySelector('#chat-input')).not.toBeNull();
        expect(container.querySelector('#chat-form')).not.toBeNull();
    });

    test('criterio 2: la bienvenida aparece dentro de los 3000 ms', async () => {
        render(<App />);

        const startedAt = Date.now();
        const el = await screen.findByText(
            /¡Hola! Bienvenid@ a Profesionales/,
            undefined,
            { timeout: 3000 },
        );
        const elapsed = Date.now() - startedAt;

        expect(el).toBeInTheDocument();
        expect(elapsed).toBeLessThan(3000);
    });

    test('criterio 3: exactamente dos botones de tipo button, sin numero de opcion ni texto obligatorio', async () => {
        const { container } = render(<App />);
        await screen.findByRole('button', { name: /iniciar sesión/i }, { timeout: 3000 });

        const buttons = optionButtons(container);
        expect(buttons).toHaveLength(2);

        const login = container.querySelector('#btn-login') as HTMLButtonElement;
        const register = container.querySelector('#btn-register') as HTMLButtonElement;
        expect(login).not.toBeNull();
        expect(register).not.toBeNull();
        expect(login.type).toBe('button');
        expect(register.type).toBe('button');

        // Ningun control exija numero de opcion ni texto para elegir.
        expect(container.querySelectorAll('input[type="number"]')).toHaveLength(0);
        expect(container.querySelectorAll('select')).toHaveLength(0);
        expect(container.querySelectorAll('#options-container input')).toHaveLength(0);
    });

    test('criterio 4: presionar Iniciar Sesion responde en menos de 2000 ms y retira los botones', async () => {
        const { container } = render(<App />);
        const login = await screen.findByRole(
            'button',
            { name: /iniciar sesión/i },
            { timeout: 3000 },
        );

        const startedAt = Date.now();
        fireEvent.click(login);
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) =>
                        t.includes('correo electrónico y contraseña'),
                    ),
                ).toBe(true),
            { timeout: 3000 },
        );
        const total = Date.now() - startedAt;

        expect(total).toBeLessThan(2000);
        expect(userMessages(container)).toContain('Quiero iniciar sesión');
        expect(optionButtons(container)).toHaveLength(0);
    });

    test('criterio 5: presionar Registrarse responde en menos de 2000 ms y retira los botones', async () => {
        const { container } = render(<App />);
        const register = await screen.findByRole(
            'button',
            { name: /registrarse/i },
            { timeout: 3000 },
        );

        const startedAt = Date.now();
        fireEvent.click(register);
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) => t.includes('Para registrarte')),
                ).toBe(true),
            { timeout: 3000 },
        );
        const total = Date.now() - startedAt;

        expect(total).toBeLessThan(2000);
        expect(userMessages(container)).toContain('Quiero registrarme');
        expect(optionButtons(container)).toHaveLength(0);
    });

    test('criterio 6: el texto libre enruta los cuatro casos y siempre vacia el campo', async () => {
        const { container } = render(<App />);
        await screen.findByRole('button', { name: /iniciar sesión/i }, { timeout: 3000 });
        const input = () => container.querySelector('#chat-input') as HTMLInputElement;

        // (a) saludo -> repone los dos botones
        submit(container, 'hola');
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) =>
                        t.includes('Recuerda que puedes utilizar los botones'),
                    ),
                ).toBe(true),
            { timeout: 3000 },
        );
        expect(input().value).toBe('');
        expect(optionButtons(container)).toHaveLength(2);

        // (b) login -> dispara el flujo de inicio de sesion
        submit(container, 'quiero hacer login');
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) =>
                        t.includes('correo electrónico y contraseña'),
                    ),
                ).toBe(true),
            { timeout: 4000 },
        );
        expect(input().value).toBe('');
        expect(optionButtons(container)).toHaveLength(0);

        // (c) registro -> dispara el flujo de registro
        submit(container, 'registro');
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) => t.includes('Para registrarte')),
                ).toBe(true),
            { timeout: 4000 },
        );
        expect(input().value).toBe('');

        // (d) cualquier otro texto -> mensaje generico y repone los botones
        submit(container, 'quiero sacar un turno');
        await waitFor(
            () =>
                expect(
                    botReplies(container).some((t) =>
                        t.includes('Por favor selecciona una de las opciones'),
                    ),
                ).toBe(true),
            { timeout: 3000 },
        );
        expect(input().value).toBe('');
        expect(optionButtons(container)).toHaveLength(2);
    });

    test('criterio 7: el texto del usuario se muestra literal y no ejecuta HTML', async () => {
        const { container } = render(<App />);
        await screen.findByRole('button', { name: /iniciar sesión/i }, { timeout: 3000 });
        const payload =
            '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';

        submit(container, payload);
        await waitFor(() => expect(userMessages(container).length).toBeGreaterThan(0), {
            timeout: 3000,
        });

        const bubbles = [...container.querySelectorAll('.chat-message.user .message-bubble')];
        const last = bubbles[bubbles.length - 1];
        expect(last.textContent).toBe(payload);
        expect(last.querySelector('img')).toBeNull();
        expect(last.querySelector('script')).toBeNull();
        expect(container.querySelectorAll('img[src="x"]')).toHaveLength(0);
        expect((window as unknown as { __pwned?: number }).__pwned).not.toBe(1);
    });

    test('criterio 8: aplica docs/style.md (Inter, acento #2563eb, 48px, transiciones 0.15s/0.22s)', () => {
        // Se lee la fuente (los mismos archivos que Vite empaqueta).
        const root = process.cwd();
        const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
        const tokensCss = fs.readFileSync(
            path.join(root, 'src', 'styles', 'tokens.css'),
            'utf8',
        );
        const chatCss = fs.readFileSync(path.join(root, 'src', 'styles', 'chat.css'), 'utf8');

        expect(indexHtml).toMatch(/fonts\.googleapis\.com\/css2\?family=Inter/);

        expect(tokensCss).toMatch(/--primary:\s*#2563eb/);
        expect(tokensCss).toMatch(/--font-family:\s*'Inter'/);
        expect(tokensCss).toMatch(/--transition-fast:\s*0\.15s/);
        expect(tokensCss).toMatch(/--transition-normal:\s*0\.22s/);

        const pill = chatCss.match(/\.action-btn-pill\s*\{[^}]*\}/);
        expect(pill).not.toBeNull();
        expect(pill![0]).toMatch(/height:\s*48px/);
        expect(pill![0]).toMatch(/transition:\s*var\(--transition-normal\)/);
    });
});
