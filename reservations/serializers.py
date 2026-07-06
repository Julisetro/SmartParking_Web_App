from rest_framework import serializers

from .models import EstadoReserva, Reserva


class EstadoReservaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo EstadoReserva.
    Solo expone el nombre del estado.
    """

    class Meta:
        model = EstadoReserva
        fields = ["nombre"]


class ReservaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Reserva.
    Gestiona la conversación de datos de Reserva a JSON y viceversa.
    """

    # Para la lectura, se usa el serializer anidado para
    # mostrar el objeto completo del estado
    estado = EstadoReservaSerializer(read_only=True)
    # Para la lectura, se muestra el email del usuario en lugar ded solo su ID.
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id",
            "user",
            "estado",
            "fecha",
            "hora_inicio",
            "hora_salida",
            "tarifa_hora",
            "total_pago",
            "codigo_qr",
            "fecha_creacion",
            "fecha_actualizacion",
        ]

        # Se define los campos que serán establecidos por el servidor, no por el cliente
        # El cliente solo necesitará enviar "fecha" y "hora_inicio"
        read_only_fields = [
            "id",
            "user",
            "estado",
            "hora_salida",
            "tarifa_hora",
            "total_pago",
            "codigo_qr",
            "fecha_creacion",
            "fecha_actualizacion",
        ]
