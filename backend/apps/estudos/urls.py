from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, ProgressoGeralAPIView, SubtopicoViewSet, TopicoViewSet

router = DefaultRouter()
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('topicos', TopicoViewSet, basename='topico')
router.register('subtopicos', SubtopicoViewSet, basename='subtopico')

urlpatterns = [
    path('progresso/', ProgressoGeralAPIView.as_view(), name='progresso-geral'),
]

urlpatterns += router.urls
