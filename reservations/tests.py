from datetime import date, time, timedelta
from unittest.mock import Mock

from django.test import TestCase
from django.utils import timezone

from .logic import should_expire


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
