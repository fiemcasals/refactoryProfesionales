# Historias de Usuario -- Profesionales

_Generado automaticamente el 2026-08-07T13:28:15.556Z -- no editar a mano, se sobreescribe en cada publicacion._

## HU-01: Interfaz de Bienvenida, Autenticación y Registro de Usuarios con Prestación de Servicios

Como usuario de la plataforma (paciente o profesional), quiero acceder a la interfaz gráfica de chat para iniciar sesión o registrarme indicando si presto servicios médicos, para poder acceder al sistema con el perfil adecuado y conectar con la red de salud.

### Criterios de Aceptacion

- Al acceder a https://profesionales.misitiowebpersonal.com.ar/, el sistema muestra la interfaz gráfica de chat y un mensaje de bienvenida.
- Permite iniciar sesión con correo y contraseña. El campo de contraseña está oculto por defecto con ícono de ojo para mostrar/ocultar.
- El registro solicita: Correo electrónico, Contraseña (con ojo), Confirmación de contraseña (con ojo) e Indicador de si presta servicios médicos.
- Se valida que las contraseñas coincidan exactamente.
- Si el correo ya existe, notifica al usuario.

### Detalle Tecnico y Reglas de Negocio

Todos los usuarios tienen capacidad de paciente; aquellos que marquen que prestan servicios quedan habilitados como profesionales médicos. Los campos de contraseña disponen de toggle de visibilidad.

## HU-02: Gestión de Perfil de Profesional / Paciente

Como usuario registrado, quiero ver y editar la información de mi perfil (datos personales y de prestación de servicios), para mantener actualizada mi información en la plataforma.

### Criterios de Aceptacion

- Permite visualizar los datos personales.
- Permite actualizar la configuración de prestación de servicios.
- Guarda los cambios exitosamente.

### Detalle Tecnico y Reglas de Negocio

Campos editables según el perfil prestador activo.
