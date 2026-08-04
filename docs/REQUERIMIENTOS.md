# Requerimientos -- Profesionales

Sincronizados desde Scrum Master AI.

## HU-01: Interfaz de Bienvenida, Autenticación y Registro de Usuarios con Prestación de Servicios

### RF-01: Interfaz gráfica de chat y bienvenida
- **Tipo**: Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: -
- **Descripción**: Al acceder a la plataforma (`https://profesionales.misitiowebpersonal.com.ar/`), mostrar interfaz en formato chat con mensaje de bienvenida y opciones presentadas directamente como botones interactivos para inicio de sesión o registro (sin requerir ingresar texto ni números de opción).

### RF-04: Validación de coincidencia de contraseñas
- **Tipo**: Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: RF-01
- **Descripción**: Validar en el registro que la contraseña y la confirmación de contraseña coincidan exactamente antes de procesar el alta de usuario.

### RF-05: Notificación y control de correo duplicado
- **Tipo**: Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: RF-04
- **Descripción**: Verificar si el correo electrónico ingresado en el registro ya existe en la plataforma e informar/notificar al usuario en caso de duplicidad.

### RF-03: Registro de usuarios con perfil prestador de servicios
- **Tipo**: Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: RF-04, RF-05
- **Descripción**: Permitir el registro de usuarios solicitando correo electrónico, contraseña, confirmación de contraseña e indicador de si presta servicios médicos. Todos los usuarios tienen capacidad de paciente; si marcan el indicador, quedan habilitados como profesionales médicos.

### RF-02: Autenticación de usuarios (Inicio de Sesión)
- **Tipo**: Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: RF-01, RF-03
- **Descripción**: Permitir el inicio de sesión solicitando correo electrónico y contraseña. El campo de contraseña debe disponer de un ícono de ojo para alternar su visibilidad.

### RNF-01: Ocultamiento y visibilidad toggle en campos de contraseña
- **Tipo**: No Funcional
- **Estado**: Por hacer (`to_do`)
- **Depende de**: RF-02, RF-03
- **Descripción**: Los campos de contraseña en inicio de sesión y registro deben ocultar por defecto el texto tipeado e incluir un botón/ícono de ojo para mostrar u ocultar los caracteres.