# Plan de Requerimientos — Profesionales

_Generado automáticamente el 2026-08-14T16:50:46.947Z — no editar a mano, se sobreescribe en cada publicación._

Orden sugerido de desarrollo (respeta dependencias entre Requerimientos). Cada fila indica de qué Requerimientos depende, si tiene.

| Orden | Código | Requerimiento | Historia de Usuario | Módulo | Entrega | Estado | Desarrollador | Depende de | Rechazos |
|---|---|---|---|---|---|---|---|---|---|
| 1 | RF-01 | Interfaz gráfica de chat y bienvenida | HU-01 | — | — | Haciendo | Sin asignar | — | — |
| 2 | RF-04 | Validación de coincidencia de contraseñas | HU-01 | — | — | Hacer | Sin asignar | RF-01 | — |
| 3 | RF-05 | Notificación y control de correo duplicado | HU-01 | — | — | Hacer | scrum-prof | RF-04 | — |
| 4 | RF-03 | Registro de usuarios con perfil prestador de servicios | HU-01 | — | — | Hacer | qa-prof | RF-04, RF-05 | — |
| 5 | RF-02 | Autenticación de usuarios (Inicio de Sesión) | HU-01 | — | — | Hacer | Sin asignar | RF-01, RF-03 | — |
| 6 | RNF-01 | Ocultamiento y visibilidad toggle en campos de contraseña | HU-01 | — | — | Hacer | Sin asignar | RF-02, RF-03 | — |

## Detalle

### RF-01 — Interfaz gráfica de chat y bienvenida
Trabajo finalizado en la rama feature/general/req-1785771199977-interfaz-grafica-de-chat-y-bienvenida y pusheado a origin.
- Estimado: 5h

### RF-04 — Validación de coincidencia de contraseñas
- Estimado: 5h

### RF-05 — Notificación y control de correo duplicado
- Estimado: 5h

### RF-03 — Registro de usuarios con perfil prestador de servicios
- Estimado: 5h

### RF-02 — Autenticación de usuarios (Inicio de Sesión)
- Estimado: 5h

### RNF-01 — Ocultamiento y visibilidad toggle en campos de contraseña
- Estimado: 5h
