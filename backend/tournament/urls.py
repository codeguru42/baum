from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GameViewSet, PlayerViewSet

router = DefaultRouter()
router.register(r"players", PlayerViewSet)
router.register(r"games", GameViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
