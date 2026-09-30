import { useState } from 'react';
import type { FormEvent } from 'react';
import { InvalidCredentials, login } from '../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de inicio de sesión (RF-02 criterio 2).
 * Valida en el cliente sin llamar al backend cuando falta un dato
 * o el correo no tiene formato válido (criterio 5), mostrando el error
 * en el campo correspondiente. `noValidate` desactiva la validación
 * nativa del navegador para que corra la nuestra.
 */
export function LoginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const eErr = !email.trim()
            ? 'Ingresá tu correo.'
            : !EMAIL_RE.test(email.trim())
              ? 'El correo no tiene un formato válido.'
              : '';
        const pErr = !password ? 'Ingresá tu contraseña.' : '';
        setEmailError(eErr);
        setPasswordError(pErr);
        setFormError('');
        if (eErr || pErr) return; // Sin fetch (criterio 5).

        setBusy(true);
        try {
            const session = await login(email.trim(), password);
            onSuccess(session.email);
        } catch (err) {
            setFormError(
                err instanceof InvalidCredentials
                    ? err.message
                    : 'No se pudo iniciar sesión. Probá de nuevo.',
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <form id="login-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
                <label htmlFor="login-email">Correo electrónico</label>
                <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={emailError !== ''}
                    aria-describedby={emailError ? 'login-email-error' : undefined}
                />
                {emailError !== '' && (
                    <span id="login-email-error" className="field-error" data-field="email">
                        {emailError}
                    </span>
                )}
            </div>
            <div className="auth-field">
                <label htmlFor="login-password">Contraseña</label>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={passwordError !== ''}
                    aria-describedby={passwordError ? 'login-password-error' : undefined}
                />
                {passwordError !== '' && (
                    <span
                        id="login-password-error"
                        className="field-error"
                        data-field="password"
                    >
                        {passwordError}
                    </span>
                )}
            </div>
            {formError !== '' && (
                <p className="form-error" role="alert">
                    {formError}
                </p>
            )}
            <button
                type="submit"
                className="action-btn-pill primary-filled"
                disabled={busy}
            >
                {busy ? 'Ingresando…' : 'Ingresar'}
            </button>
        </form>
    );
}
