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
    subtopicos = serializers.SerializerMethodField()

    class Meta:
        model = Subtopico
        fields = [
            'id',
            'nome',
            'topico',
            'subtopico_pai',
            'concluido',
            'ordem',
            'observacoes',
            'subtopicos',
            'concluido_em',
            'criado_em',
            'atualizado_em',
        ]
        read_only_fields = ['id', 'subtopicos', 'concluido_em', 'criado_em', 'atualizado_em']

    def get_subtopicos(self, obj):
        filhos = obj.subtopicos_filhos.all().order_by('ordem', 'id')
        return SubtopicoSerializer(filhos, many=True, context=self.context).data

    def validate_topico(self, topico):
        usuario = self.context['request'].user
        if topico.usuario_id != usuario.id:
            raise serializers.ValidationError('Topico nao pertence ao usuario autenticado.')
        return topico

    def validate(self, attrs):
        topico = attrs.get('topico', getattr(self.instance, 'topico', None))
        subtopico_pai = attrs.get('subtopico_pai', getattr(self.instance, 'subtopico_pai', None))

        if subtopico_pai is None:
            return attrs

        usuario = self.context['request'].user
        if subtopico_pai.topico.usuario_id != usuario.id:
            raise serializers.ValidationError({'subtopico_pai': 'Subtopico pai nao pertence ao usuario autenticado.'})
        if topico is not None and subtopico_pai.topico_id != topico.id:
            raise serializers.ValidationError({'subtopico_pai': 'Subtopico pai deve pertencer ao mesmo topico.'})
        if self.instance is not None and subtopico_pai.pk == self.instance.pk:
            raise serializers.ValidationError({'subtopico_pai': 'Subtopico nao pode ser pai de si mesmo.'})
        if self.instance is not None:
            ancestral = subtopico_pai
            while ancestral is not None:
                if ancestral.pk == self.instance.pk:
                    raise serializers.ValidationError({'subtopico_pai': 'Subtopico nao pode ser filho de um descendente.'})
                ancestral = ancestral.subtopico_pai

        return attrs


class OrdenacaoSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class ToggleConclusaoSerializer(serializers.Serializer):
    concluido = serializers.BooleanField(required=False)
