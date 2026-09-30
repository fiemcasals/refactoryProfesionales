from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def _normalize(self, email: str) -> str:
        # Criterio 6: el correo se normaliza a minúsculas.
        return (email or '').strip().lower()

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo es obligatorio.')
        user = self.model(email=self._normalize(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        # authenticate() usa este método: normaliza antes de buscar,
        # así "Usuario@X.com" entra igual que "usuario@x.com" (criterio 6).
        return self.get(email=self._normalize(email))


class User(AbstractBaseUser, PermissionsMixin):
    """Usuario identificado por correo. Sin username."""

    email = models.EmailField('correo electrónico', unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    def __str__(self) -> str:
        return self.email
