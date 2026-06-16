from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .mixins import ProgressoMixin, UserOwnershipMixin
from .models import Categoria, Subtopico, Topico
from .serializers import (
    CategoriaSerializer,
    OrdenacaoSerializer,
    SubtopicoSerializer,
    ToggleConclusaoSerializer,
    TopicoSerializer,
)
from .services import ProgressoService


class CategoriaViewSet(UserOwnershipMixin, viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    ownership_field = 'usuario'

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'], url_path='ordenar-topicos')
    def ordenar_topicos(self, request, pk=None):
        categoria = self.get_object()
        serializer = OrdenacaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            topicos = ProgressoService.reordenar_topicos(
                categoria,
                serializer.validated_data['ids'],
                request.user,
            )
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages) from exc
        return Response(TopicoSerializer(topicos, many=True).data)


class TopicoViewSet(UserOwnershipMixin, ProgressoMixin, viewsets.ModelViewSet):
    queryset = Topico.objects.select_related('categoria').all()
    serializer_class = TopicoSerializer
    permission_classes = [IsAuthenticated]
    ownership_field = 'usuario'

    @transaction.atomic
    def perform_create(self, serializer):
        topico = serializer.save()
        ProgressoService.atualizar_cache_categoria(topico.categoria, self.request.user)

    @transaction.atomic
    def perform_update(self, serializer):
        topico_anterior = self.get_object()
        categoria_anterior = topico_anterior.categoria
        topico = serializer.save()
        ProgressoService.atualizar_caches_para_topico(topico, self.request.user)
        if categoria_anterior.pk != topico.categoria_id:
            ProgressoService.atualizar_cache_categoria(categoria_anterior, self.request.user)

    @transaction.atomic
    def perform_destroy(self, instance):
        categoria = instance.categoria
        instance.delete()
        ProgressoService.atualizar_cache_categoria(categoria, self.request.user)

    @action(detail=True, methods=['post'], url_path='ordenar-subtopicos')
    def ordenar_subtopicos(self, request, pk=None):
        topico = self.get_object()
        serializer = OrdenacaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            subtopicos = ProgressoService.reordenar_subtopicos(
                topico,
                serializer.validated_data['ids'],
                request.user,
            )
        except DjangoValidationError as exc:
            raise ValidationError(exc.messages) from exc
        return Response(SubtopicoSerializer(subtopicos, many=True).data)


class SubtopicoViewSet(ProgressoMixin, viewsets.ModelViewSet):
    queryset = Subtopico.objects.select_related('topico', 'topico__categoria').all()
    serializer_class = SubtopicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        if not usuario.is_authenticated:
            return self.queryset.none()
        return self.queryset.filter(topico__usuario=usuario)

    @transaction.atomic
    def perform_create(self, serializer):
        subtopico = serializer.save()
        ProgressoService.registrar_subtopico(subtopico, self.request.user)

    @transaction.atomic
    def perform_update(self, serializer):
        subtopico_anterior = self.get_object()
        topico_anterior = subtopico_anterior.topico
        conclusao_alterada = 'concluido' in serializer.validated_data
        subtopico = serializer.save()
        if conclusao_alterada:
            subtopico = ProgressoService.marcar_subtopico(
                subtopico,
                subtopico.concluido,
                self.request.user,
            )
        else:
            ProgressoService.atualizar_caches_para_topico(subtopico.topico, self.request.user)
        if topico_anterior.pk != subtopico.topico_id:
            ProgressoService.atualizar_caches_para_topico(topico_anterior, self.request.user)

    @transaction.atomic
    def perform_destroy(self, instance):
        topico = instance.topico
        instance.delete()
        ProgressoService.atualizar_caches_para_topico(topico, self.request.user)

    @action(detail=True, methods=['post'], url_path='toggle-conclusao')
    def toggle_conclusao(self, request, pk=None):
        subtopico = self.get_object()
        serializer = ToggleConclusaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        novo_estado = serializer.validated_data.get('concluido', not subtopico.concluido)
        subtopico = ProgressoService.marcar_subtopico(subtopico, novo_estado, request.user)
        payload = SubtopicoSerializer(subtopico).data
        payload['progresso'] = ProgressoService.calcular_progresso_geral(request.user)
        return Response(payload)


class ProgressoGeralAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ProgressoService.calcular_progresso_geral(request.user))
