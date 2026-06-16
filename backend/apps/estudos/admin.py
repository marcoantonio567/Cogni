from django.contrib import admin

from .models import Categoria, Subtopico, Topico


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'usuario',
        'total_subtopicos',
        'subtopicos_concluidos',
        'progresso_cache',
    )
    list_filter = ('usuario',)
    search_fields = ('nome', 'descricao', 'usuario__username')


@admin.register(Topico)
class TopicoAdmin(admin.ModelAdmin):
    list_display = (
        'nome',
        'categoria',
        'usuario',
        'ordem',
        'total_subtopicos',
        'subtopicos_concluidos',
        'progresso_cache',
    )
    list_filter = ('usuario', 'categoria')
    search_fields = ('nome', 'categoria__nome', 'usuario__username')


@admin.register(Subtopico)
class SubtopicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'topico', 'concluido', 'ordem', 'concluido_em')
    list_filter = ('concluido', 'topico__usuario')
    search_fields = ('nome', 'topico__nome')
