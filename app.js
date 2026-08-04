/**
 * App Logic for Profesionales Platform
 * Implementation of RF-01: Interfaz gráfica de chat y bienvenida con botones interactivos.
 */

document.addEventListener('DOMContentLoaded', () => {
    const messagesList = document.getElementById('messages-list');
    const optionsContainer = document.getElementById('options-container');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    // Helper: Formats current time as HH:MM
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Helper: Renders a message bubble in the stream
    function appendMessage(sender, text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;

        const senderSpan = document.createElement('span');
        senderSpan.className = 'message-sender';
        senderSpan.textContent = sender;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();

        msgDiv.appendChild(senderSpan);
        msgDiv.appendChild(bubbleDiv);
        msgDiv.appendChild(timeSpan);

        messagesList.appendChild(msgDiv);
        messagesList.scrollTop = messagesList.scrollHeight;
    }

    // Helper: Shows typing indicator before bot replies
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesList.appendChild(indicator);
        messagesList.scrollTop = messagesList.scrollHeight;
        return indicator;
    }

    // Helper: Removes typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Renders interactive option buttons (RF-01 requirement: Direct buttons instead of typing option numbers)
    function renderInitialOptions() {
        optionsContainer.innerHTML = '';

        // Login Button
        const btnLogin = document.createElement('button');
        btnLogin.id = 'btn-login';
        btnLogin.className = 'action-btn-pill primary-filled';
        btnLogin.type = 'button';
        btnLogin.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Iniciar Sesión
        `;
        btnLogin.addEventListener('click', () => handleOptionSelection('login'));

        // Register Button
        const btnRegister = document.createElement('button');
        btnRegister.id = 'btn-register';
        btnRegister.className = 'action-btn-pill';
        btnRegister.type = 'button';
        btnRegister.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Registrarse
        `;
        btnRegister.addEventListener('click', () => handleOptionSelection('register'));

        optionsContainer.appendChild(btnLogin);
        optionsContainer.appendChild(btnRegister);
    }

    // Handles option button clicks
    function handleOptionSelection(option) {
        if (option === 'login') {
            appendMessage('Tú', 'Quiero iniciar sesión', true);
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                appendMessage('Asistente Profesionales', '¡Excelente! Ingresa tu correo electrónico y contraseña para acceder a la plataforma.');
                optionsContainer.innerHTML = '';
            }, 600);
        } else if (option === 'register') {
            appendMessage('Tú', 'Quiero registrarme', true);
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                appendMessage('Asistente Profesionales', '¡Genial! Para registrarte, por favor completa tu correo electrónico, contraseña e indica si vas a prestar servicios médicos.');
                optionsContainer.innerHTML = '';
            }, 600);
        }
    }

    // Free form chat input handler
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userText = chatInput.value.trim();
        if (!userText) return;

        appendMessage('Tú', userText, true);
        chatInput.value = '';

        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            const lower = userText.toLowerCase();
            if (lower.includes('hola') || lower.includes('buenas') || lower.includes('inicio')) {
                appendMessage('Asistente Profesionales', '¡Hola! Recuerda que puedes utilizar los botones directos para Iniciar Sesión o Registrarte.');
                renderInitialOptions();
            } else if (lower.includes('login') || lower.includes('iniciar')) {
                handleOptionSelection('login');
            } else if (lower.includes('registro') || lower.includes('registrar')) {
                handleOptionSelection('register');
            } else {
                appendMessage('Asistente Profesionales', 'Entendido. Por favor selecciona una de las opciones principales para continuar con tu gestión en la red de salud:');
                renderInitialOptions();
            }
        }, 700);
    });

    // Initialize RF-01 Flow
    function initWelcomeFlow() {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            appendMessage(
                'Asistente Profesionales',
                '👋 <strong>¡Hola! Bienvenid@ a Profesionales</strong><br>La plataforma integral para la gestión de turnos y conexión con servicios de salud. ¿Cómo deseas continuar hoy?'
            );
            renderInitialOptions();
        }, 500);
    }

    initWelcomeFlow();
});
