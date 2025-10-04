import random
import string
from datetime import datetime, timedelta, timezone

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.urls import reverse
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import (
    ChangeCelularConfirmSerializer,
    ChangeCelularRequestSerializer,
    ChangeEmailRequestSerializer,
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


class ChangeEmailRequestView(generics.UpdateAPIView):
    """
    Vista de API para iniciar el proceso de cambio de email.
    """

    serializer_class = ChangeEmailRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Este método maneja la petición POST para iniciar el cambio de email.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        password = serializer.validated_data["password"]
        new_email = serializer.validated_data["new_email"]

        # 1. Verificamos que la contraseña sea correcta
        if not user.check_password(password):
            return Response(
                {"password": ["La contraseña es incorrecta."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 2. Guardamos el nuevo email en el usuario para usarlo en el link de confirmacion #noqa: E501
        request.session["new_email_for_change"] = new_email
        # 3. Generamos el token de confirmacion
        token_generator = PasswordResetTokenGenerator()
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        # 4. Construimos el link de confirmacion
        verification_url = request.build_absolute_uri(
            reverse("email-change-confirm", kwargs={"uidb64": uidb64, "token": token})
        )
        # 5. Enviamos el email de confirmacion (se imprime en consola)
        subject = "Confirma tu cambio de correo electrónico"
        text_content = f"Hola {user.first_name},\n\nPor favor, confirma tu cambio de correo electrónico haciendo clic en el siguiente enlace:\n{verification_url}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nGracias."  # noqa: E501
        # Se usa EmailMultiAlternatives para enviar tanto texto plano como HTML
        msg = EmailMultiAlternatives(
            subject, text_content, "noreply@smartparking.com", [new_email]
        )
        msg.send()
        return Response(
            {"detail": "Se ha enviado un correo de confirmación a la nueva dirección."},
            status=status.HTTP_200_OK,
        )


class ChangeEmailConfirmView(generics.GenericAPIView):
    """
    Vista de API para confirmar el cambio de email.
    """

    # Cualquiera con el enlace puede acceder
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token, *args, **kwargs):
        """
        Este método maneja la petición GET para confirmar el cambio de email.
        """
        try:
            # Decodificamos el uidb64 para obtener el ID del usuario
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        # Recuperamos el nuevo email de la sesión
        new_email = request.session.get("new_email_for_change")

        token_generator = PasswordResetTokenGenerator()
        if (
            user is not None
            and token_generator.check_token(user, token)
            and new_email is not None
        ):  # noqa: E501
            # Verificamos que el nuevo email no haya sido tomado mientras tanto
            if CustomUser.objects.filter(email__iexact=new_email).exists():
                return Response(
                    {"detail": "Este correo electrónico ya está en uso."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Si el token es válido, actualizamos el email
            user.email = new_email
            user.username = new_email
            user.save()
            # Limpiamos el nuevo email de la sesión
            del request.session["new_email_for_change"]
            return Response(
                {"detail": "Correo electrónico actualizado con éxito."},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"detail": "El enlace de confirmación es inválido o ha expirado."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class ChangeCelularRequestView(generics.UpdateAPIView):
    """
    Vista para iniciar el proceso de cambio de número de celular.
    """

    serializer_class = ChangeCelularRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        password = serializer.validated_data["password"]
        new_celular = serializer.validated_data["new_celular"]
        # 1. Verificamos que la contraseña sea correcta
        if not user.check_password(password):
            return Response(
                {"password": ["La contraseña es incorrecta."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 2. Generamos un código de verificación
        verification_code = "".join(random.choices(string.digits, k=6))
        # Simulamos el envío del código por SMS imprimiéndolo en consola
        print("---Simulación de envío de SMS---")
        print(f"Para: {new_celular}")
        print(f"Código de verificación: {verification_code}")
        print("-------------------------------")
        # 3. Guardamos el código y el nuevo celular en la sesión con un timestamp
        request.session["new_celular_for_change"] = new_celular
        request.session["celular_verification_code"] = verification_code
        request.session["celular_code_expires"] = (
            datetime.now(timezone.utc) + timedelta(minutes=6)
        ).isoformat()
        return Response(
            {
                "detail": "Se ha enviado un código de verificación al nuevo número de celular."  # noqa: E501
            },
            status=status.HTTP_200_OK,
        )


class ChangeCelularConfirmView(generics.GenericAPIView):
    """
    Vista para confirmar el cambio de número de celular
    mediante un código de verificación.
    """

    serializer_class = ChangeCelularConfirmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Validamos el código de verificación
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_code = serializer.validated_data["verification_code"]
        new_celular = request.session.get("new_celular_for_change")
        verification_code = request.session.get("celular_verification_code")
        expires_at_str = request.session.get("celular_code_expires")
        # 1. Verificamos que haya un proceso en curso
        if not all([new_celular, verification_code, expires_at_str]):
            return Response(
                {"detail": "No hay un proceso de cambio de celular en curso."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 2. Verificamos que el código no haya expirado
        expires_at = datetime.fromisoformat(expires_at_str)
        if datetime.now(timezone.utc) > expires_at:
            # Limpiamos la sesión
            del request.session["new_celular_for_change"]
            del request.session["celular_verification_code"]
            del request.session["celular_code_expires"]
            return Response(
                {"detail": "El código de verificación ha expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 3. Verificamos que el código sea correcto
        if user_code != verification_code:
            return Response(
                {"verification_code": ["El código de verificación es incorrecto."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 4. Verificamos que el nuevo celular no haya sido tomado mientras tanto
        if CustomUser.objects.filter(celular=new_celular).exists():
            return Response(
                {"detail": "Este número de celular ya está en uso."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # 5. Si todo es correcto, actualizamos el número de celular
        user = request.user
        user.celular = new_celular
        user.save(update_fields=["celular"])
        # Limpiamos la sesión
        del request.session["new_celular_for_change"]
        del request.session["celular_verification_code"]
        del request.session["celular_code_expires"]
        return Response(
            {"detail": "Número de celular actualizado con éxito."},
            status=status.HTTP_200_OK,
        )
