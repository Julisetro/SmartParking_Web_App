from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from reservations.models import EstadoReserva, Reserva


# Todo comando de gestión debe ser una clase llamada "Command" que herda de BaseCommand
class Command(BaseCommand):
    # Texto de ayuda que se mostrara al ejecutar "python manage.py expire_reservations --help" # noqa: E501
    help = (
        "Expira las reservas que no han sido confirmadas dentro del período permitido."
    )

    def handle(self, *args, **options):
        # Usamos self.stdout para imprimir mensajes de progreso en la consola
        self.stdout.write(
            self.style.NOTICE("Iniciando el proceso de expiración de reservas...")
        )  # noqa: E501
        # Envolvemos la logica en un bloque try except para manejar errores inesperados
        try:
            estado_confirmada = EstadoReserva.objects.get(nombre="Confirmada")
            estado_expirada = EstadoReserva.objects.get(nombre="Expirada")
        except EstadoReserva.DoesNotExist:
            # Si los estados no existen, imprimimos un error y salimos
            self.stderr.write(
                self.style.ERROR(
                    "Error: Los estados 'Confirmada' o 'Expirada' no están configurados"
                )
            )
            return
        # Define el "periodo de gracia" que un usuario tiene para llegar despues de la hora de inicio # noqa: E501
        periodo_gracia = timedelta(minutes=30)
        # Obtenemos la fecha y hora actual, consciente de la zona horaria del proyecto.
        now = timezone.now()
        # Consultamos solo las reservas que son candidatas a expirar
        # aquellas que estan "Confirmada" y cuya fecha de reserva es hoy o anterior
        reservas_a_expirar = Reserva.objects.filter(
            estado=estado_confirmada, fecha__lte=now.date()
        )

        # Contador de reservas expiradas
        reservas_expiradas_count = 0

        # Iteramos sobre las reservas candidatas
        for reserva in reservas_a_expirar:
            # Combinamos la fecha y la hora de la reserva en un único objeto datetime
            # para poder compararlo
            # Se usa timezone.make_aware para asegurar que el datetime es consciente de la zona horaria # noqa: E501
            reserva_datetime = timezone.make_aware(
                timezone.datetime.combine(reserva.fecha, reserva.hora_inicio)
            )

            # Condicion principal:
            # Si la hora actual es mayor a la hora de inicio + periodo de gracia
            # entonces la reserva expira
            if now > reserva_datetime + periodo_gracia:
                # Actualizamos el estado de la reserva a "Expirada"
                reserva.estado = estado_expirada
                # Se guarda el cambio en la base de datos
                reserva.save()
                # Se incrementa el contador
                reservas_expiradas_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Reserva ID {reserva.id} expirada correctamente."
                    )
                )
        # Imprimimos un resumen de la operación
        self.stdout.write(
            self.style.SUCCESS(
                f"Proceso completado. Total de reservas expiradas: {reservas_expiradas_count}"  # noqa: E501
            )
        )
