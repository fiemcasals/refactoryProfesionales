# Plan de Requerimientos — Profesionales

Orden sugerido de desarrollo (respeta dependencias entre Requerimientos). Cada fila indica de qué Requerimientos depende, si tiene.

| Orden | Código | Requerimiento | Historia de Usuario | Módulo | Entrega | Estado | Desarrollador | Depende de | Rechazos |
|---|---|---|---|---|---|---|---|---|---|
| 1 | RF-01 | Interfaz gráfica de chat y bienvenida | HU-01 | - | - | Por hacer | Unassigned | - | 0 |
| 2 | RF-04 | Validación de coincidencia de contraseñas | HU-01 | - | - | Por hacer | Unassigned | RF-01 | 0 |
| 3 | RF-05 | Notificación y control de correo duplicado | HU-01 | - | - | Por hacer | Unassigned | RF-04 | 0 |
| 4 | RF-03 | Registro de usuarios con perfil prestador de servicios | HU-01 | - | - | Por hacer | Unassigned | RF-04, RF-05 | 0 |
| 5 | RF-02 | Autenticación de usuarios (Inicio de Sesión) | HU-01 | - | - | Por hacer | Unassigned | RF-01, RF-03 | 0 |
| 6 | RNF-01 | Ocultamiento y visibilidad toggle en campos de contraseña | HU-01 | - | - | Por hacer | Unassigned | RF-02, RF-03 | 0 |

## Detalle
- **RF-01**: Interfaz gráfica de chat y bienvenida
- **RF-04**: Validación de coincidencia de contraseñas
- **RF-05**: Notificación y control de correo duplicado
- **RF-03**: Registro de usuarios con perfil prestador de servicios
- **RF-02**: Autenticación de usuarios (Inicio de Sesión)
- **RNF-01**: Ocultamiento y visibilidad toggle en campos de contraseña
