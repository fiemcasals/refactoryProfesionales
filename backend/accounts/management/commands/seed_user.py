from django.core.management.base import BaseCommand

from accounts.models import User

# Usuario de prueba para desarrollo y QA manual. Solo local: la base es
# SQLite y este comando no existe en producción.
SEED_EMAIL = 'qa@profesionales.local'
SEED_PASSWORD = 'Profesionales123'


class Command(BaseCommand):
    help = 'Crea el usuario de prueba para desarrollo (idempotente).'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email=SEED_EMAIL,
            defaults={'is_staff': False, 'is_superuser': False},
        )
        if created:
            user.set_password(SEED_PASSWORD)
            user.save()
            self.stdout.write(f'creado {SEED_EMAIL}')
        else:
            self.stdout.write(f'ya existía {SEED_EMAIL}')
