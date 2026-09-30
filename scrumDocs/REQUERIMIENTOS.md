# Requerimientos -- Profesionales

_Generado automaticamente el 2026-09-30T13:58:54.240Z -- no editar a mano, se sobreescribe en cada publicacion._

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

- El backend corre como aplicación Django y expone un endpoint de salud que responde 200 sin requerir autenticación.
- El formulario de inicio de sesión está disponible en la interfaz de chat y solicita correo electrónico yContraseña.
- Al enviar el formulario con un correo registrado y suContraseña correcta, la respuesta devuelve un token de sesión y la interfaz confirma el ingreso mostrando el correo del usuario autenticado.
- Al enviar el formulario con un correo que no está registrado, o con unaContraseña incorrecta para un correo existente, la respuesta indica credenciales no válidas y no devuelve token de sesión. El mensaje no distingue entre correo inexistente yContraseña incorrecta.
- La validación del formulario rechaza el envío, sin llamar al backend, cuando el correo o laContraseña están vacíos o el correo no tiene formato válido, mostrando el error en el campo correspondiente.
- El correo se normaliza a minúsculas: dos registros que difieren sólo en mayúsculas son la misma cuenta.
- LaContraseña nunca se devuelve en ninguna respuesta ni se escribe en los logs del servidor.

### RF-03: Registro de usuarios con perfil prestador de servicios (Funcional)

Permitir el registro de usuarios solicitando correo electrónico, contraseña, confirmación de contraseña e indicador de si presta servicios médicos. Todos los usuarios tienen capacidad de paciente; si marcan el indicador, quedan habilitados como profesionales médicos.

**Condiciones de aprobación**

- El formulario de registro está disponible en la interfaz de chat y solicita, en este orden: correo electrónico,Contraseña, confirmación deContraseña e indicador de si presta servicios médicos.
- Al registrarse sin marcar el indicador, la cuenta queda creada con capacidad de paciente.
- Al marcar el indicador, la cuenta queda creada con capacidad de profesional médico además de paciente.
- Al completar el registro, la respuesta confirma la creación y la interfaz inicia la sesión del usuario recién creado mostrando su correo y su capacidad.
- El correo de una cuenta ya existente no puede registrarse de nuevo: la respuesta indica que ese correo ya tiene cuenta. La verificación del duplicado es responsabilidad de RF-05.
- LaContraseña nunca se devuelve en ninguna respuesta ni se escribe en los logs del servidor.

### RF-04: Validación de coincidencia de contraseñas (Funcional)

Validar en el registro que la contraseña y la confirmación de contraseña coincidan exactamente antes de procesar el alta de usuario.

**Condiciones de aprobación**

- El formulario de registro no envía la solicitud al backend mientras laContraseña y su confirmación sean distintas.
- La comparación distingue mayúsculas de minúsculas: "Abc123" y "abc123" se consideran distintas y el envío se rechaza.
- La comparación distingue todos los caracteres, incluidos los espacios iniciales y finales: "abc123" y "abc123 " se consideran distintas y el envío se rechaza.
- Cuando las dosContraseñas coinciden, el campo de confirmación se marca como válido y el formulario habilita el envío.
- Cuando no coinciden, el error se muestra en el campo de confirmación, el envío queda bloqueado y la interfaz conserva el valor tipeado en el campo deContraseña.
- Si las dosContraseñas están vacías, coinciden entre sí y esta validación las acepta: en ese caso el rechazo lo produce la validación de campos obligatorios, no este criterio.

### RF-05: Notificación y control de correo duplicado (Funcional)

Verificar si el correo electrónico ingresado en el registro ya existe en la plataforma e informar/notificar al usuario en caso de duplicidad.

**Condiciones de aprobación**

- Antes de crear la cuenta, el backend verifica si el correo ya está registrado y la interfaz no da el alta hasta tener esa respuesta.
- La verificación de duplicado no distingue mayúsculas de minúsculas: un correo que sólo difiere en mayúsculas se considera duplicado.
- La verificación de duplicado se hace en el backend y no únicamente en el navegador: una solicitud enviada directamente al endpoint de registro con un correo existente también es rechazada.
- Si el correo no está registrado, el registro continúa el curso normal hasta la creación de la cuenta.
- Si el correo ya está registrado, no se crea ninguna cuenta nueva y la respuesta lo indica en el chat, no en una pantalla aparte.
- El mensaje de duplicado señala la acción posible —iniciar sesión con ese correo— sin revelar ningún dato adicional de la cuenta existente.

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

- Todo campo deContraseña de la plataforma aparece enmascarado al cargar la página, sin ninguna acción del usuario.
- Cada campo deContraseña tiene un botón de visibilidad asociado, con etiqueta accesible que dice si va a mostrar o a ocultar los caracteres.
- El botón alterna el estado del campo al que está asociado y sólo a ese: accione el de uno y el otro no cambia.
- El botón de visibilidad está disponible tanto en el formulario de inicio de sesión como en el de registro, y en todos los campos deContraseña de ambos formularios, incluido el de confirmación deContraseña del registro.
- Al ocultar de nuevo, el texto tipeado sigue siendo el mismo: el toggle no borra lo que el usuario escribió.
- El botón se opera con teclado y con puntero, y no interrumpe el orden de foco de los campos del formulario.
- El botón de visibilidad cumple el tamaño táctil mínimo de 44x44 px y respeta el contraste definido en docs/style.md.

## RO-01: Levantar los entornos de dev, testing y producción

### RF-01: Levantar el entorno local de dev con CORS para la app de Scrum (Funcional)

El proyecto sólo tenía un entorno único sin nombre, que no distingue dev de testing. La verificación de pruebas de la app necesita los entornos registrados: 'dev' y 'testing' corren en localhost porque QA valida contra la máquina donde se levanta la app, y sólo 'produccion' es una URL pública. Bloqueo conocido de esta tarjeta: el backend tiene que responder Access-Control-Allow-Origin al origen de la instancia de Scrum Master AI en dev y testing, porque la verificación se dispara desde el navegador. Es lo que RF-01 dejó anotado sin resolver.

**Condiciones de aprobación**

- El servidor de desarrollo corre en http://localhost:3000 mientras se valida, y la interfaz de chat carga en esa dirección.
- El backend responde CORS al origen de la instancia de Scrum Master AI, sólo en configuración de desarrollo.
- Un endpoint de salud del backend responde 200 sin autenticación desde esa dirección.
- La URL queda registrada en el proyecto como entorno 'dev' y es la que usa la verificación de pruebas.
- Existe un comando documentado que levanta el entorno local de punta a punta, para que cualquiera pueda repetir la verificación.

### RF-02: Levantar el entorno local de testing con CORS para la app de Scrum (Funcional)

Instancia donde QA valida los Requerimientos promoted desde dev antes de promover testing -> main. Sin esta URL, ninguna prueba de la app puede ejecutarse.

**Condiciones de aprobación**

- La instancia de prueba corre en http://localhost:8000 y la interfaz de chat carga en esa dirección.
- El backend responde CORS al origen de la instancia de Scrum Master AI, sólo en configuración de desarrollo.
- Un endpoint de salud del backend responde 200 sin autenticación desde esa dirección.
- La URL queda registrada en el proyecto como entorno 'testing'.
- Un Requerimiento promovido a in_testing se puede observar en esta dirección, que es la base contra la que QA corre las pruebas.
- QA no necesita descartar ningún requisito por no tener dónde probarlo.

### RF-03: Preparar la máquina de producción con dominio, certificado y backups (Funcional)

Instancia donde corre la rama main. Sólo el Project Manager puede promover testing -> main, así que esta tarjeta tiene que estar resuelta antes de la primera promoción a producción.

**Condiciones de aprobación**

- La rama main está desplegada en el dominio final del proyecto con un certificado TLS válido y vigente.
- El dominio resuelve al servidor y la interfaz de chat carga por HTTPS sin avisos de certificado.
- La URL queda registrada en el proyecto como entorno de producción.
- Las variables de entorno de producción están definidas y la configuración no arrastra ningún secreto de desarrollo.
- Hay un backup automático configurado y se verificó al menos una restauración.
- El backend NO responde CORS al origen de la app de Scrum en producción.
