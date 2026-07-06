from django.conf import settings
from django.db import models


class EstadoReserva(models.Model):
    """
    Representa los posibles estados de una reserva.
    """

    nombre = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    """
    Representa una reserva de parqueadero hecha por un usuario.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservas",
        verbose_name="Usuario",
    )
    estado = models.ForeignKey(
        "EstadoReserva",
        on_delete=models.PROTECT,
        verbose_name="Estado",
    )

    fecha = models.DateTimeField(verbose_name="Fecha de Reserva")
    hora_inicio = models.TimeField(verbose_name="Hora de Inicio")
    hora_salida = models.DateTimeField(
        null=True, blank=True, verbose_name="Hora de Salida"
    )

    # --- Campos financieros ---
    tarifa_hora = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Tarifa por Hora"
    )
    total_pago = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Total a Pagar"
    )

    codigo_qr = models.CharField(
        max_length=255, unique=True, blank=True, verbose_name="Código QR"
    )

    # --- Campos de timestamp ---
    fecha_creacion = models.DateTimeField(
        auto_now_add=True, verbose_name="Fecha de Creación"
    )
    fecha_actualizacion = models.DateTimeField(
        auto_now=True, verbose_name="Fecha de Actualización"
    )

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ["-fecha", "-hora_inicio"]

    def __str__(self):
        return f"Reserva de {self.user.get_full_name()} para el {self.fecha} a las {self.hora_inicio}"  # noqa: E501
