from rest_framework.routers import DefaultRouter

from .views import ReservaViewSet

# Se crea una instancia del router
router = DefaultRouter()
# Se registra el ViewSet de Reservas con el router
# "reservations" será el prefijo de la URL (ej. /api/reservations/)
router.register(r"reservations", ReservaViewSet, basename="reservation")

# Las urlpatterns de la aplicación son las URLs generadas por el router
urlpatterns = router.urls
