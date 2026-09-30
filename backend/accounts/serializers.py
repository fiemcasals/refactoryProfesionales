from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    # write_only: la contraseña nunca sale en una respuesta (criterio 7).
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        # Criterio 6: normalizar a minúsculas antes de buscar.
        return value.strip().lower()
