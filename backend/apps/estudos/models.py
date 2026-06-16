from django.conf import settings
from django.db import models


class Categoria(models.Model):
    nome = models.CharField(max_length=120)
    descricao = models.TextField(blank=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categorias',
    )
    total_subtopicos = models.PositiveIntegerField(default=0)
    subtopicos_concluidos = models.PositiveIntegerField(default=0)
    progresso_cache = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nome', 'id']
        indexes = [
            models.Index(fields=['usuario', 'nome']),
        ]

    def __str__(self):
        return self.nome


class Topico(models.Model):
    nome = models.CharField(max_length=120)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='topicos',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='topicos',
    )
    ordem = models.PositiveIntegerField(default=0)
    total_subtopicos = models.PositiveIntegerField(default=0)
    subtopicos_concluidos = models.PositiveIntegerField(default=0)
    progresso_cache = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem', 'id']
        indexes = [
            models.Index(fields=['usuario', 'categoria', 'ordem']),
        ]

    def __str__(self):
        return self.nome


class Subtopico(models.Model):
    nome = models.CharField(max_length=160)
    topico = models.ForeignKey(
        Topico,
        on_delete=models.CASCADE,
        related_name='subtopicos',
    )
    subtopico_pai = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subtopicos_filhos',
        null=True,
        blank=True,
    )
    concluido = models.BooleanField(default=False)
    ordem = models.PositiveIntegerField(default=0)
    observacoes = models.TextField(blank=True)
    concluido_em = models.DateTimeField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem', 'id']
        indexes = [
            models.Index(fields=['topico', 'ordem']),
            models.Index(fields=['topico', 'subtopico_pai', 'ordem']),
            models.Index(fields=['concluido', 'concluido_em']),
        ]

    def __str__(self):
        return self.nome
