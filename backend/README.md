# Backend de la plataforma Profesionales (RF-02: autenticación).
# Django + DRF. SQLite local. Solo desarrollo.

## Requisitos

- Python 3.10+ y `pip install -r requirements.txt`.

## Comandos (desde `backend/`)

```bash
# Migraciones (la primera vez, y cada vez que cambie un modelo)
python manage.py migrate

# Usuario de prueba para desarrollo y QA manual (idempotente)
python manage.py seed_user
#   email:    qa@profesionales.local
#   password: Profesionales123

# Servidor de desarrollo (puerto 8000)
python manage.py runserver

# Suite de RF-02 (tramo backend)
python manage.py test accounts
```

## Endpoints

| Método | Ruta | Auth | Respuestas |
|---|---|---|---|
| GET | `/api/health/` | no | `200 {"status":"ok"}` |
| POST | `/api/auth/login/` | no | `200 {"token","email"}` · `401 {"detail":"Credenciales no válidas."}` · `400` si falta un campo |

El `401` es el mismo para correo inexistente y contraseña incorrecta
(criterio 4: no enumerar usuarios). La contraseña nunca vuelve en una
respuesta (criterio 7). El correo se normaliza a minúsculas (criterio 6).

## Producción

No usar `settings_dev.py`. Exportar `DJANGO_SETTINGS_MODULE=config.settings`
y `DJANGO_SECRET_KEY` con un valor propio. CORS solo lleva orígenes exactos,
nunca `*`.
