"""Settings de desarrollo. NUNCA usar en producción."""
from .settings import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', *MIDDLEWARE]

# Solo orígenes conocidos, nunca '*'. El de la instancia de Scrum es para que
# QA pueda correr "Verificación en vivo" desde la app; los localhost son para
# el desarrollo local (RF-01 estático en :3000, RF-06 Vite en :5174).
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5174',
    'https://scrum.misitiowebpersonal.com.ar',
]
