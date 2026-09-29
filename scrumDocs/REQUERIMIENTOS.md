# Requerimientos -- Profesionales

_Generado automaticamente el 2026-09-29T13:15:51.346Z -- no editar a mano, se sobreescribe en cada publicacion._

## HU-01: Interfaz de Bienvenida, Autenticación y Registro de Usuarios con Prestación de Servicios

### RF-01: Interfaz gráfica de chat y bienvenida (Funcional)

Al acceder a la plataforma (https://profesionales.misitiowebpersonal.com.ar/), mostrar interfaz en formato chat con mensaje de bienvenida y opciones presentadas directamente como botones interactivos para inicio de sesion o registro (sin requerir ingresar texto ni numeros de opcion).

**Condiciones de aprobación**

- Al acceder a la raíz de la plataforma se renderiza la interfaz de chat completa: cabecera con la marca "Profesionales" y el estado "Asistente en línea", el área de mensajes #messages-list, la barra de opciones #options-container y el campo de entrada #chat-input.
- Entre 0 ms y 3.000 ms después de cargar la página, el área de mensajes contiene un mensaje del emisor "Asistente Profesionales" con el texto "¡Hola! Bienvenid@ a Profesionales".
- La bienvenida deja disponibles exactamente dos botones, #btn-login y #btn-register, ambos de tipo button, dentro de #options-container. No existe ningún control que exija ingresar un número de opción ni escribir texto para elegir entre iniciar sesión o registrarse.
- Al presionar #btn-login se agrega al chat el mensaje del usuario "Quiero iniciar sesión" y, dentro de los 2.000 ms siguientes, el asistente responde indicando ingresar correo y contraseña; #options-container queda sin botones.
- Al presionar #btn-register se agrega al chat el mensaje del usuario "Quiero registrarme" y, dentro de los 2.000 ms siguientes, el asistente responde indicando los datos de registro; #options-container queda sin botones.
- El formulario #chat-form enruta el texto enviado y en los cuatro casos deja #chat-input vacío: (a) contiene "hola", "buenas" o "inicio" → el asistente responde el saludo y repone #btn-login y #btn-register; (b) contiene "login" o "iniciar" → dispara el flujo idéntico a presionar #btn-login; (c) contiene "registro" o "registrar" → dispara el flujo idéntico a presionar #btn-register; (d) cualquier otro texto → el asistente pide elegir una opción y repone los dos botones.
- El texto que envía el usuario se muestra literalmente: una cadena que contiene marcado HTML no se interpreta, no incorpora elementos al DOM y no ejecuta scripts en la página.
- La interfaz aplica docs/style.md: tipografía Inter vía Google Fonts, --primary #2563eb como único acento interactivo, botones .action-btn-pill con height 48px (>= 44px táctil) y transiciones de 0,15 s y 0,22 s.

### RF-02: Autenticación de usuarios (Inicio de Sesión) (Funcional)

Permitir el inicio de sesión solicitando correo electrónico y contraseña.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-03: Registro de usuarios con perfil prestador de servicios (Funcional)

Permitir el registro de usuarios solicitando correo electrónico, contraseña, confirmación de contraseña e indicador de si presta servicios médicos. Todos los usuarios tienen capacidad de paciente; si marcan el indicador, quedan habilitados como profesionales médicos.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-04: Validación de coincidencia de contraseñas (Funcional)

Validar en el registro que la contraseña y la confirmación de contraseña coincidan exactamente antes de procesar el alta de usuario.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-05: Notificación y control de correo duplicado (Funcional)

Verificar si el correo electrónico ingresado en el registro ya existe en la plataforma e informar/notificar al usuario en caso de duplicidad.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._

### RF-06: Reimplementar la interfaz de chat y bienvenida sobre React + Vite (Funcional)

La interfaz de RF-01 se implementó en HTML/CSS/JS plano, pero el stack del proyecto es Django + React/Vite. Rehacerla como aplicación React construida con Vite en frontend/ (React + TypeScript), conservando el comportamiento, los ids del DOM (#main-header, #messages-list, #options-container, #chat-input, #chat-form, #btn-login, #btn-register) y las condiciones de aceptación de RF-01. Los archivos estáticos de la raíz (index.html, app.js, styles.css) y la suite jsdom que los cubre NO se modifican ni se borran en esta tarjeta: RF-01 está en producción y su prueba de humo los requiere. El backend Django se arma en RF-02.

**Condiciones de aprobación**

- Al acceder a la raíz de la plataforma se renderiza la interfaz de chat completa: cabecera con la marca "Profesionales" y el estado "Asistente en línea", el área de mensajes #messages-list, la barra de opciones #options-container y el campo de entrada #chat-input.
- Entre 0 ms y 3.000 ms después de cargar la página, el área de mensajes contiene un mensaje del emisor "Asistente Profesionales" con el texto "¡Hola! Bienvenid@ a Profesionales".
- La bienvenida deja disponibles exactamente dos botones, #btn-login y #btn-register, ambos de tipo button, dentro de #options-container. No existe ningún control que exija ingresar un número de opción ni escribir texto para elegir entre iniciar sesión o registrarse.
- Al presionar #btn-login se agrega al chat el mensaje del usuario "Quiero iniciar sesión" y, dentro de los 2.000 ms siguientes, el asistente responde indicando ingresar correo y contraseña; #options-container queda sin botones.
- Al presionar #btn-register se agrega al chat el mensaje del usuario "Quiero registrarme" y, dentro de los 2.000 ms siguientes, el asistente responde indicando los datos de registro; #options-container queda sin botones.
- El formulario #chat-form enruta el texto enviado y en los cuatro casos deja #chat-input vacío: (a) contiene "hola", "buenas" o "inicio" → el asistente responde el saludo y repone #btn-login y #btn-register; (b) contiene "login" o "iniciar" → dispara el flujo idéntico a presionar #btn-login; (c) contiene "registro" o "registrar" → dispara el flujo idéntico a presionar #btn-register; (d) cualquier otro texto → el asistente pide elegir una opción y repone los dos botones.
- El texto que envía el usuario se muestra literalmente: una cadena que contiene marcado HTML no se interpreta, no incorpora elementos al DOM y no ejecuta scripts en la página.
- La interfaz aplica docs/style.md: tipografía Inter vía Google Fonts, --primary #2563eb como único acento interactivo, botones .action-btn-pill con height 48px (>= 44px táctil) y transiciones de 0,15 s y 0,22 s.
- cd frontend && npm run build compila la aplicación React sin errores.
- cd frontend && npm test corre la suite completa en verde, con al menos un test automatizado por cada una de estas condiciones. El criterio 7 se cumple por construcción —React escapa el texto del usuario— y no mediante un sanitize manual.

### RNF-01: Ocultamiento y visibilidad toggle en campos de contraseña (No funcional)

Los campos de contraseña en inicio de sesión y registro deben ocultar por defecto el texto tipeado e incluir un botón/ícono de ojo para mostrar u ocultar los caracteres.

**Condiciones de aprobación**

_Sin condiciones de aprobación cargadas: pedíselas al Project Manager o al Scrum Master antes de darlo por terminado._
