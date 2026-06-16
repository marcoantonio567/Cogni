from datetime import datetime, time, timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone

from .models import Categoria, Subtopico, Topico


class ProgressoService:
    @staticmethod
    def _percentual(concluidos, total):
        if not total:
            return Decimal('0.00')
        valor = Decimal(concluidos) * Decimal('100') / Decimal(total)
        return valor.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @staticmethod
    def _validar_categoria_usuario(categoria, usuario):
        if usuario is not None and categoria.usuario_id != usuario.id:
            raise PermissionDenied('Categoria nao pertence ao usuario autenticado.')

    @staticmethod
    def _validar_topico_usuario(topico, usuario):
        if usuario is not None and topico.usuario_id != usuario.id:
            raise PermissionDenied('Topico nao pertence ao usuario autenticado.')

    @classmethod
    def calcular_progresso_topico(cls, topico, usuario=None):
        cls._validar_topico_usuario(topico, usuario)
        totais = topico.subtopicos.aggregate(
            total=Count('id'),
            concluidos=Count('id', filter=Q(concluido=True)),
        )
        total = totais['total'] or 0
        concluidos = totais['concluidos'] or 0
        return {
            'total_subtopicos': total,
            'subtopicos_concluidos': concluidos,
            'progresso': cls._percentual(concluidos, total),
        }

    @classmethod
    def calcular_progresso_categoria(cls, categoria, usuario=None):
        cls._validar_categoria_usuario(categoria, usuario)
        totais = Subtopico.objects.filter(topico__categoria=categoria).aggregate(
            total=Count('id'),
            concluidos=Count('id', filter=Q(concluido=True)),
        )
        total = totais['total'] or 0
        concluidos = totais['concluidos'] or 0
        return {
            'total_subtopicos': total,
            'subtopicos_concluidos': concluidos,
            'progresso': cls._percentual(concluidos, total),
        }

    @classmethod
    def calcular_progresso_geral(cls, usuario):
        totais = Subtopico.objects.filter(topico__usuario=usuario).aggregate(
            total=Count('id'),
            concluidos=Count('id', filter=Q(concluido=True)),
        )
        total = totais['total'] or 0
        concluidos = totais['concluidos'] or 0
        return {
            'total_subtopicos': total,
            'subtopicos_concluidos': concluidos,
            'progresso': cls._percentual(concluidos, total),
        }

    @classmethod
    def atualizar_cache_topico(cls, topico, usuario=None):
        cls._validar_topico_usuario(topico, usuario)
        dados = cls.calcular_progresso_topico(topico, usuario)
        Topico.objects.filter(pk=topico.pk).update(
            total_subtopicos=dados['total_subtopicos'],
            subtopicos_concluidos=dados['subtopicos_concluidos'],
            progresso_cache=dados['progresso'],
        )
        topico.total_subtopicos = dados['total_subtopicos']
        topico.subtopicos_concluidos = dados['subtopicos_concluidos']
        topico.progresso_cache = dados['progresso']
        return dados

    @classmethod
    def atualizar_cache_categoria(cls, categoria, usuario=None):
        cls._validar_categoria_usuario(categoria, usuario)
        dados = cls.calcular_progresso_categoria(categoria, usuario)
        Categoria.objects.filter(pk=categoria.pk).update(
            total_subtopicos=dados['total_subtopicos'],
            subtopicos_concluidos=dados['subtopicos_concluidos'],
            progresso_cache=dados['progresso'],
        )
        categoria.total_subtopicos = dados['total_subtopicos']
        categoria.subtopicos_concluidos = dados['subtopicos_concluidos']
        categoria.progresso_cache = dados['progresso']
        return dados

    @classmethod
    def atualizar_caches_para_topico(cls, topico, usuario=None):
        cls._validar_topico_usuario(topico, usuario)
        cls.atualizar_cache_topico(topico, usuario)
        cls.atualizar_cache_categoria(topico.categoria, usuario)

    @classmethod
    def registrar_subtopico(cls, subtopico, usuario=None):
        cls._validar_topico_usuario(subtopico.topico, usuario)
        if subtopico.concluido and subtopico.concluido_em is None:
            subtopico.concluido_em = timezone.now()
            subtopico.save(update_fields=['concluido_em', 'atualizado_em'])
        cls.atualizar_caches_para_topico(subtopico.topico, usuario)
        return subtopico

    @classmethod
    @transaction.atomic
    def marcar_subtopico(cls, subtopico, concluido, usuario=None):
        subtopico = (
            Subtopico.objects.select_for_update()
            .select_related('topico', 'topico__categoria')
            .get(pk=subtopico.pk)
        )
        cls._validar_topico_usuario(subtopico.topico, usuario)
        subtopico.concluido = concluido
        subtopico.concluido_em = timezone.now() if concluido else None
        subtopico.save(update_fields=['concluido', 'concluido_em', 'atualizado_em'])
        cls.atualizar_caches_para_topico(subtopico.topico, usuario)
        return subtopico

    @classmethod
    @transaction.atomic
    def reordenar_topicos(cls, categoria, ids_ordenados, usuario=None):
        cls._validar_categoria_usuario(categoria, usuario)
        ids_ordenados = [int(item) for item in ids_ordenados]
        topicos = list(categoria.topicos.select_for_update().order_by('id'))
        ids_atuais = {topico.id for topico in topicos}
        if set(ids_ordenados) != ids_atuais:
            raise ValidationError('A ordem deve conter exatamente os topicos da categoria.')
        ordem_por_id = {topico_id: indice for indice, topico_id in enumerate(ids_ordenados, start=1)}
        for topico in topicos:
            nova_ordem = ordem_por_id[topico.id]
            if topico.ordem != nova_ordem:
                Topico.objects.filter(pk=topico.pk).update(ordem=nova_ordem)
        return categoria.topicos.order_by('ordem', 'id')

    @classmethod
    @transaction.atomic
    def reordenar_subtopicos(cls, topico, ids_ordenados, usuario=None):
        cls._validar_topico_usuario(topico, usuario)
        ids_ordenados = [int(item) for item in ids_ordenados]
        subtopicos = list(topico.subtopicos.select_for_update().order_by('id'))
        ids_atuais = {subtopico.id for subtopico in subtopicos}
        if set(ids_ordenados) != ids_atuais:
            raise ValidationError('A ordem deve conter exatamente os subtopicos do topico.')
        ordem_por_id = {subtopico_id: indice for indice, subtopico_id in enumerate(ids_ordenados, start=1)}
        for subtopico in subtopicos:
            nova_ordem = ordem_por_id[subtopico.id]
            if subtopico.ordem != nova_ordem:
                Subtopico.objects.filter(pk=subtopico.pk).update(ordem=nova_ordem)
        return topico.subtopicos.order_by('ordem', 'id')

    @classmethod
    def grafico_semanal(cls, usuario):
        hoje = timezone.localdate()
        inicio = hoje - timedelta(days=6)
        inicio_periodo = timezone.make_aware(datetime.combine(inicio, time.min))
        fim_periodo = timezone.make_aware(datetime.combine(hoje + timedelta(days=1), time.min))
        dias = [inicio + timedelta(days=indice) for indice in range(7)]
        totais = {dia.isoformat(): 0 for dia in dias}
        conclusoes = Subtopico.objects.filter(
            topico__usuario=usuario,
            concluido=True,
            concluido_em__gte=inicio_periodo,
            concluido_em__lt=fim_periodo,
        ).values_list('concluido_em', flat=True)
        for concluido_em in conclusoes:
            dia = timezone.localtime(concluido_em).date().isoformat()
            if dia in totais:
                totais[dia] += 1
        return {
            'labels': [dia.isoformat() for dia in dias],
            'valores': [totais[dia.isoformat()] for dia in dias],
        }
