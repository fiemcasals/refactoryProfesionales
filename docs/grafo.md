# Grafo de Dependencias -- Profesionales

_Generado automaticamente el 2026-08-07T13:28:26.199Z -- no editar a mano, se sobreescribe en cada publicacion._

```mermaid
graph TD
  subgraph US_1785510643692["HU-01: Interfaz de Bienvenida, Autenticación y Registro de Usuarios con Prestación de Servicios"]
    REQ_1785771199977["RF-01: Interfaz gráfica de chat y bienvenida"]
    REQ_1785771214294["RF-02: Autenticación de usuarios (Inicio de Sesión)"]
    REQ_1785771214393["RF-03: Registro de usuarios con perfil prestador de servicios"]
    REQ_1785771214462["RF-04: Validación de coincidencia de contraseñas"]
    REQ_1785771214528["RF-05: Notificación y control de correo duplicado"]
    REQ_1785771214595["RNF-01: Ocultamiento y visibilidad toggle en campos de contraseña"]
  end
  REQ_1785771199977 --> REQ_1785771214294
  REQ_1785771214393 --> REQ_1785771214294
  REQ_1785771214462 --> REQ_1785771214393
  REQ_1785771214528 --> REQ_1785771214393
  REQ_1785771199977 --> REQ_1785771214462
  REQ_1785771214462 --> REQ_1785771214528
  REQ_1785771214294 --> REQ_1785771214595
  REQ_1785771214393 --> REQ_1785771214595
```