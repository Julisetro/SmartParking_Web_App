from unittest.mock import patch

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.test import TestCase
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser
from .serializers import ChangeEmailRequestSerializer, UserRegistrationSerializer


class UserRegistrationIntegrationTest(APITestCase):
    """
    Pruebas de Integración para el endpoint de registro de usuarios.
    Estas pruebas verifican el flujo completo de la API, desde la solicitud
    HTTP hasta la respuesta, incluyendo la interacción con la base de datos.
    """

    def setUp(self):
        """
        Este método se ejecuta antes de cada prueba en esta clase.
        Aquí definimos la URL para el endpoint de registro, evitando
        hardcodearla en cada prueba.
        """
        self.register_url = reverse("user-register")

    def test_user_can_register_successfully(self):
        """
        Verifica que un usuario pueda registrarse exitosamente con datos válidos.
        """
        # Datos del nuevo usuario que enviaremos en la solicitud POST
        user_data = {
            "email": "test_user@example.com",
            "password": "StrongPassword123",
            "first_name": "Test",
            "last_name": "User",
            "cedula": "123456789",
            "celular": "3001234567",
        }

        # Realizamos la solicitud POST a la API
        response = self.client.post(self.register_url, user_data, format="json")

        # 1. Verificamos que la respuesta tenga el status code 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Verificamos que se haya creado un solo usuario en la base de datos
        self.assertEqual(CustomUser.objects.count(), 1)

        # 3. Verificamos que el usuario creado tenga los datos correctos
        created_user = CustomUser.objects.get()
        self.assertEqual(created_user.email, user_data["email"])
        self.assertEqual(created_user.first_name, user_data["first_name"])
        # El campo 'username' se debe poblar con el email
        self.assertEqual(created_user.username, user_data["email"])

    def test_user_cannot_register_with_existing_email(self):
        """
        Verifica que la API impida el registro si el email ya está en uso.
        """
        # Primero, creamos un usuario existente en la base de datos
        # para simular la condición de email duplicado.
        existing_user_email = "test_user@example.com"
        CustomUser.objects.create_user(
            email=existing_user_email,
            password="SomePassword123",
            username=existing_user_email,
        )

        # Datos para el intento de registro con el email duplicado
        duplicate_user_data = {
            "email": existing_user_email,
            "password": "AnotherPassword456",
            "first_name": "Another",
            "last_name": "User",
            "cedula": "987654321",
            "celular": "3007654321",
        }

        # Realizamos la solicitud POST con los datos duplicados
        response = self.client.post(
            self.register_url, duplicate_user_data, format="json"
        )

        # 1. Verificamos que la respuesta sea un 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Nos aseguramos de que no se haya creado un segundo usuario
        self.assertEqual(CustomUser.objects.count(), 1)

        # 3. Verificamos que la respuesta contenga el mensaje de error esperado
        # El serializador anida el error bajo la clave 'email' porque es
        # el campo que directamente causa la validación de unicidad.
        self.assertIn("email", response.data)


class UserRegistrationSerializerUnitTest(TestCase):
    """
    Pruebas Unitarias para el UserRegistrationSerializer.
    Estas pruebas se enfocan únicamente en la lógica del serializador,
    específicamente en su método `create`, de forma aislada.
    """

    def test_serializer_create_method(self):
        """
        Verifica que el método `create` del serializador cree correctamente
        una instancia de CustomUser.
        """
        # Datos validados que el serializador recibiría
        validated_data = {
            "email": "unit_test@example.com",
            "password": "UnitTestPassword123",
            "first_name": "Unit",
            "last_name": "Test",
            "cedula": "1122334455",
            "celular": "3101122334",
        }

        # Instanciamos el serializador
        serializer = UserRegistrationSerializer()

        # Ejecutamos el método `create` directamente
        user = serializer.create(validated_data)

        # 1. Verificamos que el objeto devuelto sea una instancia de CustomUser
        self.assertIsInstance(user, CustomUser)

        # 2. Verificamos que los atributos se hayan asignado correctamente
        self.assertEqual(user.email, validated_data["email"])
        self.assertEqual(user.username, validated_data["email"])

        # 3. Verificamos que la contraseña se haya hasheado correctamente
        # El método check_password se encarga de comparar la contraseña
        # en texto plano con la versión hasheada en la base de datos.
        self.assertTrue(user.check_password(validated_data["password"]))


class AuthenticationIntegrationTest(APITestCase):
    """
    Pruebas de Integración para la autenticación de usuarios (Login y Logout).
    """

    def setUp(self):
        """
        Crea un usuario de prueba antes de cada test en esta clase.
        """
        self.email = "login_user@example.com"
        self.password = "LoginPassword123"
        self.user = CustomUser.objects.create_user(
            email=self.email,
            username=self.email,
            password=self.password,
        )
        self.login_url = reverse("token_obtain_pair")
        self.logout_url = reverse("user_logout")

    def test_user_can_login_with_valid_credentials(self):
        """
        Verifica que un usuario pueda iniciar sesión y obtener tokens con
        credenciales válidas.
        """
        login_data = {"email": self.email, "password": self.password}
        response = self.client.post(self.login_url, login_data, format="json")

        # 1. Verificamos que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Verificamos que la respuesta contenga tokens de acceso y refresco
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_cannot_login_with_invalid_credentials(self):
        """
        Verifica que un usuario no pueda iniciar sesión con credenciales incorrectas.
        """
        login_data = {"email": self.email, "password": "WrongPassword"}
        response = self.client.post(self.login_url, login_data, format="json")

        # 1. Verificamos que la respuesta sea 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Verificamos que no se devuelvan tokens
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_user_can_logout(self):
        """
        Verifica que un usuario pueda cerrar sesión, invalidando su refresh token.
        """
        # Primero, iniciamos sesión para obtener los tokens
        login_data = {"email": self.email, "password": self.password}
        login_response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        access_token = login_response.data["access"]
        refresh_token = login_response.data["refresh"]

        # Autenticamos al cliente para la siguiente petición de logout
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Ahora, usamos el refresh token para cerrar la sesión
        logout_data = {"refresh": refresh_token}
        logout_response = self.client.post(self.logout_url, logout_data, format="json")

        # 1. Verificamos que la respuesta de logout sea 204 NO CONTENT
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        # 2. (Verificación extra) Intentamos usar el refresh token invalidado
        # para obtener un nuevo access token. Esto debería fallar.
        refresh_url = reverse("token_refresh")
        refresh_attempt_response = self.client.post(
            refresh_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(
            refresh_attempt_response.status_code, status.HTTP_401_UNAUTHORIZED
        )


class UserProfileIntegrationTest(APITestCase):
    """
    Pruebas de Integración para el endpoint del perfil de usuario.
    Verifica la obtención y actualización de los datos del perfil.
    """

    def setUp(self):
        """
        Este método se ejecuta antes de cada prueba en esta clase.
        Crea un usuario de prueba y lo autentica.
        """
        self.password = "TestPassword123"
        self.user = CustomUser.objects.create_user(
            email="profile_user@example.com",
            username="profile_user@example.com",
            password=self.password,
            first_name="Profile",
            last_name="User",
            cedula="1020304050",
        )
        # Obtenemos la URL del endpoint del perfil
        self.profile_url = reverse("user-profile")
        # Autenticamos al cliente para las pruebas. Esto adjuntará
        # automáticamente el token de autorización a todas las solicitudes
        # subsiguientes hechas con este cliente.
        self.client.force_authenticate(user=self.user)

    def test_authenticated_user_can_retrieve_profile(self):
        """
        Verifica que un usuario autenticado pueda obtener sus datos de perfil.
        """
        # Realizamos una solicitud GET al endpoint del perfil
        response = self.client.get(self.profile_url)

        # 1. Verificamos que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Verificamos que los datos devueltos correspondan al usuario
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["first_name"], self.user.first_name)
        self.assertEqual(response.data["cedula"], self.user.cedula)

    def test_unauthenticated_user_cannot_retrieve_profile(self):
        """
        Verifica que un usuario no autenticado no pueda acceder al perfil.
        """
        # Anulamos la autenticación del cliente para esta prueba específica
        self.client.force_authenticate(user=None)

        # Realizamos la solicitud GET sin estar autenticado
        response = self.client.get(self.profile_url)

        # Verificamos que la respuesta sea 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_update_profile(self):
        """
        Verifica que un usuario autenticado pueda actualizar su nombre y apellido.
        """
        # Datos para la actualización del perfil
        update_data = {
            "first_name": "NombreActualizado",
            "last_name": "ApellidoActualizado",
        }

        # Realizamos una solicitud PUT para actualizar los datos
        response = self.client.put(self.profile_url, update_data, format="json")

        # 1. Verificamos que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Verificamos que los datos en la respuesta sean los actualizados
        self.assertEqual(response.data["first_name"], update_data["first_name"])
        self.assertEqual(response.data["last_name"], update_data["last_name"])

        # 3. Verificamos que los datos se hayan guardado en la base de datos
        # Para esto, refrescamos la instancia del usuario desde la BD
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, update_data["first_name"])
        self.assertEqual(self.user.last_name, update_data["last_name"])

    def test_user_cannot_update_read_only_fields(self):
        """
        Verifica que campos de solo lectura como email o cédula no se puedan
        modificar a través del endpoint de actualización de perfil.
        """
        # Guardamos los valores originales para compararlos después
        original_email = self.user.email
        original_cedula = self.user.cedula

        # Intentamos actualizar el email y la cédula junto con el nombre
        update_data = {
            "first_name": "NuevoNombre",
            "email": "intento_de_cambio@example.com",
            "cedula": "000000",
        }

        # Realizamos la solicitud PUT
        response = self.client.put(self.profile_url, update_data, format="json")

        # 1. La solicitud debe ser exitosa (200 OK) porque ignora los campos
        #    adicionales y solo procesa 'first_name' y 'last_name'.
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 2. Verificamos que el nombre se haya actualizado
        self.assertEqual(response.data["first_name"], update_data["first_name"])

        # 3. Verificamos que el email y la cédula NO hayan cambiado en la BD
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_email)
        self.assertEqual(self.user.cedula, original_cedula)


class ChangePasswordIntegrationTest(APITestCase):
    """
    Pruebas de Integración para el endpoint de cambio de contraseña.
    """

    def setUp(self):
        """
        Crea un usuario de prueba y lo autentica.
        """
        self.old_password = "OldSecurePassword123"
        self.user = CustomUser.objects.create_user(
            email="changepassword@example.com",
            username="changepassword@example.com",
            password=self.old_password,
        )
        self.change_password_url = reverse("change-password")
        self.client.force_authenticate(user=self.user)

    def test_user_can_change_password_successfully(self):
        """
        Verifica que un usuario pueda cambiar su contraseña exitosamente
        proporcionando los datos correctos.
        """
        new_password = "NewSecurePassword456"
        data = {
            "old_password": self.old_password,
            "new_password": new_password,
            "new_password2": new_password,
        }

        response = self.client.post(self.change_password_url, data, format="json")

        # 1. Verificamos que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Contraseña actualizada con éxito.")

        # 2. Verificamos que la contraseña realmente cambió en la base de datos
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(new_password))
        self.assertFalse(self.user.check_password(self.old_password))

    def test_user_cannot_change_password_with_incorrect_old_password(self):
        """
        Verifica que el cambio de contraseña falle si la contraseña
        antigua es incorrecta.
        """
        data = {
            "old_password": "WrongOldPassword",
            "new_password": "NewSecurePassword456",
            "new_password2": "NewSecurePassword456",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        # 1. Verificamos que la respuesta sea 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("old_password", response.data)

        # 2. Verificamos que la contraseña no haya cambiado en la base de datos
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.old_password))

    def test_user_cannot_change_password_if_new_passwords_mismatch(self):
        """
        Verifica que el cambio falle si las nuevas contraseñas no coinciden.
        """
        data = {
            "old_password": self.old_password,
            "new_password": "NewSecurePassword456",
            "new_password2": "MismatchingPassword",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        # 1. Verificamos que la respuesta sea 400 BAD REQUEST (validación del serializer) # noqa
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

        # 2. Verificamos que la contraseña no haya cambiado
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.old_password))

    def test_unauthenticated_user_cannot_change_password(self):
        """
        Verifica que un usuario no autenticado no pueda cambiar la contraseña.
        """
        self.client.force_authenticate(user=None)
        data = {
            "old_password": self.old_password,
            "new_password": "some_new_password",
            "new_password2": "some_new_password",
        }

        response = self.client.post(self.change_password_url, data, format="json")

        # Verificamos que la respuesta sea 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangeEmailRequestSerializerUnitTest(TestCase):
    """
    Pruebas Unitarias para el ChangeEmailRequestSerializer.
    """

    def setUp(self):
        """
        Crea un usuario existente para probar la validación de unicidad.
        """
        self.existing_email = "exists@example.com"
        CustomUser.objects.create_user(
            email=self.existing_email,
            username=self.existing_email,
            password="password",
        )

    def test_serializer_rejects_existing_email(self):
        """
        Verifica que el serializador falle si el nuevo email ya está en uso.
        """
        data = {"new_email": self.existing_email, "password": "some_password"}
        serializer = ChangeEmailRequestSerializer(data=data)

        # Verificamos que la validación falle y contenga el error correcto
        self.assertFalse(serializer.is_valid())
        self.assertIn("new_email", serializer.errors)
        self.assertEqual(
            serializer.errors["new_email"][0], "Este email ya está en uso."
        )

    def test_serializer_accepts_new_email(self):
        """
        Verifica que el serializador acepte un email que no está en uso.
        """
        data = {"new_email": "new@example.com", "password": "some_password"}
        serializer = ChangeEmailRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class ChangeEmailIntegrationTest(APITestCase):
    """
    Pruebas de Integración para el flujo completo de cambio de email.
    """

    def setUp(self):
        """
        Crea un usuario de prueba y lo autentica.
        """
        self.password = "TestPassword123"
        self.user = CustomUser.objects.create_user(
            email="change_email_user@example.com",
            username="change_email_user@example.com",
            password=self.password,
        )
        self.client.force_authenticate(user=self.user)
        self.request_url = reverse("email-change-request")

    @patch("users.views.EmailMultiAlternatives")
    def test_email_change_request_successful(self, mock_email):
        """
        Verifica que una solicitud de cambio de email exitosa envíe un correo.
        """
        new_email = "new_email@example.com"
        data = {"password": self.password, "new_email": new_email}

        response = self.client.post(self.request_url, data, format="json")

        # 1. Verificamos que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["detail"],
            "Se ha enviado un correo de confirmación a la nueva dirección.",
        )

        # 2. Verificamos que el email se haya guardado en la sesión
        session = self.client.session
        self.assertEqual(session.get("new_email_for_change"), new_email)

        # 3. Verificamos que se haya intentado enviar un email
        mock_email.assert_called_once()

        # 4. Verificamos que el email del usuario aún no ha cambiado
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.email, new_email)

    def test_email_change_request_fails_with_incorrect_password(self):
        """
        Verifica que la solicitud falle si la contraseña es incorrecta.
        """
        data = {"password": "WrongPassword", "new_email": "new@example.com"}
        response = self.client.post(self.request_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
        self.assertIsNone(self.client.session.get("new_email_for_change"))

    def test_full_email_change_flow_is_successful(self):
        """
        Prueba el flujo completo: solicitud, captura de token y confirmación.
        """
        # --- Parte 1: Solicitar el cambio ---
        new_email = "confirmed_new_email@example.com"
        data = {"password": self.password, "new_email": new_email}

        # Forzamos el guardado de la sesión para que persista en la prueba
        session = self.client.session
        session.save()

        response = self.client.post(self.request_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # --- Parte 2: Generar el enlace de confirmación (como lo haría la vista) ---
        token_generator = PasswordResetTokenGenerator()
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = token_generator.make_token(self.user)
        confirm_url = reverse(
            "email-change-confirm", kwargs={"uidb64": uidb64, "token": token}
        )

        # --- Parte 3: Confirmar el cambio ---
        # El cliente de prueba de Django mantiene las cookies (y por tanto la sesión)
        # entre las peticiones dentro de un mismo método de prueba.
        # No es necesario desautenticar, ya que la vista de confirmación
        # permite el acceso a cualquiera (AllowAny).
        confirm_response = self.client.get(confirm_url)

        # 1. Verificamos que la confirmación sea exitosa
        self.assertEqual(confirm_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            confirm_response.data["detail"], "Correo electrónico actualizado con éxito."
        )

        # 2. Verificamos que el email y el username se hayan actualizado en la BD
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, new_email)
        self.assertEqual(self.user.username, new_email)

        # 3. Verificamos que el dato de la sesión se haya limpiado
        session = self.client.session
        self.assertIsNone(session.get("new_email_for_change"))

    def test_email_change_confirmation_fails_with_invalid_token(self):
        """
        Verifica que la confirmación falle si el token es inválido.
        """
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        invalid_token = "invalid-token"
        confirm_url = reverse(
            "email-change-confirm",
            kwargs={"uidb64": uidb64, "token": invalid_token},
        )

        response = self.client.get(confirm_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"],
            "El enlace de confirmación es inválido o ha expirado.",
        )

    def test_email_change_fails_if_email_is_taken_in_meantime(self):
        """
        Verifica que la confirmación falle si el email es tomado por otro
        usuario antes de que se confirme el cambio.
        """
        # 1. El usuario inicia el proceso de cambio
        new_email = "taken_in_meantime@example.com"
        data = {"password": self.password, "new_email": new_email}

        # Forzamos el guardado de la sesión
        session = self.client.session
        session.save()

        self.client.post(self.request_url, data, format="json")

        # 2. Generamos el enlace de confirmación
        token_generator = PasswordResetTokenGenerator()
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = token_generator.make_token(self.user)
        confirm_url = reverse(
            "email-change-confirm", kwargs={"uidb64": uidb64, "token": token}
        )

        # 3. Otro usuario toma el email
        CustomUser.objects.create_user(
            email=new_email, username=new_email, password="password"
        )

        # 4. El usuario original intenta confirmar
        response = self.client.get(confirm_url)

        # Verificamos que la API lo impida
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"], "Este correo electrónico ya está en uso."
        )

        # Verificamos que el email del usuario original no haya cambiado
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.email, new_email)
