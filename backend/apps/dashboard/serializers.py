from rest_framework import serializers


class DashboardResumoSerializer(serializers.Serializer):
    progresso_geral = serializers.DictField()
    total_categorias = serializers.IntegerField()
    total_topicos = serializers.IntegerField()
    total_subtopicos = serializers.IntegerField()
    subtopicos_concluidos = serializers.IntegerField()
    progresso_categorias = serializers.ListField()


class GraficoSemanalSerializer(serializers.Serializer):
    labels = serializers.ListField(child=serializers.CharField())
    valores = serializers.ListField(child=serializers.IntegerField())
