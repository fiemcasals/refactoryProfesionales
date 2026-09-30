import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatOption } from '../types';
import {
    BOT_GENERIC,
    BOT_GREETING,
    BOT_LOGIN,
    BOT_REGISTER,
    SENDER_BOT,
    SENDER_USER,
    USER_LOGIN,
    USER_REGISTER,
    WELCOME_TEXT,
} from '../lib/texts';
import { WELCOME_CONTENT } from '../lib/welcome';
import { routeText } from '../lib/routing';
import { currentTime } from '../lib/time';

/** Tiempos del flujo, idénticos a los de app.js (RF-01). */
export const WELCOME_DELAY = 500;
export const OPTION_DELAY = 600;
export const TEXT_DELAY = 700;

/**
 * Máquina de estado del chat. Reproduce el flujo de RF-01:
 * bienvenida automática, dos botones, y enrutado del texto libre
 * en los cuatro casos, siempre vaciando el campo.
 */
export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [typing, setTyping] = useState(false);
    /** RF-02: email de la sesión activa, o null si no hay. */
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);
    /** RF-02: el formulario de login vive dentro del chat. */
    const [loginFormVisible, setLoginFormVisible] = useState(false);
    const idRef = useRef(0);
    const timersRef = useRef<number[]>([]);

    const later = useCallback((fn: () => void, ms: number) => {
        const id = window.setTimeout(fn, ms);
        timersRef.current.push(id);
    }, []);

    // No dejar timers colgados al desmontar.
    useEffect(() => {
        const timers = timersRef.current;
        return () => timers.forEach((t) => window.clearTimeout(t));
    }, []);

    const push = useCallback((msg: Omit<ChatMessage, 'id' | 'time'>) => {
        idRef.current += 1;
        const entry: ChatMessage = { ...msg, id: idRef.current, time: currentTime() };
        setMessages((prev) => [...prev, entry]);
    }, []);

    const answerLogin = useCallback(() => {
        push({ sender: SENDER_BOT, isUser: false, text: BOT_LOGIN });
        setOptionsVisible(false);
        // RF-02: mostrar el formulario de inicio de sesión en el chat.
        setLoginFormVisible(true);
    }, [push]);

    /** RF-02 criterio 3: confirma el ingreso mostrando el correo. */
    const confirmLogin = useCallback(
        (email: string) => {
            setLoginFormVisible(false);
            setSessionEmail(email);
            push({ sender: SENDER_BOT, isUser: false, text: `Sesión iniciada como ${email}.` });
        },
        [push],
    );

    const answerRegister = useCallback(() => {
        push({ sender: SENDER_BOT, isUser: false, text: BOT_REGISTER });
        setOptionsVisible(false);
    }, [push]);

    /** Flujo completo de una opción: mensaje del usuario, espera y respuesta. */
    const runOptionFlow = useCallback(
        (option: ChatOption) => {
            push({
                sender: SENDER_USER,
                isUser: true,
                text: option === 'login' ? USER_LOGIN : USER_REGISTER,
            });
            setTyping(true);
            later(() => {
                setTyping(false);
                if (option === 'login') answerLogin();
                else answerRegister();
            }, OPTION_DELAY);
        },
        [push, answerLogin, answerRegister, later],
    );

    /** Click en #btn-login o #btn-register. */
    const selectOption = useCallback(
        (option: ChatOption) => {
            runOptionFlow(option);
        },
        [runOptionFlow],
    );

    /** Envío del formulario #chat-form. */
    const submitText = useCallback(
        (raw: string) => {
            const userText = raw.trim();
            if (!userText) return;

            push({ sender: SENDER_USER, isUser: true, text: userText });
            setTyping(true);
            later(() => {
                setTyping(false);
                // Con sesión activa no se reponen los botones: ya no tiene
                // sentido ofrecer Iniciar Sesión / Registrarse (fix reportado
                // en testeo manual de RF-02).
                if (sessionEmail !== null) {
                    if (routeText(userText) === 'greeting') {
                        push({
                            sender: SENDER_BOT,
                            isUser: false,
                            text: `¡Hola! Ya iniciaste sesión como ${sessionEmail}.`,
                        });
                    } else {
                        push({
                            sender: SENDER_BOT,
                            isUser: false,
                            text: `Ya iniciaste sesión como ${sessionEmail}.`,
                        });
                    }
                    return;
                }
                const route = routeText(userText);
                if (route === 'greeting') {
                    push({ sender: SENDER_BOT, isUser: false, text: BOT_GREETING });
                    setOptionsVisible(true);
                } else if (route === 'login' || route === 'register') {
                    // Flujo idéntico a presionar el botón (incluye su mensaje).
                    // El indicador ya está visible; solo se programa la respuesta.
                    runOptionFlow(route);
                } else {
                    push({ sender: SENDER_BOT, isUser: false, text: BOT_GENERIC });
                    setOptionsVisible(true);
                }
            }, TEXT_DELAY);
        },
        [push, runOptionFlow, later, sessionEmail],
    );

    // Bienvenida automática al montar.
    useEffect(() => {
        setTyping(true);
        const t = window.setTimeout(() => {
            setTyping(false);
            push({
                sender: SENDER_BOT,
                isUser: false,
                text: WELCOME_TEXT,
                rich: WELCOME_CONTENT,
            });
            setOptionsVisible(true);
        }, WELCOME_DELAY);
        return () => window.clearTimeout(t);
        // Se ejecuta una sola vez al montar. Sin StrictMode a propósito:
        // el doble-montaje duplicaría el saludo (ver main.tsx).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { messages, typing, optionsVisible, loginFormVisible, selectOption, submitText, confirmLogin };
}
