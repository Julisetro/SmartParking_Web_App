from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "cedula",
            "celular",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            username=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            cedula=validated_data.get("cedula", ""),
            celular=validated_data.get("celular", ""),
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "first_name",
            "last_name",
        )


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    def validate(self, data):
        # Aqui validamos la nueva contraseña
        if data["new_password"] != data["new_password2"]:
            raise serializers.ValidationError("Las nuevas contraseñas no coinciden.")
        validate_password(data["new_password"])
        return data


class ChangeEmailRequestSerializer(serializers.Serializer):
    """
    Serializer para cambiar el email del usuario.
    Valida la contraseña actual y el nuevo email.
    """

    password = serializers.CharField(write_only=True, required=True)
    new_email = serializers.EmailField(required=True)

    def validate_new_email(self, value):
        # Chequeamos que el nuevo email no este en uso
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email ya está en uso.")
        return value
