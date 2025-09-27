from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado.
    Hereda de AbstractUser para utilizar el sistema de autenticación de Django,
    pero permite agregar campos adicionales si es necesario.
    """

    username = models.CharField(max_length=150, unique=False, null=True, blank=True)
    cedula = models.CharField(max_length=20, unique=True, null=True, blank=True)
    celular = models.CharField(max_length=20, null=True, blank=True)

    # Hacemos que email sea el campo de login y que sea unico
    email = models.EmailField(unique=True)

    # Le decihos a django que use el email para autenticar
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email
