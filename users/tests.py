from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser
from .serializers import UserRegistrationSerializer


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
