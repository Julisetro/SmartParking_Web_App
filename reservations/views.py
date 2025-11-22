import uuid

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response

from .models import EstadoReserva
from .serializers import ReservaSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite a los usuarios ver y crear reservas.
    """

    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Método sobreescrito asegura que los usuarios solo puedan ver sus propias
        reservas, nunca las de otros
        """
        return self.request.user.reservas.order_by("-fecha_creacion")

    def perform_create(self, serializer):
        """
        Método sobreescrito que añade la lógica personalizada al crear una reserva.
        Se asignan los campos de solo lectura del serializer.
        """
        # 1. Obtener el estado inicial "Confirmada" de la base de datos.
        try:
            estado_inicial = EstadoReserva.objects.get(nombre="Confirmada")
        except EstadoReserva.DoesNotExist:
            raise APIException(
                "El estado inicial 'Confirmada' no está configurado en la base de datos"
            )  # noqa: E501
        # 2. Establecer la tarifa por hora (Aqui se pondra la lógica de negocio para tarifas) # noqa: E501
        # Por ahora se usara un valor fijo como ejemplo
        tarifa_actual = 4000.00
        # 3. Gnerar un codigo QR único.
        codigo_qr_único = str(uuid.uuid4())
        # 4. Guardar la reserva inyectando los datos generados por el servidor. # noqa: E501
        serializer.save(
            user=self.request.user,
            estado=estado_inicial,
            codigo_qr=codigo_qr_único,
            tarifa_hora=tarifa_actual,
            total_pago=0.00,  # Valor inicial para el total a pagar
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """
        Acción personalizada para cancelar una reserva.
        Solo permite la cancelación si el estado actual es 'Confirmada'.
        """
        reserva = self.get_object()

        # 1. Verificar que el estado actual de la reserva sea 'Confirmada'.
        if reserva.estado.nombre != "Confirmada":
            raise ValidationError(
                "Solo se pueden cancelar reservas que estén en estado 'Confirmada'."
            )

        # 2. Obtener el nuevo estado 'Cancelada' de la base de datos.
        try:
            estado_cancelada = EstadoReserva.objects.get(nombre="Cancelada")
        except EstadoReserva.DoesNotExist:
            # Este es un error de configuración del servidor, por lo que se usa APIException. # noqa: E501
            raise APIException(
                "El estado 'Cancelada' no está configurado en la base de datos."
            )

        # 3. Actualizar el estado de la reserva y guardarla.
        reserva.estado = estado_cancelada
        reserva.save()

        # 4. Devolver la reserva actualizada.
        serializer = self.get_serializer(reserva)
        return Response(serializer.data, status=status.HTTP_200_OK)
