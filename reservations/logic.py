from datetime import datetime, timedelta

from django.utils import timezone


def should_expire(reserva, now: datetime, grace_period: timedelta) -> bool:
    """
    Determina si una reserva debe expirar comparando la hora atual
    con la hora de inicio de la reserva más un período de gracia.

    Args:
        reserva: Una instancia del modelo Reserva
        now: Un objeto datetime que representa la hora actual
        grace_period: Un objeto timedelta que representa el período de gracia
    Returns:
        True si la reserva debe expirar, False en caso contrario
    """
    # Se combina la fecha y la hora de la reserva en un
    # solo objeto datetime
    # Se usa Timezone.make_aware para asegurar que el datetime sea
    # consciente de la zona horaria evitando errores en comparaciones
    reserva_datetime = timezone.make_aware(
        datetime.combine(reserva.fecha, reserva.hora_inicio)
    )

    # La condición principal: la reserva expira si la hora actual "now"
    # es posterior a la hora de inicio de la reserva más el período de gracia
    return now > (reserva_datetime + grace_period)
