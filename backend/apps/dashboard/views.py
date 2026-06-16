from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.estudos.models import Categoria, Subtopico, Topico
from apps.estudos.services import ProgressoService

from .serializers import DashboardResumoSerializer, GraficoSemanalSerializer


class DashboardResumoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = Categoria.objects.filter(usuario=request.user).order_by('nome', 'id')
        progresso_categorias = [
            {
                'id': categoria.id,
                'nome': categoria.nome,
                'total_subtopicos': categoria.total_subtopicos,
                'subtopicos_concluidos': categoria.subtopicos_concluidos,
                'progresso': categoria.progresso_cache,
            }
            for categoria in categorias
        ]
        payload = {
            'progresso_geral': ProgressoService.calcular_progresso_geral(request.user),
            'total_categorias': categorias.count(),
            'total_topicos': Topico.objects.filter(usuario=request.user).count(),
            'total_subtopicos': Subtopico.objects.filter(topico__usuario=request.user).count(),
            'subtopicos_concluidos': Subtopico.objects.filter(
                topico__usuario=request.user,
                concluido=True,
            ).count(),
            'progresso_categorias': progresso_categorias,
        }
        return Response(DashboardResumoSerializer(payload).data)


class GraficoSemanalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payload = ProgressoService.grafico_semanal(request.user)
        return Response(GraficoSemanalSerializer(payload).data)
