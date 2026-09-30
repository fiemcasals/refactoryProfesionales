import type { ReactNode } from 'react';
import { WELCOME_TEXT } from './texts';

/**
 * Saludo de bienvenida con markup. Es un literal de este repo
 * (emoji + <strong> + <br>), el único mensaje que no es texto plano.
 * El `textContent` coincide con WELCOME_TEXT.
 */
export const WELCOME_CONTENT: ReactNode = (
    <>
        👋 <strong>¡Hola! Bienvenid@ a Profesionales</strong>
        <br />
        La plataforma integral para la gestión de turnos y conexión con servicios de salud. ¿Cómo
        deseas continuar hoy?
    </>
);

export { WELCOME_TEXT };
