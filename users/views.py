from rest_framework import generics, permissions

from .models import CustomUser
from .serializers import UserRegistrationSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    Vista de API para registrar un nuevo usuario.
    Acepta peticiones POST con los datos del usuario y crea una
    nueva instancia
    """

    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer


class UserProfileView(generics.RetrieveAPIView):
    """
    Vista de API para obtener el perfil del usuario autenticado.
    Acepta peticiones GET y devuelve los datos del usuario.
    """

    serializer_class = UserRegistrationSerializer

    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        Este método le dice a la vista cómo obtener el objetivo que debe mostrar.
        En lugar de buscar un ID en la URL,
        simplemente devolvemos el usuario autenticado.
        """
        return self.request.user
