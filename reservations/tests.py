from datetime import date, time, timedelta
from unittest.mock import Mock

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser

from .logic import should_expire
from .models import EstadoReserva, Reserva


class ReservationLogicTests(TestCase):
    """
    Pruebas unitarias para la lógica de expiración de reservas.
    Esta prueba no interactua con la base de datos.
    """

    def test_should_expire_returns_true_when_after_grace_period(self):
        """
        Verifica que should_expire devuelve True si la hora actual
        supera a la hora de la reserva más el período de gracia.
        """
        # Arrange
        # Se crea un 'Mock' que simula ser una instancia del modelo
        reserva_ficticia = Mock()
        reserva_ficticia.fecha = date(2025, 10, 29)
        reserva_ficticia.hora_inicio = time(14, 0)  # 2:00 PM

        # Se define la hora actual como si hubiera pasado mucho tiempo
        ahora = timezone.now().replace(
            year=2025, month=10, day=29, hour=14, minute=32
        )  # 2:32 PM
        periodo_gracia = timedelta(minutes=30)

        # Act
        # Llamamos a la función que estamos probando
        resultado = should_expire(reserva_ficticia, ahora, periodo_gracia)

        # Assert
        # Verificamos que el resultado es el esperado (la reserva debe expirar)
        self.assertTrue(resultado)

    def test_should_expire_returns_false_within_grace_period(self):
        """
        Verifica que should_expire devuelve False si la hora actual
        está dentro del período de gracia.
        """
        # Arrange
        reserva_ficticia = Mock()
        reserva_ficticia.fecha = date(2025, 10, 29)
        reserva_ficticia.hora_inicio = time(14, 0)  # 2:00 PM

        # La hora actual es dentro del período de gracia
        ahora = timezone.now().replace(
            year=2025, month=10, day=29, hour=14, minute=15
        )  # 2:15 PM
        periodo_gracia = timedelta(minutes=30)

        # Act
        resultado = should_expire(reserva_ficticia, ahora, periodo_gracia)

        # Assert
        # Verificamos que el resultado es "False" (la reserva no debe expirar)
        self.assertFalse(resultado)

    def test_should_expire_returns_false_at_exact_grace_period_boundary(self):
        """
        Verifica que should_expire devuelve False si la hora actual
        es exactamente igual a la hora de la reserva más el período de gracia.
        """
        # Arrange
        reserva_ficticia = Mock()
        reserva_ficticia.fecha = date(2025, 10, 29)
        reserva_ficticia.hora_inicio = time(14, 0)  # 2:00 PM

        # La hora actual es exactamente al final del período de gracia
        ahora = timezone.now().replace(
            year=2025, month=10, day=29, hour=14, minute=30, second=0, microsecond=0
        )  # 2:30 PM
        periodo_gracia = timedelta(minutes=30)

        # Act
        resultado = should_expire(reserva_ficticia, ahora, periodo_gracia)

        # Assert
        # Verificamos que el resultado es "False" (la reserva no debe expirar)
        self.assertFalse(resultado)


class ReservationAPITests(APITestCase):
    """
    Pruebas de integración para la API de reservas.
    Esta prueba interactua con la base de datos y la API.
    """

    @classmethod
    def setUpClass(cls):
        """
        Este método se ejecuta una sola vez al principio de todas
        las pruebas de la clase.
        """
        super().setUpClass()
        # Creamos los estados de reserva, que son datos compartidos y no cambian
        cls.estado_confirmada, _ = EstadoReserva.objects.get_or_create(
            nombre="Confirmada"
        )
        cls.estado_en_proceso, _ = EstadoReserva.objects.get_or_create(
            nombre="En Proceso"
        )
        cls.estado_finalizada, _ = EstadoReserva.objects.get_or_create(
            nombre="Finalizada"
        )
        cls.estado_cancelada, _ = EstadoReserva.objects.get_or_create(
            nombre="Cancelada"
        )
        cls.estado_expirada, _ = EstadoReserva.objects.get_or_create(nombre="Expirada")

    def setUp(self):
        """
        Este método se ejecuta antes de cada prueba.
        """
        # Creamos usuarios nuevos para cada prueba para garantizar el aislamiento
        self.user = CustomUser.objects.create_user(
            email="testuser@example.com",
            username="testuser@example.com",  # Añadido el argumento username
            password="password123",
            first_name="Test",
            last_name="User",
        )
        self.user_b = CustomUser.objects.create_user(
            email="testuser_b@example.com",
            username="testuser_b@example.com",  # Añadido el argumento username
            password="password123",
            first_name="TestB",
            last_name="UserB",
        )

    def test_unauthenticated_user_cannot_access_reservation(self):
        """
        Verifica que un usuario no autenticado recibe un error 401 Unauthorized
        """
        # Hacemos una petición GET a la lista de reservas sin autenticar
        response = self.client.get("/api/reservations/")
        # Verificamos que la respuesta es 401 Unauthorized
        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_create_reservation(self):
        """
        Verifica que un usuario autenticado puede crear una reserva
        y que los valores por defecto se asignan correctamente.
        """
        # Forzamos la autenticación del usuario de prueba
        self.client.force_authenticate(user=self.user)
        # Datos para crear una nueva reserva
        reservation_data = {
            "fecha": "2025-12-01",
            "hora_inicio": "15:00:00",
            "total_pago": 10.00,  # Valor ficticio para la prueba
            "tarifa_hora": 5.00,  # Valor ficticio para la prueba
        }
        # Hacemos una petición POST para crear la reserva
        response = self.client.post(
            "/api/reservations/", reservation_data, format="json"
        )
        # 1. Verificamos que la respuesta es 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # 2. Verificamos que el estado inicial sea "Confirmada"
        self.assertEqual(response.data["estado"]["nombre"], "Confirmada")
        # 3. Verificamos que la reserva esté asociada al usuario correcto
        self.assertEqual(response.data["user"], self.user.email)
        # 4. Verificamos que se generó un código QR
        self.assertTrue("codigo_qr" in response.data and response.data["codigo_qr"])

    def test_user_can_only_see_their_own_reservations(self):
        """
        Verifica que un usuario autenticado solo puede ver sus propias reservas.
        """
        # Creamos 2 reservas para el usuario A (self.user)
        Reserva.objects.create(
            user=self.user,
            estado=self.estado_confirmada,
            fecha="2025-11-10",
            hora_inicio="09:00:00",
            tarifa_hora=4000.00,
            total_pago=0.00,
            codigo_qr="QR-USERA-1",
        )
        Reserva.objects.create(
            user=self.user,
            estado=self.estado_confirmada,
            fecha="2025-11-11",
            hora_inicio="10:00:00",
            tarifa_hora=4000.00,
            total_pago=0.00,
            codigo_qr="QR-USERA-2",
        )

        # Creamos 1 reserva para el usuario B (self.user_b)
        Reserva.objects.create(
            user=self.user_b,
            estado=self.estado_confirmada,
            fecha="2025-11-12",
            hora_inicio="11:00:00",
            tarifa_hora=4000.00,
            total_pago=0.00,
            codigo_qr="QR-USERB-1",
        )
        # Parte 1: Verificamos la vista del usuario A
        self.client.force_authenticate(user=self.user)
        response_a = self.client.get("/api/reservations/")
        self.assertEqual(response_a.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_a.data), 2)  # Usuario A debe ver 2 reservas
        # Parte 2: Verificamos la vista del usuario B
        self.client.force_authenticate(user=self.user_b)
        response_b = self.client.get("/api/reservations/")
        self.assertEqual(response_b.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_b.data), 1)  # Usuario B debe ver 1 reserva

    def test_user_cannot_access_other_users_reservation_details(self):
        """
        Verifica que un usuario recibe un eror 404 Not Found
        al intentar acceder a los detalles de una reserva que no le pertenece.
        """
        # Creamos una reserva para el usuario B (self.user_b)
        reservation_b = Reserva.objects.create(
            user=self.user_b,
            estado=self.estado_confirmada,
            fecha="2025-11-15",
            hora_inicio="12:00:00",
            tarifa_hora=4000.00,
            total_pago=0.00,
            codigo_qr="QR-USERB-2",
        )
        # Autenticamos como el usuario A (self.user)
        self.client.force_authenticate(user=self.user)
        # Usuario A intenta acceder a los detalles de la reserva del usuario B
        response = self.client.get(f"/api/reservations/{reservation_b.id}/")
        # Verificamos que la respuesta es 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
