from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Categoria, Subtopico, Topico
from .services import ProgressoService


User = get_user_model()


class EstudosAPITests(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='ana', password='senha-segura-123')
        self.outro_usuario = User.objects.create_user(username='bruno', password='senha-segura-123')
        self.client.force_authenticate(self.usuario)

    def criar_arvore(self, usuario=None):
        usuario = usuario or self.usuario
        categoria = Categoria.objects.create(nome='Django', usuario=usuario)
        topico = Topico.objects.create(nome='API', categoria=categoria, usuario=usuario, ordem=1)
        return categoria, topico

    def test_usuario_nao_lista_nem_vincula_dados_de_outro_usuario(self):
        categoria_alheia, _ = self.criar_arvore(self.outro_usuario)

        detalhe = self.client.get(f'/api/v1/estudos/categorias/{categoria_alheia.id}/')
        self.assertEqual(detalhe.status_code, status.HTTP_404_NOT_FOUND)

        resposta = self.client.post(
            '/api/v1/estudos/topicos/',
            {'nome': 'Invasao', 'categoria': categoria_alheia.id, 'ordem': 1},
            format='json',
        )
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_toggle_de_subtopico_recalcula_cache_por_topico_categoria_e_geral(self):
        categoria, topico = self.criar_arvore()
        subtopico = Subtopico.objects.create(nome='Serializers', topico=topico, ordem=1)
        Subtopico.objects.create(nome='ViewSets', topico=topico, ordem=2)
        ProgressoService.atualizar_caches_para_topico(topico, self.usuario)

        resposta = self.client.post(
            f'/api/v1/estudos/subtopicos/{subtopico.id}/toggle-conclusao/',
            {'concluido': True},
            format='json',
        )

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        topico.refresh_from_db()
        categoria.refresh_from_db()
        subtopico.refresh_from_db()
        self.assertTrue(subtopico.concluido)
        self.assertIsNotNone(subtopico.concluido_em)
        self.assertEqual(topico.total_subtopicos, 2)
        self.assertEqual(topico.subtopicos_concluidos, 1)
        self.assertEqual(topico.progresso_cache, Decimal('50.00'))
        self.assertEqual(categoria.progresso_cache, Decimal('50.00'))
        self.assertEqual(resposta.data['progresso']['subtopicos_concluidos'], 1)

    def test_ordenacao_rejeita_ids_de_outro_usuario(self):
        categoria, topico = self.criar_arvore()
        categoria_alheia, topico_alheio = self.criar_arvore(self.outro_usuario)

        resposta = self.client.post(
            f'/api/v1/estudos/categorias/{categoria.id}/ordenar-topicos/',
            {'ids': [topico.id, topico_alheio.id]},
            format='json',
        )

        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        topico.refresh_from_db()
        topico_alheio.refresh_from_db()
        self.assertEqual(topico.ordem, 1)
        self.assertEqual(topico_alheio.categoria_id, categoria_alheia.id)

    def test_dashboard_semanal_considera_apenas_subtopicos_do_usuario(self):
        _, topico = self.criar_arvore()
        _, topico_alheio = self.criar_arvore(self.outro_usuario)
        Subtopico.objects.create(
            nome='Proprio',
            topico=topico,
            concluido=True,
            concluido_em=timezone.now(),
        )
        Subtopico.objects.create(
            nome='Alheio',
            topico=topico_alheio,
            concluido=True,
            concluido_em=timezone.now(),
        )

        resposta = self.client.get('/api/v1/dashboard/semanal/')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resposta.data['labels']), 7)
        self.assertEqual(sum(resposta.data['valores']), 1)

    def test_dashboard_resumo_retorna_metricas_filtradas_por_usuario(self):
        categoria, topico = self.criar_arvore()
        _, topico_alheio = self.criar_arvore(self.outro_usuario)
        subtopico = Subtopico.objects.create(nome='Proprio', topico=topico, ordem=1)
        Subtopico.objects.create(nome='Alheio', topico=topico_alheio, ordem=1)
        ProgressoService.marcar_subtopico(subtopico, True, self.usuario)

        resposta = self.client.get('/api/v1/dashboard/resumo/')

        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data['total_categorias'], 1)
        self.assertEqual(resposta.data['total_topicos'], 1)
        self.assertEqual(resposta.data['total_subtopicos'], 1)
        self.assertEqual(resposta.data['subtopicos_concluidos'], 1)
        self.assertEqual(resposta.data['progresso_categorias'][0]['id'], categoria.id)
