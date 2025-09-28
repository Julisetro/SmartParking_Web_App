from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import (
    ChangePasswordSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
)


class UserRegistrationView(generics.CreateAPIView):
    """
    Vista de API para registrar un nuevo usuario.
    Acepta peticiones POST con los datos del usuario y crea una
    nueva instancia
    """

    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista de API para obtener el perfil del usuario autenticado.
    Acepta peticiones GET y devuelve los datos del usuario.
    """

    permission_classes = [permissions.IsAuthenticated]

    serializer_class = UserRegistrationSerializer

    def get_object(self):
        """
        Este método le dice a la vista cómo obtener el objetivo que debe mostrar.
        En lugar de buscar un ID en la URL,
        simplemente devolvemos el usuario autenticado.
        """
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return self.serializer_class


class ChangePasswordView(generics.UpdateAPIView):
    """
    Vista de API para cambiar la contraseña del usuario autenticado.
    Acepta peticiones PUT con la contraseña antigua y la nueva.
    """

    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Este método maneja la petición POST para cambiar la contraseña.
        Verifica que la contraseña antigua sea correcta y que la nueva
        cumpla con los requisitos de seguridad.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Devolvemos el usuario autenticado
        user = self.request.user

        # Verificamos que la contraseña antigua sea correcta
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": ["La contraseña antigua es incorrecta."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Si la contraseña es correcta, la cambiamos
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response(
            {"detail": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK
        )
