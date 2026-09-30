from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import LoginSerializer

# Criterio 4: mensaje único. No distingue entre correo inexistente
# y contraseña incorrecta (no enumerar usuarios).
INVALID_CREDENTIALS = 'Credenciales no válidas.'


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Criterio 1: 200 sin autenticación."""
    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        # Body malformado (falta un campo, email inválido). Es 400 con el
        # detalle del campo: no revela si la cuenta existe, así que no viola
        # el criterio 4. El formulario (criterio 5) valida antes de llamar.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(
        request,
        username=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
    )
    if user is None:
        # Criterio 4: genérico y sin token. Nunca se loguea el body
        # (Django no loguea cuerpos; acá tampoco se loguea nada manual).
        return Response({'detail': INVALID_CREDENTIALS}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    # Criterio 7: la respuesta trae token y email. Nunca la contraseña.
    return Response({'token': token.key, 'email': user.email})
