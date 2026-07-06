import random
from datetime import datetime, timedelta

from locust import HttpUser, between, task


class WebAppUser(HttpUser):
    """
    Clase que representa a un usuario virtual de la aplicación Smart Parking.
    """

    # Define el tiempo de espera (en segundos) que un usuario virtual
    # esperará entre la ejecución de tareas.
    wait_time = between(1, 5)

    # Define la URL base del servicio que se va a probar.
    host = "http://127.0.0.1:8000"

    # Atributo para almacenar el token de autenticación del usuario.
    access_token = None

    def on_start(self):
        """
        Este método se ejecuta una vez por cada usuario virtual que se inicia.
        """
        # Credenciales del usuario de prueba. En un escenario real,
        # podríamos tener una lista de usuarios para no usar siempre el mismo.
        user_email = "new_1769708637193@test.com"
        user_password = "Contraseña123"

        # Realizamos la petición POST para obtener el token de acceso
        response = self.client.post(
            "/api/users/login/",
            json={"email": user_email, "password": user_password},
            name="/api/users/login/",  # Asignamos un nombre para agrupar en estadísticas # noqa: E501
        )

        # Verificamos que la petición fue exitosa y guardamos el token
        if response.status_code == 200:
            self.access_token = response.json().get("access")
            # Configuramos el header de autorización para todas las peticiones futuras
            # de este usuario virtual.
            self.client.headers["Authorization"] = f"Bearer {self.access_token}"
        else:
            print(
                f"No se pudo autenticar al usuario {user_email}. "
                f"Código de estado: {response.status_code} | "
                f"Respuesta: {response.text}"
            )

    @task
    def create_reservation(self):
        """
        Tarea principal del usuario virtual: crear una nueva reserva.
        """
        if not self.access_token:
            # Si no tenemos token, no podemos continuar.
            # Esto puede pasar si el login en on_start falló.
            return

        # --- Generación de datos aleatorios para la reserva ---
        # Fecha aleatoria en los próximos 7 días
        random_days = random.randint(1, 7)
        future_date = datetime.now() + timedelta(days=random_days)

        # Hora de inicio aleatoria entre las 8 AM y las 6 PM
        random_hour = random.randint(8, 18)
        random_minute = random.choice([0, 15, 30, 45])

        reservation_data = {
            "fecha": future_date.strftime("%Y-%m-%d"),
            "hora_inicio": f"{random_hour:02d}:{random_minute:02d}:00",
        }
        # -----------------------------------------------------

        # Realizamos la petición POST para crear la reserva
        self.client.post(
            "/api/reservations/",
            json=reservation_data,
            name="/api/reservations/ [create]",  # Etiqueta para estadísticas
        )

    @task(2)  # Esta tarea se ejecutará el doble de veces que create_reservation
    def get_my_reservations(self):
        """
        Tarea secundaria: el usuario consulta la lista de sus propias reservas.
        Esto simula un comportamiento más realista.
        """
        if not self.access_token:
            return

        self.client.get(
            "/api/reservations/",
            name="/api/reservations/ [list]",  # Etiqueta para estadísticas
        )
