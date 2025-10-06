from django.urls import path

# Se importan las vistas de Simple JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    ChangeCelularConfirmView,
    ChangeCelularRequestView,
    ChangeEmailConfirmView,
    ChangeEmailRequestView,
    ChangePasswordView,
    LogoutView,
    UserProfileView,
    UserRegistrationView,
)

# La variable "urlpatterns" es una lista que Django busca
# para encontrar las rutas de la aplicación
urlpatterns = [
    # Define la ruta para el resgistro de usuarios
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    # Nueva URL para que un usuario inicie sesión.
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # Nueva URL para refrescar el token
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Define la ruta para ver el perfil del usuario autenticado
    # Se usa "me" para indicar que es el perfil del usuario actual
    path("me/", UserProfileView.as_view(), name="user-profile"),
    # Nueva URL para cambiar la contraseña
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    # Nueva URL para iniciar el proceso de cambio de celular
    path(
        "change-celular/",
        ChangeCelularRequestView.as_view(),
        name="celular-change-request",
    ),
    path(
        "change-celular/confirm/",
        ChangeCelularConfirmView.as_view(),
        name="celular-change-confirm",
    ),
    # Nueva URL para iniciar el proceso de cambio de email
    path(
        "change-email/", ChangeEmailRequestView.as_view(), name="email-change-request"
    ),
    # Nueva URL para confirmar el cambio de email
    path(
        "change-email/confirm/<str:uidb64>/<str:token>/",
        ChangeEmailConfirmView.as_view(),
        name="email-change-confirm",
    ),
    # Nueva URL para cerrar sesión
    path("logout/", LogoutView.as_view(), name="user_logout"),
]
