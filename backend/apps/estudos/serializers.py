from rest_framework import serializers

from .models import Categoria, Subtopico, Topico


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = [
            'id',
            'nome',
            'descricao',
            'total_subtopicos',
            'subtopicos_concluidos',
            'progresso_cache',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = [
            'id',
            'total_subtopicos',
            'subtopicos_concluidos',
            'progresso_cache',
            'criado_em',
            'atualizado_em',
        ]


class TopicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topico
        fields = [
            'id',
            'nome',
            'categoria',
            'ordem',
            'total_subtopicos',
            'subtopicos_concluidos',
            'progresso_cache',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = [
            'id',
            'total_subtopicos',
            'subtopicos_concluidos',
            'progresso_cache',
            'criado_em',
            'atualizado_em',
        ]

    def validate_categoria(self, categoria):
        usuario = self.context['request'].user
        if categoria.usuario_id != usuario.id:
            raise serializers.ValidationError('Categoria nao pertence ao usuario autenticado.')
        return categoria

    def create(self, validated_data):
        categoria = validated_data['categoria']
        return Topico.objects.create(usuario=categoria.usuario, **validated_data)

    def update(self, instance, validated_data):
        categoria = validated_data.get('categoria')
        if categoria is not None:
            instance.usuario = categoria.usuario
        return super().update(instance, validated_data)


class SubtopicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtopico
        fields = [
            'id',
            'nome',
            'topico',
            'concluido',
            'ordem',
            'observacoes',
            'concluido_em',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'concluido_em', 'criado_em', 'atualizado_em']

    def validate_topico(self, topico):
        usuario = self.context['request'].user
        if topico.usuario_id != usuario.id:
            raise serializers.ValidationError('Topico nao pertence ao usuario autenticado.')
        return topico


class OrdenacaoSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class ToggleConclusaoSerializer(serializers.Serializer):
    concluido = serializers.BooleanField(required=False)
